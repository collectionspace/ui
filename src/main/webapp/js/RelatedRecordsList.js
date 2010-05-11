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
        procedures: ["intake", "acquisition"],
        object: ["objects"],
        objects: ["objects"]
    };

    bindEventHandlers = function (that) {
        that.locate("addButton").live("click", function (e) {
            if (that.applier.model.csid) {
                that.locate("messageContainer", "body").hide();                
                that.locate("recordTypeString", cspace.addDialogInst.dlg).text(that.options.recordType);
                cspace.addDialogInst.prepareDialog(that.options.recordType);
                cspace.addDialogInst.dlg.dialog("open");
            } else {
                cspace.util.displayTimestampedMessage(that.dom, that.options.strings.pleaseSaveFirst);
            }
        });

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
        that.recordList = fluid.initSubcomponent(that, "recordList", [that.container,
            listModel,
            that.options.uispec]);

        if (!cspace.addDialogInst) {
            var dlgOpts = {
                applier: that.applier,
                currentRecordType: that.options.currentRecordType
            };
            cspace.addDialogInst = cspace.searchToRelateDialog(that.container, that.applier, dlgOpts);
        }

        bindEventHandlers(that);
        return that;
    };

    fluid.defaults("cspace.relatedRecordsList", {
        recordList: {
            type: "cspace.recordList"
        },
        selectors: {
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            listContainer: ".csc-related-records-list",
            addButton: ".csc-add-related-record-button",
            recordTypeString: ".csc-record-type"
        },
        strings: {
            pleaseSaveFirst: "Please save the record you are creating before trying to relate other records to it."
        },
        relationshipsUrl: "../../chain/relationships/"
    });
})(jQuery, fluid);
