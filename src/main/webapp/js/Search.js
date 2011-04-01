/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("Search.js loaded");
    
    var displayLookingMessage = function (domBinder, keywords, strings) {
        domBinder.locate("resultsCountContainer").hide();
        domBinder.locate("lookingString").text(fluid.stringTemplate(strings.looking, {query: keywords || ""}));
        domBinder.locate("lookingContainer").show();
    };
    
    var displayResultsCount = function (domBinder, count, keywords, strings) {
        domBinder.locate("lookingContainer").hide();
        domBinder.locate("resultsCount").text(fluid.stringTemplate(strings.resultsCount, {count: count, query: keywords || ""}));
        domBinder.locate("resultsCountContainer").show();
    };

    fluid.registerNamespace("cspace.search");

    cspace.search.colDefsGenerator = function (columnList, recordType, selectable) {
        var colDefs = fluid.transform(columnList, function (object, index) {
            var key = "col:";
            var comp;

            if (object === "number") {
                key = "number";
                comp = {
                    target: "${searchModel.recordType}.html?csid=${*.csid}",
                    linktext: "${*.number}"
                };
            } else if (object === "csid") {
                key = "csid";
            } else {
                comp = {value: "${*." + object + "}"};
            }
            return {
                key: key,
                valuebinding: "*." + object,
                components: comp,
                sortable: true
            };
        });
        if (selectable) {
            colDefs[colDefs.length] = {
                key: "selected",
                valuebinding: "*.selected",
                sortable: false
            };
        }
        return colDefs;
    };
    
    cspace.search.makeCutpoints = function (selectors, selectable) {
        var rendererCutpoints = [
            {id: "header:", selector: selectors.resultsHeader},
            {id: "row:", selector: selectors.resultsRow},
            {id: "number", selector: selectors.columns.number},
            {id: "col:", selector: selectors.columns.col}
        ];

        if (selectable) {
            rendererCutpoints.push({
                id: "selected",
                selector: selectors.columns.select
            });
        }
        return rendererCutpoints;
    };

    var displaySearchResults = function (that) {
        var range = that.model.pagination.totalItems; // TODO: dependency on external model
        var pagerModel = that.resultsPager.model;

        // you're not supposed to touch the pager's model, but there's a bug in this version, so...
        pagerModel.totalRange = range;
        that.resultsPager.events.initiatePageChange.fire({pageIndex: pagerModel.pageIndex, forceUpdate: true});
            
        displayResultsCount(that.dom, range, that.model.searchModel.keywords, that.options.strings);
        that.locate("resultsContainer").show();
        that.events.afterSearch.fire();
    };

    // TODO: start to interact with this model using a proper ChangeApplier
    var updateModel = function (searchModel, newModel) {
        searchModel.keywords = newModel.keywords;
        searchModel.recordTypeLong = newModel.recordTypeLong;
        var recordType = newModel.recordTypeLong;
        // CSPACE-1139
        searchModel.recordType = recordType.indexOf("authorities-") === 0 ? 
            recordType.substring(12) : recordType;
    };

    cspace.search.makeModelFilter = function (that) {
        return function (directModel, newModel, permutation) {
            var i;
            var searchModel = that.model.searchModel;
            fluid.log("modelFilter: initialState " + searchModel.initialState + 
                ", renderRequest " + searchModel.renderRequest);
            if (searchModel.initialState) {
                searchModel.initialState = false;
                return [];
            }
            var dataRequired = false;
            var limit = fluid.pager.computePageLimit(newModel);
            for (i = newModel.pageSize * newModel.pageIndex; i < limit; ++ i) {
                if (!directModel[i]) {
                    dataRequired = true;
                    break;
                }
            } 
            if (!searchModel.renderRequest && dataRequired) {
                that.search(newModel); // if made through interaction we need to perform "search" to refetch
            }
            searchModel.renderRequest = false;
            return fluid.pager.directModelFilter(directModel, newModel, permutation);
        };
      
    };

    var bindEventHandlers = function (that) {
        that.events.modelChanged.addListener(function () {
            displaySearchResults(that);
        });
        
        that.events.onError.addListener(function (action, status) {
            that.locate("resultsContainer").hide();
            that.options.messageBar.show(that.options.strings.errorMessage, null, true);
        });
        
        if (that.options.pivoting) {
            // TODO: Change the event we listen to once pager gives us a more suitable event
            // It is a bit dangerous to use the 'onModelChange' event of pager 
            // because it doesn't assure us that pager rendering is complete
            // but pager does not give us a more suitable event to listen to
            that.resultsPager.events.onModelChange.addListener(function (newModel, oldModel) {
                that.locate("resultsRow").click(function (event) {
                    var row = $(event.currentTarget);
                    var rows = that.locate("resultsRow");
                    var index = rows.index(row);
                    var record = that.model.results[newModel.pageSize * newModel.pageIndex + index];
                    if (!record) {
                        return;
                    }
                    var expander = cspace.urlExpander({
                        vars: {
                            recordType: record.recordtype,
                            csid: record.csid
                        }
                    });
                    window.location = expander("%recordType.html?csid=%csid");
                    return false;
                });
            });
        }
    };

    var applyResults = function (that, data) {
        if (that.searchResultsResolver) {
            that.searchResultsResolver.resolve(data);
        }
        var searchModel = that.model.searchModel;
        var results = that.model.results;
        var offset = searchModel.pageIndex * searchModel.pageSize;

        fluid.model.copyModel(that.model.pagination, data.pagination);

        if (data.pagination.totalItems !== that.model.pagination.totalItems) {
            fluid.clear(results);
        }

        fluid.each(data.results, function (row, index) {
            var fullIndex = offset + index;
            if (!results[fullIndex]) { 
                results[fullIndex] = row;
                results[fullIndex].selected = false;
            }
        });
        that.model.searchModel.renderRequest = true;
        that.events.modelChanged.fire();
    };
    
    var makeSearcher = function (that) {
        return function (newPagerModel) {
            that.mainSearch.locate("searchQuery").val(that.model.searchModel.keywords);
            that.mainSearch.locate("recordTypeSelect").val(that.model.searchModel.recordTypeLong);
            displayLookingMessage(that.dom, that.model.searchModel.keywords, that.options.strings);
            var searchModel = that.model.searchModel;
            var pagerModel = newPagerModel || that.resultsPager.model;
            searchModel.pageSize = pagerModel.pageSize;
            searchModel.pageIndex = pagerModel.pageIndex;
            var url = fluid.invokeGlobalFunction(that.options.searchUrlBuilder, [that.model.searchModel]);
            that.events.onSearch.fire();
            fluid.log("Querying url " + url);
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    applyResults(that, data);
                },
                error: function (xhr, textStatus, errorThrown) {
                    that.events.onError.fire("search", textStatus);
                }
            });
        };
    };

    cspace.search.searchView = function (container, options) {
        var that = fluid.initView("cspace.search.searchView", container, options);
        
        that.hideResults = function () {
            that.locate("resultsContainer").hide();
            that.locate("resultsCountContainer").hide();
            that.locate("lookingContainer").hide();
            that.options.messageBar.hide();
        };
        
        that.model = {
            searchModel: {
                initialState: true
            },
            results: [],
            pagination: {}
        };

        that.search = makeSearcher(that);
        
        that.updateModel = function (newModel) {
            updateModel(that.model.searchModel, newModel);
        };
        
        that.updateModel({
            keywords: decodeURI(cspace.util.getUrlParameter("keywords")),
            recordTypeLong: cspace.util.getUrlParameter("recordtype")
        });

        that.hideResults();

        fluid.initDependents(that);
        bindEventHandlers(that);

        if (that.model.searchModel.recordTypeLong) {
            that.search();
        }
        return that;
    };
    
    cspace.search.handleSubmitSearch = function (searchBox, that) {
        that.options.messageBar.hide();
        fluid.clear(that.model.results);
        that.updateModel({
            keywords: searchBox.locate("searchQuery").val(),
            recordTypeLong: searchBox.locate("recordTypeSelect").val()
        });
        that.search();
    };
    
    cspace.search.defaultSearchUrlBuilder = function (options) {
        var recordTypeParts = options.recordTypeLong.split('-');        
        var sofar = "../../chain/" + recordTypeParts.join('/') + "/search?query=" + options.keywords;
        if (options.pageSize !== undefined && options.pageIndex !== undefined) {
            sofar += "&pageNum=" + options.pageIndex + "&pageSize=" + options.pageSize;
        }
        return sofar;
    };
    
    cspace.search.localSearchUrlBuilder = function (searchModel) {
        // CSPACE-1139
        var recordType = searchModel.recordTypeLong;
        var recordTypeParts = recordType.split('-');
        // TODO: IoC resolve this and remove the "localSearchToRelateDialog" from RelationManager.js
        var prefix = cspace.util.isTest ? "../data/" : "../../../test/data/";
        return prefix + recordTypeParts.join('/') + "/search.json";
    };    

    fluid.defaults("cspace.search.searchView", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            mainSearch: ".csc-search-box",
            resultsContainer: ".csc-search-results",
            resultsCountContainer: ".csc-search-resultsCountContainer",
            resultsCount: ".csc-search-results-count",
            lookingContainer: ".csc-search-lookingContainer",
            lookingString: ".csc-search-lookingString",
            resultsHeader: ".csc-header",
            resultsRow: ".csc-row",
            columns: {
                number: ".csc-number",
                col: ".csc-col",
                select: ".csc-search-select"
            }
        },
        strings: {
            errorMessage: "We've encountered an error retrieving search results. Please try again.",
            resultsCount: "Found %count records for %query",
            looking: "Looking for %query..."
        },
        messageBar: "{messageBar}",
        events: {
            modelChanged: null,
            onSearch: null,
            afterSearch: null,
            onError: null
        },
        
        columnList: ["number", "summary", "recordtype"],
        resultsSelectable: false,

        searchUrlBuilder: "cspace.search.defaultSearchUrlBuilder",
        
        components: {
            mainSearch: {
                type: "cspace.searchBox",
                options: {
                    strings: {
                        recordTypeSelectLabel: "Record Type" 
                    },
                    selfRender: true,
                    related: "all",
                    invokers: {
                        navigateToSearch: {
                            funcName: "cspace.search.handleSubmitSearch",
                            args: ["{searchBox}", "{searchView}"]
                        }
                    } 
                }
            },
            resultsPager: {
                type: "fluid.pager",
                options: {
                    dataModel: "{searchView}.model",
                    dataOffset: "results",
                    modelFilter: {
                        expander: {
                            type: "fluid.deferredCall",
                            func: "cspace.search.makeModelFilter",
                            args: ["{searchView}"]
                        }
                    },
                    columnDefs: {
                        expander: {
                            type: "fluid.deferredCall",
                            func: "cspace.search.colDefsGenerator",
                            args: ["{searchView}.options.columnList", "{searchView}.model.searchModel.recordType", "{searchView}.options.resultsSelectable"]
                        }
                    },
                    annotateColumnRange: "{searchView}.options.columnList.0",
                    bodyRenderer: {
                        type: "fluid.pager.selfRender",
                        options: {
                            renderOptions: {
                                cutpoints: {
                                    expander: {
                                        type: "fluid.deferredCall",
                                        func: "cspace.search.makeCutpoints",
                                        args: ["{searchView}.options.selectors", "{searchView}.options.resultsSelectable"]
                                    }
                                },
                                autoBind: true
                            }
                        }
                    },
                    pagerBar: {
                        type: "fluid.pager.pagerBar",
                        options: {
                            pageList: {
                                type: "fluid.pager.renderedPageList"
                            }
                        }
                    }
                }
            }
        }
    });
    
    fluid.defaults("cspace.search.searchResultsResolver", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            resolve: {
                funcName: "cspace.search.searchResultsResolver.resolve",
                args: ["{relationResolver}", "{arguments}.0"]
            }
        }
    });
    cspace.search.searchResultsResolver.resolve = function (relationResolver, data) {
        if (!data.results || data.results.length < 1) {
            return;
        }
        fluid.remove_if(data.results, function (result) {
            return relationResolver.isPrimary(result.csid) || relationResolver.isRelated(result.recordtype, result.csid);
        });
        data.pagination.totalItems = data.results.length;
    }
        
})(jQuery, fluid);
