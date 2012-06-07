/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0.
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.log("RelatedRecordsTab.js loaded");

    fluid.defaults("cspace.relatedRecordsTab", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        components: {
            globalNavigator: "{globalNavigator}",
            confirmation: {
                type: "cspace.confirmation"
            },
            /*
relationManager: {
                type: "cspace.relationManager",
                options: {
                    relationsElPath: "relations",
                    primary: "{relatedRecordsTab}.primary",
                    related: "{relatedRecordsTab}.related",
                    messagekeys: {
                        addButton: "relatedRecordsTab-addButton"
                    }
                }
            },
*/
            togglable: {
                type: "cspace.util.togglable",
                options: {
                    selectors: {
                        header: "{relatedRecordsTab}.options.selectors.header",
                        togglable: "{relatedRecordsTab}.options.selectors.togglable"
                    }
                }
            },
            relatedRecordsList: {
                type: "cspace.listView",
                container: "{relatedRecordsTab}.dom.relatedRecordsList",
                options: {
                    recordType: "{relatedRecordsTab}.options.related",
                    urls: cspace.componentUrlBuilder({
                        listUrl: "%tenant/%tname/%primary/%related/%csid"
                    }),
                    elPath: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "fluid.stringTemplate",
                            args: ["results.%recordType", {
                                recordType: "{relatedRecordsTab}.options.related"
                            }]
                        }
                    },
                    model: {
                        columns: [{
                            sortable: true,
                            id: "number",
                            name: "%recordType-number"
                        }, {
                            sortable: true,
                            id: "summary",
                            name: "summary"
                        }, {
                            sortable: true,
                            id: "summarylist.updatedAt",
                            name: "updatedAt"
                        }]
                    },
                    events: {
                        onSelect: "{relatedRecordsTab}.events.onSelect"
                    },
                    listeners: {
                        ready: "{loadingIndicator}.events.hideOn.fire"
                    }
                }
            },
            record: {
                type: "cspace.relatedRecordsTab.record",
                container: "{relatedRecordsTab}.dom.record",
                options: {
                    selectors: {
                        recordEditor: "{cspace.relatedRecordsTab}.options.selectors.recordEditor"
                    }
                }
            },
            relatedRecordsRecordEditor: {
                type: "cspace.recordEditor",
                container: "{relatedRecordsTab}.dom.recordEditor",
                options: {
                    csid: "{relatedRecordsTab}.selectedRecirdCsid",
                    recordType: "{relatedRecordsTab}.options.related",
                    globalRef: "relatedModel"
                },
                createOnEvent: "onSelect"
            }
        },
        events: {
            onSelect: null
        },
        listeners: {
            onSelect: "{relatedRecordsTab}.onSelectHandler"
        },
        protoTree: {
            recordHeader: {
                messagekey: "editRecord"
            },
            listHeader: {
                messagekey: "recordList"
            },
            goToRecord: {
                messagekey: "relatedRecordsTab-goToRecord"
            }
        },
        selectors: {
            relatedRecordsList: ".csc-listView",
            record: ".csc-relatedRecordsTab-record",
            recordEditor: ".csc-relatedRecordsTab-recordEditor",
            goToRecord: ".csc-goto",
            recordHeader: ".csc-relatedRecordsTab-recordHeader",
            togglable: ".csc-relatedRecordsTab-togglable",
            listHeader: ".csc-relatedRecordsTab-listHeader",
            header: ".csc-relatedRecordsTab-header"
        },
        selectorsToIgnore: ["togglable", "header", "relatedRecordsList", "record", "recordEditor"],
        parentBundle: "{globalBundle}",
        strings: {},
        urls: cspace.componentUrlBuilder({
            "goTo": "%webapp/html/%related.html?csid=%csid"
        }),
        mergePolicy: {
            uispec: "nomerge",
            recordModel: "preserve"
        },
        messagekeys: {
            editRecord: "%recordType-editRecord",
            recordList: "%recordType-recordList"
        },
        renderOnInit: true,
        preInitFunction: "cspace.relatedRecordsTab.preInit"
    });

    cspace.relatedRecordsTab.preInit = function (that) {
        that.onSelectHandler = function (record) {
            that.selectedRecirdCsid = record.csid;
        };
        fluid.each(that.options.messagekeys, function (message, key) {
            var expanded = fluid.stringTemplate(message, {
                recordType: that.options.related
            });
            that.options.strings[key] = that.options.parentBundle.resolve(expanded);
        });
    };

    fluid.demands("cspace.listView.dataSource",  ["cspace.localData", "cspace.listView", "cspace.relatedRecordsTab"], {
        funcName: "cspace.listView.testDataSourceTab",
        args: {
            targetTypeName: "cspace.listView.testDataSourceTab",
            termMap: {
                primary: "{cspace.relatedRecordsTab}.options.primary",
                related: "{cspace.relatedRecordsTab}.options.related",
                csid: "{cspace.relatedRecordsTab}.options.csid"
            },
            responseParser: "cspace.listView.responseParserTab"
        }
    });
    fluid.demands("cspace.listView.dataSource", ["cspace.listView", "cspace.relatedRecordsTab"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.listView}.options.urls.listUrl",
            termMap: {
                primary: "{cspace.relatedRecordsTab}.options.primary",
                related: "{cspace.relatedRecordsTab}.options.related",
                csid: "{cspace.relatedRecordsTab}.options.csid"
            },
            targetTypeName: "cspace.listView.dataSource",
            responseParser: "cspace.listView.responseParserTab"
        }
    });

    fluid.defaults("cspace.listView.testDataSourceTab", {
        url: "%test/data/%primary/%related/%csid.json"
    });
    cspace.listView.testDataSourceTab = cspace.URLDataSource;
    cspace.listView.responseParserTab = function (data) {
        return data.relations;
    };

    fluid.defaults("cspace.relatedRecordsTab.record", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        events: {
            onSelect: {
                event: "{cspace.relatedRecordsTab}.events.onSelect"
            }
        },
        listeners: {
            onSelect: "{cspace.relatedRecordsTab.record}.onSelectHandler"
        },
        selectors: {
            banner: ".csc-relatedRecordsTab-record-banner",
            header: ".csc-relatedRecordsTab-recordHeader"
        },
        selectorsToIgnore: ["header", "recordEditor"],
        styles: {
            banner: "cs-relatedRecordsTab-record-banner"
        },
        protoTree: {
            banner: {
                decorators: {
                    addClass: "{styles}.banner"
                }
            }
        },
        preInitFunction: "cspace.relatedRecordsTab.record.preInit"
    });

    cspace.relatedRecordsTab.record.preInit = function (that) {
        that.onSelectHandler = function () {
            that.locate("header").add(that.locate("recordEditor")).show();
            that.locate("banner").hide();
        };
    };

