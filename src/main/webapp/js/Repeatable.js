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
    //       We need to write a test for this but I think it is fixed now
    var addRow = function (fields) {
        // TODO: It's not yet sure whether or not a simple object like this will work for
        //       groups of fields - we'll have to test against the server when it's supported
        fields.push({});
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
        that.locate("add").click(function () {                        
            that.applier.requestChange(elPath, addRow(fluid.model.getBeanValue(that.model, elPath)));
            that.refreshView();
            that.events.afterAdd.fire();
        });
        
        that.locate("remove").click(function () {
            that.events.afterDelete.fire();
        });
    };
    
    var renderPage = function (that) {
        that.options.renderOptions.cutpoints.push({id: "repeat:", selector: that.options.selectors.repeat});
        
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

    /**
     * @node content node that will contain primary and delete
     */
    var addPrimaryAndDelete = function (that, node) {
        // TODO: we need to programatically generate the 'name' attribute since we need more then one group of radio buttons on a page. 
        var primary = $("<input class=\"csc-repeatable-primary\" type=\"radio\" name=\"primary\" />");
        var remove = $("<input class=\"csc-repeatable-delete\" type=\"button\" />");
                
        if (node[0].tagName === "TR") {
            primary.wrap("<td />");
            remove.wrap("<td />");
        }
        
        if (that.locate("primary").length === 0) {
            node.prepend(primary);
        }
        
        if (that.locate("remove").length === 0) {
            node.append(remove);
        }
                
    };
    
    
    /**
     * Repeatable is a markup generating component. If it does not find things in the markup that are specified 
     * in the default selectors, it generates nodes appropriately and puts the default selector classes into the markup.
     *  
     */
    cspace.repeatable = function (container, options) {        
        var that = fluid.initView("cspace.repeatable", container, options);
        
        that.applier = that.options.applier;
        that.model = that.options.model;
        prepareModel(that.model, that.options.elPath, that.applier);
        that.options.generateMarkup(that);
        
        that.refreshView = function () {
            renderPage(that);
        };
            
        that.refreshView();        
        return that;
    };
    
    cspace.repeatable.generateMarkup = function (that) {
        // Check for the add button and generate it if required 
        if (that.locate("add").length === 0) {
            // TODO: i18n the string
            that.container.prepend("<input class=\"csc-repeatable-add\" type=\"button\" value=\"+ Field\" />");
        }
        
        var node = that.locate("repeat");
        // TODO: check that we have a repeating node - if not what should we do? grab the first thing? grab everything?
        
        if (node[0].tagName !== "TR" && node[0].tagName !== "LI") {
            node.wrap("<ul><li class=\"csc-repeatable-repeat\"/></ul>");            
            // TODO: there is probably a bug here when the 'repeat' selector is overridden - write a test to prove this
            node.removeClass("csc-repeatable-repeat");
            node = node.parent("li");    
        }

        addPrimaryAndDelete(that, node);        
    };

    // TODO: This is a cspace specific function, we need to take it out to utilities for example.
    cspace.repeatable.extendDecoratorOptions = function (options, parentComponent) {
        $.extend(true, options, {
            applier: parentComponent.applier,
            model: parentComponent.model,
            renderOptions: {
                cutpoints: cspace.renderUtils.cutpointsFromUISpec(options.protoTree)
            }
        });
    };

    cspace.repeatable.expander = function (preProtoTree, that) {
        var rowSelector = "repeat:";
        var protoTree = {};
        protoTree[rowSelector] = {
            children : [preProtoTree]
        };
        
        // TODO: this depends on cspace utilities - once the functionality is in infusion remove the dependency
        return cspace.renderUtils.expander(protoTree, that);
    };
    
    fluid.defaults("cspace.repeatable", {
        selectors: {
            add: ".csc-repeatable-add",
            remove: ".csc-repeatable-delete",
            primary: ".csc-repeatable-primary",
            repeat: ".csc-repeatable-repeat"     
        },
        events: {
            afterRender: null,
            afterDelete: null,
            afterAdd: null
        },         
        applier: null,      // Applier for the main record that cspace.repeatable belongs to. REQUIRED
        model: null,        // Model for the main record that cspace.repeatable belongs to. REQUIRED
        elPath: "items",         // Path into the model that points to the collection of fields to be repeated - it should be an array.
        protoTree: {},      // A dehydrated tree that will be expanded by the expander and rendered in the component's refreshView.
        expander: "cspace.repeatable.expander",     // Expands the protoTree to take form of the componentTree comprehendable by the renderer.
        renderOptions: {    // Render options that (including cutpoints) that will be passed to the renderer in the component's refreshView.
            autoBind: true
           // debugMode: true
        },
        generateMarkup: cspace.repeatable.generateMarkup   // TODO: change this to a function name instead of a function
    });
    
    /**
     * @element a jqueryable selector
     */
    cspace.makeRepeatable = function (element, options) {
        element = $(element);
        element.addClass("csc-repeatable-repeat");
        element.wrap("<div />");
        
        return cspace.repeatable(element.parent("div"), options);
    };

    cspace.makeRepeatable.extendDecoratorOptions = cspace.repeatable.extendDecoratorOptions;

})(jQuery, fluid);