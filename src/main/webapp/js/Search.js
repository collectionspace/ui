/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {

    var defaultSearchUrlBuilder = function (recordType, query) {
// CSPACE-701
// Up to 0.4, there's a bug in which the recordType for 'object' needs to be
// plural
        if (recordType === "object") {
            recordType = "objects";
        }
// end of fudge for CSPACE-701
        
        var recordTypeParts = recordType.split('-');        
        return "../../chain/" + recordTypeParts.join('/') + "/search?query=" + query;
    };

    var colDefsGenerated = function (columnList, recordType, selectable) {
        var csidList = [];
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

    var displaySearchResults = function (that, recordType) {
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
                columnDefs: colDefsGenerated(colList, recordType, that.options.resultsSelectable),
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
            fluid.model.copyModel(that.resultsPager.options.columnDefs, colDefsGenerated(colList, recordType, that.options.resultsSelectable));
            // you're not supposed to touch the pager's model, but there's a bug in this version, so...
            that.resultsPager.model.totalRange = that.model.results.length;
            that.resultsPager.events.initiatePageChange.fire({pageIndex: 0, forceUpdate: true});
        } else {
            that.resultsPager = fluid.initSubcomponent(that, "resultsPager", pagerArguments);
        }
        that.locate("resultsContainer").show();
        that.locate("resultsCount").text(that.resultsPager.model.totalRange);
    };

    var submitSearchRequest = function (that) {
        return function () {
            that.locate("errorMessage").hide();
            var recordType = that.locate("recordType").val();
// CSPACE-701
            if (cspace.util.isLocal() && (recordType === "object")) {
                recordType = "collection-object";
            }
            var query = that.locate("keywords").val();
            jQuery.ajax({
                url: that.options.searchUrlBuilder(recordType, query),
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    that.model = data;
                    that.events.modelChanged.fire();
                },
                error: function (xhr, textStatus, errorThrown) {
                    that.events.onError.fire("search", textStatus);
                }
            });
        };
    };

    var bindEventHandlers = function (that) {
        var searchSubmitHandler = submitSearchRequest(that);
        that.locate("searchButton").click(searchSubmitHandler);
        that.locate("keywords").fluid("activatable", searchSubmitHandler);

        that.events.modelChanged.addListener(function () {
// CSPACE-1139
            var recordType = that.locate("recordType").val();
            if (recordType.indexOf("authorities-") === 0) {
                recordType = recordType.substring(12);
            }
            displaySearchResults(that, recordType);
        });
        
        that.events.onError.addListener(function (action, status) {
            that.locate("resultsContainer").hide();
            that.locate("errorMessage").show();
        });
    };

    cspace.search = function (container, options) {
        var that = fluid.initView("cspace.search", container, options);
        that.locate("resultsContainer").hide();
        that.model = {};
        
        bindEventHandlers(that);
        
        var keywords = cspace.util.getUrlParameter("keywords");
        var recordType = cspace.util.getUrlParameter("recordtype");
        if (keywords) {
            that.locate("keywords").val(keywords);
            that.locate("recordType").val(recordType);
            submitSearchRequest(that)();
        }
        return that;
    };

    fluid.defaults("cspace.search", {
        selectors: {
            keywords: ".csc-search-keywords",
            recordType: ".csc-select-box-container .csc-search-record-type",
            errorMessage: ".csc-search-error-message",
            searchButton: ".csc-search-submit",
            resultsContainer: ".csc-search-results",
            resultsCount: ".csc-search-results-count",
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
            onError: null
        },
        
        columnList: ["number", "summary", "recordtype"],

        searchUrlBuilder: defaultSearchUrlBuilder,

        resultsPager: {
            type: "fluid.pager"
        },
        
        resultsSelectable: false
    });
})(jQuery, fluid_1_2);