/*
    fluid.registerNamespace("cspace.relatedRecordsTab");

    var bindEventHandlers = function (that) {
        var elPath = "relations." + that.related;
        that.applier.modelChanged.addListener(elPath, that.listEditor.updateList);
        that.relationManager.events.onCreateNewRecord.addListener(that.listEditor.addNewListRow);
        that.listEditor.detailsDC.events.afterCreate.addListener(function (data) {
            var newRelation = [{
                source: {
                    csid: that.model.csid,
                    recordtype: that.primary
                },
                target: {
                    csid: data.csid,
                    recordtype: that.related
                },
                type: "affects",
                "one-way": false
            }];
            that.relationManager.dataContext.addRelations({items: newRelation});
        });
        
        that.globalNavigator.events.onPerformNavigation.addListener(function (callback) {
            if (that.listEditor.details.unsavedChanges) {
                that.confirmation.open("cspace.confirmation.saveDialog", undefined, {
                    listeners: {
                        onClose: {
                            listener: function (userAction) {
                                if (userAction === "act") {
                                    that.listEditor.events.afterListUpdate.addListener(function () {
                                        that.listEditor.events.afterListUpdate.removeListener("afterListUpdate");
                                        callback();
                                    }, "afterListUpdate", undefined, "last");
                                    that.listEditor.details.requestSave();
                                } else if (userAction === "proceed") {
                                    callback();
                                }
                            },
                            // http://issues.collectionspace.org/browse/CSPACE-4412:
                            // Need to wait till confirmation dialog is closed.
                            priority: "last"
                        }
                    },
                    parentBundle: that.options.parentBundle
                });
                return false;
            }
        }, null, null, "first");
        
        that.listEditor.details.events.afterRender.addListener(function () {
            var csid = that.listEditor.details.model.csid;
            if (csid) {
                var gotoLink = that.locate("goToRecord");
                gotoLink.attr("href", fluid.stringTemplate(that.options.urls.goTo, {related: that.related, csid: csid}));
                gotoLink.show();
            }
        });
    };

    cspace.relatedRecordsTab = function (container, options) {
        var that = fluid.initRendererComponent("cspace.relatedRecordsTab", container, options);
        that.primary = that.options.primary;
        that.related = that.options.related;

        that.renderer.refreshView();
        fluid.initDependents(that);

        bindEventHandlers(that);

        return that;
    };

    cspace.relatedRecordsTab.provideData = function (relations, related) {
        return {
            items: relations[related]
        };
    };

    cspace.relatedRecordsTab.deleteRelation = function (that, recordEditor) {
        recordEditor.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "act") {
                        that.relationManager.dataContext.removeRelations({
                            source: {
                                csid: that.model.csid,
                                recordtype: that.primary
                            },
                            target: {
                                csid: recordEditor.model.csid,
                                recordtype: that.related
                            },
                            "one-way": false,
                            type: "affects"
                        });
                    }
                }
            },
            model: {
                messages: [ "tab-re-deletePrimaryMessage" ]
            },
            parentBundle: that.options.parentBundle
        });
    };
    
    cspace.relatedRecordsTab.produceTree = function (that) {
        var strings = that.options.strings;
        return {
            recordHeader: {
                messagekey: strings.editRecord
            },
            listHeader: {
                messagekey: strings.recordList
            },
            goToRecord: {
                messagekey: "relatedRecordsTab-goToRecord"
            }
        };
    };

    fluid.defaults("cspace.relatedRecordsTab", {
        gradeNames: "fluid.rendererComponent",
        components: {
            globalNavigator: "{globalNavigator}",
            confirmation: {
                type: "cspace.confirmation"
            },
            relationManager: {
                type: "cspace.relationManager",
                options: {
                    relationsElPath: "relations",
                    primary: "{relatedRecordsTab}.primary",
                    related: "{relatedRecordsTab}.related",
                    model: "{relatedRecordsTab}.model",
                    applier: "{relatedRecordsTab}.applier",
                    messagekeys: {
                        addButton: "relatedRecordsTab-addButton"
                    }
                }
            },
            togglable: {
                type: "cspace.util.togglable",
                options: {
                    selectors: {
                        header: "{relatedRecordsTab}.options.selectors.header",
                        togglable: "{relatedRecordsTab}.options.selectors.togglable"
                    }
                }
            },
            listEditor: {
                type: "cspace.listEditor",
                options: {
                    recordType: "{relatedRecordsTab}.related",
                    listModel: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.relatedRecordsTab.provideData",
                            args: [
                                "{relatedRecordsTab}.model.relations",
                                "{relatedRecordsTab}.related"
                            ]
                        }
                    },
                    listeners: {
                        pageReady: "{relatedRecordsTab}.events.afterRender.fire"
                    }
                }
            }
        },
        produceTree: cspace.relatedRecordsTab.produceTree,
        selectors: {
            goToRecord: ".csc-goto",
            recordHeader: ".csc-relatedRecordsTab-recordHeader",
            togglable: ".csc-relatedRecordsTab-togglable",
            listHeader: ".csc-relatedRecordsTab-listHeader",
            header: ".csc-relatedRecordsTab-header"
        },
        selectorsToIgnore: ["togglable", "header"],
        events: {
            afterRender: null
        },
        parentBundle: "{globalBundle}",
        strings: {},
        urls: cspace.componentUrlBuilder({
            "goTo": "%webapp/html/%related.html?csid=%csid"
        }),
        mergePolicy: {
            uispec: "nomerge"
        }
    });
*/

})(jQuery, fluid);
