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
            that.displaySearchResults();
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
    
    cspace.search.handleSubmitSearch = function (searchBox, that) {
        that.options.messageBar.hide();
        that.applier.requestChange("results", []);
        that.updateModel({
            keywords: searchBox.locate("searchQuery").val(),
            recordType: searchBox.locate("recordTypeSelect").val()
        });
        that.resultsPager.applier.requestChange("pageCount", 1);
        that.resultsPager.applier.requestChange("pageIndex", 0);
        that.resultsPager.applier.requestChange("totalRange", 0);
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
            resultsHeader: ".csc-header",
            resultsRow: ".csc-row",
            columns: {
                number: ".csc-number",
                col: ".csc-col",
                select: ".csc-search-select"
            },
            loadingIndicator: ".csc-search-loadingIndicator"
        },
        styles: {
            disabled: "cs-search-disabled"
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
        
        columnList: ["number", "summary", "recordtype", "summarylist.updatedAt"],
        resultsSelectable: false,
        invokers: {
            buildUrl: "cspace.search.searchView.buildUrl",
            hideResults: {
                funcName: "cspace.search.searchView.hideResults",
                args: ["{searchView}.dom", "{searchView}.options.messageBar"]
            },
            search: {
                funcName: "cspace.search.searchView.search",
                args: ["{arguments}.0", "{searchView}"]
            },
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
            searchLoadingIndicator: {
                type: "cspace.util.loadingIndicator",
                container: "{searchView}.dom.loadingIndicator",
                options: {
                    events: {
                        showOn: "{searchView}.events.onSearch",
                        hideOn: "{searchView}.events.afterSearch"
                    }
                }
            },
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
        },
        urls: cspace.componentUrlBuilder({
            pageNum: "&pageNum=%pageNum",
            pageSize: "&pageSize=%pageSize",
            defaultUrl: "%chain/%recordType/search?query=%keywords%pageNum%pageSize",
            localUrl: "%chain/data/%recordType/search.json"
        })
    });
    
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
        that.events.afterSearch.fire();
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
    };
    
    cspace.search.searchView.search = function (newPagerModel, that) {
        var searchModel = that.model.searchModel;
        that.mainSearch.locate("searchQuery").val(searchModel.keywords);
        that.mainSearch.locate("recordTypeSelect").val(searchModel.recordType);
        displayLookingMessage(that.dom, searchModel.keywords, that.options.strings);
        var pagerModel = newPagerModel || that.resultsPager.model;
        that.applier.requestChange("searchModel.pageSize", pagerModel.pageSize);
        that.applier.requestChange("searchModel.pageIndex", pagerModel.pageIndex);
        var url = that.buildUrl();
        that.events.onSearch.fire();
        fluid.log("Querying url " + url);
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data, textStatus) {
                that.applyResults(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                that.events.onError.fire("search", textStatus);
            }
        });
    };
    
    cspace.search.searchView.hideResults = function (dom, messageBar) {
        dom.locate("resultsContainer").hide();
        dom.locate("resultsCountContainer").hide();
        dom.locate("lookingContainer").hide();
        messageBar.hide();
    };
    
    fluid.demands("cspace.search.searchView.buildUrl", "cspace.search.searchView", {
        funcName: "cspace.search.searchView.buildUrlDefault",
        args: ["{searchView}.model.searchModel", "{searchView}.options.urls"]
    });
    fluid.demands("cspace.search.searchView.buildUrl", ["cspace.search.searchView", "cspace.localData"], {
        funcName: "cspace.search.searchView.buildUrlLocal",
        args: ["{searchView}.model.searchModel", "{searchView}.options.urls"]
    });
    cspace.search.searchView.buildUrlDefault = function (options, urls) {
        return fluid.stringTemplate(urls.defaultUrl, {
            recordType: options.recordType,
            keywords: options.keywords,
            pageNum: options.pageIndex ? fluid.stringTemplate(urls.pageNum, {pageNum: options.pageIndex}) : "",
            pageSize: options.pageSize ? fluid.stringTemplate(urls.pageSize, {pageSize: options.pageSize}) : ""
        });
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
