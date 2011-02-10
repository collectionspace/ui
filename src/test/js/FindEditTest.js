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
    
    var opts = {
        "components": {
            "mainSearch": {
                "type": "cspace.searchBox",
                "options": {
                    "strings": {
                        "recordTypeSelectLabel": "Record Type" 
                    },
                    "selfRender": true,
                    "related": "all",
                    "invokers": {
                        "navigateToSearch": {
                            "funcName": "cspace.search.handleSubmitSearch",
                            "args": {
                                "expander": {
                                    "type": "fluid.noexpand",
                                    "tree": ["{searchBox}", "{searchView}"]
                                }
                            }
                        }
                    } 
                }
            } 
        }
    }

    var query = "barbar";
    var findEdit;
    
    var bareFindEditTests = new jqUnit.TestCase("Find Edit Tests", function () {
        cspace.util.isTest = true;
        bareFindEditTests.fetchTemplate("../../main/webapp/html/findedit.html", ".main-search-page");
    });
    
    var findEditTests = cspace.tests.testEnvironment({
        testCase: bareFindEditTests
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
        jqUnit.notVisible("Initially, error message should be hidden", findEdit.options.messageBar.container);
        findEdit.model.searchModel.recordType = "loanin";
        findEdit.model.searchModel.keywords = query;
        findEdit.search();
    };
    
    var findEditInitTests = function (options) {
        var localOpts = {
            searchUrlBuilder: function (searchModel) {
                return "../data/" + searchModel.recordType + "/search.json";
            },
            listeners: {
                onError: function () {
                    jqUnit.assertTrue("Error shouldn't happen", false);
                }
            }
        };
        fluid.merge(null, localOpts, options, opts);
        findEdit = setupFindEdit(localOpts);
        initialfindEditTets(findEdit);
    };
    
    findEditTests.test("Basic findEdit URL with query", function () {
        findEditUrlTest(opts, "../../chain/intake/search?query=foofer&pageNum=0&pageSize=10", {
            keywords: "foofer"
        });
    });
    
    findEditTests.test("Use the local search url option to override the default search url", function () {
        var options = fluid.copy(opts) || {};
        options.searchUrlBuilder = cspace.search.localSearchUrlBuilder;
        findEditUrlTest(options, "../data/intake/search.json");
    });
    
    findEditTests.test("FindEdit URL through form inputs", function () {
        findEditUrlTest(opts, "../../chain/loanin/search?query=doodle&pageNum=0&pageSize=10", null, function (findEdit) {
            jQuery(findEdit.mainSearch.options.selectors.searchQuery).val("doodle");
            jQuery(findEdit.mainSearch.options.selectors.recordTypeSelect).val("loanin");
            jQuery(findEdit.mainSearch.options.selectors.searchButton).click();
        });
    });

    findEditTests.asyncTest("FindEdit initialization", function () {
        expect(10);
        findEditInitTests({
            listeners: {
                onSearch: function () {
                    jqUnit.notVisible("When search submitted, results count should be hidden", jQuery(findEdit.options.selectors.resultsCountContainer));
                    var lookingContainer = jQuery(findEdit.options.selectors.lookingContainer);
                    jqUnit.isVisible("When search submitted, 'looking' message should be visible", lookingContainer);
                    jqUnit.assertEquals("When search submitted, 'looking' message should include query", "Looking for "+ query + "...", jQuery(findEdit.options.selectors.lookingString, lookingContainer).text());
                },
                afterSearch: function () {
                    var resultsContainer = jQuery(findEdit.options.selectors.resultsCountContainer);
                    jqUnit.isVisible("After search, results count should be visible", resultsContainer);
                    jqUnit.assertEquals("After search submitted, results count should include query string", "Found 1 records for "+ query, jQuery(findEdit.options.selectors.resultsCount, resultsContainer).text());
                    jqUnit.notVisible("When search submitted, 'looking' message should be hidden", jQuery(findEdit.options.selectors.lookingContainer));
                    start();
                }
            }
        });
    });

    findEditTests.asyncTest("FindEdit results: progress indication", function () {
        expect(8);
        findEditInitTests({
            listeners: {
                onSearch: function () {
                    jqUnit.notVisible("When search submitted, results container should be hidden", jQuery(findEdit.options.selectors.resultsContainer));
                    var lookingContainer = jQuery(findEdit.options.selectors.lookingContainer);
                    jqUnit.notVisible("When search submitted, error message should be hidden", findEdit.options.messageBar.container);

                },
                afterSearch: function () {
                    jqUnit.isVisible("After search, results container should be visible", jQuery(findEdit.options.selectors.resultsContainer));
                    var resultsCountContainer = jQuery(findEdit.options.selectors.resultsCountContainer);
                    jqUnit.notVisible("After search submitted, error message should be hidden", findEdit.options.messageBar.container);
                    start();
                }
            }
        });
    });

    fluid.demands("mainSearch", "cspace.search.searchView",
    ["{searchView}.dom.mainSearch", fluid.COMPONENT_OPTIONS]);
})();
