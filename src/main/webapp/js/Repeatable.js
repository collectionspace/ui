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
    
    // TODO: Account for an elPath into the model that points to undefined: not known whether it is a simple field or an object/row.
    var addRow = function (fields) {
        fields.push(typeof(fields[0]) === "string" ? "" : {});
        return fields;
    };
    
    var bindEventHandlers = function (that) {        
        var elPath = that.options.elPath;
        
        // Waiting to ensure that the change request went through before changing the model.
        // Also fires when fields get modified.
        that.applier.modelChanged.addListener(elPath, function (model) {             
            fluid.model.setBeanValue(that.model, elPath, fluid.model.getBeanValue(model, elPath));
        });
        
        // Make a change request to add an extra row.
        that.locate("addButton").click(function () {                        
            that.applier.requestChange(elPath, addRow(fluid.model.getBeanValue(that.model, elPath)));
            that.refreshView();
            that.events.afterAdd.fire();
        });
        
        that.locate("deleteButton").click(function () {
            that.events.afterDelete.fire();
        });
    };
    
    var renderPage = function (that) {
        // TODO: We should pass the args to the expander that are consistent with generic expanders.
        var tree = fluid.invokeGlobalFunction(that.options.expander, [that.options.protoTree, that]);
        $.extend(true, that.options.renderOptions, {
            model: that.model,
            applier: that.applier
        });
        if (that.template) {
            fluid.reRender(that.template, that.container, tree, that.options.renderOptions);
        }
        else {
            that.template = fluid.selfRender(that.container, tree, that.options.renderOptions);
        }
        bindEventHandlers(that);
        that.events.afterRender.fire();
    };

    /*
     * Repeated fields are expected to save the fields even if they're empty.
     * In this case, we require at least one instance of the field in the model.
     */
    var prepareModel = function (model, elPath, applier) {
        var list = fluid.model.getBeanValue(model, elPath);
        if (!list || list.length === 0) {
            list = addRow([]);
            applier.requestChange(elPath, list);
            fluid.model.setBeanValue(model, elPath, list);
        }
    };

    cspace.repeatable = function (container, options) {
        
        var that = fluid.initView("cspace.repeatable", container, options);
        
        that.applier = that.options.applier;
        that.model = that.options.model;
        prepareModel(that.model, that.options.elPath, that.applier);
        
        that.refreshView = function () {
            renderPage(that);
        };
            
        that.refreshView();        
        return that;
    };
    
    // TODO: This is a cspace specific function, we need to take it out to utilities for example.
    cspace.repeatable.extendDecoratorOptions = function (options, parentComponent) {
        $.extend(true, options, {
            applier: parentComponent.applier,
            model: parentComponent.model,
            renderOptions: {
                cutpoints: cspace.renderUtils.cutpointsFromUISpec(options.protoTree)
            },
            expander: "cspace.renderUtils.expander"
        });
    };
    
    fluid.defaults("cspace.repeatable", {
        selectors: {
            addButton: ".csc-repeatable-add",
            deleteButton: ".csc-repeatable-delete"
        },
        events: {
            afterRender: null,
            afterDelete: null,
            afterAdd: null
        },         
        applier: null,      // Applier for the main record that cspace.repeatable belongs to. REQUIRED
        model: null,        // Model for the main record that cspace.repeatable belongs to. REQUIRED
        elPath: "",         // Path into the model that points to the field/collection of fields to be repeated.
        protoTree: {},      // A dehydrated tree that will be expanded by the expander and rendered in the component's refreshView.
        expander: null,     // Expands the protoTree to take form of the componentTree comprehendable by the renderer.
        renderOptions: {    // Render options that (including cutpoints) that will be passed to the renderer in the component's refreshView.
            autoBind: true,
            // debugMode: true,
            cutpoints: []
        } 
    });
    
})(jQuery, fluid);