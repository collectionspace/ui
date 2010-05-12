/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid*/

cspace = cspace || {};

(function ($, fluid) {
    
    var initializeRecordListData = function (baseUrl, recordType) {
        var list = [];
        $.ajax({
            url: baseUrl + recordType,
            dataType: "json",
            async: false,
            success: function (data) {
                list = data.items;
            },
            error: function (xhr, textStatus, errorThrown) {
                fluid.log("Error fetching list of records: " + textStatus);
            }
        });
        return list;
    };

    var refreshRecordList = function (model, list, baseUrl, recordType) {
        $.ajax({
            url: baseUrl + recordType,
            dataType: "json",
            success: function (data) {
                fluid.model.copyModel(model.list, data.items);
                list.refreshView();
            },
            error: function (xhr, textStatus, errorThrown) {
                fluid.log("Error fetching list of records: " + textStatus);
            }
        });
    };

    var hideDetails = function (domBinder) {
        domBinder.locate("details").hide();
        domBinder.locate("detailsNone").show();
    };
    
    var loadDetails = function (model, detailsDC) {
        detailsDC.fetch(model.items[model.selectionIndex].csid);
    };
    
    var bindEventHandlers = function (that) {
    	
    	that.detailsDC.events.afterSave.addListener(function () {
    		refreshRecordList(that.model, that.list, that.options.baseUrl, that.recordType);
    	});
        that.detailsDC.events.afterCreate.addListener(function () {
            that.locate("newListRow").hide();
        });
        that.detailsDC.events.afterRemove.addListener(function () {
            hideDetails(that.dom);
            cspace.util.hideMessage(that.dom);
        });
        that.detailsDC.events.onError.addListener(function (operation, message) {
            that.locate("newListRow").hide();
        });
        
        that.details.events.afterRender.addListener(function () {
            that.locate("newListRow").hide();
            that.showDetails(false);
            that.events.afterRender.fire();
        });
        that.details.events.onCancel.addListener(function () {
            hideDetails(that.dom);
            that.locate("newListRow").hide();
        });
        
        that.list.events.onSelect.addListener(function (model) {
            loadDetails(model, that.detailsDC);
        });
    };
    
    var setUpListEditor = function (that) {
        that.locate("newListRow").hide();
        bindEventHandlers(that);
        hideDetails(that.dom);
        that.events.afterRender.fire();
    };
    
    cspace.listEditor = function (container, recordType, uispec, options) {
        var that = fluid.initView("cspace.listEditor", container, options);
        that.recordType = recordType;
        that.uispec = uispec;
        that.model = {
            list: initializeRecordListData(that.options.baseUrl, that.recordType),
            details: {}
        };
        that.list = fluid.initSubcomponent(that, "list", [
            that.options.selectors.list, {
                items: that.model.list,
                selectionIndex: -1
            },
            that.uispec.list
        ]);

        that.detailsApplier = fluid.makeChangeApplier(that.model.details);
        that.detailsDC = fluid.initSubcomponent(that, "dataContext", [that.model.details, fluid.COMPONENT_OPTIONS]);
        that.details = fluid.initSubcomponent(that, "details", [
            that.options.selectors.details,
            that.detailsDC,
            that.detailsApplier,
            that.uispec.details
        ]);
        
        that.showDetails = function (newDetails) {
            that.locate("detailsNone").hide();
            that.locate("details").show();
            if (newDetails) {
                that.locate("hideOnCreate").hide();
                that.locate("hideOnEdit").show();
            } else {
                that.locate("hideOnEdit").hide();
                that.locate("hideOnCreate").show();
            }
        };
        
        that.showNewListRow = function (show) {
            var newListRow = that.locate("newListRow");
            newListRow[show ? "show" : "hide"]();
        };

        setUpListEditor(that);
        return that;
    };

    fluid.defaults("cspace.listEditor", {
        list: {
            type: "cspace.recordList"
        },
        details: {
            type: "cspace.recordEditor"
        },
        dataContext: {
            type: "cspace.dataContext",
            options: {
                recordType: "",
                dataType: "json",
                fileExtension: ""
            }
        },
        selectors: {
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            list: ".csc-listEditor-list",
            csid: ".csc-listEditor-list-csid",
            listRow: ".csc-listEditor-list-row",
            details: ".csc-listEditor-details",
            detailsNone: ".csc-listEditor-details-none",
            newListRow: ".csc-listEditor-addNew",
            hideOnCreate: ".csc-details-hideOnCreate",
            hideOnEdit: ".csc-details-hideOnEdit"
        },
         events: {
             afterRender: null
         },
         baseUrl: "../../chain/"
    });

})(jQuery, fluid);
