/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/

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
        var url = cspace.util.addTrailingSlash(that.options.baseUrl) + "id/" + sequenceName;
        jQuery.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: callback,
            error: function (xhr, textStatus, errorThrown) {
                cspace.util.provideErrorCallback(that, url, "errorFetching")(xhr, textStatus, errorThrown);
                callback({next: "Not supported yet"}, "error");
            }
        });

    };

    var populateInputField = function (that) {
        return function (data, status) {
            if (!data) {
                that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                    url: cspace.util.addTrailingSlash(that.options.baseUrl) + "id/" + that.options.selected
                }));
                return;
            }
            if (data.isError === true) {
                fluid.each(data.messages, function (message) {
                    that.displayErrorMessage(message);
                });
                return;
            }
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
        cspace.util.setZIndex(list);
        
        that.locate("button").click(function () {
            var list = that.locate("list");
            list.toggle();
            if (list.is(":visible")) {
                list.focus();
            }
        });
        
        fluid.deadMansBlur(rows, {
            exclusions: {rows: rows}, 
            handler: function () {
                list.hide();
            }
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

    fluid.defaults("cspace.numberPatternChooser", {
        gradeNames: ["fluid.viewComponent", "fluid.modelComponent", "autoInit"],
        finalInitFunction: "cspace.numberPatternChooser.finalInit",
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
            selecting: "cs-selecting",
            container: "cs-numberPatternChooserContainer"
        },
        model: null,
        selected: null,
        events: {
            afterRender: null
        },
        templateUrl: cspace.componentUrlBuilder("%webapp/html/components/NumberPatternChooser.html"),
        baseUrl: "../../../chain",
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        }
    });
    
    cspace.numberPatternChooser.finalInit = function (that) {
        // Data structure needed by fetchResources
        var resources = {
            chooser: {
                href: that.options.templateUrl,
                cutpoints: buildCutpoints(that.options.selectors),
                options: {
                    dataType: "html",
                    success: function (data) {
                        if (!data) {
                            that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                                url: that.options.templateUrl
                            }));
                            return;
                        }
                        if (data.isError === true) {
                            fluid.each(data.messages, function (message) {
                                that.displayErrorMessage(message);
                            });
                            return;
                        }
                    },
                    error: cspace.util.provideErrorCallback(that, that.options.templateUrl, "errorFetching")
                }
            }
        };
        
        // Get the template, create the tree and render the table of contents
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["chooser"], {});
            var node = $("<div></div>", that.container[0].ownerDocument).addClass(that.options.styles.container);
            fluid.reRender(templates, node, buildTree(that.model), {model: that.model});
            that.container.append(node);
            setupNode(that);
            bindEvents(that);
            that.events.afterRender.fire(node);
        });
    };
    
})(jQuery, fluid);
