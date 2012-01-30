/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.recordTraverser", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        model: { },
        selectors: {
            linkNext: ".csc-recordTraverser-next",
            linkPrevious: ".csc-recordTraverser-previous",
            current: ".csc-recordTraverser-current"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RecordTraverserTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        styles: {
            linkActive: "cs-recordTraverser-linkActive",
            linkDeactive: "cs-recordTraverser-linkDeactive"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            linkNext: {
                target: "${currentNext.target}",
                linktext: "${currentNext.number}"
            },
            linkPrevious: {
                target: "${currentPrevious.target}",
                linktext: "${currentPrevious.number}"
            },
            current: "${current.number}"
        },
        finalInitFunction: "cspace.recordTraverser.finalInitFunction",
        components: {
            localStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "recordsData"
                }
            }
        },
        invokers: {
            prepareModel: {
                funcName: "cspace.recordTraverser.prepareModel",
                args: ["{cspace.recordTraverser}.model", "{cspace.recordTraverser}.applier", "{cspace.recordTraverser}.options.elPaths", "{cspace.recordTraverser}.options.urls"]
            }
        },
        listeners: {
            prepareModelForRender: "{cspace.recordTraverser}.prepareModelForRenderListener"
        },
        preInitFunction: "cspace.recordTraverser.preInitFunction",
        urls: cspace.componentUrlBuilder({
            navigate: "%webapp/html/%recordType.html?csid=%csid"
        }),
        elPaths: {
            recordsData: "recordsData",
            recordsDataResults: "recordsData.results",
            totalItems: "recordsData.pagination.totalItems",
            recordType: "recordtype",
            csid: "csid"
        }
    });
    
    cspace.recordTraverser.prepareModel = function (model, applier, elPaths, urls) {
        var selected = model.recordsData.selected;
        applier.requestChange("current", fluid.get(model, fluid.model.composeSegments(elPaths.recordsDataResults, selected)));
        applier.requestChange("currentNext", fluid.get(model, fluid.model.composeSegments(elPaths.recordsDataResults, selected + 1)));
        applier.requestChange("currentPrevious", fluid.get(model, fluid.model.composeSegments(elPaths.recordsDataResults, selected - 1)));
        
        fluid.each(["Next", "Previous"], function (rec) {
            var currentRec = "current" + rec;
            applier.requestChange(currentRec + ".target", fluid.stringTemplate(urls.navigate, {
                recordType: fluid.get(model, fluid.model.composeSegments(currentRec, elPaths.recordType)),
                csid: fluid.get(model, fluid.model.composeSegments(currentRec, elPaths.csid))
            }));
        });
    };
    
    cspace.recordTraverser.preInitFunction = function (that) {
        that.prepareModelForRenderListener = function () {
            that.prepareModel();
        };
    };
    
    cspace.recordTraverser.finalInitFunction = function(that) {
        that.applier.requestChange(that.options.elPaths.recordsData, that.localStorage.get());
        
        that.localStorage.set();
        
        if (!that.model.recordsData) {
            return;
        }
        
        that.refreshView();
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.recordTraverser");
    
})(jQuery, fluid);
