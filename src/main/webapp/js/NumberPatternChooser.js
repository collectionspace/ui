/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid*/

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("NumberPatternChooser.js loaded");

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
        jQuery.ajax({
            url: cspace.util.addTrailingSlash(that.options.baseUrl) + "id/" + sequenceName,
            type: "GET",
            dataType: "json",
            success: callback,
            error: function (xhr, textStatus, errorThrown) {
                // TODO: implement proper error handling
                callback({next: "Not supported yet"}, "error");
            }
        });

    };

    var populateInputField = function (that) {
        return function (data, status) {
            var numField = that.locate("numberField", that.container);
            numField.val(data.next);
            numField.change();
            numField.focus();
        };
    };

    var selectNumberPattern = function (that, patternRow) {
        that.locate("checkmark").removeClass(that.options.styles.selected);
        that.options.selected = that.model.list[patternRow.rowIndex - 1];
        that.locate("checkmark", patternRow).addClass(that.options.styles.selected);
        that.locate("list").hide();
        fetchNextNumberInSequence(that, that.options.selected, populateInputField(that));
    };

    var bindEvents = function (that) {
        var list = that.locate("list");
        var rows = that.locate("row");
        
        that.locate("button").click(function () {
            var list = that.locate("list");
            list.toggle();
            if (list.is(":visible")) {
                list.focus();
            }
        });
        
        fluid.deadMansBlur(rows, rows, function (event) {
            list.hide();
        });

        var keyCode = function (evt) {
            return evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0);          
        };
        list.keypress(function (event) {
            if (keyCode(event) === $.ui.keyCode.ESCAPE) {
                list.hide();
            }
        });

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
            selectNumberPattern(that, event.currentTarget);
        });

        rows.fluid("activatable", function (event) {
            selectNumberPattern(that, event.currentTarget);
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

    // TODO: This makes *obvious*  assumptions about the nature of the parentComponent!
    cspace.numberPatternChooser.extendDecoratorOptions = function (options, parentComponent) {
        $.extend(true, options, {
            baseUrl: parentComponent.dataContext.options.baseUrl
        });
    };

    fluid.defaults("cspace.numberPatternChooser", {
        selectors: {
            button: ".csc-numberPatternChooser-button",
            list: ".csc-numberPatternChooser-list",
            row: ".csc-numberPatternChooser-patternRow",
            name: ".csc-numberPatternChooser-name",
            sample: ".csc-numberPatternChooser-sample",
	        checkmark: ".csc-numberPatternChooser-checkmark"
        },
		styles: {
	        selected: "cs-numberPatternChooser-selected",
            selecting: "cs-selecting"
	    },
        model: null,
        selected: null,
        events: {
            afterRender: null
        },
        templateUrl: "../html/NumberPatternChooser.html"
    });
})(jQuery, fluid);
