/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RelationManager.js loaded");
    
    fluid.registerNamespace("cspace.relationManager");

    var updateRelations = function (applier, model) {
        return function (relations) {
            if (!relations.items || !relations.items[0].target) {
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
        that.locate("addButton").click(function (e) {
            if (that.model.csid) {
                that.locate("messageContainer", "body").hide();
                that.searchToRelateDialog.dlg.dialog("open");
            } else {
                cspace.util.displayTimestampedMessage(that.dom, that.options.strings.pleaseSaveFirst);
            }
        });
        that.dataContext.events.afterAddRelations.addListener(updateRelations(that.options.applier, that.model));
    };
    
    cspace.relationManager = function (container, options) {
        var that = fluid.initView("cspace.relationManager", container, options);
        
        that.model = that.options.model;
                
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);
        that.addRelations = that.options.addRelations(that);
        
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
    
    cspace.relationManager.localsearchToRelateDialog = function (container, options) {
        var that = fluid.initLittleComponent("cspace.relationManager.localsearchToRelateDialog", options);
        return cspace.searchToRelateDialog(container, that.options);
    };
    
    fluid.defaults("cspace.relationManager.localsearchToRelateDialog", {
        search: {
            options: {
                searchUrlBuilder: cspace.search.localSearchUrlBuilder
            }
        },
        mergePolicy: {
            model: "preserve"
        }
    });
    
    fluid.demands("cspace.searchToRelateDialog", ["cspace.localData", "cspace.relationManager"], {
        funcName: "cspace.relationManager.localsearchToRelateDialog",
        args: ["{relationManager}.container", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("cspace.searchToRelateDialog", "cspace.relationManager", 
        ["{relationManager}.container", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.relationManager", {
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
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            addButton: ".csc-add-related-record-button"
        },
        strings: {
            pleaseSaveFirst: "Please save the record you are creating before trying to relate other records to it."
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