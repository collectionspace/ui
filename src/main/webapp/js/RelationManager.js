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
    
    var updateRelations = function (applier) {
        // TODO: Fluid transform candidate.
        return function (relations) {
            var newModelRelations = [];
            fluid.model.copyModel(newModelRelations, applier.model.relations);
            var relIndex = newModelRelations.length;            
            for (var i = 0; i < relations.items.length; i++) {
                newModelRelations[relIndex] = relations.items[i].target;
                newModelRelations[relIndex].relationshiptype = relations.items[i].type;
                relIndex += 1;
            }
            applier.requestChange("relations", newModelRelations);
        };
    };
    
    var bindEventHandlers = function (that) {
        that.locate("addButton").click(function (e) {
            if (that.applier.model.csid) {
                that.locate("messageContainer", "body").hide();
                cspace.addDialogInst.prepareDialog(that.recordType);
                cspace.addDialogInst.dlg.bind("dialogopen", function () {
                    cspace.addDialogInst.events.addRelations.addListener(that.addRelations, "addRelationsListener");
                    cspace.addDialogInst.events.onCreateNewRecord.addListener(that.events.onCreateNewRecord.fire, "onCreateNewRecordListener");
                });
                cspace.addDialogInst.dlg.bind("dialogclose", function () {
                    cspace.addDialogInst.events.addRelations.removeListener("addRelationsListener");
                    cspace.addDialogInst.events.onCreateNewRecord.removeListener("onCreateNewRecordListener");
                });
                cspace.addDialogInst.dlg.dialog("open");
            } else {
                cspace.util.displayTimestampedMessage(that.dom, that.options.strings.pleaseSaveFirst);
            }
        });
        that.dataContext.events.afterAddRelations.addListener(updateRelations(that.applier));
    };
    
    var makeDialog = function (that) {
        var dlgOpts = that.options.searchToRelateDialog.options || {};
        dlgOpts.primaryRecordType = that.options.primaryRecordType || that.recordType;
        return fluid.initSubcomponent(that, "searchToRelateDialog", [that.container, that.applier, dlgOpts]);
    };
    
    cspace.relationManager = function (container, recordType, applier, options) {
        var that = fluid.initView("cspace.relationManager", container, options);
        that.applier = applier;
        that.recordType = recordType;
        
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.applier.model, fluid.COMPONENT_OPTIONS]); 
        
        cspace.addDialogInst = cspace.addDialogInst || makeDialog(that);
        
        // TODO: add relations should be overridden high up if local.
        // something like this: that.addRelations = that.options.addRelations;
        that.addRelations = function (relations) {
            if (cspace.util.isLocal()) {
                updateRelations(that.applier)(relations);
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
        },
        primaryRecordType: null
    });
    
})(jQuery, fluid);