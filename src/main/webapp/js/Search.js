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

    var colDefs = [
        {key: "number", valuebinding: "*.number", components: {
            target: "${*.recordtype}.html?csid=${*.number}",
            linktext: fluid.VALUE
        }, sortable: false},
        {key: "detail", valuebinding: "*.detail", components: {
            value: "${*.detail}"
        }, sortable: false},
        {key: "recordtype", valuebinding: "*.recordtype", components: {
            value: "${*.recordtype}"
        }, sortable: false},
        {key: "edited", valuebinding: "*.edited", components: {
            value: "${*.edited}"
        }, sortable: false}
    ];

    var colDefsGenerated = function (columnList, recordType) {
        return fluid.transform(columnList, function (object, index) {
            var comp;
            if (object === "number") {
                comp = {
                    target: recordType + ".html?csid=${*.number}",
                    linktext: fluid.VALUE
                };
            } else {
                comp = {
                    value: "${*." + object + "}"
                };
            }
            return {
                key: object,
                valuebinding: "*." + object,
                components: comp,
                sortable: false
            };
        });
    };

    var temporaryTestData = {
        objectentry: [
            {csid: "1984.068.0335b", number: "1984.068.0335b", detail: "Catalogs. Wyanoak Publishing Company.", edited: "today"},
            {csid: "1984.068.0338", number: "1984.068.0338", detail: "Stamp albums. Famous stars series stamp album.", edited: "yesterday"},
            {csid: "2005.018.1383", number: "2005.018.1383", detail: "Souvenir books. Molly O' Play Book.", edited: "Tuesday"}
        ],
        intake: [
            {csid: "2007.4-a", number: "2007.4-a", detail: "", edited: "today"},
            {csid: "IN2004.002", number: "IN2004.002", detail: "", edited: "yesterday"},
            {csid: "IN2009.001", number: "IN2009.001", detail: "", edited: "Tuesday"},
            {csid: "IN2009.002", number: "IN2009.002", detail: "", edited: "today"},
            {csid: "IN2009.003", number: "IN2009.003", detail: "", edited: "yesterday"}
        ],
        acquisition: [
            {csid: "ACQ2009.2", number: "ACQ2009.2", detail: "", edited: "Tuesday"},
            {csid: "ACQ2009.002.001", number: "ACQ2009.002.001", detail: "", edited: "Tuesday"}
        ]
    };

    var displaySearchResults = function (that, recordType) {
        // given a set of search results, display them in the 'resultsContainer'
        that.model = temporaryTestData[recordType];
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
                                {id: "row:", selector: that.options.selectors.resultsRow},
                                {id: "number", selector: that.options.selectors.columns.col1},
                                {id: "detail", selector: that.options.selectors.columns.col2},
                                {id: "edited", selector: that.options.selectors.columns.col3}
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
    };

    var submitSearchRequest = function (that) {
        return function () {
            jQuery.ajax({
                url: "http://localhost:8080/chain/search",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    displaySearchResults(that);
                },
                error: function (xhr, textStatus, errorThrown) {
//                    that.events.onError.fire("fetch", modelPath, textStatus);
// for testing, display test results on error
                    displaySearchResults(that, that.locate("recordType").val());
                }
            });
        };
    };

    var bindEventHandlers = function (that) {
        that.locate("searchButton").click(submitSearchRequest(that));
    };

    cspace.search = function (container, options) {
        var that = fluid.initView("cspace.search", container, options);
        that.model = {};
        
        bindEventHandlers(that);
        
//        var keywords = cspace.util.getUrlParameter("keyword");
//        var recordType = cspace.util.getUrlParameter("recordtype");
        
        return that;
    };

    fluid.defaults("cspace.search", {
        selectors: {
            keywords: ".csc-search-keywords",
            recordType: ".csc-search-record-type",
            searchButton: ".csc-search-submit",
            resultsContainer: ".csc-search-results",
            resultsCount: ".csc-search-results-count",
            resultsRow: ".csc-row",
            columns: {
                col1: ".csc-number",
                col2: ".csc-detai",
                col3: ".csc-edited"
            }
        },
        
        events: {
            
        },
        
        resultsPager: {
            type: "fluid.pager"
        }
    });
})(jQuery, fluid_1_1);
