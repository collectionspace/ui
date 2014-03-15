/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.log("Search.js loaded");
    
    var displayLookingMessage = function (domBinder, searchModel, strings) {
        domBinder.locate("resultsCountContainer").hide();

        var message = isRelatedSearch(searchModel) ?
                fluid.stringTemplate(strings.relatedLooking, {query: searchModel.relatedTitle || searchModel.relatedCsid || ""}) :
                fluid.stringTemplate(strings.looking, {query: searchModel.keywords || ""});

        domBinder.locate("lookingString").text(message);
        domBinder.locate("lookingContainer").show();
    };
    
    var displayResultsCount = function (domBinder, count, searchModel, strings) {
        domBinder.locate("lookingContainer").hide();

        var message = isRelatedSearch(searchModel) ?
                fluid.stringTemplate(strings.relatedResultsCount, {count: count, query: searchModel.relatedTitle || searchModel.relatedCsid || ""}) :
                fluid.stringTemplate(strings.resultsCount, {count: count, query: searchModel.keywords || ""});                  
               
        domBinder.locate("resultsCount").text(message);                 
        domBinder.locate("resultsCountContainer").show();
    };

    fluid.registerNamespace("cspace.search");

    cspace.search.colDefsGenerator = function (columnList, recordType, vocab, selectable, labels) {
        var colDefs = fluid.transform(columnList, function (key, index) {
            var comp;
            if (key === "number") {
                comp = {
                    target: "${*.recordtype}.html?csid=${*.csid}",
                    linktext: "${*.number}",
                    // CSPACE-6339: If the record has a namespace, append 
                    // a vocab parameter to the URL. Do this in a decorator
                    // instead of putting it in the target string, so we
                    // can omit it altogether on records that are not 
                    // authority items. 
                    decorators: {
                        type: "fluid",
                        func: "cspace.search.vocabParamAppender",
                        options: {
                            vocab: "${*.namespace}"
                        }
                    }
                };
            } else if (key !== "csid") {
                comp = {value: "${*." + key + "}"};
            }
            return {
                key: key,
                valuebinding: "*." + key,
                components: comp,
                sortable: key !== "recordtype",
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
    
    cspace.search.vocabParamAppender = function(container, options) {
        // Decorates a link. If a non-empty vocabulary shortid is supplied in the
        // options, it is appended to the href as a "vocab" parameter.

        var vocab = options.vocab;
        
        // Ugh. When the pager expands "${*.namespace}", it converts it to a string,
        // so if it was undefined, we get "undefined" here. Hopefully there won't
        // ever be a vocabulary with the shortid "undefined", because here we can't
        // differentiate an item in a vocabulary named "undefined", and a record
        // that is not a vocabulary item.
        
        if (vocab && vocab != "undefined") {
            var href = container.prop("href");
            
            if (href) {
                var vocabParam = $.param({
                    vocab: vocab
                });
                
                href = href + "&" + vocabParam;
                container.prop("href", href);
            }            
        }
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
                    event.preventDefault();
                });
                that.locate("resultsRow").click(function (event) {
                    var index = that.locate("resultsRow").index($(event.currentTarget));
                    var record = that.model.results[newModel.pageSize * newModel.pageIndex + index];
                    if (!record) {
                        return;
                    }
                    var vocab = cspace.vocab.resolve({
                        model: record,
                        recordType: record.recordType,
                        vocab: that.vocab
                    });
                    if (!vocab && that.vocab.isVocab(record.recordtype)) {
                        vocab = record.recordtype;
                    }
                    if (!vocab && that.vocab.hasVocabs(record.recordtype)) {
                        vocab = record.recordtype;
                    }
                    if (vocab === "all") {
                        vocab = record.recordtype;
                    }
                    var expander = cspace.urlExpander({
                        vars: {
                            recordType: record.recordtype,
                            csid: record.csid,
                            vocab: vocab ? fluid.stringTemplate(that.options.urls.vocab, {vocab: vocab}) : ""
                        }
                    });
                    var pivotLocation = expander(that.options.urls.pivot);
                    if (event.shiftKey || event.ctrlKey || event.metaKey) {
                        window.open(pivotLocation, "_blank");
                        return;
                    }
                    if (that.searchReferenceStorage) {
                        that.searchReferenceStorage.set({
                            token: that.model.pagination.traverser,
                            index: index + newModel.pageSize * newModel.pageIndex,
                            source: that.options.source
                        });
                    }
                    window.location = pivotLocation;
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
            keywords: searchBox.model.keywords,
            recordType: searchBox.model.recordType,
            vocab: searchBox.model.vocabs ? searchBox.model.vocabSelection : undefined,
            relatedRecordType: undefined,
            relatedCsid: undefined,
            relatedTitle: undefined,
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
            primaryRecordCreated: {
                event: "{globalEvents}.events.primaryRecordCreated"
            },
            modelChanged: null,
            onSearch: null,
            onInitialSearch: null,
            afterSearch: null,
            onError: null,
            ready: null,
            pagerAfterRender: null
        },
        //columnList: ["number", "summary", "recordtype", "summarylist.updatedAt"],
        columnList: ["number", "summary", "recordtype", "namespace", "summarylist.updatedAt"],
        resultsSelectable: false,
        listeners: {
            primaryRecordCreated: "{that}.primaryRecordCreated",
            onInitialSearch: "{cspace.search.searchView}.onInitialSearchHandler",
            afterSearch: "{loadingIndicator}.events.hideOn.fire",
            onError: "{loadingIndicator}.events.hideOn.fire",
            onSearch: "{loadingIndicator}.events.showOn.fire"
        },
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
            },
            onInitialSearch: "cspace.search.searchView.onInitialSearch"
        },
        primaryCSID: "{globalModel}.model.primaryModel.csid",
        components: {
            messageBar: "{messageBar}",
            vocab: "{vocab}",
            mainSearch: {
                type: "cspace.searchBox",
                options: {
                    model: {
                        messagekeys: {
                            recordTypeSelectLabel: "mainSearch-recordTypeSelectLabel",
                            selectVocabLabel: "selectVocabLabel"
                        }
                    },
                    selfRender: true,
                    related: ["allCategory", "cataloging", "procedures", "vocabularies"]
                }
            },
            workflowStyler: {
                type: "cspace.util.workflowStyler",
                createOnEvent: "pagerAfterRender",
                options: {
                    offset: "{cspace.search.searchView}.model.offset",
                    rows: "{cspace.search.searchView}.dom.resultsRow",
                    list: "{cspace.search.searchView}.model.results"
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
                            args: ["{searchView}.options.columnList", "{searchView}.model.searchModel.recordType", "{searchView}.model.searchModel.vocab", "{searchView}.options.resultsSelectable", "{searchView}.options.strings"]
                        }
                    },
                    listeners: {
                        afterRender: "{cspace.search.searchView}.events.pagerAfterRender.fire"
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
            pivot: "%recordType.html?csid=%csid%vocab",
            pageNum: "&pageNum=%pageNum",
            pageSize: "&pageSize=%pageSize",
            mkRtSbj: "&mkRtSbj=%mkRtSbj",
            vocab: "&vocab=%vocab",
            sort: "&sortDir=%sortDir&sortKey=%sortKey",
            defaultUrl: "%tenant/%tname/%recordType/search?query=%keywords%pageNum%pageSize%sort%mkRtSbj",
            defaultVocabUrl: "%tenant/%tname/vocabularies/%vocab/search?query=%keywords%pageNum%pageSize%sort",
            defaultRelatedUrl: "%tenant/%tname/%relatedRecordType/%recordType/%relatedCsid?%pageNum%pageSize%sort",
            localUrl: "%tenant/%tname/data/%recordType/search.json"
        }),
       preInitFunction: "cspace.search.searchView.preInit"
    });

    cspace.search.updateSearchHistory = function (storage, searchModel, hashtoken) {
        // NOTE: The empty line token is a temporary hack to save search history.
        hashtoken = hashtoken || "";
        var history = storage.get() || {},
            searchToSave = {
                hashtoken: hashtoken,
                model: searchModel
            };
        if (!history) {
            storage.set([searchToSave]);
            return;
        }
        history = [searchToSave].concat(fluid.makeArray(history));
        storage.set(history.slice(0, 10));
    };
    
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
        that.onInitialSearchHandler = function () {
            that.onInitialSearch();
        };
    };

    cspace.search.searchView.preInit = function (that) {
        that.onInitialSearchHandler = function () {
            that.onInitialSearch();
        };

        that.primaryRecordCreated = function (primaryRecordModel) {
            that.options.primaryCSID = fluid.get(primaryRecordModel, "csid");
        };
        
        // Function which won't allow a user to select already related records
        that.disableRelated = function (model) {
            if (!model.results || model.results.length < 1) {
                return;
            }
            var offset = model.pagination.pageSize * model.pagination.pageNum;
            var index;
            for (index = offset; index < fluid.pager.computePageLimit(that.resultsPager.model); ++ index) {
                var result = model.results[index],
                    row = that.locate("resultsRow").eq(index - offset),
                    disable = result.related === "true" ||
                              result.csid === that.options.primaryCSID ||
                              fluid.get(result, "summarylist.workflow") === "locked";
                row.prop("disabled", disable);
                row.toggleClass(that.options.styles.disabled, disable);
            }
        };
    };
    
    cspace.search.searchView.updateSearch = function (currentSearch, search) {
        var fields = fluid.copy(currentSearch.fields);
        if (fields) {
            search.options.defaultFieldsModel = fields;
        }
        fluid.each(currentSearch, function (value, path) {
            search.applier.requestChange(path, value);
        });
        search.refreshView();

        var hideToggle = isRelatedSearch(currentSearch);
        search.toggleControls(true, hideToggle);
    };
    
    cspace.search.searchView.applyResults = function (that, data) {
        var searchModel = that.model.searchModel;
        var offset = searchModel.pageIndex * searchModel.pageSize;
        that.applier.requestChange("offset", offset);
        that.applier.requestChange("pagination", data.pagination);

        // The related records query returns "items" instead of "results", so check for both.
        var results = data.results || data.items;
        
        fluid.each(results, function (row, index) {
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
            
        displayResultsCount(that.dom, range, that.model.searchModel, that.options.strings);
        
        // Disable all related records.
        that.disableRelated(that.model);
        
        that.locate("resultsContainer").show();
        that.events.afterSearch.fire(that.model.searchModel);
    };
    
    cspace.search.searchView.updateModel = function (applier, newModel) {
        fluid.each(newModel, function (value, field) {
            applier.requestChange(fluid.model.composeSegments("searchModel", field), value);
        });
    };
    
    cspace.search.searchView.finalInit = function (that) {
        var hashtoken = cspace.util.getUrlParameter("hashtoken");
        if (hashtoken) {
            // Only present on findedit and advanced search pages.
            var searchData;
            fluid.each([that.searchHistoryStorage, that.findeditHistoryStorage], function (storage) {
                if (!storage) {
                    // PAHMA-462: The searchView inside the searchToRelateDialog on the advanced search page doesn't
                    // have history storage, so need to check that storage is defined.
                    return;
                }
                if (storage.options.source !== that.options.source) {
                    return;
                }
                var history = storage.get();
                if (!history) {return;}
                searchData = fluid.find(history, function (search) {
                    if (search.hashtoken === hashtoken) {return search.model;}
                });
            });
            if (searchData) {
                that.updateModel(searchData);
            }
        } else {
            that.updateModel({
                keywords: decodeURI(cspace.util.getUrlParameter("keywords")),
                recordType: cspace.util.getUrlParameter("recordtype"),
                vocab: cspace.util.getUrlParameter("vocab"),
                relatedRecordType: cspace.util.getUrlParameter("relatedRecordType"),
                relatedCsid: cspace.util.getUrlParameter("relatedCsid"),
                relatedTitle: decodeURIComponent(cspace.util.getUrlParameter("relatedTitle"))
            });
        }
        that.hideResults();
        bindEventHandlers(that);
        if (that.model.searchModel.recordType) {
            that.events.onInitialSearch.fire();
        } else {
            that.events.ready.fire();
        }
    };

    cspace.search.searchView.onInitialSearch = function (that) {
        that.mainSearch.refreshView();
        that.search();
    };

    cspace.search.searchView.onInitialSearchAdvanced = function (that) {
        var searchModel = that.model.searchModel;
        that.updateSearch(searchModel);
        that.handleAdvancedSearch(searchModel);
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
        that.mainSearch.locate("searchQuery").val(searchModel.keywords).change();
        that.mainSearch.locate("recordTypeSelect").val(searchModel.recordType).change();
        that.mainSearch.locate("selectVocab").val(searchModel.vocab).change();
        displayLookingMessage(that.dom, searchModel, that.options.strings);
        var pagerModel = newPagerModel || that.resultsPager.model;
        that.updateModel({
            pageSize: pagerModel.pageSize,
            pageIndex: pagerModel.pageIndex,
            sortKey: pagerModel.sortKey,
            sortDir: pagerModel.sortDir,
            mkRtSbj: that.options.primaryCSID
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
        var url;

        if (isRelatedSearch(options)) {
            url = fluid.stringTemplate(urls.defaultRelatedUrl, {
                relatedRecordType: options.relatedRecordType,
                recordType: options.recordType,
                relatedCsid: options.relatedCsid,
                pageNum: options.pageIndex ? fluid.stringTemplate(urls.pageNum, {pageNum: options.pageIndex}) : "",
                pageSize: options.pageSize ? fluid.stringTemplate(urls.pageSize, {pageSize: options.pageSize}) : "",
                sort: options.sortKey ? fluid.stringTemplate(urls.sort, {sortKey: options.sortKey, sortDir: options.sortDir || "1"}) : ""
            });
        } else {
            url = fluid.stringTemplate(options.vocab && options.vocab !== "all" ? urls.defaultVocabUrl : urls.defaultUrl, {
                recordType: options.recordType,
                keywords: options.keywords,
                vocab: options.vocab || "",
                pageNum: options.pageIndex ? fluid.stringTemplate(urls.pageNum, {pageNum: options.pageIndex}) : "",
                pageSize: options.pageSize ? fluid.stringTemplate(urls.pageSize, {pageSize: options.pageSize}) : "",
                sort: options.sortKey ? fluid.stringTemplate(urls.sort, {sortKey: options.sortKey, sortDir: options.sortDir || "1"}) : "",
                mkRtSbj: options.mkRtSbj ? fluid.stringTemplate(urls.mkRtSbj, {mkRtSbj: options.mkRtSbj}) : ""
            });
        }
        
        return url;
    };
    cspace.search.searchView.buildUrlLocal = function (options, urls) {
        return fluid.stringTemplate(urls.localUrl, {recordType: options.recordType});
    };

    var isRelatedSearch = function (searchModel) {
        return (searchModel.relatedRecordType && searchModel.relatedCsid);
    };
})(jQuery, fluid);
