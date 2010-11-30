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
    fluid.log("Sidebar.js loaded");
    
    fluid.registerNamespace("cspace.sidebar");

    cspace.sidebar = function (container, options) {
        var that = fluid.initView("cspace.sidebar", container, options);
        
        that.model = that.options.model;

        fluid.initDependents(that);
        
        that.options.applier.modelChanged.addListener("termsUsed", function (model, oldModel, changeRequest) {
            that.termsUsed.applier.requestChange("items", model.termsUsed);
            that.termsUsed.refreshView();
        });

        return that;
    };
    
    cspace.sidebar.localRelatedRecordListOpts = function (container, options) {
        var that = fluid.initLittleComponent("cspace.sidebar.localRelatedRecordListOpts", options);
        return cspace.relatedRecordsList(container, that.options);
    };
    
    fluid.defaults("cspace.sidebar.localRelatedRecordListOpts", {
        components: {
            relationManager: {
                options: {
                    dataContext: {
                        baseUrl: "data/",
                        fileExtension: ".json"
                    }
                }
            }
        },
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        }
    });
    
    fluid.demands("cspace.recordList", "cspace.sidebar", 
        ["{sidebar}.options.selectors.termsUsed", fluid.COMPONENT_OPTIONS]);
    
    fluid.demands("procedures",  ["cspace.localData", "cspace.sidebar"], {
        funcName: "cspace.sidebar.localRelatedRecordListOpts",
        args: ["{sidebar}.options.selectors.relatedProcedures", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("procedures", "cspace.sidebar", 
        ["{sidebar}.options.selectors.relatedProcedures", fluid.COMPONENT_OPTIONS]);
    
    fluid.demands("cataloging",  ["cspace.localData", "cspace.sidebar"], {
        funcName: "cspace.sidebar.localRelatedRecordListOpts",
        args: ["{sidebar}.options.selectors.relatedCataloging", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("cataloging", "cspace.sidebar", 
        ["{sidebar}.options.selectors.relatedCataloging", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.sidebar", {
        components: {
            termsUsed: {
                type: "cspace.recordList",
                options: {
                    listeners: {
                        afterSelect: "{sidebar}.options.recordListAfterSelectHandler"
                    },
                    model: {
                        items: "{sidebar}.model.termsUsed",
                        selectionIndex: -1
                    },
                    uispec : "{sidebar}.options.uispec.termsUsed",
                    recordType: "authorities",
                    strings: {
                        nothingYet: "No Authority terms used yet"
                    }
                }
            },
            cataloging: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primaryRecordType",
                    related: "cataloging",
                    applier: "{sidebar}.options.applier",
                    uispec : "{sidebar}.options.uispec.relatedCataloging",
                    model: "{sidebar}.model",
                    recordListAfterSelectHandler: "{sidebar}.options.recordListAfterSelectHandler"
                }
            },
            procedures: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primaryRecordType",
                    related: "procedures",
                    applier: "{sidebar}.options.applier",
                    uispec : "{sidebar}.options.uispec.relatedProcedures",
                    model: "{sidebar}.model",
                    recordListAfterSelectHandler: "{sidebar}.options.recordListAfterSelectHandler"
                }
            }
        },
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        recordListAfterSelectHandler: cspace.recordList.afterSelectHandlerDefault,        
        selectors: {
            mediaSnapshot: ".csc-media-snapshot",
            termsUsed: ".csc-integrated-authorities",
            relatedCataloging: ".csc-related-cataloging",
            relatedProcedures: ".csc-related-procedures"
        }
    });
    
    fluid.demands("sidebar", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.sidebar", fluid.COMPONENT_OPTIONS]);
        
})(jQuery, fluid);
