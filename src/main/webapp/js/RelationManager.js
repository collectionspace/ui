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

    var updateRelations = function (applier, model) {
        return function (relations) {
            if (!relations.items || !relations.items[0] || !relations.items[0].target) {
                return;
            }
            
            var newModelRelations = [];
            var related = relations.items[0].target.recordtype;
            var elPath = "relations." + related;
            
            fluid.model.copyModel(newModelRelations, model.relations[related]);
            var relIndex = newModelRelations.length;
            $.each(relations.items, function (index, relation) {
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
        that.dataContext.events.afterAddRelations.addListener(updateRelations(that.options.applier, that.model));
    };
    
    cspace.relationManager = function (container, options) {
        var that = fluid.initRendererComponent("cspace.relationManager", container, options);
        that.renderer.refreshView();                
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);
        that.addRelations = that.options.addRelations(that);
        that.dialogNode = that.locate("searchDialog"); // since blasted jQuery UI dialog will move it out of our container
        
        fluid.initDependents(that);
        bindEventHandlers(that);
        return that;
    };
    
    cspace.relationManager.provideAddRelations = function (relationManager) {
        return relationManager.dataContext.addRelations;
    };
    
    cspace.relationManager.provideLocalAddRelations = function (relationManager) {
        return updateRelations(relationManager.options.applier, relationManager.model);
    };
    
    cspace.relationManager.localSearchToRelateDialog = function (container, options) {
        var that = fluid.initLittleComponent("cspace.relationManager.localSearchToRelateDialog", options);
        return cspace.searchToRelateDialog(container, that.options);
    };
    
    // TODO: Approach is interesting but not correct - has fragile dependence on exact 
    // options structure. UrlBuilder itself needs to be IoC-resolved directly, as with 
    // specs 
    fluid.defaults("cspace.relationManager.localSearchToRelateDialog", {
        components: {
            search: {
                options: {
                    searchUrlBuilder: cspace.search.localSearchUrlBuilder
                }
            }
        },
        mergePolicy: {
            model: "preserve"
        }
    });
    
    fluid.demands("cspace.searchToRelateDialog", ["cspace.localData", "cspace.relationManager"], {
        funcName: "cspace.relationManager.localSearchToRelateDialog",
        args: ["{relationManager}.dom.searchDialog", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("cspace.searchToRelateDialog", "cspace.relationManager", 
        ["{relationManager}.dom.searchDialog", fluid.COMPONENT_OPTIONS]);

    cspace.relationManager.permissionResolver = function (options) {
        var that = fluid.initLittleComponent("cspace.relationManager.permissionResolver", options);
        options.allOf.push({
            permission: options.recordClassPermission,
            oneOf: that.options.recordTypeManager.recordTypesForCategory(options.recordClass)
        });
        that.visible = cspace.permissions.resolveMultiple(options);
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
        produceTree: cspace.relationManager.produceTree,
        components: {
            searchToRelateDialog: {
                type: "cspace.searchToRelateDialog",
                options: {
                    listeners: {
                        addRelations: "{relationManager}.addRelations",
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
        dataContext: {
            type: "cspace.dataContext",
            options: {
                recordType: "relationships"
            }
        },
        addRelations: cspace.relationManager.provideAddRelations,
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
            applier: "preserve"
        }
    });
    
})(jQuery, fluid);