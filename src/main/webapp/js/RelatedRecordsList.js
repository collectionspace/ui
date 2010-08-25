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

    // TODO: This is a hard-coded list of procedures, which should be replaced by something
    //       provided by the server
    var procedureList = ["procedures", "intake", "acquisition", "loanin", "loanout", "movement"];

    // TODO: This has to be done in the app layer i.e. provide an array of procedures in relations block.
    // This way wouldn't have to write this work around. Related to CSPACE-1977.
    var buildRelationsList = function (relations, relatedRecordType) {
        if (relatedRecordType !== "procedures") {
            return relations[relatedRecordType];
        }
        var relationList = [];
        $.each(procedureList, function (index, value) {
            relationList = relationList.concat(relations[value] || []);
        });
        return relationList;     
    };
    
    var bindModelChangedListener = function (that, recordType) {
        var elPath = "relations." + recordType;
        that.applier.modelChanged.addListener(elPath, function(model, oldModel, changeRequest) {
            // TODO: This should be just model.relations[that.relatedRecordType]
            // Related to CSPACE-1977.
            fluid.model.copyModel(that.recordList.model.items, buildRelationsList(model.relations, that.relatedRecordType) || []);
            that.recordList.refreshView();
        });
    };

    var bindEventHandlers = function (that) {
        if (!that.relatedRecordType || that.relatedRecordType === "procedures") {
            $.each(procedureList, function (index, value) {
                bindModelChangedListener(that, value);
            });            
        } else {
            bindModelChangedListener(that, that.relatedRecordType);
        }
    };

    cspace.relatedRecordsList = function (container, primaryRecordType, relatedRecordType, applier, options) {
        var that = fluid.initView("cspace.relatedRecordsList", container, options);
        that.primaryRecordType = primaryRecordType;
        that.relatedRecordType = relatedRecordType;
        that.applier = applier;

        var listModel = {
        	// TODO: This should be just that.applier.model.relations[that.relatedRecordType]
        	// Related to CSPACE-1977.
            items: buildRelationsList(that.applier.model.relations, that.relatedRecordType) || [],
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
            that.primaryRecordType,
            that.relatedRecordType,
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
