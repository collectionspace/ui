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

    var buildTree = function () {
        return {
            children: [
                {ID: "patterns",
                 optionnames: {valuebinding: "names"},
                 optionlist: {valuebinding: "list"},
                 selection: {valuebinding: ""}
            },
            {ID: "pattern-row:",
             children: [
                 {ID: "pattern-name",
                  parentRelativeID: "..::patterns",
                  choiceindex: 0},
                 {ID: "pattern-sample",
                  value: "IN2009.1"}
             ]},
            {ID: "pattern-row:",
             children: [
                 {ID: "pattern-name",
                  parentRelativeID: "..::patterns",
                  choiceindex: 1},
                 {ID: "pattern-sample",
                  value: "ACC2009.42"}
             ]},
            {ID: "pattern-row:",
             children: [
                 {ID: "pattern-name",
                  parentRelativeID: "..::patterns",
                  choiceindex: 2},
                 {ID: "pattern-sample",
                  value: "LI2009.1"}
             ]}
            ]
        };
    };

    var buildCutpoints = function () {
        return [
            {id: "pattern-row:", selector: ".csc-numberPatternChooser-patternRow"},
            {id: "pattern-name", selector: ".csc-numberPatternChooser-name"},
            {id: "pattern-sample", selector: ".csc-numberPatternChooser-sample"}
        ];
    };

    var setupChooser = function (that) {
        // Data structure needed by fetchResources
        var resources = {
            chooser: {
                href: that.options.templateURL,
                cutpoints: buildCutpoints()
            }
        };
        
        // Get the template, create the tree and render the table of contents
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["chooser"], {});
            var node = $("<div></div>", that.container[0].ownerDocument);
            fluid.reRender(templates, node, buildTree(), {model: that.model});
            that.container.append(node);
            that.events.afterRender.fire(node);
        });
    };

    cspace.numberPatternChooser = function (container, options) {
        var that = fluid.initView("cspace.numberPatternChooser", container, options);
        that.model = {
            names: ["Intake", "Acquisition", "Loan In"],
            list: ["intake", "acc", "loan-in"],
            selection: "acc"
        }; // = options.model?
        
        that.refreshView = function () {
            
        };
        
        setupChooser(that);

        return that;
    };

    fluid.defaults("cspace.numberPatternChooser", {
        selectors: {
            button: ".csc-numberPatternChooser-button",
            list: ".csc-numberPatternChooser-list"
        },
        events: {
            afterRender: null
        },
        templateUrl: "../html/NumberPatternChooser.html"
    });
}) (jQuery, fluid_1_1);
