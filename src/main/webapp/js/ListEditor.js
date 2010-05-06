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
    
    var hideDetails = function (domBinder) {
        domBinder.locate("details").hide();
        domBinder.locate("detailsNone").show();
    };
    
    var loadDetails = function (that) {
        return function(e){
            var csid = that.locate("csid", e.target.parentNode).text();
            that.detailsDC.fetch(csid);
        };
    };
    
    var bindEventHandlers = function (that) {

        that.locate("listRow").live("click", loadDetails(that));
        
        that.detailsDC.events.afterCreate.addListener(function () {
            that.locate("newListRow").hide();
            that.listDC.fetch(cspace.util.isLocal() ? "records/list" : null);
        });
        that.detailsDC.events.afterUpdate.addListener(function () {
            that.listDC.fetch(cspace.util.isLocal() ? "records/list" : null);
        });
        that.detailsDC.events.afterRemove.addListener(function () {
            hideDetails(that.dom);
            cspace.util.hideMessage(that.dom);
            that.listDC.fetch(cspace.util.isLocal() ? "records/list" : null);
        });
        that.details.events.afterRender.addListener(function () {
            that.locate("newListRow").hide();
            that.showDetails(false);
        });
        that.detailsDC.events.onError.addListener(function (operation, message) {
            that.locate("newListRow").hide();
            if (operation === "fetch") {                
            }
        });
        that.details.events.onCancel.addListener(function () {
            hideDetails(that.dom);
            that.locate("newListRow").hide();
        });

        that.list.events.afterRender.addListener(that.fireAfterRender);

        that.listDC.events.modelChanged.addListener(function (update) {
            that.list.updateModel(that.model.list.items);
        });
    };
    
    var setUpListEditor = function (that) {
        that.locate("newListRow").hide();
        bindEventHandlers(that);
        that.listDC.fetch(cspace.util.isLocal() ? "records/list" : null);
        hideDetails(that.dom);
    };
    
    cspace.listEditor = function (container, options) {
        var that = fluid.initView("cspace.listEditor", container, options);
        that.model = {
            list: [],
            details: {}
        };
        that.listApplier = fluid.makeChangeApplier(that.model.list);
        that.listDC = fluid.initSubcomponent(that, "listDataContext", [that.model.list, fluid.COMPONENT_OPTIONS]);
        that.list = fluid.initSubcomponent(that, "list", [
            that.options.selectors.list, {
                uispec: that.options.uispec.list,
                data: that.model.list
            }
        ]);

        that.detailsApplier = fluid.makeChangeApplier(that.model.details);
        that.detailsDC = fluid.initSubcomponent(that, "dataContext", [that.model.details, fluid.COMPONENT_OPTIONS]);
        that.details = fluid.initSubcomponent(that, "details", [
            that.options.selectors.details,
            that.detailsApplier,
            {
                uispec: that.options.uispec.details,
                dataContext: that.detailsDC
            }
        ]);

        that.fireAfterRender = function () {
            that.locate("newListRow").hide();
            that.events.afterRender.fire();
            that.list.events.afterRender.removeListener(that.fireAfterRender);
        };
        
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
            if (show) {
                newListRow.show();
            }
            else {
                newListRow.hide();
            }
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
        listDataContext: {
            type: "cspace.dataContext",
            options: {
                recordType: "",
                dataType: "json",
                fileExtension: ""
            }
        },
        dataContext: {
            type: "cspace.dataContext",
            options: {
                recordType: "",
                dataType: "json",
                fileExtension: ""
            }
        },
        url: "",
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
         }
    });

})(jQuery, fluid);
