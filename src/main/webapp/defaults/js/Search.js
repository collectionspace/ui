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

    cspace.search.colDefsGenerator = function (columnList, recordType, selectable, labels) {
        var colDefs = fluid.transform(columnList, function (key, index) {
            var comp;
            if (key === "number") {
                comp = {
                    target: "${searchModel.recordType}.html?csid=${*.csid}",
                    linktext: "${*.number}"
                };
            } else if (key !== "csid") {
                comp = {value: "${*." + key + "}"};
            }
            return {
                key: key,
                valuebinding: "*." + key,
                components: comp,
                sortable: key !== "recordtype" && key !== "summary",
                label: labels[key]
            };
        });
        if (selectable) {
            colDefs[colDefs.length] = {
                key: "selected",
                valuebinding: "*.selected",
                sortable: false,
                label: labels["selected"]
            };
        }
        return colDefs;
    };

    cspace.search.makeModelFilter = function (that) {
        return function (directModel, newModel, permutation) {
            var i, searchModel = that.model.searchModel;
            var sortChanged = searchModel.sortDir !== newModel.sortDir || searchModel.sortKey !== newModel.sortKey;
            fluid.log("modelFilter: initialState " + searchModel.initialState + 
                ", renderRequest " + searchModel.renderRequest);
            if (searchModel.initialState) {
                that.applier.requestChange("searchModel.initialState", false);
                return [];
            }
            var dataRequired = sortChanged;
            for (i = newModel.pageSize * newModel.pageIndex; i < fluid.pager.computePageLimit(newModel); ++ i) {
                if (!directModel[i]) {
                    dataRequired = true;
                    break;
                }
            }
            if (!searchModel.renderRequest && dataRequired) {
                if (sortChanged) {
                    that.applier.requestChange("results", []);
                    that.resultsPager.applier.requestChange("pageCount", 1);
                    that.resultsPager.applier.requestChange("pageIndex", 0);
                    that.resultsPager.applier.requestChange("totalRange", 0);
                }
                that.search(newModel); // if made through interaction we need to perform "search" to refetch
            }
            that.applier.requestChange("searchModel.renderRequest", false);
            return fluid.pager.directModelFilter(directModel, newModel, permutation);
        };
      
    };
    
    cspace.search.sorter = function (overallThat, model) {
        return null;
    };

    var bindEventHandlers = function (that) {
        that.events.modelChanged.addListener(function () {
            that.displaySearchResults();
        });
        
        that.events.onError.addListener(function (action, status) {
            that.locate("resultsContainer").hide();
            that.messageBar.show(that.options.strings.errorMessage + status, null, true);
        });
        
        if (that.options.pivoting) {
            // TODO: Change the event we listen to once pager gives us a more suitable event
            // It is a bit dangerous to use the 'onModelChange' event of pager 
            // because it doesn't assure us that pager rendering is complete
            // but pager does not give us a more suitable event to listen to
            that.resultsPager.events.onModelChange.addListener(function (newModel, oldModel) {
                $("a.link", that.container).click(function (event) {
                    event.stopPropagation();
                });
                that.locate("resultsRow").click(function (event) {
                    var index = that.locate("resultsRow").index($(event.currentTarget));
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
                    that.searchReferenceStorage.set({
                        token: that.model.pagination.traverser,
                        index: index + newModel.pageSize * newModel.pageIndex
                    });
                    window.location = expander(that.options.urls.pivot);
                    return false;
                });
            });
        } else {
            that.container.delegate("a.link", "click", function () {
                return false;
            });
        }
    };
    
    cspace.search.handleSubmitSearch = function (searchBox, that) {
        that.messageBar.hide();
        that.applier.requestChange("results", []);
        that.updateModel({
            keywords: searchBox.locate("searchQuery").val(),
            recordType: searchBox.locate("recordTypeSelect").val(),
            sortKey: ""
        });
        that.resultsPager.applier.requestChange("pageCount", 1);
        that.resultsPager.applier.requestChange("pageIndex", 0);
        that.resultsPager.applier.requestChange("totalRange", 0);
        that.resultsPager.applier.requestChange("sortKey", "");
        that.search();
    };

    fluid.defaults("cspace.search.searchView", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "cspace.search.searchView.finalInit",
        model: {
            searchModel: {
                initialState: true
            },
            results: [],
            pagination: {}
        },
        selectors: {
            mainSearch: ".csc-search-box",
            resultsContainer: ".csc-search-results",
            resultsCountContainer: ".csc-search-resultsCountContainer",
            resultsCount: ".csc-search-results-count",
            lookingContainer: ".csc-search-lookingContainer",
            lookingString: ".csc-search-lookingString",
            resultsRow: ".csc-row",
            loadingIndicator: ".csc-search-loadingIndicator"
        },
        styles: {
            disabled: "cs-search-disabled"
        },
        strings: {},
        events: {
            modelChanged: null,
            onSearch: null,
            afterSearch: null,
            onError: null,
            ready: null
        },
        columnList: ["number", "summary", "recordtype", "summarylist.updatedAt"],
        resultsSelectable: false,
        invokers: {
            buildUrl: "cspace.search.searchView.buildUrl",
            hideResults: {
                funcName: "cspace.search.searchView.hideResults",
                args: ["{searchView}.dom", "{searchView}.messageBar"]
            },
            search: "cspace.search.searchView.search",
            updateModel: {
                funcName: "cspace.search.searchView.updateModel",
                args: ["{searchView}.applier", "{arguments}.0"]
            },
            displaySearchResults: {
                funcName: "cspace.search.searchView.displaySearchResults",
                args: ["{searchView}"]
            },
            applyResults: {
                funcName: "cspace.search.searchView.applyResults",
                args: ["{searchView}", "{arguments}.0"]
            }
        },
        components: {
            messageBar: "{messageBar}",
            searchReferenceStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "searchReference"
                }
            },
            mainSearch: {
                type: "cspace.searchBox",
                options: {
                    model: {
                        messagekeys: {
                            recordTypeSelectLabel: "mainSearch-recordTypeSelectLabel" 
                        }
                    },
                    selfRender: true,
                    related: "all"
                }
            },
            resultsPager: {
                type: "fluid.pager",
                options: {
                    dataModel: "{searchView}.model",
                    dataOffset: "results",
                    sorter: cspace.search.sorter,
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
                            args: ["{searchView}.options.columnList", "{searchView}.model.searchModel.recordType", "{searchView}.options.resultsSelectable", "{searchView}.options.strings"]
                        }
                    },
                    annotateColumnRange: "{searchView}.options.columnList.0",
                    bodyRenderer: {
                        type: "fluid.pager.selfRender",
                        options: {
                            renderOptions: {
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
        },
        urls: cspace.componentUrlBuilder({
            pivot: "%recordType.html?csid=%csid",
            pageNum: "&pageNum=%pageNum",
            pageSize: "&pageSize=%pageSize",
            sort: "&sortDir=%sortDir&sortKey=%sortKey",
            defaultUrl: "%tenant/%tname/%recordType/search?query=%keywords%pageNum%pageSize%sort",
            localUrl: "%tenant/%tname/data/%recordType/search.json"
        })
    });
    
    cspace.search.searchView.handleAdvancedSearch = function (searchModel, that) {
        that.messageBar.hide();
        that.applier.requestChange("results", []);
        if (!searchModel.fields) {
            searchModel.fields = undefined;
        }
        that.updateModel(searchModel);
        that.resultsPager.applier.requestChange("pageCount", 1);
        that.resultsPager.applier.requestChange("pageIndex", 0);
        that.resultsPager.applier.requestChange("totalRange", 0);
        that.search();
    };
    
    cspace.search.searchView.preInitAdvanced = function (that) {
        cspace.util.preInitMergeListeners(that.options, {
            hideResults: function () {
                that.locate("resultsContainer").hide();
            },
            onAdvancedSearch: function (searchModel) {
                that.handleAdvancedSearch(searchModel);
            },
            currentSearchUpdated: function (searchModel) {
                that.updateSearch(searchModel);
                that.handleAdvancedSearch(searchModel);
            }
        });
    };
    
    cspace.search.searchView.updateSearch = function (currentSearch, search) {
        var fields = fluid.copy(currentSearch.fields);
        if (fields) {
            search.options.defaultFieldsModel = fields;
        }
        fluid.each(currentSearch, function (value, path) {
            search.applier.requestChange(path, value)
        });
        search.refreshView();
        search.toggleControls(true);
    };
    
    cspace.search.searchView.applyResults = function (that, data) {
        var searchModel = that.model.searchModel;
        var offset = searchModel.pageIndex * searchModel.pageSize;
        that.applier.requestChange("pagination", data.pagination);
        fluid.each(data.results, function (row, index) {
            var fullIndex = offset + index;
            if (!that.model.results[fullIndex]) {
                row.selected = false;
                that.applier.requestChange(fluid.model.composeSegments("results", fullIndex), row);
            }
        });
        that.applier.requestChange("searchModel.renderRequest", true);
        that.events.modelChanged.fire();
    };
    
    cspace.search.searchView.displaySearchResults = function (that) {
        var range = that.model.pagination.totalItems; // TODO: dependency on external model
        var pagerModel = that.resultsPager.model;

        // you're not supposed to touch the pager's model, but there's a bug in this version, so...
        that.resultsPager.applier.requestChange("totalRange", range);
        that.resultsPager.events.initiatePageChange.fire({pageIndex: pagerModel.pageIndex, forceUpdate: true});
            
        displayResultsCount(that.dom, range, that.model.searchModel.keywords, that.options.strings);
        if (that.searchResultsResolver) {
            that.searchResultsResolver.resolve(that.model);
        }
        that.locate("resultsContainer").show();
        that.events.afterSearch.fire(that.model.searchModel);
    };
    
    cspace.search.searchView.updateModel = function (applier, newModel) {
        fluid.each(newModel, function (value, field) {
            applier.requestChange(fluid.model.composeSegments("searchModel", field), value);
        });
    };
    
    cspace.search.searchView.finalInit = function (that) {
        that.updateModel({
            keywords: decodeURI(cspace.util.getUrlParameter("keywords")),
            recordType: cspace.util.getUrlParameter("recordtype")
        });
        that.hideResults();
        bindEventHandlers(that);
        if (that.model.searchModel.recordType) {
            that.search();
        }
        that.events.ready.fire();
    };
    
    cspace.search.searchView.advancedSearch = function (newPagerModel, that) {
        var pagerModel = newPagerModel || that.resultsPager.model;
        var searchModel = that.model.searchModel;
        that.updateModel({
            pageSize: pagerModel.pageSize,
            pageIndex: pagerModel.pageIndex,
            sortKey: pagerModel.sortKey,
            sortDir: pagerModel.sortDir
        });
        var url = that.buildUrl();
        that.events.onSearch.fire();
        fluid.log("Querying url " + url);
        fluid.fetchResources({
            results: {
                href: url,
                options: {
                    dataType: "json",
                    data: searchModel.fields ? JSON.stringify({
                        fields: searchModel.fields,
                        operation: searchModel.operation
                    }) : undefined,
                    type: searchModel.fields ? "POST" : "GET",
                    success: function (responseData, textStatus) {
                        if (responseData.isError === true) {
                            fluid.each(responseData.messages, function (message) {
                                that.events.onError.fire("search", message.message);
                            });
                            return;
                        }
                        that.applyResults(responseData);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        that.events.onError.fire("search", textStatus);
                    }
                }
            }
        });
    };
    
    cspace.search.searchView.search = function (newPagerModel, that) {
        var searchModel = that.model.searchModel;
        that.mainSearch.locate("searchQuery").val(searchModel.keywords);
        that.mainSearch.locate("recordTypeSelect").val(searchModel.recordType);
        displayLookingMessage(that.dom, searchModel.keywords, that.options.strings);
        var pagerModel = newPagerModel || that.resultsPager.model;
        that.updateModel({
            pageSize: pagerModel.pageSize,
            pageIndex: pagerModel.pageIndex,
            sortKey: pagerModel.sortKey,
            sortDir: pagerModel.sortDir
        });
        var url = that.buildUrl();
        that.events.onSearch.fire();
        fluid.log("Querying url " + url);
        fluid.fetchResources({
            results: {
                href: url,
                options: {
                    dataType: "json",
                    type: "GET",
                    success: function (data, textStatus) {
                        if (data.isError === true) {
                            fluid.each(data.messages, function (message) {
                                that.events.onError.fire("search", message.message);
                            });
                            return;
                        }
                        that.applyResults(data);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        that.events.onError.fire("search", textStatus);
                    }
                }
            }
        });
    };
    
    cspace.search.searchView.hideResults = function (dom, messageBar) {
        dom.locate("resultsContainer").hide();
        dom.locate("resultsCountContainer").hide();
        dom.locate("lookingContainer").hide();
        messageBar.hide();
    };
    
    cspace.search.searchView.buildUrlDefault = function (options, urls) {
        var url = fluid.stringTemplate(urls.defaultUrl, {
            recordType: options.recordType,
            keywords: options.keywords,
            pageNum: options.pageIndex ? fluid.stringTemplate(urls.pageNum, {pageNum: options.pageIndex}) : "",
            pageSize: options.pageSize ? fluid.stringTemplate(urls.pageSize, {pageSize: options.pageSize}) : "",
            sort: options.sortKey ? fluid.stringTemplate(urls.sort, {sortKey: options.sortKey, sortDir: options.sortDir || "1"}) : ""
        });
        return url;
    };
    cspace.search.searchView.buildUrlLocal = function (options, urls) {
        return fluid.stringTemplate(urls.localUrl, {recordType: options.recordType});
    };
    
    fluid.defaults("cspace.search.searchResultsResolver", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            resolve: {
                funcName: "cspace.search.searchResultsResolver.resolve",
                args: ["{searchView}", "{relationResolver}", "{arguments}.0"]
            }
        }
    });
    cspace.search.searchResultsResolver.resolve = function (search, relationResolver, model) {
        if (!model.results || model.results.length < 1) {
            return;
        }
        var offset = model.pagination.pageSize * model.pagination.pageNum;
        var index;
        for (index = offset; index < fluid.pager.computePageLimit(search.resultsPager.model); ++ index) {
            var result = model.results[index];
            var row = search.locate("resultsRow").eq(index - offset);
            var disable = relationResolver.isPrimary(result.csid) || relationResolver.isRelated(result.recordtype, result.csid);
            row.prop("disabled", disable);
            row.toggleClass(search.options.styles.disabled, disable);
        }
    };

})(jQuery, fluid);
