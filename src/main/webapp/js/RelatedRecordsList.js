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

    var addNewRelationship = function (newCsid, currentCsid) {
        /* url for relationships: .../chain/relationships/
         * GET/POST/DELETE
         * JSON blob:
         * { source: <mini-record>,
             target: <mini-record>,
             type: "affects",
             csid: 123,
             'one-way': true/false // default determined by type
           } 
         */
        var newRelationship = {
            source: {csid: currentCsid},
            target: {csid: relatedCsid},
            type: "affects",
            "one-way": false // default determined by type
        };
        var ajaxOpts = {
            url: that.options.relationshipsUrl,
            type: "POST",
            dataType: "json",
            data: JSON.stringify(newRelationship),
            success: function (data, textStatus) {
                successEvent.fire(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                that.events.onError.fire(operation, textStatus);
            }
        };
        jQuery.ajax(ajaxOpts);
    };

    var bindEventHandlers = function (that) {
        
    };

    var renderPage = function (that) {
        that.locate("recordTypeString").text(that.options.recordType);
        that.locate("addButton").click(function () {});
    };

    cspace.relatedRecordsList = function (container, options) {
        var that = fluid.initView("cspace.relatedRecordsList", container, options);
        that.model = {
            csid: that.options.csid || null,
            items: that.options.data || []
        };

        var rlOpts = {
            data: cspace.util.buildRelationsList(that.model.items, recordsLists[that.options.recordType]),
            uispec: that.options.uispec
        };
        that.recordList = fluid.initSubcomponent(that, "recordList", [that.container, rlOpts]);

        that.add = function (relatedCsid) {
            addNewRelationship(relatedCsid, that.model.csid);
        };

        that.refreshView = function () {
            renderPage(that);
        };

        cspace.addDialogInst = cspace.addDialogInst || cspace.searchToRelateDialog(that.container);
        that.locate("addButton").live("click", function (e) {
            that.locate("recordTypeString", cspace.addDialogInst.dlg).text(that.options.recordType);
            cspace.addDialogInst.prepareDialog(that.options.recordType);
            cspace.addDialogInst.dlg.dialog("open");
        });


        bindEventHandlers(that);
        renderPage(that);
        return that;
    };

    fluid.defaults("cspace.relatedRecordsList", {
        recordList: {
            type: "cspace.recordList"
        },
        selectors: {
            listContainer: ".csc-related-records-list",
            addButton: ".csc-add-related-record-button",
            recordTypeString: ".csc-record-type"
        },
        relationshipsUrl: "../../chain/relationships/"
    });
})(jQuery, fluid_1_2);
