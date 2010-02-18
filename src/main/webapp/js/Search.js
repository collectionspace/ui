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

    var resultsPager;

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

    var colDefsGenerated = function (columnList, recordType) {
        return fluid.transform(columnList, function (object, index) {
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
    };

    var displaySearchResults = function (that, recordType) {
        var colList = [];
        var results = (that.model.results || []);
        for (var key in results[0]) {
            if (results[0].hasOwnProperty(key)) {
                colList.push(key);
            }
        }
        var pagerArguments = [
            that.options.selectors.resultsContainer,
            {
                dataModel: results,
                columnDefs: colDefsGenerated(colList, recordType),
                bodyRenderer: {
                    type: "fluid.pager.selfRender",
                    options: {
                        renderOptions: {
                            cutpoints: [
                                {id: "header:", selector: that.options.selectors.resultsHeader},
                                {id: "row:", selector: that.options.selectors.resultsRow},
                                {id: "number", selector: that.options.selectors.columns.number},
                                {id: "col:", selector: that.options.selectors.columns.col}
                            ]
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
        if (resultsPager) {
            fluid.model.copyModel(resultsPager.options.dataModel, results);
            fluid.model.copyModel(resultsPager.options.columnDefs, colDefsGenerated(colList, recordType));
            // you're not supposed to touch the pager's model, but there's a bug in this version, so...
            resultsPager.model.totalRange = results.length;
            resultsPager.events.initiatePageChange.fire({pageIndex: 0, forceUpdate: true});
        } else {
            resultsPager = fluid.initSubcomponent(that, "resultsPager", pagerArguments);
        }
        that.locate("resultsContainer").show();
        that.locate("resultsCount").text(resultsPager.model.totalRange);
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
        that.locate("searchButton").click(submitSearchRequest(that));

        that.events.modelChanged.addListener(function () {
            displaySearchResults(that, that.locate("recordType").val());
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
            recordType: ".csc-search-record-type",
            errorMessage: ".csc-search-error-message",
            searchButton: ".csc-search-submit",
            resultsContainer: ".csc-search-results",
            resultsCount: ".csc-search-results-count",
            resultsHeader: ".csc-header",
            resultsRow: ".csc-row",
            columns: {
                number: ".csc-number",
                col: ".csc-col"
            }
        },
        
        events: {
            modelChanged: null,
            onError: null
        },
        
        searchUrlBuilder: defaultSearchUrlBuilder,

        resultsPager: {
            type: "fluid.pager"
        }
    });
})(jQuery, fluid_1_2);
