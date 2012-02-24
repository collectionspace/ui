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
            indexTotal: ".csc-recordTraverser-indexTotal",
            returnToSearch: ".csc-recordTraverser-returnToSearch",
            linkNext: ".csc-recordTraverser-next",
            linkPrevious: ".csc-recordTraverser-previous"
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
            indexTotal: "cs-recordTraverser-indexTotal",
            linkNext: "cs-recordTraverser-next",
            linkPrevious: "cs-recordTraverser-previous",
            returnToSearch: "cs-recordTraverser-returnToSearch",
            disabled: "cs-recordTraverser-disabled"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            indexTotal: {
                messagekey: "recordTraverser-indexTotal",
                args: ["${adjacentRecords.userIndex}", "${adjacentRecords.total}"],
                decorators: {"addClass": "{styles}.indexTotal"}
            },
            returnToSearch: {
                messagekey: "recordTraverser-returnToSearch",
                decorators: {"addClass": "{styles}.returnToSearch"}
            },
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${adjacentRecords.previous}",
                trueTree: {
                    linkPrevious: {
                        target: "${adjacentRecords.previous.target}",
                        decorators: [{"addClass": "{styles}.linkPrevious"}, {
                            type: "attrs",
                            attributes: {
                                title: "${adjacentRecords.previous.number}"
                            }
                        }]
                    }
                },
                falseTree: {
                    linkPrevious: {
                        decorators: [{"addClass": "{styles}.linkPrevious"}, {"addClass": "{styles}.disabled"}]
                    }
                }
            },
            {
                type: "fluid.renderer.condition",
                condition: "${adjacentRecords.next}",
                trueTree: {
                    linkNext: {
                        target: "${adjacentRecords.next.target}",
                        decorators: [{"addClass": "{styles}.linkNext"}, {
                            type: "attrs",
                            attributes: {
                                title: "${adjacentRecords.next.number}"
                            }
                        }]
                    }
                },
                falseTree: {
                    linkNext: {
                        decorators: [{"addClass": "{styles}.linkNext"}, {"addClass": "{styles}.disabled"}]
                    }
                }
            }]
        },
        finalInitFunction: "cspace.recordTraverser.finalInitFunction",
        components: {
            localStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "searchReference"
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
            afterRender: {
                funcName: "cspace.recordTraverser.afterRender",
                args: ["{cspace.recordTraverser}.dom", "{globalNavigator}", "{cspace.recordTraverser}.localStorage", "{cspace.recordTraverser}.model", "{cspace.recordTraverser}.options.elPaths"]
            }
        },
        urls: cspace.componentUrlBuilder({
            navigate: "%webapp/html/%recordType.html?csid=%csid",
            adjacentRecords: "%tenant/%tname/adjacentRecords?token=%token&index=%index"
        }),
        listeners: {
            prepareModelForRender: "{cspace.recordTraverser}.prepareModelForRenderListener",
            afterRender: "{cspace.recordTraverser}.afterRenderHandler"
        },
        preInitFunction: "cspace.recordTraverser.preInitFunction",
        elPaths: {
            searchReference: "searchReference",
            index: "index",
            userIndex: "userIndex",
            token: "token",
            total: "total",
            csid: "csid",
            adjacentRecords: "adjacentRecords",
            previous: "adjacentRecords.previous",
            next: "adjacentRecords.next",
            recordType: "recordtype"
        }
    });

    fluid.demands("cspace.recordTraverser.dataSource", ["cspace.recordTraverser"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordTraverser}.options.urls.adjacentRecords",
            termMap: {
                token: "%token",
                index: "%index"
            },
            targetTypeName: "cspace.recordTraverser.dataSource"
        }
    });

    fluid.demands("cspace.recordTraverser.dataSource",  ["cspace.localData", "cspace.recordTraverser"], {
        funcName: "cspace.recordTraverser.testDataSource",
        args: {
            targetTypeName: "cspace.recordTraverser.testDataSource",
            termMap: {
                token: "%token",
                index: "%index"
            }
        }
    });
    fluid.defaults("cspace.recordTraverser.testDataSource", {
        url: "%test/data/person/%token.json"
    });
    cspace.recordTraverser.testDataSource = cspace.URLDataSource;
    
    var get = function (model) {
        return fluid.get(model, fluid.model.composeSegments.apply(null, Array().slice.call(arguments, 1)));
    };

    cspace.recordTraverser.afterRender = function (dom, globalNavigator, localStorage, model, elPaths) {
        var searchReference = elPaths.searchReference;
        fluid.each({
            "linkNext": 1,
            "linkPrevious": -1
        }, function (increment, selector) {
            dom.locate(selector).click(function () {
                var link = $(this);
                globalNavigator.events.onPerformNavigation.fire(function () {
                    localStorage.set({
                        token: get(model, searchReference, elPaths.token),
                        index: get(model, searchReference, elPaths.index) + increment
                    });
                    window.location = link.attr("href");
                });
            });
        });
    };
    
    cspace.recordTraverser.prepareModel = function (model, applier, elPaths, urls) {
        fluid.each([elPaths.next, elPaths.previous], function (rec) {
            if (!get(model, rec, elPaths.csid)) {
                return;
            }
            applier.requestChange(rec + ".target", fluid.stringTemplate(urls.navigate, {
                recordType: get(model, rec, elPaths.recordType),
                csid: get(model, rec, elPaths.csid)
            }));
        });
        applier.requestChange(fluid.model.composeSegments(elPaths.adjacentRecords, elPaths.userIndex),
            get(model, elPaths.adjacentRecords, elPaths.index) + 1);
    };
    
    cspace.recordTraverser.preInitFunction = function (that) {
        that.afterRenderHandler = function () {
            that.afterRender();
        };
        that.prepareModelForRenderListener = function () {
            that.prepareModel();
        };
    };
    
    cspace.recordTraverser.finalInitFunction = function(that) {
        var applier = that.applier,
            model = that.model,
            elPaths = that.options.elPaths,
            searchReference = elPaths.searchReference,
            localStorage = that.localStorage;

        applier.requestChange(searchReference, localStorage.get());
        if (!fluid.get(model, searchReference)) {
            return;
        }
        localStorage.set();
        that.dataSource.get({
            token: get(model, searchReference, elPaths.token),
            index: get(model, searchReference, elPaths.index)
        }, function(data) {
            applier.requestChange(elPaths.adjacentRecords, data);
            that.refreshView();
        });
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.recordTraverser");
    
})(jQuery, fluid);
