/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RecordList.js loaded");

    var selectItem = function (row, model, domBinder, events, styles) {
        row = $(row);
        var rows = domBinder.locate("row");
        var newIndex = rows.index(row);        
        events.onSelect.fire(model, rows, events, styles, newIndex);
    };

    var bindEventHandlers = function (that) {
        var list = that.container;
        var rows = that.locate("row");
        
        that.events.onSelect.addListener(that.options.onSelectHandler);
        
        list.fluid("selectable", {
            selectableElements: rows,
            onSelect: function (row) {
                if (row) {
                    rows.removeClass(that.options.styles.selecting);
                    $(row).addClass(that.options.styles.selecting);
                }
            },
            onUnselect: function (row) {
                if (row) {
                    $(row).removeClass(that.options.styles.selecting);
                }
            }
        });
        rows.mouseover(function (event) {
            rows.removeClass(that.options.styles.selecting);
            $(event.currentTarget).addClass(that.options.styles.selecting);
        });

        rows.click(function (event) {
            selectItem(event.currentTarget, that.model, that.dom, that.events, that.options.styles);
        });

        rows.fluid("activatable", function (event) {
            selectItem(event.currentTarget, that.model, that.dom, that.events, that.options.styles);
        });
    };

    var renderList = function (that) {
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}", model: that.model});
        var protoTree = cspace.renderUtils.buildProtoTree(that.uispec, that);
        var tree = expander(protoTree);
        if (that.model.items.length <= 0) {
            tree.children[0].children = [{
                ID: that.options.selectors.nothingYet,
                value: that.options.strings.nothingYet
            }];
        }
        var selectors = {};
        cspace.renderUtils.buildSelectorsFromUISpec(that.uispec, selectors);
        selectors[that.options.selectors.nothingYet] = that.options.selectors.nothingYet;
        var renderOpts = {
            cutpoints: fluid.renderer.selectorsToCutpoints(selectors, {}),
            model: that.model,
            // debugMode: true,
            autoBind: true
        };
        if (!that.renderTemplate) {
            that.renderTemplate = fluid.selfRender(that.container, tree, renderOpts);
        } else {
            fluid.reRender(that.renderTemplate, that.container, tree, renderOpts);
        }
        that.locate("numberOfItems").text("(" + that.model.items.length + ")");
    };

    cspace.recordList = function (container, model, uispec, options) {
        var that = fluid.initView("cspace.recordList", container, options);
        that.model = model;
        that.uispec = uispec;
        that.refreshView = function () {
            renderList(that);
            bindEventHandlers(that);
            that.events.afterRender.fire();
        };

        that.refreshView();
        return that;
    };
    
    cspace.recordList.onSelectHandlerDefault = function (model, rows, events, styles, newIndex) {
        rows.removeClass(styles.selected);
        rows.eq(newIndex).addClass(styles.selected);
        model.selectionIndex = newIndex;
        events.afterSelect.fire(model);    
    };
    
    fluid.defaults("cspace.recordList", {
        onSelectHandler: cspace.recordList.onSelectHandlerDefault,
        selectors: {
            numberOfItems: ".csc-num-items",    // present in sidebar, not in find/edit
            nothingYet: ".csc-no-items-message",
            row: ".csc-recordList-row"
        },
        events: {
            onSelect: null,
            afterSelect: null,
            afterRender: null
        },
        strings: {
            nothingYet: "No related records yet"
        },
        styles: {
            selecting: "cs-selecting",
            selected: "cs-selected"
        }
    });

})(jQuery, fluid);
