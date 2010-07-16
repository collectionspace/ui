/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {

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

    var defaultSearchUrlBuilder = function (recordType, keywords) {
        var recordTypeParts = recordType.split('-');        
        return "../../chain/" + recordTypeParts.join('/') + "/search?query=" + keywords;
    };

    var colDefsGenerated = function (columnList, recordType, selectable) {
        // CSPACE-1139
        if (recordType.indexOf("authorities-") === 0) {
            recordType = recordType.substring(12);
        }

        var colDefs = fluid.transform(columnList, function (object, index) {
            var key = "col:";
            var comp;

            if (object === "number") {
                key = "number";
                comp = {
                    target: recordType + ".html?csid=${*.csid}",
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

    var displaySearchResults = function (that) {
        var colList = that.options.columnList;
        var results = (that.model.results || []);

        var rendererCutpoints = [
            {id: "header:", selector: that.options.selectors.resultsHeader},
            {id: "row:", selector: that.options.selectors.resultsRow},
            {id: "number", selector: that.options.selectors.columns.number},
            {id: "col:", selector: that.options.selectors.columns.col}
        ];

        if (that.options.resultsSelectable) {
            that.model.results = fluid.transform(results, function (object, index) {
                object.selected = false;
                return object;
            });
            rendererCutpoints[rendererCutpoints.length] = {
                id: "selected",
                selector: that.options.selectors.columns.select
            };
        }
        var pagerArguments = [
            that.options.selectors.resultsContainer,
            {
                dataModel: that.model.results,
                columnDefs: colDefsGenerated(colList, that.model.recordType, that.options.resultsSelectable),
                bodyRenderer: {
                    type: "fluid.pager.selfRender",
                    options: {
                        renderOptions: {
                            cutpoints: rendererCutpoints,
                            autoBind: true,
                            model: that.model.results
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
        ];
        if (that.resultsPager) {
            fluid.model.copyModel(that.resultsPager.options.dataModel, that.model.results);
            fluid.model.copyModel(that.resultsPager.options.columnDefs, colDefsGenerated(colList, that.model.recordType, that.options.resultsSelectable));
            // you're not supposed to touch the pager's model, but there's a bug in this version, so...
            that.resultsPager.model.totalRange = that.model.results.length;
            that.resultsPager.events.initiatePageChange.fire({pageIndex: 0, forceUpdate: true});
        } else {
            that.resultsPager = fluid.initSubcomponent(that, "resultsPager", pagerArguments);
        }
        displayResultsCount(that.dom, that.resultsPager.model.totalRange, that.model.keywords);
        that.locate("resultsContainer").show();
        that.events.afterSearch.fire();
    };

    var submitSearch = function (url, model, successEvent, errorEvent) {
        jQuery.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data, textStatus) {
                fluid.model.copyModel(model.results, data.results);
                successEvent.fire();
            },
            error: function (xhr, textStatus, errorThrown) {
                errorEvent.fire("search", textStatus);
            }
        });
    };

    var submitSearchRequest = function (that) {
        return function () {
            that.locate("errorMessage").hide();
            that.model.recordType = that.locate("recordType").val();
// CSPACE-701
            if (cspace.util.useLocalData() && (that.model.recordType === "object")) {
                that.model.recordType = "objects";
            }
            that.model.keywords = that.locate("keywords").val();
            that.search();
        };
    };

    var bindEventHandlers = function (that) {
        var searchSubmitHandler = submitSearchRequest(that);
        that.locate("searchButton").click(searchSubmitHandler);
        that.locate("keywords").fluid("activatable", searchSubmitHandler);

        that.events.modelChanged.addListener(function () {
            displaySearchResults(that, that.model.recordType);
        });
        
        that.events.onError.addListener(function (action, status) {
            that.locate("resultsContainer").hide();
            that.locate("errorMessage").show();
        });
    };

    cspace.search = function (container, options) {
        var that = fluid.initView("cspace.search", container, options);
        
        that.hideResults = function () {
            that.locate("resultsContainer").hide();
            that.locate("resultsCountContainer").hide();
            that.locate("lookingContainer").hide();
            that.locate("errorMessage").hide();
        };
        
        that.model = {
            keywords: cspace.util.getUrlParameter("keywords"),
            recordType: cspace.util.getUrlParameter("recordtype"),
            results: []
        };

        that.search = function () {
            displayLookingMessage(that.dom, that.model.keywords);
            that.events.onSearch.fire();
            submitSearch(that.options.searchUrlBuilder(that.model.recordType, that.model.keywords), that.model, that.events.modelChanged, that.events.onError);
        };

        bindEventHandlers(that);
        that.hideResults();

        if (that.model.keywords) {
            that.locate("keywords").val(that.model.keywords);
            that.locate("recordType").val(that.model.recordType);
            that.search();
        }

        return that;
    };
    
    cspace.search.localSearchUrlBuilder = function (recordType, keywords) {
        // CSPACE-1139
        if (recordType.indexOf("authorities-") === 0) {
            recordType = recordType.substring(12);
        }
        var recordTypeParts = recordType.split('-');        
        return "./data/" + recordTypeParts.join('/') + "/search/list.json";
    };



    fluid.defaults("cspace.search", {
        selectors: {
            keywords: ".csc-search-keywords",
            recordType: ".csc-select-box-container .csc-search-record-type",
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

        searchUrlBuilder: defaultSearchUrlBuilder,

        resultsPager: {
            type: "fluid.pager"
        },
        
        resultsSelectable: false
    });
})(jQuery, fluid);
