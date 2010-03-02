/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2, cspace*/

cspace = cspace || {};

(function ($, fluid) {

    var recordsLists = {
        intake: ["intake"],
        acquisition: ["acquisition"],
        procedures: ["intake", "acquisition"],
        object: ["objects"],
        objects: ["objects"],
        "collection-object": ["objects"]
    };

    var displayMessage = function (locater, msg) {
        var messageContainer = locater.locate("messageContainer", "body");
        locater.locate("feedbackMessage", messageContainer).text(msg);
        messageContainer.show();
    };

    bindEventHandlers = function (that) {
        that.locate("addButton").live("click", function (e) {
            if (that.model.csid) {
                that.locate("messageContainer", "body").hide();                
                that.locate("recordTypeString", cspace.addDialogInst.dlg).text(that.options.recordType);
                cspace.addDialogInst.prepareDialog(that.options.recordType);
                cspace.addDialogInst.dlg.dialog("open");
            } else {
                displayMessage(that.dom, "Please save the record you are creating before trying to relate other records to it.");
            }
        });

        that.options.applier.modelChanged.addListener("relations", function(model, oldModel, changeRequest) {
            that.recordList.updateModel(cspace.util.buildRelationsList(model.relations, recordsLists[that.options.recordType]));
        });
    };

    cspace.relatedRecordsList = function (container, options) {
        var that = fluid.initView("cspace.relatedRecordsList", container, options);
        // workaround for FLUID-3505:
        that.options.applier = options.applier;

        that.model = {
            csid: that.options.applier.model.csid || null,
            items: that.options.applier.model.relations || []
        };

        var rlOpts = {
            data: cspace.util.buildRelationsList(that.model.items, recordsLists[that.options.recordType]),
            uispec: that.options.uispec
        };
        that.recordList = fluid.initSubcomponent(that, "recordList", [that.container, rlOpts]);

        if (!cspace.addDialogInst) {
            var dlgOpts = {
                currentCSID: that.model.csid,
                applier: that.options.applier,
                currentRecordType: that.options.currentRecordType
            };
            cspace.addDialogInst = cspace.searchToRelateDialog(that.container, dlgOpts);
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
            listContainer: ".csc-related-records-list",
            addButton: ".csc-add-related-record-button",
            recordTypeString: ".csc-record-type"
        },
        relationshipsUrl: "../../chain/relationships/"
    });
})(jQuery, fluid_1_2);
