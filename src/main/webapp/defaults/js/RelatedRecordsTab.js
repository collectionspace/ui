/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0.
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RelatedRecordsTab.js loaded");

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
            that.relationManager.addRelations({items: newRelation});
        });
        that.listEditor.details.events.afterRender.addListener(function () {
            var csid = that.listEditor.details.model.csid;
            if (csid) {
                var gotoLink = that.locate("goToRecord");
                gotoLink.attr("href", fluid.stringTemplate(that.options.urls.goTo, {related: that.related, csid: csid}));
                gotoLink.show();
            }
        });
    };

    /**
     *
     * @param {Object} container
     * @param {Object} uispec
     * @param {Object} applier  The applier holding the data model of the primary record
     * @param {Object} options
     */
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
            strings: {
                primaryMessage: recordEditor.options.strings.deletePrimaryMessage
            }
        });
    };
    
    cspace.relatedRecordsTab.produceTree = function (that) {
        return {
            recordHeader: {
                messagekey: "editRecord"
            },
            listHeader: {
                messagekey: "recordList"
            },
            goToRecord: {
                messagekey: "goToRecord"
            }
        };
    };

    fluid.defaults("cspace.relatedRecordsTab", {
        gradeNames: "fluid.rendererComponent",
        components: {
            relationManager: {
                type: "cspace.relationManager",
                options: {
                    relationsElPath: "relations",
                    primary: "{relatedRecordsTab}.primary",
                    related: "{relatedRecordsTab}.related",
                    model: "{relatedRecordsTab}.model",
                    applier: "{relatedRecordsTab}.applier",
                    strings: {
                        addButton: "Add record"
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
        strings: {
            goToRecord: "Go To Record"
        },
        urls: cspace.componentUrlBuilder({
            "goTo": "%webapp/html/%related.html?csid=%csid"
        })
    });

})(jQuery, fluid);
