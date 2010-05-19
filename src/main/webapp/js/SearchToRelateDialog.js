/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {

    var handleAddClick = function (that) {
        return function () {
            var data = that.search.resultsPager.options.dataModel;
            var newIndex = 0;
            var newRelations = [];
            var source = {
                csid: that.model.csid,
                recordtype: that.options.currentRecordType
            };
            // TODO: Candidate for transform.
            for (var i = 0; i < data.length; i++) {
                if (data[i].selected) {
                    newRelations[newIndex] = {
                        source: source,
                        target: data[i],
                        type: "affects",
                        "one-way": false
                    };
                    newIndex += 1;
                }
            }
            that.events.addRelations.fire({
                items: newRelations
            });
            that.dlg.dialog("close");
        };
    };

    var setupAddDialog = function (that) {
        var resources = {
            addDialog: {
                href: that.options.templates.dialog
            }
        };
        
        var addDialog = $("<div></div>", that.container[0].ownerDocument)
            .dialog({
                autoOpen: false,
                modal: true,
				minWidth: 700,
				draggable: true,
                dialogClass: "cs-search-dialog",
                position: ['center', 100],
				title: "Add Related Object/Procedural Record"                
            });
        
        addDialog.parent().css("overflow", "visible");
        
        fluid.fetchResources(resources, function () {
            // TODO: check why we are fetching resources after we create the dialog. 
            var templates = fluid.parseTemplates(resources, ["addDialog"], {});
            fluid.reRender(templates, addDialog, {});

            // TODO: Should be pushed up.
            var searchOpts = {
                resultsSelectable: true
            };
            if (cspace.util.isLocal()) {
                searchOpts.searchUrlBuilder = function (recordType, query) {
                    var recordTypeParts = recordType.split('-');        
                    return "./data/" + recordTypeParts.join('/') + "/search/list.json";
                };
            }
            // TODO: Should be a subcomponent.
            // Like this: that.search = fluid.initSubcomponent(that, "search", [$(".main-search-page", ".cs-search-dialog"), fluid.COMPONENT_OPTIONS]);
            that.search = cspace.search(".main-search-page", searchOpts);

            that.locate("addButton", addDialog).click(handleAddClick(that));
            that.locate("closeButton", addDialog).click(function () {
                addDialog.dialog("close");
            });
            that.events.afterRender.fire();
        });

        return addDialog;        
    };

    cspace.searchToRelateDialog = function (container, model, options) {
        
        var that = fluid.initView("cspace.searchToRelateDialog", container, options);
        that.model = model;
        that.dlg = setupAddDialog(that);

        that.prepareDialog = function (type) {
            var selectBoxContainer = that.locate("selectBoxContainer", that.dlg);
            selectBoxContainer.empty();
            selectBoxContainer.append(that.locate(type + "Selecter", that.dlg).clone());
            that.locate("searchResults", that.dlg).hide();
        };

        return that;
    };
    
    fluid.defaults("cspace.searchToRelateDialog", {
        selectors: {
            addButton: ".csc-relate-button",
            searchResults: ".csc-search-results",
            recordTypeString: ".csc-record-type",
            selectBoxContainer: ".csc-select-box-container",
            selectBoxes: ".csc-select-boxes",
            objectsSelecter: ".csc-recordTypeSelecter-object",
            proceduresSelecter: ".csc-recordTypeSelecter-procedures",
            closeButton: ".csc-searchToRelate-closeBtn"
        },
        templates: {
            dialog: "../html/searchToRelate.html"
        },
        events: {
            addRelations: null,
            afterRender: null
        }
    });
})(jQuery, fluid);
