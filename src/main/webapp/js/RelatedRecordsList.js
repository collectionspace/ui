/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RelatedRecordsList.js loaded");
    
    fluid.registerNamespace("cspace.relatedRecordsList");

    // TODO: This is a hard-coded list of procedures, which should be replaced by something
    //       provided by the server. 
    // NOTE: CSPACE-1977 - services and app layer do not have the concept of procedure.
    var procedureList = ["intake", "acquisition", "loanin", "loanout", "movement"];

    var buildRelationsList = function (relations, related) {
        if (related !== "procedures") {
            return relations[related];
        }
        var relationList = [];
        $.each(procedureList, function (index, value) {
            relationList = relationList.concat(relations[value] || []);
        });
        return relationList;     
    };
    
    var addModelChangeListener = function (applier, recordList, recordType, related) {
        applier.modelChanged.addListener("relations." + recordType, function(model, oldModel, changeRequest) {
            recordList.applier.requestChange("items", buildRelationsList(model.relations, related || recordType));
            recordList.refreshView();
        });
    };

    var bindEventHandlers = function (that) {
        if (that.options.related === "procedures") {
            $.each(procedureList, function (index, value) {
                addModelChangeListener(that.options.applier, that.recordList, value, that.options.related);
            });
        }
        else {
            addModelChangeListener(that.options.applier, that.recordList, that.options.related);
        }
    };

    cspace.relatedRecordsList = function (container, options) {
        var that = fluid.initView("cspace.relatedRecordsList", container, options);
        that.model = that.options.model;
        
        fluid.initDependents(that);        
        bindEventHandlers(that);
        return that;
    };
    
    cspace.relatedRecordsList.provideRecordList = function (container, selector, relations, related, options) {
        options.model = {
            items: buildRelationsList(relations, related),
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
        addRelations: cspace.relationManager.proveAddRelations,
        recordListAfterSelectHandler: cspace.recordList.afterSelectHandlerDefault,
        selectors: {
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            recordListSelector: ".csc-relatedRecordsList-recordList"
        }
    });
})(jQuery, fluid);
