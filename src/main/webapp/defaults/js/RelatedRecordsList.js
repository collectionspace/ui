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
        applier.modelChanged.addListener(that.options.relationsElPath + "." + recordType, function (model) {
            var instantiator = that.options.instantiator;
            that.renderer.refreshView();
            fluid.each(that.options.components, function (component, name) {
                if (that[name]) {
                    instantiator.clearComponent(that, name);
                }
                fluid.initDependent(that, name, instantiator);
            });
            setupRelatedRecordsList(that);
        });
    };

    var bindEventHandlers = function (that) {
        fluid.each(that.options.recordTypes[that.options.related], function (value) {
            addModelChangeListener(that, that.options.recordTypes, that.options.applier, that.recordList, value, that.options.related);
        });
    };
    
    var setupRelatedRecordsList = function (that) {
        that.locate("numOfRelated").text(fluid.stringTemplate(that.options.strings.numOfRelated, {
            numOfRelated: that.recordList.calculateRecordListSize()
        }));
    };

    cspace.relatedRecordsList = function (container, options) {
        var that = fluid.initRendererComponent("cspace.relatedRecordsList", container, options);
        that.renderer.refreshView();
        fluid.initDependents(that);        
        bindEventHandlers(that);
        setupRelatedRecordsList(that);
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
    
    cspace.relatedRecordsList.buildRelationsListColumns = function (related) {
        if (related !== "cataloging") {
            return ["number", "recordtype", "summary"];
        }
        return ["number", "summary", "summarylist.updatedAt"];
    };
    
    cspace.relatedRecordsList.buildRelationsListNames = function (related) {
        if (related !== "cataloging") {
            return;
        }
        return ["number", "summary", "updatedAt"];
    };
    
    cspace.relatedRecordsList.produceTree = function(that) {
        return {
            mainHeader: {
                messagekey: that.options.related //holds key for stringBundle lookup
            }
        };
    };

    fluid.defaults("cspace.relatedRecordsList", {
        gradeNames: "fluid.rendererComponent",
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
                    elPaths: {
                        items: "items"
                    },
                    strings: {
                        number: "Number",
                        summary: "Summary",
                        recordtype: "Type"
                    },
                    model: {
                        messagekeys: {
                            nothingYet: "relatedRecordsList-nothingYet"
                        }
                    },
                    showNumberOfItems: false
                }
            },
            relationManager: {
                type: "cspace.relationManager",
                options: {
                    primary: "{relatedRecordsList}.options.primary",
                    related: "{relatedRecordsList}.options.related",
                    applier: "{relatedRecordsList}.options.applier",
                    model: "{relatedRecordsList}.model",
                    relationsElPath: "{relatedRecordsList}.options.relationsElPath"
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
            numOfRelated: ".csc-num-items",
            relationManagerSelector: ".csc-relatedRecordsList-relationManager",
            recordListSelector: ".csc-relatedRecordsList-recordList",
            mainHeader: ".csc-related-mainheader",
            header: ".csc-related-header",
            togglable: ".csc-related-togglable"
        },
        selectorsToIgnore: ["relationManagerSelector", "recordListSelector", "header", "togglable", "numOfRelated"],
        strings: {
            numOfRelated: "(%numOfRelated)"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RelatedRecordListTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        }
    });

    fluid.fetchResources.primeCacheFromResources("cspace.relatedRecordsList");
})(jQuery, fluid);
