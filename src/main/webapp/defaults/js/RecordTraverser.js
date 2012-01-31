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
            },
            dataSource: {
                type: "cspace.recordTraverser.dataSource"
            },
            globalNavigator: "{globalNavigator}"
        },
        invokers: {
            prepareModel: {
                funcName: "cspace.recordTraverser.prepareModel",
                args: ["{cspace.recordTraverser}.model", "{cspace.recordTraverser}.applier", "{cspace.recordTraverser}.options.elPaths", "{cspace.recordTraverser}.options.urls"]
            },
            linkTraverse: "linkTraverse"
        },
        listeners: {
            prepareModelForRender: "{cspace.recordTraverser}.prepareModelForRenderListener"
        },
        preInitFunction: "cspace.recordTraverser.preInitFunction",
        urls: cspace.componentUrlBuilder({
            listUrl: "%tenant/%tname/%recordType?pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey",
            navigate: "%webapp/html/%recordType.html?csid=%csid"
        }),
        elPaths: {
            recordsData: "recordsData",
            recordsDataResults: "recordsData.results",
            totalItems: "recordsData.pagination.totalItems",
            recordType: "recordtype",
            csid: "csid",
            items: "items"
        }
    });
    
    fluid.demands("cspace.recordTraverser.dataSource",  ["cspace.localData", "cspace.recordTraverser"], {
        funcName: "cspace.recordTraverser.testDataSource",
        args: {
            targetTypeName: "cspace.recordTraverser.testDataSource",
            termMap: {
                recordType: "%recordType"
            }
        }
    });
    fluid.demands("cspace.recordTraverser.dataSource", ["cspace.recordTraverser"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordTraverser}.options.urls.listUrl",
            termMap: {
                recordType: "%recordType",
                pageNum: "%pageNum",
                pageSize: "%pageSize",
                sortDir: "%sortDir",
                sortKey: "%sortKey"
            },
            targetTypeName: "cspace.recordTraverser.dataSource"
        }
    });
    fluid.defaults("cspace.recordTraverser.testDataSource", {
        url: "%test/data/%recordType/records.json"
    });
    cspace.recordTraverser.testDataSource = cspace.URLDataSource;
    
    var bindHandlers = function (that) {
        that.locate("linkTraverse").click(that.linkTraverse);
    };
    
    var assembleTriple = function (model, applier, elPaths, prevIndex, curIndex, nextIndex) {
        
        var prevEl = getElement(model, applier, elPaths, prevIndex);
        var curEl = getElement(model, applier, elPaths, curIndex);
        var nextEl = getElement(model, applier, elPaths, nextIndex);
        
        // Create an array of 3 records if possible
        var results = [];
        fluid.each([prevEl, curEl, nextEl], function (rec) {
            if (!rec) {
                return;
            }
            
            results.push(rec);
        });
        
        applier.requestChange("currentNext", nextEl);
        applier.requestChange("current", curEl);
        applier.requestChange("currentPrevious", prevEl);
        
        return results;
    };
    
    
    var bindEventHandlers = function (that) {
        that.locate("currentNext").click(function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                
                var selected = model.recordsData.selected;
                var results = assembleTriple(model, applier, elPaths, selected, selected + 1, selected + 2);
                
                // put this new localStorage
                model.recordsData.results = results;
                model.recordsData.selected = 1;
                
                // modify pagination
                // ......
                
                that.localStorage.set(model.recordsData);
                
                window.location = that.locate("currentNext").target;
            });
        });
        
        that.locate("currentPrevious").click(function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                
                var selected = model.recordsData.selected;
                var results = assembleTriple(model, applier, elPaths, selected - 2, selected - 1, selected);
                
                // put this new localStorage
                model.recordsData.results = results;
                model.recordsData.selected = 1;
                
                // modify pagination
                // ......
                
                that.localStorage.set(model.recordsData);
                
                window.location = that.locate("currentNext").target;
            });
        });
    };
    
    cspace.recordTraverser.linkTraverse = function (globalNavigator, callback) {
        globalNavigator.events.onPerformNavigation.fire(callback);
    };
    
    var getElement = function(model, applier, elPaths, index) {
        // try to get an element
        var element = fluid.get(model, fluid.model.composeSegments(elPaths.recordsDataResults, index));
        
        // if it does not exist then just try to find it
        if (!element) {
            element = searchElement(model, index);
        }
        
        return element;
    };
    
    var searchElement = function (model, index) {
        
        // Put some logic here not to do the search if it is obvious that we won't find an element
        // ...
        
        var initialUpdate;
        var element;
        
        if (!model) {
            initialUpdate = true;
            model = that.recordsData.pagination;
        }
        var directModel = {
            recordType: that.model.recordType,
            pageNum: ((model.pageIndex - 1) * model.pageSize + index) + 1,
            pageSize: 1
        };
        that.dataSource.get(directModel, function (data) {
            // get data
            that.updateList(fluid.get(data, that.options.elPath.items));
            
            // get the element we tried to find?
            element = data.items[0];
            
        }, cspace.util.provideErrorCallback(that, that.dataSource.resolveUrl(directModel), "errorFetching"));
        
        return element;
    };
    
    cspace.recordTraverser.prepareModel = function (model, applier, elPaths, urls) {
        
//          OLD WORKING CODE
        
//        var selected = model.recordsData.selected;
//        applier.requestChange("currentNext", fluid.get(model, fluid.model.composeSegments(elPaths.recordsDataResults, selected + 1)));
//        applier.requestChange("current", fluid.get(model, fluid.model.composeSegments(elPaths.recordsDataResults, selected)));
//        applier.requestChange("currentPrevious", fluid.get(model, fluid.model.composeSegments(elPaths.recordsDataResults, selected - 1)));
//        
//        fluid.each(["Next", "Previous"], function (rec) {
//            var currentRec = "current" + rec;
//            applier.requestChange(currentRec + ".target", fluid.stringTemplate(urls.navigate, {
//                recordType: fluid.get(model, fluid.model.composeSegments(currentRec, elPaths.recordType)),
//                csid: fluid.get(model, fluid.model.composeSegments(currentRec, elPaths.csid))
//            }));
//        });
//        
//        // now modify pagination
        
        
        var selected = model.recordsData.selected;
        
        assembleTriple(model, applier, elPaths, selected - 1, selected, selected + 1);
        //applier.requestChange("currentNext", getElement(model, applier, elPaths, selected + 1));
        //applier.requestChange("current", getElement(model, applier, elPaths, selected));
        //applier.requestChange("currentPrevious", getElement(model, applier, elPaths, selected - 1));
        
        fluid.each(["Next", "Previous"], function (rec) {
            var currentRec = "current" + rec;
            applier.requestChange(currentRec + ".target", fluid.stringTemplate(urls.navigate, {
                recordType: fluid.get(model, fluid.model.composeSegments(currentRec, elPaths.recordType)),
                csid: fluid.get(model, fluid.model.composeSegments(currentRec, elPaths.csid))
            }));
        });
        
        // modify pagination

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
        
        bindEventHandlers(that);
        
        that.refreshView();
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.recordTraverser");
    
})(jQuery, fluid);
