/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RelatedRecordsList.js loaded");
    
    fluid.registerNamespace("cspace.relatedRecordsList");
    
    var addModelChangeListener = function (that, recordTypes, applier, recordList, recordType, related) {
        applier.modelChanged.addListener("relations." + recordType, function (model) {
            var instantiator = that.options.instantiator;
            that.renderer.refreshView();
            fluid.each(that.options.components, function (component, name) {
                if (that[name]) {
                    instantiator.clearComponent(that, name);
                }
                fluid.initDependent(that, name, instantiator);
            });
        });
    };

    var bindEventHandlers = function (that) {
        fluid.each(that.options.recordTypes[that.options.related], function (value) {
            addModelChangeListener(that, that.options.recordTypes, that.options.applier, that.recordList, value, that.options.related);
        });
    };

    cspace.relatedRecordsList = function (container, options) {
        var that = fluid.initRendererComponent("cspace.relatedRecordsList", container, options);
        that.renderer.refreshView();
        fluid.initDependents(that);        
        bindEventHandlers(that);
        that.events.afterSetup.fire(that);
        return that;
    };
    
    cspace.relatedRecordsList.buildRelationsList = function (recordTypes, relations, related) {
        var relationList = [];
        fluid.each(recordTypes[related], function (value) {
            relationList = relationList.concat(relations[value] || []);
        });   
        return relationList;
    };
    
    cspace.relatedRecordsList.produceTree = function(that) {
        return {
            mainHeader: {
                messagekey: that.options.related //holds key for stringBundle lookup
            },
            numberHeader: {
                messagekey: "numberHeader"
            },
            summaryHeader: {
                messagekey: "summaryHeader"
            },
            typeHeader: {
                messagekey: "typeHeader"
            }
        };
    };

    fluid.defaults("cspace.relatedRecordsList", {
        gradeNames: ["fluid.rendererComponent"],
        mergePolicy: {
            model: "preserve",
            applier: "nomerge",
            instantiator: "nomerge"
        },
        instantiator: "{instantiator}",
        components: {
            recordList: {
                type: "cspace.recordList",
                options: {
                    uispec: "{relatedRecordsList}.options.uispec",
                    listeners: {
                        afterSelect: "{relatedRecordsList}.options.recordListAfterSelectHandler"
                    }
                }
            },
            relationManager: {
                type: "cspace.relationManager",
                options: {
                    primary: "{relatedRecordsList}.options.primary",
                    related: "{relatedRecordsList}.options.related",
                    applier: "{relatedRecordsList}.options.applier",
                    model: "{relatedRecordsList}.model"
                }
            },
            togglableRelated: {
                type: "cspace.util.togglable",
                options: {
                    selectors: {
                        header: "{relatedRecordsList}.options.selectors.header",
                        togglable: "{relatedRecordsList}.options.selectors.togglable"
                    }
                }
            }
        },
        events: {
            afterSetup: null  
        },
        recordListAfterSelectHandler: cspace.recordList.afterSelectHandlerDefault,
        parentBundle: "{globalBundle}",
        recordTypes: "{recordTypes}",
        produceTree: cspace.relatedRecordsList.produceTree,
        selectors: {
            recordListSelector: ".csc-relatedRecordsList-recordList",
            mainHeader: ".csc-related-mainheader",
            numberHeader: ".csc-related-number-header",
            summaryHeader: ".csc-related-summary-header",
            typeHeader: ".csc-related-recordtype-header",
            header: ".csc-related-header",
            togglable: ".csc-related-togglable"
        },
        selectorsToIgnore: ["recordListSelector", "header", "togglable"],
        strings: {
            numberHeader: "Number",
            summaryHeader: "Summary",
            typeHeader: "Type"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RelatedRecordListTemplate.html"
            })
        }
    });

    fluid.fetchResources.primeCacheFromResources("cspace.relatedRecordsList");
})(jQuery, fluid);
