/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.createNew");
  
    var bindEvents = function (that) {
        // Bind a click event on the create button to trigger createNew's navigateToRecord
        that.locate("createButton").click(that.createRecord);
    };

    var setupCreateNew = function (that) {
        cspace.util.modelBuilder.fixupModel(that.model);
        // Check whether the components needs to be rendered as part of its initialization.
        that.refreshView();
        that.locate("radio").filter(":first").attr('checked', true);
    };

    // Actual implementation of the createNew component's creator function.
    cspace.createNew = function (container, options) {
        // Initialize createNew component as a renderer component.
        var that = fluid.initRendererComponent("cspace.createNew", container, options);
        // Initialize component's dependants if any and component's invokers.
        fluid.initDependents(that);
        setupCreateNew(that);
        return that;
    };

    // A public function that is called as createNew's createRecord method is called, and
    // creates a new record by navigating to the page of the selected radio button.
    // Note that the record isn't actually created until the user clicks the save button. This
    // function will simply redirect user to a page where he is presented with an empty
    // record
    cspace.createNew.createRecord = function (that) {
        var url = fluid.stringTemplate(that.options.newRecordUrl, {
            recordUrl: that.locate("radio").filter(":checked").attr("value")
        });
        window.location = url;
    };
    
    cspace.createNew.createRecordLocal = function (that) {
        var url = fluid.stringTemplate(that.options.newRecordUrl, {
            recordUrl: "record"
        });
        url += "?recordtype=" + that.locate("radio").filter(":checked").attr("value");
        window.location = url;
    };

    cspace.createNew.stylefy = function (that) {
        //apply styles:
        var styles = that.options.styles;
        fluid.each(styles, function (style, key) {
            if (that.options.selectors[key]) {
                that.locate(key).addClass(style);
            }
        });
        //style category divs based on how many there are. If only 1, it should
        //take fullWidth style. Else first half should have "left", second half "right"
        var categories = that.locate("category:");
        that.locate("categories").addClass(styles["totalOf" + categories.length]);
        $.each(categories, function (index, value) {
            $(value).addClass(styles["category" + (index + 1)]);
        });
        //if there are no categories visible, hide the create new button:
        if (categories.length === 0) {
            that.locate("createButton").hide();
        }
    };

    // A public function that is called as createNew's refreshView method, renders the component and
    // binds the event handlers.
    cspace.createNew.refreshView = function (that) {
        that.renderer.refreshView();
        bindEvents(that);
        cspace.createNew.stylefy(that);
    };

    // A public function that is called as createNew's treeBuilder method and builds a component tree.
    cspace.createNew.produceTree = function () {
        return {
            createButton: {
                messagekey: "createButtonText"
            },
            expander: {
                repeatID: "category",
                type: "fluid.renderer.repeat",
                pathAs: "cat",
                controlledBy: "categories",
                tree: {
                    categoryHeader: {
                        messagekey: "${{cat}.name}"
                    },
                    expander: {
                        repeatID: "row",
                        type: "fluid.renderer.repeat",
                        pathAs: "rowdy",
                        valueAs: "rowdyVal",
                        controlledBy: "{cat}.arr",
                        tree: {
                            "label": {
                                messagekey: "${{rowdy}}"
                            },
                            radio: {
                                decorators: [{
                                    type: "jQuery",
                                    func: "attr",
                                    args: ["value", "${{rowdyVal}}"]
                                }]
                            }
                        }
                    }
                }
            }
        };
    };
    
    cspace.createNew.buildModel = function (options, records) {
        if (!records || records.length < 1) {
            return;
        }
        return {
            "name": options.related + "Category",
            arr: records
        };
    };
    
    fluid.defaults("cspace.createNew", {
        gradeNames: "fluid.rendererComponent",
        parentBundle: "{globalBundle}",
        model: {
            categories: [{
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.modelBuilder",
                    args: {
                        callback: "cspace.createNew.buildModel",
                        related: "cataloging",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "create"
                    }
                }
            }, {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.modelBuilder",
                    args: {
                        callback: "cspace.createNew.buildModel",
                        related: "procedures",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "create"
                    }
                }
            }, {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.modelBuilder",
                    args: {
                        callback: "cspace.createNew.buildModel",
                        related: "vocabularies",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "create"
                    }
                }
            }]
        },
        mergePolicy: {
            model: "preserve"       // If the model is passed to the component, preserve the original 
        // object on options merging.
        },
        selectors: {
            categories: ".csc-createNew-categories", //container for repeatable categories
            "category:": ".csc-createNew-category", //to be repeated
            categoryHeader: ".csc-createNew-categoryHeader",
            "row:": ".csc-createNew-recordRow", //row to be repeated
            radio: ".csc-createNew-recordRadio", //radiobuttn
            "label": ".csc-createNew-recordLabel", //label
            //create new button:
            createButton: ".csc-createNew-createButton"
        },
        selectorsToIgnore: ["categories"],
        styles: {                   // Set of styles that the component will be adding onto selectors.
            categories: "cs-createNew-categories",
            "category:": "cs-createNew-category",
            categoryHeader: "cs-createNew-categoryHeader",
            "row:": "cs-createNew-recordRow",
            radio: "cs-createNew-recordRadio",
            "label": "cs-createNew-recordLabel",
            createButton: "cs-createNew-createButton",
            totalOf1: "cs-createNew-totalOfOneCategories",
            totalOf2: "cs-createNew-totalOfTwoCategories",
            totalOf3: "cs-createNew-totalOfThreeCategories",
            category1: "cs-createNew-category1",
            category2: "cs-createNew-category2",
            category3: "cs-createNew-category3"
        },
        strings: {                  // List of strings that the component will render (for l10n and i18n).
            //headers
            catalogingCategory: "Cataloging Records",
            proceduresCategory: "Procedural Records",
            vocabulariesCategory: "Vocabulary Terms",
            //create new button:
            createButtonText: "Create"
        },
        produceTree: cspace.createNew.produceTree,
        invokers: {
            refreshView: {          // A public method that renders the component and binds event handlers anew.
                funcName: "cspace.createNew.refreshView",
                args: ["{createNew}"]
            },
            createRecord: "createRecord"
        },
        newRecordUrl: "%recordUrl.html",
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/pages/CreateNewTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        }
    });
    
    // This funtction executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.createNew");
    
})(jQuery, fluid);
