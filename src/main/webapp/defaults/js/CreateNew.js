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
    
    fluid.defaults("cspace.createNew", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        finalInitFunction: "cspace.createNew.finalInit",
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
            category: ".csc-createNew-category", //to be repeated
            categoryHeader: ".csc-createNew-categoryHeader",
            rows: ".csc-createNew-recordRows", //row to be repeated
            row: ".csc-createNew-recordRow",
            //create new button:
            createButton: ".csc-createNew-createButton",
            createTemplateButton: ".csc-createNew-createTemplateButton"
        },
        repeatingSelectors: ["category", "rows"],
        styles: {                   // Set of styles that the component will be adding onto selectors.
            categories: "cs-createNew-categories",
            category: "cs-createNew-category",
            categoryHeader: "cs-createNew-categoryHeader",
            row: "cs-createNew-recordRow",
            rows: "cs-createNew-recordRows",
            createButton: "cs-createNew-createButton",
            createTemplateButton: "cs-createNew-createTemplateButton",
            totalOf1: "cs-createNew-totalOfOneCategories",
            totalOf2: "cs-createNew-totalOfTwoCategories",
            totalOf3: "cs-createNew-totalOfThreeCategories",
            category1: "cs-createNew-category1",
            category2: "cs-createNew-category2",
            category3: "cs-createNew-category3"
        },
        strings: {},
        produceTree: "cspace.createNew.produceTree",
        invokers: {
            refreshView: {          // A public method that renders the component and binds event handlers anew.
                funcName: "cspace.createNew.refreshView",
                args: ["{createNew}"]
            },
            createRecord: "createRecord",
            createTemplate: "createTemplate",
            updateModel: {
                funcName: "cspace.createNew.updateModel",
                args: ["{createNew}", "{arguments}.0"]
            }
        },
        urls: cspace.componentUrlBuilder({
            newRecordUrl: "%webapp/html/%recordType.html%template",
            newRecordLocalUrl: "%webapp/html/record.html?recordtype=%recordType%template",
            templateUrl: "%webapp/html/template.html?recordtype=%recordType",
            templateViewsUrl: "%webapp/config/templateViews.json",
            template: "&template=%template"
        }),
        newRecordUrl: "%recordUrl.html",
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/pages/CreateNewTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        components: {
            templateSource: {
                type: "cspace.createNew.templateViewDataSource"
            }
        },
        events: {
            collapseAll: null,
            updateModel: null
        }
    });
    
    cspace.createNew.updateModel = function (that, model) {
        fluid.each(model, function (value, key) {
            that.applier.requestChange(key, value);
        });
    };
    
    // A public function that is called as createNew's createRecord method is called, and
    // creates a new record by navigating to the page of the selected radio button.
    // Note that the record isn't actually created until the user clicks the save button. This
    // function will simply redirect user to a page where he is presented with an empty
    // record
    cspace.createNew.createRecord = function (model, url, templateUrl) {
        var template = model.createFromSelection === "fromTemplate" ? model.templateSelection : "";
        window.location = fluid.stringTemplate(url, {
            recordType: model.currentSelection,
            template: template ? fluid.stringTemplate(templateUrl, {template: template}) : ""
        });
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
        var categories = that.locate("category");
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
        cspace.createNew.stylefy(that);
    };

    // A public function that is called as createNew's treeBuilder method and builds a component tree.
    cspace.createNew.produceTree = function (that) {
        return {
            createButton: {
                messagekey: "createButtonText",
                decorators: [{
                    type: "jQuery",
                    func: "click",
                    args: that.createRecord
                }, {"addClass": "{styles}.createButton"}]
            },
            createTemplateButton: {
                messagekey: "createTemplateButtonText",
                decorators: [{
                    type: "jQuery",
                    func: "click",
                    args: that.createTemplate
                }, {"addClass": "{styles}.createTemplateButton"}]
            },
            categories: {decorators: {"addClass": "{styles}.categories"}},
            expander: {
                repeatID: "category",
                type: "fluid.renderer.repeat",
                pathAs: "cat",
                controlledBy: "categories",
                tree: {
                    categoryHeader: {
                        messagekey: "${{cat}.name}",
                        decorators: {"addClass": "{styles}.categoryHeader"}
                    },
                    expander: {
                        repeatID: "rows",
                        type: "fluid.renderer.repeat",
                        pathAs: "rowdy",
                        valueAs: "rowdyVal",
                        controlledBy: "{cat}.arr",
                        tree: {
                            row: {
                                decorators: [{
                                    type: "fluid",
                                    func: "cspace.createNew.recordTemplateBox",
                                    options: {
                                        model: {
                                            recordType: "${{rowdyVal}}",
                                            templates: "${templateViews}"
                                        }
                                    }
                                }, {"addClass": "{styles}.row"}]
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
    
    cspace.createNew.finalInit = function (that) {
        cspace.util.modelBuilder.fixupModel(that.model);
        that.templateSource.get(null, function (templateViews) {
            that.applier.requestChange("templateViews", templateViews);
            that.refreshView();
            $("input[type|='radio']").filter(":first").prop('checked', true).change();
        });
    };
    
    // This funtction executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.createNew");
    
    fluid.defaults("cspace.createNew.recordTemplateBox", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        mergePolicy: {
            "rendererOptions.applier": "applier",
            createNewApplier: "nomerge",
            createNewModel: "preserve"
        },
        events: {
            onShowTemplate: null,
            collapseOn: null,
            updateModel: null
        },
        produceTree: "cspace.createNew.recordTemplateBox.produceTree",
        renderOnInit: true,
        selectors: {
            radio: ".csc-createNew-recordRadio",
            "label": ".csc-createNew-recordLabel",
            templates: ".csc-createNew-templates",
            createFrom: ".csc-createNew-createFrom",
            createInput: ".csc-createNew-createFrom-input",
            createLabel: ".csc-createNew-createFrom-label",
            templateSelection: ".csc-createNew-templateSelection"
        },
        repeatingSelectors: ["createFrom"],
        styles: {
            radio: "cs-createNew-recordRadio",
            "label": "cs-createNew-recordLabel",
            templates: "cs-createNew-templates",
            templateSelection: "cs-createNew-templateSelection"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RecordTemplateTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        invokers: {
            updateCurrentSelection: {
                funcName: "cspace.createNew.recordTemplateBox.updateCurrentSelection",
                args: "{recordTemplateBox}"
            }
        },
        strings: {},
        parentBundle: "{globalBundle}",
        preInitFunction: "cspace.createNew.recordTemplateBox.preInit",
        model: {
            createFromList: ["fromScratch", "fromTemplate"],
            createFromNames: [],
            createFromSelection: "fromScratch",
            templateSelection: "",
            templateNames: []
        },
        animationOpts: {
            time: 300,
            easing: "linear"
        }
    });
    
    var updateModel = function (that) {
        that.events.updateModel.fire({
            currentSelection: that.locate("radio").val(),
            createFromSelection: that.model.createFromSelection,
            templateSelection: that.model.templateSelection
        });
    };
    
    cspace.createNew.recordTemplateBox.updateCurrentSelection = function (that) {
        that.events.onShowTemplate.fire();
        if (that.model.templates) {
            that.refreshView();
            that.locate("radio").prop("checked", true);
            that.locate("templates").show(that.options.animationOpts.time, that.options.animationOpts.easing);
        }
        updateModel(that);
    };
    
    cspace.createNew.recordTemplateBox.produceTree = function (that) {
        return {
            "label": {
                messagekey: "${recordType}",
                decorators: {"addClass": "{styles}.label"}
            },
            radio: {
                decorators: [{
                    type: "jQuery",
                    func: "attr",
                    args: ["value", "${recordType}"]
                }, {
                    type: "jQuery",
                    func: "change",
                    args: function () {
                        that.updateCurrentSelection();
                    }
                }, {"addClass": "{styles}.radio"}]
            }, 
            expander: {
                type: "fluid.renderer.condition",
                condition: "${templates}",
                trueTree: {
                    templates: {decorators: [{"addClass": "{styles}.templates"}, {
                        type: "jQuery",
                        func: "hide"
                    }]},
                    expander: {                  
                        type: "fluid.renderer.selection.inputs",
                        rowID: "createFrom",
                        labelID: "createLabel",
                        inputID: "createInput",
                        selectID: "createFromSelect",
                        tree: {
                            "selection": "${createFromSelection}",
                            "optionlist": "${createFromList}",
                            "optionnames": "${createFromNames}"
                        }
                    },
                    templateSelection: {
                        optionnames: "${templateNames}",
                        optionlist: "${templates}",
                        selection: "${templateSelection}",
                        decorators: {"addClass": "{styles}.templateSelection"}
                    }
                },
                falseTree: {
                    templates: {
                        decorators: {
                            type: "jQuery",
                            func: "hide"
                        }
                    }
                }
            }
        };
    };
    
    var lookupNames = function (applier, messageBase, list, key, prefix) {
        fluid.each(list, function (value, index) {
            applier.requestChange(fluid.model.composeSegments(key, index), 
                cspace.util.lookupMessage(messageBase, prefix + "-" + value));
        });
    };
    
    var fixupModel = function (model, applier, messageBase) {
        var exists = fluid.get(model, "templates")[model.recordType];
        applier.requestChange("templates", exists ? exists.templates : undefined);
        if (exists) {
            applier.requestChange("templateSelection", exists.templates[0]);
        }
        lookupNames(applier, messageBase, model.createFromList, "createFromNames", "createnew");
        lookupNames(applier, messageBase, model.templates, "templateNames", "template");
    };
    
    cspace.createNew.recordTemplateBox.preInit = function (that) {
        cspace.util.preInitMergeListeners(that.options, {
            collapseOn: function () {
                that.locate("templates").hide(that.options.animationOpts.time, that.options.animationOpts.easing);
            }
        });
        fixupModel(that.model, that.applier, that.options.parentBundle.messageBase);
        fluid.each(["templateSelection", "createFromSelection"], function (value) {
            that.applier.modelChanged.addListener(value, function () {
                updateModel(that);
            });
        });
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.createNew.recordTemplateBox");
    
})(jQuery, fluid);
