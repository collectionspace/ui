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
    
    // TODO: This has to be done in the app layer i.e. provide an array of procedures in relations block.
    // This way wouldn't have to write this work around. Related to CSPACE-1977.
    var buildRelationsList = function (relations, recordType) {
        if (recordType !== "procedures") {
            return relations[recordType];
        }
        var procedures = ["procedures", "intake", "acquisition", "loanin", "loanout"];
        var relationList = [];
        $.each(procedures, function (index, value) {
            relationList = relationList.concat(relations[value] || []);
        });
        return relationList;     
    };
    
    bindEventHandlers = function (that) {
        var elPath = "relations." + that.options.recordType;
        that.applier.modelChanged.addListener(elPath, function(model, oldModel, changeRequest) {
        	// TODO: This should be just model.relations[that.options.recordType]
        	// Related to CSPACE-1977.
            fluid.model.copyModel(that.recordList.model.items, buildRelationsList(model.relations, that.options.recordType) || []);
            that.recordList.refreshView();
        });
    };

    cspace.relatedRecordsList = function (container, applier, options) {
        var that = fluid.initView("cspace.relatedRecordsList", container, options);
        that.applier = applier;

        var listModel = {
        	// TODO: This should be just that.applier.model.relations[that.options.recordType]
        	// Related to CSPACE-1977.
            items: buildRelationsList(that.applier.model.relations, that.options.recordType) || [],
            selectionIndex: -1
        };
        that.recordList = fluid.initSubcomponent(that, "recordList", [
            that.locate("recordListSelector"),
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
            timestamp: ".csc-timestamp",
            recordListSelector: ".csc-relatedRecordsList-recordList"
        }
    });
})(jQuery, fluid);
