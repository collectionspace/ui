/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    var bindEventHandlers = function (that) {
        that.applier.modelChanged.addListener("relations", function () {
            that.listEditor.options.updateList(that.listEditor, that.listEditor.list.refreshView);
        });
        that.listEditor.events.pageReady.addListener(function () {
            that.events.afterRender.fire();
        });
        that.relationManager.events.onCreateNewRecord.addListener(that.listEditor.addNewListRow);
        that.listEditor.detailsDC.events.afterCreate.addListener(function (data) {
            var newRelation = [{
                source: {
                    csid: that.applier.model.csid,
                    recordtype: that.recordType
                },
                target: {
                    csid: data.csid,
                    recordtype: "objects"
                },//data,
                type: "affects",
                "one-way": false
            }];
            that.relationManager.addRelations({items: newRelation});
        });
    };
    
    var createListUpdater = function (applier) {
        return function (listEditor, callback) {
            $.ajax({
                url: listEditor.options.baseUrl + listEditor.recordType + "/" + applier.model.csid,
                dataType: "json",
                success: function (data) {
                    fluid.model.copyModel(listEditor.model.list, data.relations);
                    if (callback) {
                        callback();
                    }
                }
            });
        };
    };
    
    cspace.relatedRecordsTab = function (container, recordType, uispec, applier, options) {
        var that = fluid.initView("cspace.relatedRecordsTab", container, options);        
        that.recordType = recordType;
        that.uispec = uispec;
        that.applier = applier;
        
        that.options.listEditor.options.updateList = createListUpdater(that.applier);
        
        that.listEditor = fluid.initSubcomponent(that, "listEditor", [that.container, that.recordType, 
            that.uispec, fluid.COMPONENT_OPTIONS]);
            
        that.relationManager = fluid.initSubcomponent(that, "relationManager", [
            that.container,
            that.recordType,
            that.applier,
            fluid.COMPONENT_OPTIONS
        ]);
            
        bindEventHandlers(that);
        
        return that;
    };
    
    fluid.defaults("cspace.relatedRecordsTab", {
        listEditor: {
            type: "cspace.listEditor"
        },
        relationManager: {
            type: "cspace.relationManager"
        },
        selectors: {
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp"
        },
        events: {
            afterRender: null
        }
    });
    
})(jQuery, fluid);