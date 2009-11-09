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

    var buildTree = function (model) {
		// If no model return empty component tree.	
		if (!model) {
			return {};
		}
				
		var samples = model.samples;		
		var tree = {
			children: [{
				ID: "patterns",
	            optionnames: {valuebinding: "names"},
	            optionlist: {valuebinding: "list"},
	            selection: {valuebinding: ""}
			}]
		};		
		return tree.children.concat(fluid.transform(samples, function (node, index) {
			return {
                ID: "pattern-row:",
                children: [{
                    ID: "pattern-name",
                    parentRelativeID: "..::patterns",
                    choiceindex: index
                }, {
                    ID: "pattern-sample",
                    value: node
                }]
            };
		}));
    };

    var buildCutpoints = function (selectors) {
        return [
            {id: "pattern-row:", selector: selectors.row},
            {id: "pattern-name", selector: selectors.name},
            {id: "pattern-sample", selector: selectors.sample}
        ];
    };

    var fetchNextNumberInSequence = function (that, sequenceName, callback) {
        callback(that, sequenceName);
//        ajax call to get number({
//            callback: callback
//        });
    };

    var populateInputField = function(that, value) {
		var numField = that.locate("numberField", that.container);
		numField.val(value);
		fluid.applyChange(numField, value, that.options.applier);
    };

    var bindEvents = function (that) {
        var list = that.locate("list");
        that.locate("button").click(function () {
			if (list.is(":visible")) {
				list.hide();
			}
			else {
				list.show();
			}
        });
        that.locate("row").click(function (eventObject) {
            that.options.selected = that.model.list[eventObject.currentTarget.rowIndex-1];
            list.hide();
            fetchNextNumberInSequence(that, that.options.selected, populateInputField);
        });
    };
	
	var setupNode = function (that) {
		// Only display number-pattern-chooser button when there is a model.
		if (!that.model) {
            that.locate("button").hide();
        }
		that.locate("list").hide();
	};

    var setupChooser = function (that) {
        // Data structure needed by fetchResources
        var resources = {
            chooser: {
                href: that.options.templateUrl,
                cutpoints: buildCutpoints(that.options.selectors)
            }
        };
        
        // Get the template, create the tree and render the table of contents
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["chooser"], {});
			var node = $("<div></div>", that.container[0].ownerDocument);
            fluid.reRender(templates, node, buildTree(that.model), {model: that.model});
			that.container.append(node);
			setupNode(that);
            bindEvents(that);
            that.events.afterRender.fire(node);
        });
    };

    cspace.numberPatternChooser = function (container, options) {
        var that = fluid.initView("cspace.numberPatternChooser", container, options);
		
        that.model = that.options.model;
        
        that.refreshView = function () {            
        };
        
        setupChooser(that);

        return that;
    };

    fluid.defaults("cspace.numberPatternChooser", {
        selectors: {
            button: ".csc-numberPatternChooser-button",
            list: ".csc-numberPatternChooser-list",
			row: ".csc-numberPatternChooser-patternRow",
			name: ".csc-numberPatternChooser-name",
			sample: ".csc-numberPatternChooser-sample"
        },
		model: null,
		selected: null,
        events: {
            afterRender: null
        },
        templateUrl: "../html/NumberPatternChooser.html"
    });
}) (jQuery, fluid_1_1);
