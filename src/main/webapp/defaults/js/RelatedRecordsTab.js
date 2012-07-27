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
            instantiator: "{instantiator}",
            confirmation: {
                type: "cspace.confirmation"
            },
            messageBar: "{messageBar}",
            relationManager: {
                type: "cspace.relationManager",
                container: "{relatedRecordsTab}.dom.relationManager",
                options: {
                    primary: "{relatedRecordsTab}.options.primary",
                    related: "{relatedRecordsTab}.options.related",
                    model: {
                        addButton: "relatedRecordsTab-addButton"
                    },
                    events: {
                        onAddRelation: "{cspace.relatedRecordsTab}.events.onAddRelation",
                        afterAddRelation: "{cspace.relatedRecordsTab}.events.afterAddRelation",
                        onCreateNewRecord: "{cspace.relatedRecordsTab}.events.onCreateNewRecord"
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
            relatedRecordsListView: {
                type: "cspace.listView",
                container: "{relatedRecordsTab}.dom.relatedRecordsListView",
                options: {
                    recordType: "{relatedRecordsTab}.options.related",
                    urls: cspace.componentUrlBuilder({
                        listUrl: "%tenant/%tname/%primary/%related/%csid?pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey"
                    }),
                    elPath: "items",
                    model: {
                        pageSizeList: ["5", "10", "20", "50"],
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
                        ready: "{loadingIndicator}.events.hideOn.fire",
                        onModelChange: "{loadingIndicator}.events.showOn.fire",
                        afterUpdate: "{loadingIndicator}.events.hideOn.fire",
                        onError: "{loadingIndicator}.events.hideOn.fire"
                    },
                    nonSortableColumns: {
                        loanin: ["summary"],
                        acquisition: ["summary"],
                        cataloging: ["summary"]
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
                    csid: "{relatedRecordsTab}.selectedRecordCsid",
                    recordType: "{relatedRecordsTab}.options.related",
                    globalRef: "relatedModel",
                    listeners: {
                        afterRecordRender: "{loadingIndicator}.events.hideOn.fire",
                        afterCreate: "{relatedRecordsTab}.afterRelatedRecordCreate"
                    }
                },
                createOnEvent: "onSelect"
            },
            deleteRelationDataSource: {
                type: "cspace.relatedRecordsTab.deleteRelationDataSource"
            }
        },
        events: {
            onSelect: null,
            onAddRelation: null,
            onDeleteRelation: null,
            deleteRelation: null,
            afterAddRelation: null,
            afterDeleteRelation: null,
            onCreateNewRecord: null,
            relationsUpdated: {
                event: "{globalEvents}.events.relationsUpdated"
            }
        },
        listeners: {
            relationsUpdated: "{relatedRecordsTab}.relationsUpdatedHandler",
            afterAddRelation: "{relatedRecordsTab}.events.relationsUpdated.fire",
            deleteRelation: "{loadingIndicator}.events.showOn.fire",
            afterDeleteRelation: [
                "{relatedRecordsTab}.afterDeleteRelation",
                "{loadingIndicator}.events.hideOn.fire",
                "{relatedRecordsTab}.events.relationsUpdated.fire"
            ],
            onCreateNewRecord: "{relatedRecordsTab}.onCreateNewRecord",
            onDeleteRelation: [
                "{relatedRecordsTab}.onDeleteRelation"
            ],
            onSelect: [
                "{loadingIndicator}.events.showOn.fire",
                "{relatedRecordsTab}.onSelectHandler"
            ]
        },
        protoTree: {
            recordHeader: {
                messagekey: "editRecord"
            },
            listHeader: {
                messagekey: "recordList"
            }
        },
        selectors: {
            relationManager: ".csc-relatedRecordsTab-relationManager",
            relatedRecordsListView: ".csc-listView",
            record: ".csc-relatedRecordsTab-record",
            recordEditor: ".csc-relatedRecordsTab-recordEditor",
            recordHeader: ".csc-relatedRecordsTab-recordHeader",
            togglable: ".csc-relatedRecordsTab-togglable",
            listHeader: ".csc-relatedRecordsTab-listHeader",
            header: ".csc-relatedRecordsTab-header"
        },
        selectorsToIgnore: ["togglable", "header", "relatedRecordsListView", "record", "recordEditor", "relationManager"],
        parentBundle: "{globalBundle}",
        strings: {},
        urls: cspace.componentUrlBuilder({
            deleteRelation: "%tenant/%tname/relationships/0"
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

    fluid.demands("cspace.relatedRecordsTab.deleteRelationDataSource",  ["cspace.localData", "cspace.relatedRecordsTab"], {
        funcName: "cspace.relatedRecordsTab.testDeleteRelationDataSource",
        args: {
            removable: true,
            targetTypeName: "cspace.relatedRecordsTab.testDeleteRelationDataSource"
        }
    });
    fluid.demands("cspace.relatedRecordsTab.deleteRelationDataSource", "cspace.relatedRecordsTab", {
        funcName: "cspace.URLDataSource",
        args: {
            removable: true,
            url: "{cspace.relatedRecordsTab}.options.urls.deleteRelation",
            targetTypeName: "cspace.relatedRecordsTab.deleteRelationDataSource"
        }
    });

    fluid.defaults("cspace.relatedRecordsTab.testDeleteRelationDataSource", {
        url: "%test/data/relationships.json"
    });
    cspace.relatedRecordsTab.testDeleteRelationDataSource = cspace.URLDataSource;

    cspace.relatedRecordsTab.preInit = function (that) {
        
        that.listTag = fluid.typeTag(fluid.model.composeSegments("cspace", "relatedTabList", that.options.related));
        that.relationsUpdatedHandler = function (related) {
            if (related !== that.options.related) {
                return;
            }
            that.relatedRecordsListView.updateModel();
        };
        that.onDeleteRelation = function (target) {
            if (!target.csid || !target.recordtype) {
                target = undefined;
            }
            that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
                listeners: {
                    onClose: function (userAction) {
                        if (userAction === "act") {
                            that.events.deleteRelation.fire();
                            that.deleteRelationDataSource.remove({
                                source: {
                                    csid: that.options.csid,
                                    recordtype: that.options.primary
                                },
                                target: target || {
                                    csid: that.selectedRecordCsid,
                                    recordtype: that.options.related
                                },
                                type: "affects",
                                "one-way": false
                            }, null, function (data) {
                                if (data && data.isError) {
                                    data.messages = data.messages || fluid.makeArray("");
                                    fluid.each(data.messages, function (message) {
                                        that.messageBar.show(that.options.parentBundle.resolve("recordEditor-removeRelationsFailedMessage", [message]), null, true);
                                    });
                                    return;
                                }
                                that.events.afterDeleteRelation.fire(that.options.related, fluid.get(target, "csid") || that.selectedRecordCsid);
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
        that.afterRelatedRecordCreate = function (model) {
            that.events.onAddRelation.fire({
                items: [{
                    source: {
                        csid: that.options.csid,
                        recordtype: that.options.primary
                    },
                    target: {
                        csid: model.csid,
                        recordtype: that.options.related
                    },
                    type: "affects",
                    "one-way": false
                }]
            });
        };
        that.onCreateNewRecord = function () {
            that.events.onSelect.fire({
                recordType: that.options.related
            });
        };
        that.afterDeleteRelation = function (related, csid) {
            var resolve = that.options.parentBundle.resolve,
                recordEditor = "relatedRecordsRecordEditor",
                recordEditorComponent = that[recordEditor],
                record = "record",
                instantiator = that.instantiator;
            if (recordEditorComponent && recordEditorComponent.model.csid === csid) {
                instantiator.clearComponent(that, recordEditor);
                that.instantiator.clearComponent(that, record);
                fluid.initDependent(that, record, instantiator);
            }
            that.messageBar.show(that.options.parentBundle.resolve("relationManager-afterDeleteRelation"), null, false);
        };
        that.onSelectHandler = function (record) {
            that.selectedRecordCsid = record.csid;
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
            }
        }
    });
    fluid.demands("cspace.listView.dataSource", ["cspace.listView", "cspace.relatedRecordsTab"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.listView}.options.urls.listUrl",
            termMap: {
                primary: "{cspace.relatedRecordsTab}.options.primary",
                related: "{cspace.relatedRecordsTab}.options.related",
                csid: "{cspace.relatedRecordsTab}.options.csid",
                pageNum: "%pageNum",
                pageSize: "%pageSize",
                sortDir: "%sortDir",
                sortKey: "%sortKey"
            },
            targetTypeName: "cspace.listView.dataSource"
        }
    });

    fluid.defaults("cspace.listView.testDataSourceTab", {
        url: "%test/data/%primary/%related/%csid.json"
    });
    cspace.listView.testDataSourceTab = cspace.URLDataSource;

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
            bannerMessageTop: ".csc-relatedRecordsTab-record-banner-messageTop",
            bannerMessageBottom: ".csc-relatedRecordsTab-record-banner-messageBottom",
            header: ".csc-relatedRecordsTab-recordHeader"
        },
        selectorsToIgnore: ["header", "recordEditor"],
        styles: {
            banner: "cs-relatedRecordsTab-record-banner",
            bannerMessageBottom: "cs-relatedRecordsTab-record-banner-messageBottom"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            banner: {
                decorators: {
                    addClass: "{styles}.banner"
                }
            },
            bannerMessageTop: {
                messagekey: "relatedRecordsTab-bannerTop"
            },
            bannerMessageBottom: {
                messagekey: "relatedRecordsTab-bannerBottom",
                decorators: {
                    addClass: "{styles}.bannerMessageBottom"
                }
            }
        },
        renderOnInit: true,
        preInitFunction: "cspace.relatedRecordsTab.record.preInit",
        postInitFunction: "cspace.relatedRecordsTab.record.postInit"
    });

    cspace.relatedRecordsTab.record.preInit = function (that) {
        that.onSelectHandler = function () {
            that.recordUnion.show();
            that.locate("banner").hide();
        };
    };

    cspace.relatedRecordsTab.record.postInit = function (that) {
        that.locate("banner").show();
        that.recordUnion = that.locate("header").add(that.locate("recordEditor"));
        that.recordUnion.hide();
    };

})(jQuery, fluid);
