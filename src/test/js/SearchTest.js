/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace jqUnit start stop expect fluid jQuery ok jqMock*/
"use strict";

(function () {
    // jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;
    
    var query = "barbar";
    var search;
    
    var searchTests = new jqUnit.TestCase("Search Tests", function () {
        cspace.util.isTest = true;
        searchTests.fetchTemplate("../../main/webapp/html/findedit.html", ".main-search-page");
    });
    
    var setupSearch = function (options) {
        return cspace.search.searchView(".main-search-page", options);
    };
    
    var setupAjaxMock = function (search, expectedAjaxParams, searchModel, callback) {
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var ajaxParams = {
            dataType: "json",
            type: "GET"
        };
        var model = {
            recordTypeLong: "intake"
        };
        callback = callback || function (search) {
            search.updateModel(model);
            search.search();
        }; 
        fluid.merge(null, ajaxParams, expectedAjaxParams);
        fluid.merge(null, model, searchModel);
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(ajaxParams)).returnValue();
        callback(search);
        ajaxMock.verify();              
        ajaxMock.restore();
    };
    
    var searchUrlTest = function (options, url, model, callback) {
        expect(1);
        search = setupSearch(options);
        setupAjaxMock(search, {
            url: url
        }, model, callback);
    };
    
    var initialSearchTets = function (search) {
        jqUnit.notVisible("Initially, results container should be hidden", jQuery(search.options.selectors.resultsContainer));
        jqUnit.notVisible("Initially, results count container should be hidden", jQuery(search.options.selectors.resultsCountContainer));
        jqUnit.notVisible("Initially, 'looking' message should be hidden", jQuery(search.options.selectors.lookingContainer));
        jqUnit.notVisible("Initially, error message should be hidden", jQuery(search.options.selectors.errorMessage));
        search.model.searchModel.recordType = "loanin";
        search.model.searchModel.keywords = query;
        search.search();
    };
    
    var searchInitTests = function (options) {
        var opts = {
            searchUrlBuilder: function (searchModel) {
                return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
            },
            listeners: {
                onError: function () {
                    jqUnit.assertTrue("Error shouldn't happen", false);
                }
            }
        };
        fluid.merge(null, opts, options);
        search = setupSearch(opts);
        initialSearchTets(search);
        stop();
    };
    
    searchTests.test("Basic search URL with query", function () {
        searchUrlTest(null, "../../chain/intake/search?query=foofer&pageNum=0&pageSize=10", {
            keywords: "foofer"
        });
    });
    
    searchTests.test("Use the local search url option to override the default search url", function () {
        searchUrlTest({
            searchUrlBuilder: cspace.search.localSearchUrlBuilder
        }, "./data/intake/search/list.json");
    });
    
    searchTests.test("Search URL through form inputs", function () {
        searchUrlTest(null, "../../chain/acquisition/search?query=doodle&pageNum=0&pageSize=10", null, function (search) {
            jQuery(search.options.selectors.keywords).val("doodle");
            jQuery(search.options.selectors.recordType).val("acquisition");
            jQuery(search.options.selectors.searchButton).click();
        });
    });

    searchTests.test("Search initialization", function () {
        expect(10);
        searchInitTests({
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
                }
            }
        });
    });

    searchTests.test("Search results: progress indication", function () {
        expect(8);
        searchInitTests({
            listeners: {
                onSearch: function () {
                    jqUnit.notVisible("When search submitted, results container should be hidden", jQuery(search.options.selectors.resultsContainer));
                    var lookingContainer = jQuery(search.options.selectors.lookingContainer);
                    jqUnit.notVisible("When search submitted, error message should be hidden", jQuery(search.options.selectors.errorMessage));

                },
                afterSearch: function () {
                    jqUnit.isVisible("After search, results container should be visible", jQuery(search.options.selectors.resultsContainer));
                    var resultsCountContainer = jQuery(search.options.selectors.resultsCountContainer);
                    jqUnit.notVisible("After search submitted, error message should be hidden", jQuery(search.options.selectors.errorMessage));
                    start();
                }
            }
        });
    });
})();
