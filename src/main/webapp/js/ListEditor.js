/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
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
            that.options.messageBar.hide();
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
        
        that.list.events.afterSelect.addListener(function (list) {
            that.options.loadDetails(list.model, that.detailsDC);
        });
        
        that.locate("addNewListRowButton").click(that.addNewListRow);
    };
    
    var setUpListEditor = function (that) {
        that.locate("newListRow").hide();
        bindEventHandlers(that);
        fluid.log("listEditor pageReady");
        that.events.pageReady.fire(that);
    };
    
    fluid.demands("details", "cspace.listEditor", ["{listEditor}.dom.details", fluid.COMPONENT_OPTIONS]);
    fluid.demands("list", "cspace.listEditor", ["{listEditor}.dom.list", fluid.COMPONENT_OPTIONS]);
    
    /**
     * 
     * @param {Object} container
     * @param {Object} recordType   The record type of the records being listed
     * @param {Object} uispec
     * @param {Object} options
     */
    cspace.listEditor = function (container, recordType, uispec, options) {
        var that = fluid.initView("cspace.listEditor", container, options);
        fluid.initDependents(that);
        that.recordType = recordType;
        that.uispec = uispec;
        that.model = {
            list: [],
            details: {}
        };
        
        //TODO: This component needs to be IOC'ed.
        
        that.detailsApplier = fluid.makeChangeApplier(that.model.details);
        that.options.components.detailsDC = {
            type: "cspace.dataContext",
            options: that.options.dataContext.options
        };
        fluid.initDependent(that, "detailsDC", that.instantiator);
        that.detailsDC.initDataSource();
        that.detailsDC.fetch();
        
        that.options.components.details = fluid.merge({
            "options.model": "preserve",
            "options.applier": "nomerge"
        }, that.options.details, {
            options: {
                applier: "{listEditor}detailsApplier",
                model: "{listEditor}model.details",
                uispec: "{listEditor}uispec.details"
            }
        });
        
        fluid.initDependent(that, "details", that.instantiator);
        
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
        
        that.options.list.options.onSelectHandler = function (list, rows, newIndex) {
            that.options.globalNavigator.events.onPerformNavigation.fire(function () {
                cspace.recordList.onSelectHandlerDefault(list, rows, newIndex);
            });
        };

        var initListFunction = function () {
            that.options.list.options.model = {
                items: that.model.list,
                selectionIndex: -1
            };
            that.options.list.options.uispec = "{listEditor}uispec.list";
            that.options.components.list = {
                type: "cspace.recordList",
                options: that.options.list.options
            };
            fluid.initDependent(that, "list", that.instantiator);
            setUpListEditor(that);
        };
        if (typeof(that.options.initList) === "function") {
            that.options.initList(that, initListFunction);
        } else {
            fluid.invokeGlobalFunction(that.options.initList, [that, initListFunction]);
        }
        that.events.afterSetup.fire(that);
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
                if (listEditor.list) {
                    // We have to requestChange here in order for the recordList
                    // to update the list of records with new model.
                    listEditor.list.applier.requestChange("items", data.items);
                }
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
        if (listEditor.list) {
            // We have to requestChange here in order for the recordList
            // to update the list of records with new model.
            listEditor.list.applier.requestChange("items", listEditor.options.data);
        }
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
        globalNavigator: "{globalNavigator}",
        messageBar: "{messageBar}",
        components: {
            instantiator: "{instantiator}"
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
            afterSetup: null,
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
