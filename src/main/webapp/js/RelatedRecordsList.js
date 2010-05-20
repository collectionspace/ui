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
    
    var recordsLists = {
        intake: ["intake"],
        acquisition: ["acquisition"],
        loanin: ["loanin"],
        loanout: ["loanout"],
        procedures: ["intake", "acquisition", "loanin", "loanout"],
        object: ["objects"],
        objects: ["objects"]
    };

    bindEventHandlers = function (that) {
        that.applier.modelChanged.addListener("relations", function(model, oldModel, changeRequest) {
            fluid.model.copyModel(that.recordList.model.items, cspace.util.buildRelationsList(model.relations, recordsLists[that.options.recordType]));
            that.recordList.refreshView();
        });
    };

    cspace.relatedRecordsList = function (container, applier, options) {
        var that = fluid.initView("cspace.relatedRecordsList", container, options);
        that.applier = applier;

        var listModel = {
            items: cspace.util.buildRelationsList(that.applier.model.relations, recordsLists[that.options.recordType]),
            selectionIndex: -1
        };
        that.recordList = fluid.initSubcomponent(that, "recordList", [
            that.container,
            listModel,
            that.options.uispec,
            fluid.COMPONENT_OPTIONS
        ]);
        
        that.relationManager = fluid.initSubcomponent(that, "relationManager", [
            that.container,
            that.options.recordType,
            that.applier,
            fluid.COMPONENT_OPTIONS
        ]);

        bindEventHandlers(that);
        return that;
    };

    fluid.defaults("cspace.relatedRecordsList", {
        recordList: {
            type: "cspace.recordList"
        },
        relationManager: {
            type: "cspace.relationManager"
        },
        selectors: {
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp"
        }
    });
})(jQuery, fluid);
