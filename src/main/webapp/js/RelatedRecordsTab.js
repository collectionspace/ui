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
        that.applier.modelChanged.addListener(elPath, function (model, oldModel, changeRequest) {
            that.listEditor.options.updateList(that.listEditor, that.listEditor.list.refreshView);
        });
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
        that.applier = that.options.applier;
        that.model = that.options.model;
        
        that.renderer.refreshView();
        fluid.initDependents(that);
            
        bindEventHandlers(that);
        
        return that;
    };
    
    cspace.relatedRecordsTab.createListUpdater = function (model, primary, related) {
        return function (listEditor, callback) {
            $.ajax({
                url: listEditor.options.baseUrl + primary + "/" + model.csid,
                dataType: "json",
                success: function (data) {
                    if (listEditor.list) {
                        // We have to requestChange here in order for the recordList
                        // to update the list of records with new model.
                        listEditor.list.applier.requestChange("items", data.relations[related]);
                    }
                    fluid.model.copyModel(listEditor.model.list, data.relations[related]);
                    if (callback) {
                        callback();
                    }
                }
            });
        };
    };
    
    cspace.relatedRecordsTab.provideData = function (relations, related) {
        return relations[related];
    };
    
    cspace.relatedRecordsTab.produceTree = function (that) {
        return {
            recordHeader: {
                messagekey: "editRecord"
            },
            listHeader: {
                messagekey: "recordList"
            },
            newRecordRow: {
                messagekey: "newRecordRow"
            },
            idNumber: {
                messagekey: "idNumber"
            },
            summary: {
                messagekey: "summary"
            },
            goToRecord: {
                messagekey: "goToRecord"
            }
        };
    };
    
    fluid.demands("relationManager", "cspace.relatedRecordsTab", 
        ["{relatedRecordsTab}.container", fluid.COMPONENT_OPTIONS]);
    fluid.demands("togglable", "cspace.relatedRecordsTab", 
        ["{relatedRecordsTab}.container", fluid.COMPONENT_OPTIONS]);
    fluid.demands("listEditor", "cspace.relatedRecordsTab", 
        ["{relatedRecordsTab}.container", "{relatedRecordsTab}.related",
         "{relatedRecordsTab}.options.uispec", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.relatedRecordsTab", {
        components: {
            relationManager: {
                type: "cspace.relationManager",
                options: {
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
                    data: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.relatedRecordsTab.provideData",
                            args: [
                                "{relatedRecordsTab}.model.relations",
                                "{relatedRecordsTab}.related"
                            ]
                        }
                    },
                    updateList: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.relatedRecordsTab.createListUpdater",
                            args: [
                                "{relatedRecordsTab}.model", 
                                "{relatedRecordsTab}.primary", 
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
            header: ".csc-relatedRecordsTab-header",
            newRecordRow: ".csc-relatedRecordsTab-newRecordRow",
            idNumber: ".csc-relatedRecordsTab-idNumber",
            summary: ".csc-relatedRecordsTab-summary"
        },
        selectorsToIgnore: ["togglable", "header"],
        events: {
            afterRender: null
        },
        parentBundle: "{globalBundle}",
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        strings: {
            idNumber: "ID Number",
            goToRecord: "Go To Record"
        },
        urls: cspace.componentUrlBuilder({
            "goTo": "%webapp/html/%related.html?csid=%csid"
        })
    });
    
    fluid.demands("relatedRecordsTab", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.relatedRecordsTab", fluid.COMPONENT_OPTIONS]);
    
})(jQuery, fluid);
