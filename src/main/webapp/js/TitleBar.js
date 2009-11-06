/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_1*/

var cspace = cspace || {};

(function ($, fluid) {

    var buildCutpoints = function (selectors) {
        return [
            {id: "number", selector: selectors.number},
            {id: "numberLabel", selector: selectors.numberLabel},
            {id: "text", selector: selectors.text},
            {id: "textLabel", selector: selectors.textLabel}
        ];
    };

    var buildTree = function (model) {
        return {
            children: [
                {ID: "number", valuebinding: "number"},
                {ID: "numberLabel", value: model.numberLabel},
                {ID: "text", valuebinding: "text"},
                {ID: "textLabel", value: model.textLabel}
            ]
        };
    };

    var setupTitleBar = function (that) {
        // Data structure needed by fetchResources
        var resources = {
            titleBar: {
                href: that.options.templateURL,
                cutpoints: buildCutpoints(that.options.selectors)
            }
        };
        
        // Get the template, create the tree and render the table of contents
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["titleBar"], {});
            var node = $("<div></div>", that.container[0].ownerDocument);
            fluid.reRender(templates, node, buildTree(that.model), {model: that.model,
                                                                    applier: that.applier,
                                                                    debugMode: true,
                                                                    autoBind: true});
            that.container.append(node);
            that.events.afterRender.fire(node);
        });
    };

    cspace.titleBar = function (container, options) {
        var that = fluid.initView("cspace.titleBar", container, options);
        // probably initialize model from options?
        that.model = {
            number: "Test Number",
            numberLabel: that.options.strings.numberLabel,
            text: "Test Text",
            textLabel: that.options.strings.textLabel
        };

        that.applier = fluid.makeChangeApplier(that.model);
        
        setupTitleBar(that);

        return that;
    };

    fluid.defaults("cspace.titleBar", {
        events: {
            afterRender: null
        },
        selectors: {
            number: ".csc-titleBar-number",
            numberLabel: ".csc-titleBar-numberLabel",
            text: ".csc-titleBar-text",
            textLabel: ".csc-titleBar-textLabel"
        },
        strings: {
            numberLabel: "Object Number",
            textLabel: "Object Title"
        },
        templateURL: "../html/TitleBarTemplate.html"
    });
}) (jQuery, fluid_1_1);
