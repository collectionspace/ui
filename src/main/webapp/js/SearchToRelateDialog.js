/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {

    var makeRelater = function (that) {
        return function () {
            var data = that.search.resultsPager.options.dataModel;

            that.dlg.dialog("close");
        };
    };

    var setupAddDialog = function (that) {
        var resources = {
            addDialog: {
                href: "../html/searchToRelate.html"
            }
        };
        
        var addDialog = $("<div></div>", that.container[0].ownerDocument)
            .dialog({
                autoOpen: false,
                modal: true,
                dialogClass: "cs-search-dialog",
                position: [50,50],
                midWidth: 700
            });
        
        addDialog.parent().css("overflow", "visible");
        
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["addDialog"], {});
            fluid.reRender(templates, addDialog, {});

            var searchOpts = {
                resultsSelectable: true
            };
            if (cspace.util.isLocal()) {
                searchOpts.searchUrlBuilder = function (recordType, query) {
                    var recordTypeParts = (recordType === "collection-object" ? [recordType] : recordType.split('-'));        
                    return "./data/" + recordTypeParts.join('/') + "/search/list.json";
                };
            }
            that.search = cspace.search(".main-search-page", searchOpts);

            that.locate("addButton", addDialog).click(makeRelater(that));
        });

        return addDialog;        
    };

    cspace.searchToRelateDialog = function (container, options) {
        var that = fluid.initView("cspace.searchToRelateDialog", container, options);

        that.dlg = setupAddDialog(that);

        that.prepareDialog = function (type) {
            var selectBoxContainer = that.locate("selectBoxContainer", that.dlg);
            selectBoxContainer.empty();
            selectBoxContainer.append(that.locate(type+"Selecter", that.dlg).clone());
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
            objectSelecter: ".csc-recordTypeSelecter-object",
            proceduresSelecter: ".csc-recordTypeSelecter-procedures"
        }
    });
})(jQuery, fluid_1_2);
