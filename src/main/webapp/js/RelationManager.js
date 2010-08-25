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

    var updateRelations = function (applier, relatedRecordType) {
        // TODO: Fluid transform candidate.
        return function (relations) {
            var newModelRelations = [];
            var elPath = "relations." + relatedRecordType;
            fluid.model.copyModel(newModelRelations, applier.model.relations[relatedRecordType]);
            var relIndex = newModelRelations.length;            
            for (var i = 0; i < relations.items.length; i++) {
                var relation = relations.items[i];
                newModelRelations[relIndex] = relation.target;
                newModelRelations[relIndex].relationshiptype = relation.type;
                relIndex += 1;
            }
            applier.requestChange(elPath, newModelRelations);
        };
    };
    
    var bindEventHandlers = function (that) {
        that.locate("addButton").click(function (e) {
            if (that.applier.model.csid) {
                that.locate("messageContainer", "body").hide();
                that.addDialog = makeDialog(that);
                that.addDialog.dlg.bind( "dialogclose", function(event, ui) {
                    that.addDialog.dlg.dialog("destroy");
                    that.addDialog.dlg.remove();
                    that.addDialog = undefined;
                });
            } else {
                cspace.util.displayTimestampedMessage(that.dom, that.options.strings.pleaseSaveFirst);
            }
        });
        that.dataContext.events.afterAddRelations.addListener(updateRelations(that.applier, that.relatedRecordType));
    };
    
    var makeDialog = function (that) {
        var dlgOpts = that.options.searchToRelateDialog.options || {};
        dlgOpts.listeners = dlgOpts.listeners || {};
        dlgOpts.listeners.addRelations = that.addRelations;
        dlgOpts.listeners.onCreateNewRecord = that.events.onCreateNewRecord.fire;
        dlgOpts.relatedRecordType = that.relatedRecordType;
        if (cspace.util.useLocalData()) {
            $.extend(true, dlgOpts, { search : { options: { searchUrlBuilder : cspace.search.localSearchUrlBuilder }}});
        }
        return fluid.initSubcomponent(that, "searchToRelateDialog", [that.container, that.primaryRecordType, that.applier, dlgOpts]);
    };
    
    cspace.relationManager = function (container, primaryRecordType, relatedRecordType, applier, options) {
        var that = fluid.initView("cspace.relationManager", container, options);
        that.applier = applier;
        that.primaryRecordType = primaryRecordType;
        that.relatedRecordType = relatedRecordType;
        
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.applier.model, fluid.COMPONENT_OPTIONS]); 
        
        // TODO: add relations should be overridden high up if local.
        // something like this: that.addRelations = that.options.addRelations;
        that.addRelations = function (relations) {
            if (cspace.util.useLocalData()) {
                updateRelations(that.applier, that.relatedRecordType)(relations);
            }
            else {
                that.dataContext.addRelations(relations);
            }
        };
        
        bindEventHandlers(that);        
        return that;
    };
    
    fluid.defaults("cspace.relationManager", {
        searchToRelateDialog: {
            type: "cspace.searchToRelateDialog"
        },
        dataContext: {
            type: "cspace.dataContext",
            options: {
                recordType: "relationships"
            }
        },
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
        }
    });
    
})(jQuery, fluid);