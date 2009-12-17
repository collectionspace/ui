/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_1*/

var cspace = cspace || {};

(function ($, fluid) {

    var defaultSearchUrlBuilder = function (recordType, query) {
        return "../chain/" + recordType + "/search?query=" + query;
    };

//    var temporaryTestData = {
//        object: [
//            {csid: "1984.068.0335b", number: "1984.068.0335b", summary: "Catalogs. Wyanoak Publishing Company.", edited: "today"},
//            {csid: "2005.018.1383", number: "2005.018.1383", summary: "Souvenir books. Molly O' Play Book.", edited: "Tuesday"},
//            {csid: "1984.068.0338", number: "1984.068.0338", summary: "Stamp albums. Famous stars series stamp album.", edited: "yesterday"}
//        ],
//        intake: [
//            {csid: "2007.4-a", number: "2007.4-a", summary: "Christoph Grissemann", edited: "today"},
//            {csid: "IN2004.002", number: "IN2004.002", summary: "Jennifer Connelly", edited: "yesterday"},
//            {csid: "IN2009.001", number: "IN2009.001", summary: "", edited: "Tuesday"},
//            {csid: "IN2009.002", number: "IN2009.002", summary: "Duncan Jones", edited: "today"},
//            {csid: "IN2009.003", number: "IN2009.003", summary: "yes, please", edited: "yesterday"}
//        ],
//        acquisition: [
//            {csid: "ACQ2009.2", number: "ACQ2009.2", summary: "Another nice person", edited: "Tuesday"},
//            {csid: "ACQ2009.002.001", number: "ACQ2009.002.001", summary: "BigShopIncorproated", edited: "Tuesday"}
//        ]
//    };
//
//    var getTestData = function (recordType) {
//        return temporaryTestData[recordType];
//    };
//
    var colDefsGenerated = function (columnList, recordType) {
        return fluid.transform(columnList, function (object, index) {
            var key = "col:";
            var comp;

            if (object === "number") {
                key = "number";
                comp = {
                    target: recordType + ".html?csid=${*.number}",
                    linktext: fluid.VALUE
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
        for (var key in that.model[0]) {
            if (that.model[0].hasOwnProperty(key)) {
                colList.push(key);
            }
        }
        var pagerArguments = [
            that.options.selectors.resultsContainer,
            {
                dataModel: that.model,
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
        var resultsPager = fluid.initSubcomponent(that, "resultsPager", pagerArguments);
        that.locate("resultsContainer").show();
        that.locate("resultsCount").text(resultsPager.model.totalRange);
    };

    var submitSearchRequest = function (that) {
        return function () {
            var recordType = that.locate("recordType").val();
            var query = that.locate("keywords").val();
// Temporarily bypass the ajax call, to make cross-browser testing easier
//            that.model = getTestData(recordType);
//            that.events.modelChanged.fire();
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
            console.log("Error on " + action + ": " + status);
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
})(jQuery, fluid_1_1);
