/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RelatedRecordsTab.js loaded");
 
    var bindEventHandlers = function (that) {
        var elPath = "relations." + that.relatedRecordType;
        that.applier.modelChanged.addListener(elPath, function () {
            that.listEditor.options.updateList(that.listEditor, that.listEditor.list.refreshView);
        });
        that.relationManager.events.onCreateNewRecord.addListener(that.listEditor.addNewListRow);
        that.listEditor.detailsDC.events.afterCreate.addListener(function (data) {
            var newRelation = [{
                source: {
                    csid: that.applier.model.csid,
                    recordtype: that.primaryRecordType
                },
                target: {
                    csid: data.csid,
                    recordtype: that.relatedRecordType
                },
                type: "affects",
                "one-way": false
            }];
            that.relationManager.addRelations({items: newRelation});
        });
        that.listEditor.details.events.afterRender.addListener(function () {
            var csid = that.listEditor.details.model.csid;
            if (csid) {
                var gotoLink = that.locate("goToRecord");
                gotoLink.attr("href", "./" + that.relatedRecordType + ".html?csid=" + csid);
                gotoLink.show();
            }
        });
    };
    
    var createListUpdater = function (applier, primaryRecordType, relatedRecordType) {
        return function (listEditor, callback) {
            $.ajax({
                url: listEditor.options.baseUrl + primaryRecordType + "/" + applier.model.csid,
                dataType: "json",
                success: function (data) {
                    fluid.model.copyModel(listEditor.model.list, data.relations[relatedRecordType]);
                    if (callback) {
                        callback();
                    }
                }
            });
        };
    };
    
    /**
     * 
     * @param {Object} container
     * @param {Object} primaryRecordType
     * @param {Object} relatedRecordType
     * @param {Object} uispec
     * @param {Object} applier  The applier holding the data model of the primary record
     * @param {Object} options
     */
    cspace.relatedRecordsTab = function (container, primaryRecordType, relatedRecordType, uispec, applier, options) {
        var that = fluid.initView("cspace.relatedRecordsTab", container, options);
        that.primaryRecordType = primaryRecordType;
        that.relatedRecordType = relatedRecordType;
        that.uispec = uispec;
        that.applier = applier;
            
        that.relationManager = fluid.initSubcomponent(that, "relationManager", [
            that.container,
            that.primaryRecordType,
            that.relatedRecordType,
            that.applier,
            fluid.COMPONENT_OPTIONS
        ]);
        
        that.options.listEditor.options.updateList = createListUpdater(that.applier, that.primaryRecordType, that.relatedRecordType);

        $.extend(true, that.options.listEditor.options, {
            listeners: {
                pageReady: function () {
                    that.events.afterRender.fire();
                }
            }
        });        
        that.listEditor = fluid.initSubcomponent(that, "listEditor", [that.container, that.relatedRecordType, 
            that.uispec, fluid.COMPONENT_OPTIONS]);
            
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
            timestamp: ".csc-timestamp",
            goToRecord: ".csc-goto"
        },
        events: {
            afterRender: null
        }
    });
    
})(jQuery, fluid);
