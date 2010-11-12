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
    var findEdit;
    
    var findEditTests = new jqUnit.TestCase("Find Edit Tests", function () {
        cspace.util.isTest = true;
        findEditTests.fetchTemplate("../../main/webapp/html/findedit.html", ".main-search-page");
    });
    
    var setupFindEdit = function (options) {
        return cspace.search.searchView(".main-search-page", options);
    };
    
    var setupAjaxMock = function (findEdit, expectedAjaxParams, findEditModel, callback) {
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var ajaxParams = {
            dataType: "json",
            type: "GET"
        };
        var model = {
            recordTypeLong: "intake"
        };
        callback = callback || function (findEdit) {
            findEdit.updateModel(model);
            findEdit.search();
        }; 
        fluid.merge(null, ajaxParams, expectedAjaxParams);
        fluid.merge(null, model, findEditModel);
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(ajaxParams)).returnValue();
        callback(findEdit);
        ajaxMock.verify();              
        ajaxMock.restore();
    };
    
    var findEditUrlTest = function (options, url, model, callback) {
        expect(1);
        findEdit = setupFindEdit(options);
        setupAjaxMock(findEdit, {
            url: url
        }, model, callback);
    };
    
    var initialfindEditTets = function (findEdit) {
        jqUnit.notVisible("Initially, results container should be hidden", jQuery(findEdit.options.selectors.resultsContainer));
        jqUnit.notVisible("Initially, results count container should be hidden", jQuery(findEdit.options.selectors.resultsCountContainer));
        jqUnit.notVisible("Initially, 'looking' message should be hidden", jQuery(findEdit.options.selectors.lookingContainer));
        jqUnit.notVisible("Initially, error message should be hidden", jQuery(findEdit.options.selectors.errorMessage));
        findEdit.model.searchModel.recordType = "loanin";
        findEdit.model.searchModel.keywords = query;
        findEdit.search();
    };
    
    var findEditInitTests = function (options) {
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
        findEdit = setupFindEdit(opts);
        initialfindEditTets(findEdit);
        stop();
    };
    
    findEditTests.test("Basic findEdit URL with query", function () {
        findEditUrlTest(null, "../../chain/intake/search?query=foofer&pageNum=0&pageSize=10", {
            keywords: "foofer"
        });
    });
    
    findEditTests.test("Use the local search url option to override the default search url", function () {
        findEditUrlTest({
            searchUrlBuilder: cspace.search.localSearchUrlBuilder
        }, "./data/intake/search/list.json");
    });
    
    findEditTests.test("FindEdit URL through form inputs", function () {
        findEditUrlTest(null, "../../chain/acquisition/search?query=doodle&pageNum=0&pageSize=10", null, function (findEdit) {
            jQuery(findEdit.options.selectors.keywords).val("doodle");
            jQuery(findEdit.options.selectors.recordType).val("acquisition");
            jQuery(findEdit.options.selectors.searchButton).click();
        });
    });

    findEditTests.test("FindEdit initialization", function () {
        expect(10);
        findEditInitTests({
            listeners: {
                onSearch: function () {
                    jqUnit.notVisible("When search submitted, results count should be hidden", jQuery(findEdit.options.selectors.resultsCountContainer));
                    var lookingContainer = jQuery(findEdit.options.selectors.lookingContainer);
                    jqUnit.isVisible("When search submitted, 'looking' message should be visible", lookingContainer);
                    jqUnit.assertEquals("When search submitted, 'looking' message should include query", query, jQuery(findEdit.options.selectors.queryString, lookingContainer).text());
                },
                afterSearch: function () {
                    var resultsContainer = jQuery(findEdit.options.selectors.resultsCountContainer);
                    jqUnit.isVisible("After search, results count should be visible", resultsContainer);
                    jqUnit.assertEquals("After search submitted, results count should include query string", query, jQuery(findEdit.options.selectors.queryString, resultsContainer).text());
                    jqUnit.notVisible("When search submitted, 'looking' message should be hidden", jQuery(findEdit.options.selectors.lookingContainer));
                    start();
                }
            }
        });
    });

    findEditTests.test("FindEdit results: progress indication", function () {
        expect(8);
        findEditInitTests({
            listeners: {
                onSearch: function () {
                    jqUnit.notVisible("When search submitted, results container should be hidden", jQuery(findEdit.options.selectors.resultsContainer));
                    var lookingContainer = jQuery(findEdit.options.selectors.lookingContainer);
                    jqUnit.notVisible("When search submitted, error message should be hidden", jQuery(findEdit.options.selectors.errorMessage));

                },
                afterSearch: function () {
                    jqUnit.isVisible("After search, results container should be visible", jQuery(findEdit.options.selectors.resultsContainer));
                    var resultsCountContainer = jQuery(findEdit.options.selectors.resultsCountContainer);
                    jqUnit.notVisible("After search submitted, error message should be hidden", jQuery(findEdit.options.selectors.errorMessage));
                    start();
                }
            }
        });
    });
})();
