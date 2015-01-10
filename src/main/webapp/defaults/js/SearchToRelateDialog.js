/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.log("SearchToRelateDialog.js loaded");

    fluid.defaults("cspace.searchToRelateDialog", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            dialog: { 
            // See comments for Confirmation.js - we adopt a common strategy now
            // since the problem in THIS component is that it invokes jquery.dialog on startup, thus
            // causing its container to move.
                expander: {
                    type: "fluid.deferredCall",
                    func: "cspace.searchToRelateDialog.getDialogGetter",
                    args: ["{searchToRelateDialog}"]
                }
            },
            addButton: ".csc-searchToRelate-addButton",
            closeButton: ".csc-searchToRelate-closeBtn",
            closeButtonImg: ".csc-searchToRelate-closeBtnImg",
            createNewButton: ".csc-searchToRelate-createButton",
            relationshipType: ".csc-searchToRelate-relationshipTypeSelect",
            createNew: ".csc-searchToRelate-createNew",
            previous: ".csc-searchToRelate-previous",
            next: ".csc-searchToRelate-next",
            multipleRelate: ".csc-related-steps"
        },
        selectorsToIgnore: ["closeButton", "dialog"],
        styles: {
            multipleRelate: "cs-related-steps",
            createNewButton: "cs-searchToRelate-createButton"
        },
        produceTree: "cspace.searchToRelateDialog.produceTree",
        renderOnInit: true,
        model: {
            showCreate: false
        },
        related: null,
        primary: null,
        components: {
            globalModel: "{globalModel}",
            search: {
                type: "cspace.search.searchView",
                options: {
                    resultsSelectable: true,
                    recordType: "{searchToRelateDialog}.options.related",
                    components: {
                        mainSearch: {
                            options: {
                                model: {
                                    messagekeys: {
                                        recordTypeSelectLabel: "searchToRelateDialog-recordTypeSelectLabel"
                                    }
                                },
                                related: "{searchToRelateDialog}.options.related",
                                permission: "read",
                                enableAdvancedSearch: false
                            }
                        },
                        resultsPager: {
                            options: {
                                bodyRenderer: {
                                    options: {
                                        template: "{searchToRelateDialog}.options.resources.template.resourceText"
                                    }
                                }
                            }
                        }
                    },
                    listeners: {
                        afterSearch: "{cspace.searchToRelateDialog}.afterSearchHandler"
                    }
                }
            }
        },
        invokers: {
            setupDialogClass: {
                funcName: "cspace.searchToRelateDialog.setupDialogClass",
                args: "{searchToRelateDialog}.options.related"
            }
        },
        parentBundle: "{globalBundle}",
        strings: { },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "slowTemplate",
                url: "%webapp/html/components/searchToRelate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        rendererFnOptions: {
            rendererTargetSelector: "dialog"
        },
        events: {
            onAddRelation: null,
            onCreateNewRecord: null,
            onOpen: null,
            onClose: null
        },
        preInitFunction: "cspace.searchToRelateDialog.preInit",
        finalInitFunction: "cspace.searchToRelateDialog.finalInit"
    });

    cspace.searchToRelateDialog.preInit = function (that) {
        that.open = function () {
            that.search.hideResults();
            that.locate("addButton").hide();
            that.container.dialog("open");
            that.events.onOpen.fire();
        };
        that.close = function () {
            that.container.dialog("close");
            that.events.onClose.fire();
        };
        that.afterSearchHandler = function () {
            that.locate("addButton").show();
        };
        that.createNew = function () {
            that.events.onCreateNewRecord.fire();
            that.close();
        };
        that.add = function () {
            var newRelations = [],
                source = {
                csid: fluid.get(that.globalModel.model, "primaryModel.csid"),
                recordtype: that.options.primary
            };
            fluid.each(that.search.model.results, function (result) {
                if (!result || !result.selected) {
                    return;
                }
                newRelations.push({
                    source: source,
                    target: result,
                    type: "affects",
                    "one-way": false
                });
            });
            that.events.onAddRelation.fire({
                items: newRelations
            });
            that.close();
        };
    };

    cspace.searchToRelateDialog.finalInit = function (that) {
        var resolve = that.options.parentBundle.resolve,
            title = resolve(that.options.strings.title || "searchToRelateDialog-title", [resolve(that.options.related === "procedures" ? "searchToRelateDialog-procedures" : that.options.related)]);
        that.container.dialog({
            autoOpen: false,
            modal: true,
            minWidth: 700,
            draggable: true,
            dialogClass: "cs-search-dialog " + that.setupDialogClass(),
            position: ["center", 100],
            title: title
        });
        fluid.deadMansBlur(that.container, {
            exclusions: {union: that.container},
            handler: function () {
                that.close();
            }
        });
    };

    cspace.searchToRelateDialog.produceTree = function (that) {
        return {
            closeButtonImg: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        alt: "searchToRelateDialog-closeAlt"
                    }
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.close
                }]
            },
            relationshipType: {
                messagekey: "searchToRelateDialog-relationshipType"
            },
            expander: {
                type: "fluid.renderer.condition",
                condition: "${showCreate}",
                trueTree: {
                    createNew: {
                        messagekey: "searchToRelateDialog-createNew"
                    },
                    createNewButton: {
                        messagekey: "searchToRelateDialog-createNewButton",
                        decorators: [{addClass: "{styles}.createNewButton"}, {
                            type: "jQuery",
                            func: "click",
                            args: that.createNew
                        }]
                    },
                    multipleRelate: {
                        decorators: {addClass: "{styles}.multipleRelate"}
                    }
                },
                falseTree: {
                    multipleRelate: {}
                }
            },
            addButton: {
                messagekey: that.options.strings.addButton || "searchToRelateDialog-addButton",
                decorators: [{
                    addClass: "hidden"
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.add
                }]
            },
            next: {
                messagekey: "searchToRelateDialog-next"
            },
            previous: {
                messagekey: "searchToRelateDialog-previous"
            }
        };
    }

    cspace.searchToRelateDialog.getDialogGetter = function (that) {
        return function () {
            return that.container;
        };
    };

    cspace.searchToRelateDialog.setupDialogClass = function (dialogTrigger) {
        var dialog = "cs-search-dialogFor-" + dialogTrigger;
        return dialog;
    };

    fluid.fetchResources.primeCacheFromResources("cspace.searchToRelateDialog");
    
})(jQuery, fluid);
