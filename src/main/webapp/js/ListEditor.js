/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("ListEditor.js loaded");

    var hideDetails = function (domBinder) {
        domBinder.locate("details").hide();
        domBinder.locate("detailsNone").show();
        domBinder.locate("newListRow").hide();
    };
    
    var showDetails = function (domBinder, newDetails) {
        domBinder.locate("detailsNone").hide();
        domBinder.locate("details").show();
        if (newDetails) {
            domBinder.locate("newListRow").show();
            domBinder.locate("hideOnCreate").hide();
            domBinder.locate("hideOnEdit").show();
        } else {
            domBinder.locate("newListRow").hide();
            domBinder.locate("hideOnEdit").hide();
            domBinder.locate("hideOnCreate").show();
        }
    };
    
    var bindEventHandlers = function (that) {

        that.detailsDC.events.afterSave.addListener(function () {
            that.options.updateList(that, that.list.refreshView);
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
            showDetails(that.dom, false);
        });
        that.details.events.onCancel.addListener(function () {
            hideDetails(that.dom);
        });
        
        that.list.events.afterSelect.addListener(function (model) {
            that.options.loadDetails(model, that.detailsDC);
        });
        
        that.locate("addNewListRowButton").click(that.addNewListRow);
    };
    
    var setUpListEditor = function (that) {
        that.locate("newListRow").hide();
        bindEventHandlers(that);
        that.events.pageReady.fire();
    };
    
    /**
     * 
     * @param {Object} container
     * @param {Object} recordType   The record type of the records being listed
     * @param {Object} uispec
     * @param {Object} options
     */
    cspace.listEditor = function (container, recordType, uispec, options) {
        var that = fluid.initView("cspace.listEditor", container, options);
        that.recordType = recordType;
        that.uispec = uispec;
        that.model = {
            list: [],
            details: {}
        };
        
        //TODO: This component needs to be IOC'ed.
        
        that.detailsApplier = fluid.makeChangeApplier(that.model.details);
        that.detailsDC = fluid.initSubcomponent(that, "dataContext", [that.model.details, fluid.COMPONENT_OPTIONS]);
        that.detailsDC.fetch();
        
        that.options.details.options = that.options.details.options || {};
        that.options.details.options.applier = that.detailsApplier;
        that.options.details.options.dataContext = that.detailsDC;
        that.options.details.options.model = that.model.details;
        that.options.details.options.uispec = that.uispec.details;
        that.details = fluid.initSubcomponent(that, "details", 
            [$(that.options.selectors.details, that.container), fluid.COMPONENT_OPTIONS]);
        hideDetails(that.dom);
        
        /**
         * addNewListRow - add an empty row to the list and display cleared and ready for editing details.
         */
        that.addNewListRow = function () {
            that.detailsDC.fetch();
            showDetails(that.dom, true);
            that.events.afterAddNewListRow.fire();
        };
        
        that.refreshView = function () {
            that.list.refreshView();
            hideDetails(that.dom);
        };
        
        $.extend(true, that.options.list.options, {
            onSelectHandler: function (model, rows, events, styles, newIndex) {
                if (that.details.unsavedChanges) {
                    // We save the oldSuccessHandler and then put it back in place once the event is triggered in 
                    // order to keep the defualt functionality enabled. 
                    var oldSuccessHandler = that.details.confirmation.options.successHandler; 
                    that.details.confirmation.options.successHandler = function (confirmation) {
                        return function () {
                            confirmation.updateEventListeners("remove");                            
                            confirmation.dlg.dialog("close");
                            confirmation.options.successHandler = oldSuccessHandler;
                            that.details.unsavedChanges = false;
                            cspace.recordList.onSelectHandlerDefault(model, rows, events, styles, newIndex);
                        };
                    };
                    that.details.showConfirmation();
                }
                else {
                    cspace.recordList.onSelectHandlerDefault(model, rows, events, styles, newIndex);
                }
            }
        });

        var initListFunction = function () {
            that.options.list.options.model = {
                items: that.model.list,
                selectionIndex: -1
            };
            that.options.list.options.uispec = that.uispec.list;
            that.list = fluid.initSubcomponent(that, "list", 
                [$(that.options.selectors.list, container), fluid.COMPONENT_OPTIONS]);
            setUpListEditor(that);
        };
        if (typeof(that.options.initList) === "function") {
            that.options.initList(that, initListFunction);
        } else {
            fluid.invokeGlobalFunction(that.options.initList, [that, initListFunction]);
        }
        return that;
    };

    /*
     * A strategy for providing data to populate the 'list' portion of the ListEditor model.
     * This strategy fetches the data from the server. 
     * @param {Object} listEditor   The ListEdior component
     * @param {Function} callback   An optional callback function that will be called on success
     */
    cspace.listEditor.fetchData = function (listEditor, callback) {
        $.ajax({
            url: listEditor.options.baseUrl + listEditor.recordType,
            dataType: "json",
            success: function (data) {
                fluid.model.copyModel(listEditor.model.list, data.items);
                if (callback) {
                    callback();
                }
            }
        });
    };

    /*
     * A strategy for providing data to populate the 'list' portion of the ListEditor model.
     * This strategy extracts data from an option. 
     * @param {Object} listEditor   The ListEdior component
     * @param {Function} callback   An optional callback function that will be called on success
     */
    cspace.listEditor.receiveData = function (listEditor, callback) {
        fluid.model.copyModel(listEditor.model.list, listEditor.options.data);
        if (callback) {
            callback();
        }
    };
    
    /*
     * A strategy for providing data to populate the 'details' portion of the ListEditor model.
     * This strategy uses the DataContext to fetch the information. 
     * @param {Object} model        A data model
     * @param {Object} detailsDC    The DataContext used for the 'details' section of the component
     */
    cspace.listEditor.loadDetails = function (model, detailsDC) {
        var selectedModel = model.items[model.selectionIndex];
        if (!selectedModel) {
            return;
        }
        detailsDC.fetch(model.items[model.selectionIndex].csid);
    };

    fluid.defaults("cspace.listEditor", {
        list: {
            type: "cspace.recordList",
            options: {}
        },
        details: {
            type: "cspace.recordEditor",
            options: {
                deferRendering: true
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
            hideOnEdit: ".csc-details-hideOnEdit",
            addNewListRowButton: ".csc-listEditor-createNew"
        },
        events: {
            pageReady: null,
            afterAddNewListRow: null
        },
        
        // strategies:
        loadDetails: cspace.listEditor.loadDetails,
        initList: cspace.listEditor.fetchData,
        updateList: cspace.listEditor.fetchData,

        baseUrl: "../../chain/", // used by the cspace.listEditor.fetchData strategy
        data: [] // used by the cspace.listEditor.receiveData strategy
    });

})(jQuery, fluid);
