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

    makeFunction = function (recordType) {
        return function () {
            $(".test-content").text("This is the new text. Record type = "+recordType);
        };
    };

    setupAddDialog = function (that) {
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
            $(".test-search-button").click(makeFunction("bar"));
        });

        return addDialog;        
    };

    cspace.searchToRelateDialog = function (container, options) {
        var that = fluid.initView("cspace.searchToRelateDialog", container, options);

        that.dlg = setupAddDialog(that);

        that.showDialog = function () {
            
        };

        return that;
    };
    
    fluid.defaults("cspace.searchToRelateDialog", {
        selectors: {
            addButton: ".csc-add-related-records-button",
            recordTypeString: ".csc-record-type"
        }
    });
})(jQuery, fluid_1_2);
