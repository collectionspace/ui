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
    fluid.log("SearchToRelateDialog.js loaded");

    var handleAddClick = function (that) {
        return function () {
            var data = that.search.model.results;
            var newIndex = 0;
            var newRelations = [];
            var source = {
                csid: that.model.csid,
                recordtype: that.options.primary
            };
            for (var i = 0; i < data.length; i++) {
                if (data[i].selected) {
                    newRelations[newIndex] = {
                        source: source,
                        target: data[i],
                        type: "affects",
                        "one-way": false
                    };
                    ++newIndex;
                }
            }
            that.events.addRelations.fire({
                items: newRelations
            });
            that.dlg.dialog("close");
        };
    };
    
    var bindEventHandlers = function (that, addDialog) {
        that.locate("addButton", addDialog).click(handleAddClick(that));
        that.locate("closeButton", addDialog).click(function () {
            addDialog.dialog("close");
        });
        that.locate("createNewButton", addDialog).click(function () {
            that.events.onCreateNewRecord.fire();
            that.dlg.dialog("close");
        });
        that.search.events.onSearch.addListener(function () {
            that.locate("addButton", that.dlg).hide();
        });
        that.search.events.afterSearch.addListener(function () {
            that.locate("addButton", that.dlg).show();
        });
    };

    var setupAddDialog = function (that) {
        var resources = {
            addDialog: {
                href: that.options.templates.dialog
            }
        };
        
        fluid.fetchResources(resources, function () {
            // TODO: check why we are fetching resources after we create the dialog. 
            var templates = fluid.parseTemplates(resources, ["addDialog"], {});
            that.dlg = $("<div></div>", that.container[0])
                .dialog({
                    autoOpen: false,
                    modal: true,
                    minWidth: 700,
                    draggable: true,
                    dialogClass: "cs-search-dialog",
                    position: ['center', 100],
                    title: "Add Related Object/Procedural Record"                
                });        
            that.dlg.parent().css("overflow", "visible");
            
            fluid.reRender(templates, that.dlg, {});
            // TODO: We are hard coding a selector in here for search. 
            //       The selector should conform to cspace standards and should be specified in the options block
            $.extend(true, that.options.search.options, {recordType: that.options.related});
            that.search = fluid.initSubcomponent(that, "search", [that.dlg, fluid.COMPONENT_OPTIONS]);
            
            bindEventHandlers(that, that.dlg);
            
            that.search.hideResults();
            if (that.options.related && (that.options.related !== "procedures")) {
                // TODO: This makes serious DOM assumptions!!
                that.locate("recordTypeSelector", that.dlg).append("<option value=\"" + that.options.related + "\"></option>");
                that.locate("recordTypeSelector", that.dlg).val(that.options.related);
                that.locate("recordTypes", that.dlg).hide();
            }
            that.locate("addButton", that.dlg).hide();
            
            that.events.afterRender.fire();
        });
    };
    
 // TODO: All this really needs is the csid, not the "applier"!
    cspace.searchToRelateDialog = function (container, options) {        
        var that = fluid.initView("cspace.searchToRelateDialog", container, options);
        that.model = that.options.model;
        setupAddDialog(that);
        return that;
    };
    
    fluid.defaults("cspace.searchToRelateDialog", {
        mergePolicy: {
            model: "preserve"
        },
        selectors: {
            addButton: ".csc-searchToRelate-addButton",
            recordTypeSelector: ".csc-search-recordType",
            recordTypes: ".csc-searchToRelate-recordTypes",
            closeButton: ".csc-searchToRelate-closeBtn",
            createNewButton: ".csc-searchToRelate-createButton"
        },
        templates: {
            dialog: "../html/searchToRelate.html"
        },
        events: {
            addRelations: null,
            onCreateNewRecord: null,
            afterRender: null
        },
        search: {
            type: "cspace.search.searchView",
            options: {
                resultsSelectable: true
            }
        }
    });
})(jQuery, fluid);
