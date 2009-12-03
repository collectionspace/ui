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
            target: "#",
            linktext: fluid.VALUE
        }, sortable: false},
        {key: "detail", valuebinding: "*.detail", components: {
            value: fluid.VALUE
        }, sortable: false},
        {key: "recordtype", valuebinding: "*.recordtype", components: {
            value: fluid.VALUE
        }, sortable: false},
        {key: "edited", valuebinding: "*.edited", components: {
            value: fluid.VALUE
        }, sortable: false}
    ];

    var temporaryTestData = {
        searchResults: [
            {number:"ACC1", detail: "Foo", recordtype: "Object", edited: "today"},
            {number:"IN2", detail: "Bar", recordtype: "Intake", edited: "yesterday"},
            {number:"ACQ3", detail: "Bat", recordtype: "Acquisition", edited: "Tuesday"},
            {number:"LI4", detail: "Blah", recordtype: "Loan in", edited: "Monday"},
            {number:"ACC1.a", detail: "Foo", recordtype: "Object", edited: "today"},
            {number:"IN2.b", detail: "Bar", recordtype: "Intake", edited: "yesterday"},
            {number:"ACQ3.c", detail: "Bat", recordtype: "Acquisition", edited: "Tuesday"},
            {number:"LI4.d", detail: "Blah", recordtype: "Loan in", edited: "Monday"},
            {number:"ACC1.1", detail: "Foo", recordtype: "Object", edited: "today"},
            {number:"IN2.2", detail: "Bar", recordtype: "Intake", edited: "yesterday"},
            {number:"ACQ3.3", detail: "Bat", recordtype: "Acquisition", edited: "Tuesday"},
            {number:"LI4.4", detail: "Blah", recordtype: "Loan in", edited: "Monday"},
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
                    type: "fluid.pager.selfRender"
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
