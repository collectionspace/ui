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

    var temporaryTestData = {
        searchResults: [
            {csid: "1984.068.0335b", number:"1984.068.0335b", detail: "Catalogs. Wyanoak Publishing Company.", recordtype: "objectentry", edited: "today"},
            {csid: "1984.068.0338", number:"1984.068.0338", detail: "Stamp albums. Famous stars series stamp album.", recordtype: "objectentry", edited: "yesterday"},
            {csid: "2005.018.1383", number:"2005.018.1383", detail: "Souvenir books. Molly O' Play Book.", recordtype: "objectentry", edited: "Tuesday"},
            {csid: "2007.4-a", number:"2007.4-a", detail: "", recordtype: "intake", edited: "today"},
            {csid: "IN2004.002", number:"IN2004.002", detail: "", recordtype: "intake", edited: "yesterday"},
            {csid: "IN2009.001", number:"IN2009.001", detail: "", recordtype: "intake", edited: "Tuesday"},
            {csid: "IN2009.002", number:"IN2009.002", detail: "", recordtype: "intake", edited: "today"},
            {csid: "IN2009.003", number:"IN2009.003", detail: "", recordtype: "intake", edited: "yesterday"},
            {csid: "ACQ2009.2", number:"ACQ2009.2", detail: "", recordtype: "acquisition", edited: "Tuesday"},
            {csid: "ACQ2009.002.001", number:"ACQ2009.002.001", detail: "", recordtype: "acquisition", edited: "Tuesday"}
        ]
    };

    var displaySearchResults = function (results) {
        // given a set of search results, display them in the 'resultsContainer'
    };

    var submitSearchRequest = function () {
        return function(){
            jQuery.ajax({
                url: searchUrl,
                type: "GET",
                dataType: "json",
                success: function(data, textStatus){
                    displaySearchResults(data);
                },
                error: function(xhr, textStatus, errorThrown){
                    that.events.onError.fire("fetch", modelPath, textStatus);
                }
            });
        };
    };

    var bindEventHandlers = function (that) {
        that.locate("searchButton").click(submitSearchRequest());
    };

    cspace.search = function (container, options) {
        var that = fluid.initView("cspace.search", container, options);
//        that.model = {
//            searchResults: []
//        };
        that.model = temporaryTestData.searchResults;
        
        var pagerArguments = [
            that.options.selectors.resultsContainer,
            {
                dataModel: that.model,
                columnDefs: colDefs,
                bodyRenderer: {
                    type: "fluid.pager.selfRender",
                    options: {
                        renderOptions: {
                            cutpoints: [
                                {id: "row:", selector: ".csc-row"},
                                {id: "number", selector: ".csc-number"},
                                {id: "detail", selector: ".csc-detail"},
                                {id: "recordtype", selector: ".csc-recordtype"},
                                {id: "edited", selector: ".csc-edited"}
                            ]
                        }
                    }
                },
                pagerBar: {
                    type: "fluid.pager.pagerBar",
                    options: {
                        pageList: {
                            type: "fluid.pager.renderedPageList",                        }
                    }
                }
            }
        ];
        var resultsPager = fluid.initSubcomponent(that, "resultsPager", pagerArguments);
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
            resultsCount: ".csc-search-results-count"
        },
        
        events: {
            
        },
        
        resultsPager: {
            type: "fluid.pager"
        }
    });
})(jQuery, fluid_1_1);
