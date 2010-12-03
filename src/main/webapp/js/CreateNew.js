/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global cspace, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.createNew");
  
    var bindEvents = function (that) {
        // Bind a click event on the create button to trigger createNew's navigateToRecord
        that.locate("createButton").click(that.createRecord);
    };    

    var setupCreateNew = function (that) {
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
        //find entry in model based on index:
        var selectedRecord = that.locate("radio").filter(":checked").attr("value");
        var url = fluid.stringTemplate(that.options.newRecordUrl, {
            recordUrl: selectedRecord
        });
        window.location = url;
    };

    cspace.createNew.stylefy = function(that) {
        //apply styles:
        var styles = that.options.styles;
        fluid.each(styles, function(style, key) {
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
    };
    
    // A public funtion that returns a defined array of strategies used by fluid.model.getBeanValue
    // to resolve values in the model based on permissions and schema.
    cspace.createNew.provideResolverGetConfig = function (options) {
        return [cspace.util.censorWithSchemaStrategy(options)];
    };

    // A public function that is called as createNew's refreshView method, renders the component and
    // binds the event handlers.
    cspace.createNew.refreshView = function (that) {
        //We need to hide categories if we dont have permissions to any record in category
        fluid.remove_if(that.model.categories, function (category, index) {
            return fluid.model.getBeanValue(category, "arr", that.options.resolverGetConfig).length < 1;
        });
        
        // No need to pass arguments to treeBuilder since it is an invoker.
        var tree = that.treeBuilder();
        // Render the component.
        that.render(tree);
        // Bind event handlers.
        bindEvents(that);
        // Stiles
        cspace.createNew.stylefy(that);
    };

    // A public function that is called as createNew's treeBuilder method and builds a component tree.
    cspace.createNew.modelToTree = function (model, options) {
        var tree = {
            //Fix all the text strings:           
            //create new button:
            createButton: {
                messagekey: "createButtonText"  // Key into the strings structure in component's options
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
        return tree;
    };
    
    fluid.defaults("cspace.createNew", {
        model: {
            // TDOD: need to get this model from the app layer!
            categories: [ 
            {
                name: "catalogingCategory",
                arr: ["cataloging"]
            } , {
                name: "proceduresCategory",
                arr: [
                "acquisition",
                "intake",
                "loanin",
                "loanout",
                "movement",
                "objectexit"
                ]
            }, {
                name: "vocabularyCategory",
                arr: [
                "person",
                "organization"
                ]
            }
            ]
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
            vocabularyCategory: "Vocabulary Terms",
            //labels for radio buttons:
            cataloging: "Cataloging Record",
            intake: "Intake",
            acquisition: "Acquisition",
            loanin: "Loan In",
            loanout: "Loan Out",
            movement: "Location and Movement",
            objectexit: "Object Exit",
            person: "Person",
            organization: "Organization",
            //create new button:
            createButtonText: "Create"
        },
        resolverGetConfig: null,    // An option used by initRendererComponent as a strategy when 
        // resolving values in the model (through fluid.model.getBeanValue)
        invokers: {                 // Component's public functions with arguments that are resolved at the time of invokation.
            treeBuilder: {          // A public method that builds component tree for rendering.
                funcName: "cspace.createNew.modelToTree",
                args: ["{createNew}.model", "{createNew}.options"]
            },
            refreshView: {          // A public method that renders the component and binds event handlers anew.
                funcName: "cspace.createNew.refreshView",
                args: ["{createNew}"]
            },
            createRecord: {     // A public method that builds new page's url.
                funcName: "cspace.createNew.createRecord",
                args: ["{createNew}"]
            }
        },
        newRecordUrl: "%recordUrl.html",
        resources: {                // A set of resources that will get resolved and fetched at some point during initialization.
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "fastTemplate", // Class name that indicates to pageBuilder that the 
                        // template is necessary on page's initialization.
                        url: "%webapp/html/createNewTemplate.html"
                    }
                }
            }
        }
    });
    
    fluid.demands("createNew", "cspace.pageBuilder", {
        funcName: "cspace.createNew.provideCreateNew",
        args: ["{pageBuilder}.options.selectors.createNew", fluid.COMPONENT_OPTIONS]
    });

    cspace.createNew.provideCreateNew = function (container, options) {
        options.resolverGetConfig = options.resolverGetConfig ||
            [cspace.util.censorWithSchemaStrategy({
                permissions: options.permissions,
                operations: ["create", "update", "delete"],
                method: "OR"
            })];
        return cspace.createNew(container, options);
    };
    
    // This funtction executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.createNew");
    
})(jQuery, fluid);
