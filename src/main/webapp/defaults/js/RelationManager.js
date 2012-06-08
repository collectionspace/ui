/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RelationManager.js loaded");
    
    fluid.registerNamespace("cspace.relationManager");
    
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
    
    cspace.relationManager.addFromTab = function (that) {
        that.globalNavigator.events.onPerformNavigation.fire(function () {
            if (that.model.csid) {
                that.messageBar.hide();
                that.searchToRelateDialog.open();
            } else {
                that.messageBar.show(that.lookupMessage("relationManager-pleaseSaveFirst"), null, true);
            }
        });
    };

    cspace.relationManager.add = function (that) {
        if (that.model.csid) {
            that.messageBar.hide();
            that.searchToRelateDialog.open();
        } else {
            that.messageBar.show(that.lookupMessage("relationManager-pleaseSaveFirst"), null, true);
        }
        return false;
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

    fluid.defaults("cspace.relationManager.permissionResolver", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            recordTypeManager: "{recordTypeManager}",
            resolver: "{permissionsResolver}"
        },
        finalInitFunction: "cspace.relationManager.permissionResolver.finalInit"
    });
    cspace.relationManager.permissionResolver.finalInit = function (that) {
        if (that.options.locked) {
            that.visible = false;
            return;
        }
        that.options.resolver = that.resolver;
        that.options.allOf.push({
            permission: that.options.recordClassPermission,
            oneOf: that.recordTypeManager.recordTypesForCategory(that.options.recordClass)
        });
        that.visible = cspace.permissions.resolveMultiple(that.options);
    };
    
    cspace.relationManager.produceTree = function (that) {
        return {
            addButton: {
                messagekey: that.options.messagekeys.addButton
            }
        };
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
            },
    // TODO: this should really not be a component but in fact it requires access to 
    // already merged option values and so cannot use an expander - also, the 
    // indirection on recordClass cannot be performed directly via IoC
            showAddButton: {
                type: "cspace.relationManager.permissionResolver",
                options: {
                    locked: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.resolveLocked",
                            args: "{cspace.relationManager}.model"
                        }
                    },
                    recordClass: "{relationManager}.options.related",
                    recordClassPermission: "update",
                    allOf: [{
                        target: "{relationManager}.options.primary",
                        permission: "update"
                    }]
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
    
})(jQuery, fluid);