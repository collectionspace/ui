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
    
    var displayLookingMessage = function (domBinder, keywords) {
        domBinder.locate("resultsCountContainer").hide();
        domBinder.locate("queryString").text(keywords);
        domBinder.locate("lookingContainer").show();
    };
    
    var displayResultsCount = function (domBinder, count, keywords) {
        domBinder.locate("lookingContainer").hide();
        domBinder.locate("resultsCount").text(count);
        domBinder.locate("queryString").text(keywords);
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
            
        displayResultsCount(that.dom, range, that.model.searchModel.keywords);
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

    var handleSubmitSearch = function (that) {
        return function () {
            that.locate("errorMessage").hide();
            fluid.clear(that.model.results);
            updateModel(that.model.searchModel, { 
                keywords: that.locate("keywords").val(),
                recordTypeLong: that.locate("recordType").val()
            });
            that.search();
        };
    };

    cspace.search.makeModelFilter = function (that) {
        return function (directModel, newModel, permutation) {
            var searchModel = that.model.searchModel;
            fluid.log("modelFilter: initialState " + searchModel.initialState + 
                ", renderRequest " + searchModel.renderRequest);
            if (searchModel.initialState) {
                searchModel.initialState = false;
                return [];
            }
            var dataRequired = false;
            var limit = fluid.pager.computePageLimit(newModel);
            for (var i = newModel.pageSize * newModel.pageIndex; i < limit; ++ i) {
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
        var searchSubmitHandler = handleSubmitSearch(that);
        that.locate("searchButton").click(searchSubmitHandler);
        that.locate("keywords").fluid("activatable", searchSubmitHandler);

        that.events.modelChanged.addListener(function () {
            displaySearchResults(that);
        });
        
        that.events.onError.addListener(function (action, status) {
            that.locate("resultsContainer").hide();
            that.locate("errorMessage").show();
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
            displayLookingMessage(that.dom, that.model.searchModel.keywords);
            var searchModel = that.model.searchModel;
            var pagerModel = newPagerModel || that.resultsPager.model;
            searchModel.pageSize = pagerModel.pageSize;
            searchModel.pageIndex = pagerModel.pageIndex;
            var url = that.options.searchUrlBuilder(that.model.searchModel);
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
            that.locate("errorMessage").hide();
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
            keywords: cspace.util.getUrlParameter("keywords"),
            recordTypeLong: cspace.util.getUrlParameter("recordtype")
        });

        that.hideResults();
        
        fluid.initDependents(that);
        bindEventHandlers(that);

        if (that.model.searchModel.keywords) {
            that.locate("keywords").val(that.model.searchModel.keywords);
            that.locate("recordType").val(that.model.searchModel.recordTypeLong);
            that.search();
        }

        return that;
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
        var prefix = cspace.util.isTest ? "../../main/webapp/html/data/" : "./data/";
        return prefix + recordTypeParts.join('/') + "/search/list.json";
    };

    fluid.demands("fluid.pager", "cspace.search.searchView", 
      ["{searchView}.dom.resultsContainer", fluid.COMPONENT_OPTIONS]);


    fluid.defaults("cspace.search.searchView", {
        selectors: {
            keywords: ".csc-search-keywords",
            recordType: ".csc-search-recordType",
            errorMessage: ".csc-search-error-message",
            searchButton: ".csc-search-submit",
            resultsContainer: ".csc-search-results",
            resultsCountContainer: ".csc-search-resultsCountContainer",
            resultsCount: ".csc-search-results-count",
            lookingContainer: ".csc-search-lookingContainer",
            queryString: ".csc-search-queryString",
            resultsHeader: ".csc-header",
            resultsRow: ".csc-row",
            columns: {
                number: ".csc-number",
                col: ".csc-col",
                select: ".csc-search-select"
            }
        },
        
        events: {
            modelChanged: null,
            onSearch: null,
            afterSearch: null,
            onError: null
        },
        
        columnList: ["number", "summary", "recordtype"],
        resultsSelectable: false,

        searchUrlBuilder: cspace.search.defaultSearchUrlBuilder,
        
        components: {

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
    
    fluid.demands("search", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.search", fluid.COMPONENT_OPTIONS]);
        
})(jQuery, fluid);
