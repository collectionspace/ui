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

    fluid.log("RelationManager.js loaded");

    fluid.defaults("cspace.relationManager", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
            searchDialog: ".csc-search-related-dialog",
            addButton: ".csc-add-related-record-button"
        },
        styles: {
            addButton: "cs-add-related-record-button"
        },
        produceTree: "cspace.relationManager.produceTree",
        strings: {},
        parentBundle: "{globalBundle}",
        selectorsToIgnore: "searchDialog",
        components: {
            // TODO: this should really not be a component but in fact it requires access to 
            // already merged option values and so cannot use an expander - also, the 
            // indirection on recordType cannot be performed directly via IoC
            showAddButton: {
                type: "cspace.relationManager.permissionResolver",
                options: {
                    locked: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.resolveLocked",
                            args: "{globalModel}.model.primaryModel"
                        }
                    },
                    model: "{relationManager}.model",
                    applier: "{relationManager}.applier"
                }
            },
            searchToRelateDialog: {
                type: "cspace.searchToRelateDialog",
                createOnEvent: "onSearchToRelateDialog",
                options: {
                    /*
listeners: {
                        addRelations: "{relationManager}.dataContext.addRelations",
                        onCreateNewRecord: "{relationManager}.events.onCreateNewRecord.fire"
                    }
*/
                }
            }
        },
        invokers: {
            add: "cspace.relationManager.add"
        },
        events: {
            onSearchToRelateDialog: null,
            onAddRelation: null,
            onRemoveRelation: null,
            afterAddRelation: null,
            afterRemoveRelation: null
        },
        model: {
            showAddButton: false
        },
        finalInitFunction: "cspace.relationManager.finalInit"
    });

    cspace.relationManager.finalInit = function (that) {
        that.refreshView();
        if (!that.model.showAddButton) {
            return;
        }
        that.dialogNode = that.locate("searchDialog"); // since blasted jQuery UI dialog will move it out of our container
        that.events.onSearchToRelateDialog.fire();
    };

    cspace.relationManager.addFromTab = function (that, globalNavigator, globalBundle, messageBar, csid) {
        globalNavigator.events.onPerformNavigation.fire(function () {
            cspace.relationManager.add(that, globalBundle, messageBar, csid);
        });
    };

    cspace.relationManager.add = function (that, globalBundle, messageBar, csid) {
        if (csid) {
            messageBar.hide();
            that.searchToRelateDialog.open();
        } else {
            messageBar.show(globalBundle.resolve("relationManager-pleaseSaveFirst"), null, true);
        }
    };

    cspace.relationManager.produceTree = function (that) {
        return {
            expander: {
                type: "fluid.renderer.condition",
                condition: "${showAddButton}",
                trueTree: {
                    addButton: {
                        messagekey: "${addButton}",
                        decorators: [{
                            addClass: "{styles}.addButton"
                        }, {
                            type: "jQuery",
                            func: "click",
                            args: that.add
                        }]
                    }
                }
            }
        };
    };

    fluid.defaults("cspace.relationManager.permissionResolver", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        components: {
            recordTypeManager: "{recordTypeManager}",
            resolver: "{permissionsResolver}"
        },
        recordType: "{relationManager}.options.related",
        recordTypePermission: "update",
        allOf: [{
            target: "{relationManager}.options.primary",
            permission: "update"
        }],
        finalInitFunction: "cspace.relationManager.permissionResolver.finalInit"
    });

    cspace.relationManager.permissionResolver.finalInit = function (that) {
        if (that.options.locked) {
            that.applier.requestChange("showAddButton", false);
            return;
        }
        that.options.resolver = that.resolver;
        that.options.allOf.push({
            permission: that.options.recordTypePermission,
            oneOf: that.recordTypeManager.recordTypesForCategory(that.options.recordType)
        });
        that.applier.requestChange("showAddButton", cspace.permissions.resolveMultiple(that.options));
    };

    /*

    var bindEventHandlers = function (that) {
        if (that.showAddButton.visible) {
            that.locate("addButton").click(that.add);
        }
        else {
            that.locate("addButton").hide();
        }
        that.dataContext.events.afterAddRelations.addListener(that.addRelations);
        that.dataContext.events.afterRemoveRelations.addListener(that.removeRelations);
    };
    
    cspace.relationManager = function (container, options) {
        var that = fluid.initRendererComponent("cspace.relationManager", container, options);
        that.renderer.refreshView();
        
        that.dialogNode = that.locate("searchDialog"); // since blasted jQuery UI dialog will move it out of our container
        fluid.initDependents(that);
        that.events.afterInitDependents.fire();
        
        bindEventHandlers(that);
        return that;
    };
    
    cspace.relationManager.addRelations = function (relationsElPath, applier, model, relations) {
        if (!relations.items || !relations.items[0] || !relations.items[0].target) {
            return;
        }
        var related = relations.items[0].target.recordtype;
        var newModelRelations = fluid.copy(model[relationsElPath][related]) || [];
        var elPath = relationsElPath + "." + related;
        var relIndex = newModelRelations.length;
        fluid.each(relations.items, function (relation) {
            newModelRelations[relIndex] = relation.target;
            newModelRelations[relIndex].relationshiptype = relation.type;
            ++relIndex;
        });
        applier.requestChange(elPath, newModelRelations);
    };
    
    cspace.relationManager.removeRelations = function (relationsElPath, applier, model, relations) {
        var related = relations.target.recordtype;
        var elPath = relationsElPath + "." + related;
        var csid = relations.target.csid;
        var newModelRelations = fluid.copy(model[relationsElPath][related]);
        fluid.remove_if(newModelRelations, function (relation) {
            return relation.csid === csid;
        });
        applier.requestChange(elPath, newModelRelations);
    };

    fluid.defaults("cspace.relationManager", {
        gradeNames: "fluid.rendererComponent",
        produceTree: cspace.relationManager.produceTree,
        invokers: {
            add: "cspace.relationManager.add",            
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{searchToRelateDialog}.options.parentBundle.messageBase", "{arguments}.0"]
            },
            addRelations: {
                funcName: "cspace.relationManager.addRelations",
                args: ["{relationManager}.options.relationsElPath", "{relationManager}.options.applier", "{relationManager}.model", "{arguments}.0"]
            },
            removeRelations: {
                funcName: "cspace.relationManager.removeRelations",
                args: ["{relationManager}.options.relationsElPath", "{relationManager}.options.applier", "{relationManager}.model", "{arguments}.0"]
            }
        },
        parentBundle: "{globalBundle}",
        components: {
            messageBar: "{messageBar}",
            globalNavigator: "{recordEditor}.globalNavigator",
            dataContext: {
                type: "cspace.dataContext",
                options: {
                    recordType: "relationships"
                }
            },
            searchToRelateDialog: {
                type: "cspace.searchToRelateDialog",
                createOnEvent: "afterInitDependents",
                options: {
                    listeners: {
                        addRelations: "{relationManager}.dataContext.addRelations",
                        onCreateNewRecord: "{relationManager}.events.onCreateNewRecord.fire"
                    },
                    model: "{relationManager}.model",
                    related: "{relationManager}.options.related",
                    primary: "{relationManager}.options.primary"
                }
            }
        },
        selectors: {
            searchDialog: ".csc-search-related-dialog",
            addButton: ".csc-add-related-record-button"
        },
        selectorsToIgnore: "searchDialog",
        strings: { },
        messagekeys: {
            addButton: "relationManager-addButton"
        },
        events: {
            onCreateNewRecord: null,
            afterInitDependents: null
        },
        mergePolicy: {
            model: "preserve",
            applier: "nomerge"
        }
    });
*/
    
})(jQuery, fluid);