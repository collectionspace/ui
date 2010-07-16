/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace jqUnit start stop expect fluid jQuery ok jqMock*/
"use strict";

(function () {
    // jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;
    
    var searchTests = new jqUnit.TestCase("Search Tests", function () {
        cspace.util.isTest = true;
        searchTests.fetchTemplate("../../main/webapp/html/search.html", ".main-search-page");
    });  
    
    searchTests.test("Basic search URL with query", function () {
        expect(1);
        var search = cspace.search(".main-search-page");

        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "../../chain/intake/search?query=foofer",
            dataType: "json",
            type: "GET"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams)).returnValue();
        search.model.recordType = "intake";
        search.model.keywords = "foofer";
        search.search();
        ajaxMock.verify();              
        ajaxMock.restore();
    });

    searchTests.test("Search initialization", function () {
        expect(10);
        var expectedModel;
        jQuery.ajax({
            async: false,
            url: "../../main/webapp/html/data/loanin/search/list.json",
            dataType: "json",
            success: function (data) {
                expectedModel = data;
            },
            error: function (xhr, textStatus, error) {
                fluid.log("Unable to load intake search results test data");
            }
        });
        var query = "barbar";

        var search;
        var searchOpts = {
            searchUrlBuilder: function (recordType, query) {
                return "../../main/webapp/html/data/" + recordType + "/search/list.json";
            },
            listeners: {
                onSearch: function () {
                    jqUnit.notVisible("When search submitted, results count should be hidden", jQuery(search.options.selectors.resultsCountContainer));
                    var lookingContainer = jQuery(search.options.selectors.lookingContainer);
                    jqUnit.isVisible("When search submitted, 'looking' message should be visible", lookingContainer);
                    jqUnit.assertEquals("When search submitted, 'looking' message should include query", query, jQuery(search.options.selectors.queryString, lookingContainer).text());
                },
                afterSearch: function () {
                    var resultsContainer = jQuery(search.options.selectors.resultsCountContainer);
                    jqUnit.isVisible("After search, results count should be visible", resultsContainer);
                    jqUnit.assertEquals("After search submitted, results count should include query string", query, jQuery(search.options.selectors.queryString, resultsContainer).text());
                    jqUnit.notVisible("When search submitted, 'looking' message should be hidden", jQuery(search.options.selectors.lookingContainer));
                    start();
                },
                onError: function () {
                    jqUnit.assertTrue("Error shouldn't happen", false);
                    start();
                }
            }
        };

        search = cspace.search(".main-search-page", searchOpts);
        jqUnit.notVisible("Initially, results container should be hidden", jQuery(search.options.selectors.resultsContainer));
        jqUnit.notVisible("Initially, results count container should be hidden", jQuery(search.options.selectors.resultsCountContainer));
        jqUnit.notVisible("Initially, 'looking' message should be hidden", jQuery(search.options.selectors.lookingContainer));
        jqUnit.notVisible("Initially, error message should be hidden", jQuery(search.options.selectors.errorMessage));
        search.model.recordType = "loanin";
        search.model.keywords = query;
        search.search();
        stop();
    });

    searchTests.test("Search URL through form inputs", function () {
        expect(1);
        var search = cspace.search(".main-search-page");

        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "../../chain/acquisition/search?query=doodle",
            dataType: "json",
            type: "GET"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams)).returnValue();
        jQuery(search.options.selectors.keywords).val("doodle");
        jQuery(search.options.selectors.recordType).val("acquisition");
        jQuery(search.options.selectors.searchButton).click();
        ajaxMock.verify();              
        ajaxMock.restore();
    });

    searchTests.test("Search results: progress indication", function () {
        expect(14);
        var expectedModel;
        jQuery.ajax({
            async: false,
            url: "../../main/webapp/html/data/loanin/search/list.json",
            dataType: "json",
            success: function (data) {
                expectedModel = data;
            },
            error: function (xhr, textStatus, error) {
                fluid.log("Unable to load intake search results test data");
            }
        });
        var query = "barbar";

        var search;
        var searchOpts = {
            searchUrlBuilder: function (recordType, query) {
                return "../../main/webapp/html/data/" + recordType + "/search/list.json";
            },
            listeners: {
                onSearch: function () {
            		jqUnit.notVisible("When search submitted, results container should be hidden", jQuery(search.options.selectors.resultsContainer));
                    jqUnit.notVisible("When search submitted, results count should be hidden", jQuery(search.options.selectors.resultsCountContainer));
                    var lookingContainer = jQuery(search.options.selectors.lookingContainer);
                    jqUnit.isVisible("When search submitted, 'looking' message should be visible", lookingContainer);
                    jqUnit.assertEquals("When search submitted, 'looking' message should include query", query, jQuery(search.options.selectors.queryString, lookingContainer).text());
                    jqUnit.notVisible("When search submitted, error message should be hidden", jQuery(search.options.selectors.errorMessage));

                },
                afterSearch: function () {
                    jqUnit.isVisible("After search, results container should be visible", jQuery(search.options.selectors.resultsContainer));
                    var resultsCountContainer = jQuery(search.options.selectors.resultsCountContainer);
                    jqUnit.isVisible("After search, results count should be visible", resultsCountContainer);
                    jqUnit.assertEquals("After search submitted, results count should include query string", query, jQuery(search.options.selectors.queryString, resultsCountContainer).text());
                    jqUnit.notVisible("After search submitted, 'looking' message should be hidden", jQuery(search.options.selectors.lookingContainer));
                    jqUnit.notVisible("After search submitted, error message should be hidden", jQuery(search.options.selectors.errorMessage));
                    start();
                },
                onError: function () {
                    jqUnit.assertTrue("Error shouldn't happen", false);
                    start();
                }
            }
        };

        search = cspace.search(".main-search-page", searchOpts);
        jqUnit.notVisible("Initially, results container should be hidden", jQuery(search.options.selectors.resultsContainer));
        jqUnit.notVisible("Initially, results count container should be hidden", jQuery(search.options.selectors.resultsCountContainer));
        jqUnit.notVisible("Initially, 'looking' message should be hidden", jQuery(search.options.selectors.lookingContainer));
        jqUnit.notVisible("Initially, error message should be hidden", jQuery(search.options.selectors.errorMessage));
        search.model.recordType = "loanin";
        search.model.keywords = query;
        search.search();
        stop();
    });
    
    searchTests.test("Use the local search url option to override the default search url", function () {
        expect(1);
        var search = cspace.search(".main-search-page", 
        		{searchUrlBuilder: cspace.search.localSearchUrlBuilder});

        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "./data/intake/search/list.json",
            dataType: "json",
            type: "GET"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams)).returnValue();
        search.model.recordType = "intake";
        search.search();
        ajaxMock.verify();              
        ajaxMock.restore();
    });


})();
