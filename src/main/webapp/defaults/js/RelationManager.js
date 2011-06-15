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

    var updateRelations = function (relationsElPath, applier, model, remove) {
        return remove ? function (relations) {
            var related = relations.target.recordtype;
            var elPath = relationsElPath + "." + related;
            var csid = relations.target.csid;
            var newModelRelations = fluid.copy(model[relationsElPath][related]);
            fluid.remove_if(newModelRelations, function (relation) {
                return relation.csid === csid;
            });
            applier.requestChange(elPath, newModelRelations);
        }: function (relations) {
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
    };
    
    var bindEventHandlers = function (that) {
        if (that.showAddButton.visible) {
            that.locate("addButton").click(function (e) {
                if (that.model.csid) {
                    that.options.messageBar.hide();
                    that.searchToRelateDialog.open();
                } else {
                    that.options.messageBar.show(that.options.strings.pleaseSaveFirst, null, true);
                }
                return false;
            });
        }
        else {
            that.locate("addButton").hide();
        }
        that.dataContext.events.afterAddRelations.addListener(updateRelations(that.options.relationsElPath, that.options.applier, that.model));
        that.dataContext.events.afterRemoveRelations.addListener(updateRelations(that.options.relationsElPath, that.options.applier, that.model, true));
    };
    
    cspace.relationManager = function (container, options) {
        var that = fluid.initRendererComponent("cspace.relationManager", container, options);
        that.renderer.refreshView();
        
        that.dialogNode = that.locate("searchDialog"); // since blasted jQuery UI dialog will move it out of our container
        fluid.initDependents(that);
        
        that.addRelations = that.searchToRelateDialog.options.listeners.addRelations;
        
        bindEventHandlers(that);
        return that;
    };
    
    cspace.relationManager.provideLocalAddRelations = function (relationManager) {
        return updateRelations(relationManager.options.relationsElPath, relationManager.options.applier, relationManager.model);
    };

    cspace.relationManager.permissionResolver = function (options) {
        var that = fluid.initLittleComponent("cspace.relationManager.permissionResolver", options);
        that.options.allOf.push({
            permission: that.options.recordClassPermission,
            oneOf: that.options.recordTypeManager.recordTypesForCategory(that.options.recordClass)
        });
        that.visible = cspace.permissions.resolveMultiple(that.options);
        return that;
    };
    
    cspace.relationManager.produceTree = function (that) {
        return {
            addButton: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.addButton                        
                    }
                }
            }
        };
    };
    
    fluid.defaults("cspace.relationManager", {
        gradeNames: "fluid.rendererComponent",
        produceTree: cspace.relationManager.produceTree,
        components: {
            dataContext: {
                type: "cspace.dataContext",
                options: {
                    recordType: "relationships"
                }
            },
            searchToRelateDialog: {
                type: "cspace.searchToRelateDialog",
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
                    recordTypeManager: "{recordTypeManager}",
                    resolver: "{permissionsResolver}",
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
        messageBar: "{messageBar}",
        strings: {
            pleaseSaveFirst: "Please save the record you are creating before trying to relate other records to it.",
            addButton: "Add"
        },
        events: {
            onCreateNewRecord: null
        },
        mergePolicy: {
            model: "preserve",
            applier: "nomerge"
        }
    });
    
})(jQuery, fluid);