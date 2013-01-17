/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";
    
    // Record Traverser default options
    fluid.defaults("cspace.recordTraverser", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        model: { },
        selectors: {
            indexTotal: ".csc-recordTraverser-indexTotal",
            returnToSearch: ".csc-recordTraverser-returnToSearch",
            linkNext: ".csc-recordTraverser-next",
            linkPrevious: ".csc-recordTraverser-previous"
        },
        // HTML template for the component
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
        // Message Bundle
        parentBundle: "{globalBundle}",
        // Rendering tree used for rendering body of the component
        protoTree: {
            indexTotal: {
                messagekey: "recordTraverser-indexTotal",
                args: ["${adjacentRecords.userIndex}", "${adjacentRecords.total}"],
                decorators: {"addClass": "{styles}.indexTotal"}
            },
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${returnToSearch}",
                trueTree: {
                    returnToSearch: {
                        target: "${returnToSearch}",
                        linktext: {
                            messagekey: "recordTraverser-returnToSearch"
                        },
                        decorators: {"addClass": "{styles}.returnToSearch"}
                    }
                }
            }, {
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
            // Cached data for the search reference
            searchReferenceStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "searchReference"
                }
            },
            // Cached data for search history
            searchHistoryStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "searchHistory",
                    source: "advancedsearch"
               }
            },
            // Cached data for find edit history
            findeditHistoryStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "findeditHistory",
                    source: "findedit"
                }
            },
            // Data for the component
            dataSource: {
                type: "cspace.recordTraverser.dataSource"
            },
            // Component to capture user navigating away from the page
            globalNavigator: "{globalNavigator}"
        },
        invokers: {
            prepareModel: {
                funcName: "cspace.recordTraverser.prepareModel",
                args: [
                    ["{cspace.recordTraverser}.searchHistoryStorage", "{cspace.recordTraverser}.findeditHistoryStorage"],
                    "{vocab}",
                    "{cspace.recordTraverser}.model",
                    "{cspace.recordTraverser}.applier",
                    "{cspace.recordTraverser}.options.elPaths",
                    "{cspace.recordTraverser}.options.urls"
                ]
            },
            displayErrorMessage: "cspace.util.displayErrorMessage"
        },
        // URL used by the navigation links
        urls: cspace.componentUrlBuilder({
            navigate: "%webapp/html/%recordType.html?csid=%csid%vocab",
            adjacentRecords: "%tenant/%tname/adjacentRecords/%token/%index",
            returnToSearch: "%webapp/html/%source.html?hashtoken=%hashtoken"
        }),
        listeners: {
            prepareModelForRender: "{cspace.recordTraverser}.prepareModelForRenderListener"
        },
        preInitFunction: "cspace.recordTraverser.preInitFunction",
        elPaths: {
            returnToSearch: "returnToSearch",
            searchReference: "searchReference",
            index: "index",
            userIndex: "userIndex",
            token: "token",
            total: "total",
            csid: "csid",
            adjacentRecords: "adjacentRecords",
            previous: "adjacentRecords.previous",
            next: "adjacentRecords.next",
            recordType: "recordtype",
            source: "source",
            vocab: "namespace"
        }
    });

    // Data for the component grabbed from App layer
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

    // Overwriting data when testing locally
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
    // Overwriting data when testing locally
    fluid.defaults("cspace.recordTraverser.testDataSource", {
        url: "%test/data/person/%token.json"
    });
    cspace.recordTraverser.testDataSource = cspace.URLDataSource;
    
    // Function to get a sub-model from the model of the component
    var get = function (model) {
        return fluid.get(model, fluid.model.composeSegments.apply(null, Array().slice.call(arguments, 1)));
    };
    
    // Preprocessing model for rendering - making sure all neccessary fields are present in the model so that we can reference them in a prototree
    cspace.recordTraverser.prepareModel = function (storages, vocabComponent, model, applier, elPaths, urls) {
        fluid.each([elPaths.next, elPaths.previous], function (rec) {
            if (!get(model, rec, elPaths.csid)) {
                return;
            }
            var vocab = cspace.vocab.resolve({
                model: get(model, rec),
                recordType: get(model, rec, elPaths.recordType),
                vocab: vocabComponent
            });
            applier.requestChange(rec + ".target", fluid.stringTemplate(urls.navigate, {
                recordType: get(model, rec, elPaths.recordType),
                csid: get(model, rec, elPaths.csid),
                vocab: vocab ? ("?" + $.param({vocab: vocab})) : ""
            }));
        });
        applier.requestChange(fluid.model.composeSegments(elPaths.adjacentRecords, elPaths.userIndex),
            get(model, elPaths.adjacentRecords, elPaths.index) + 1);
        var hashtoken = get(model, elPaths.searchReference, elPaths.token),
            source = get(model, elPaths.searchReference, elPaths.source),
            returnToSearch;
        fluid.each(storages, function (storage) {
            if (storage.options.source !== source) {
                return;
            }
            var history = storage.get();
            if (!history) {
                return;
            }
            returnToSearch = fluid.find(history, function (search) {
                if (search.hashtoken === hashtoken) {
                    return {
                        hashtoken: hashtoken,
                        source: source
                    };
                }
            });
        });
        if (!returnToSearch) {
            return;
        }
        applier.requestChange(elPaths.returnToSearch, fluid.stringTemplate(urls.returnToSearch, returnToSearch));
    };

    cspace.recordTraverser.preInitFunction = function (that) {
        // Function to cache the data we retreive
        that.save = function (increment) {
            if (!increment) {
                return;
            }
            var model = that.model,
                elPaths = that.options.elPaths,
                searchReference = elPaths.searchReference,
                index = get(model, searchReference, elPaths.index);

            if (typeof index !== "number") {
                index = undefined;
            } else {
                index += increment;
            }
            that.searchReferenceStorage.set({
                token: get(model, searchReference, elPaths.token),
                index: index,
                source: get(model, searchReference, elPaths.source)
            });
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
            searchReferenceStorage = that.searchReferenceStorage;

        // Get the data and put it as a model for the Record Traverser
        applier.requestChange(searchReference, searchReferenceStorage.get());
        var searchRef = fluid.get(model, searchReference);
        if (!searchRef) {
            return;
        }
        if ($.isEmptyObject(searchRef)) {
            searchReferenceStorage.set();
            return;
        }
        searchReferenceStorage.set();
        that.dataSource.get({
            token: get(model, searchReference, elPaths.token),
            index: get(model, searchReference, elPaths.index),
            source: get(model, searchReference, elPaths.source)
        }, function(data) {
            // If data cannot be retreived then show a user-friendly error
            if (data.isError === true) {
                that.displayErrorMessage(that.options.parentBundle.resolve("recordTraverser-fail"));
                return;
            }
            applier.requestChange(elPaths.adjacentRecords, data);
            that.refreshView();
        });

        // Capture navigation away events when user clicks navigation links
        that.globalNavigator.addListener(function (callback, evt) {
            if (!evt) {
                return;
            }
            var target = $(evt.target);
            if (target.length === 0) {
                return;
            }
            that.save(fluid.find({
                "linkNext": 1,
                "linkPrevious": -1
            }, function (increment, selector) {
                if (that.locate(selector).attr("href") === target.attr("href")) {
                    return increment;
                }
            }));
        }, "recordTraverser", "first");
    };
    
    // Fetching / Caching
    // ----------------------------------------------------
    
    // Call to primeCacheFromResources will start fetching/caching
    // of the template on this file load before the actual component's
    // creator function is called
    fluid.fetchResources.primeCacheFromResources("cspace.recordTraverser");
    
})(jQuery, fluid);
