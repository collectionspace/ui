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
    fluid.log("RelatedRecordsList.js loaded");
    
    fluid.registerNamespace("cspace.relatedRecordsList");

    var buildRelationsList = function (recordTypes, relations, related) {
        var relationList = [];
        fluid.each(recordTypes[related], function (value) {
            relationList = relationList.concat(relations[value] || []);
        });   
        return relationList;
    };
    
    var addModelChangeListener = function (recordTypes, applier, recordList, recordType, related) {
        applier.modelChanged.addListener("relations." + recordType, function (model) {
            recordList.applier.requestChange("items", buildRelationsList(recordTypes, model.relations, related));
            recordList.refreshView();
        });
    };

    var bindEventHandlers = function (that) {
        fluid.each(that.options.recordTypes[that.options.related], function (value) {
            addModelChangeListener(that.options.recordTypes, that.options.applier, that.recordList, value, that.options.related);
        });
    };

    cspace.relatedRecordsList = function (container, options) {
        var that = fluid.initRendererComponent("cspace.relatedRecordsList", container, options);
        that.renderer.refreshView();
        fluid.initDependents(that);        
        bindEventHandlers(that);
        that.events.afterSetup.fire(that);
        return that;
    };
    
    cspace.relatedRecordsList.produceTree = function(that) {
        return {
            mainHeader: {
                messagekey: that.options.related //holds key for stringBundle lookup
            },
            numberHeader: {
                messagekey: "numberHeader"
            },
            summaryHeader: {
                messagekey: "summaryHeader"
            },
            typeHeader: {
                messagekey: "typeHeader"
            }
        };
    };

    cspace.relatedRecordsList.provideRecordList = function (container, selector, recordTypes, relations, related, options) {
        options.model = {
            items: buildRelationsList(recordTypes, relations, related),
            selectionIndex: -1
        };
        return cspace.recordList($(selector, container), options);
    };
    
    cspace.relatedRecordsList.provideLocalRelationManager = function (container, options) {
        options.addRelations = cspace.relationManager.provideLocalAddRelations;
        return cspace.relationManager(container, options);
    };
    
    fluid.demands("cspace.recordList", "cspace.relatedRecordsList", {
        funcName: "cspace.relatedRecordsList.provideRecordList",
        args: ["{relatedRecordsList}.container",
               "{relatedRecordsList}.options.selectors.recordListSelector",
               "{recordTypes}",
               "{relatedRecordsList}.model.relations", 
               "{relatedRecordsList}.options.related",
               fluid.COMPONENT_OPTIONS
        ]
    });
    
    fluid.demands("cspace.relationManager", ["cspace.localData", "cspace.relatedRecordsList"], {
        funcName: "cspace.relatedRecordsList.provideLocalRelationManager",
        args: ["{relatedRecordsList}.container", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("cspace.relationManager", "cspace.relatedRecordsList", 
        ["{relatedRecordsList}.container", fluid.COMPONENT_OPTIONS]);

    fluid.defaults("cspace.relatedRecordsList", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        components: {
            recordList: {
                type: "cspace.recordList",
                options: {
                    uispec: "{relatedRecordsList}.options.uispec",
                    listeners: {
                        afterSelect: "{relatedRecordsList}.options.recordListAfterSelectHandler"
                    }
                }
            },
            relationManager: {
                type: "cspace.relationManager",
                options: {
                    primary: "{relatedRecordsList}.options.primary",
                    related: "{relatedRecordsList}.options.related",
                    applier: "{relatedRecordsList}.options.applier",
                    model: "{relatedRecordsList}.model",
                    addRelations: "{relatedRecordsList}.options.addRelations"
                }
            }
        },
        events: {
            afterSetup: null  
        },
        addRelations: cspace.relationManager.proveAddRelations,
        recordListAfterSelectHandler: cspace.recordList.afterSelectHandlerDefault,
        parentBundle: "{globalBundle}",
        recordTypes: "{recordTypes}",
        produceTree: cspace.relatedRecordsList.produceTree,
        selectors: {
            recordListSelector: ".csc-relatedRecordsList-recordList",
            mainHeader: ".csc-related-mainheader",
            numberHeader: ".csc-related-number-header",
            summaryHeader: ".csc-related-summary-header",
            typeHeader: ".csc-related-recordtype-header"
        },
        selectorsToIgnore: ["recordListSelector"],
        strings: {
            numberHeader: "Number",
            summaryHeader: "Summary",
            typeHeader: "Type"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/RelatedRecordListTemplate.html"
            })
        }
    });

    fluid.fetchResources.primeCacheFromResources("cspace.relatedRecordsList");
})(jQuery, fluid);
