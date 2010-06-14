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
        search.search("intake", "foofer");
        ajaxMock.verify();              
        ajaxMock.restore();
    });

    searchTests.test("Search results", function () {
        expect(1);
        var expectedModel;
        jQuery.ajax({
            async: false,
            url: "../../main/webapp/html/data/intake/search/list.json",
            dataType: "json",
            success: function (data) {
                expectedModel = data;
            },
            error: function (xhr, textStatus, error) {
                fluid.log("Unable to load intake search results test data");
            }
        });

        var search;
        var searchOpts = {
            searchUrlBuilder: function (recordType, query) {
                return "../../main/webapp/html/data/" + recordType + "/search/list.json";
            },
            listeners: {
                modelChanged: function () {
                    jqUnit.assertDeepEq("After search, model should hold search results", expectedModel, search.model);
                    start();
                },
                onError: function () {
                    jqUnit.assertTrue("Error shouldn't happen", false);
                    start();
                }
            }
        };

        search = cspace.search(".main-search-page", searchOpts);
        search.search("intake", "foofer");
        stop();
    });

    searchTests.test("Search URL through form inputs", function () {
        expect(1);
        var search = cspace.search(".main-search-page");
        jQuery(search.options.selectors.keywords).val("doodle");
        jQuery(search.options.selectors.recordType).val("acquisition");

        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "../../chain/acquisition/search?query=doodle",
            dataType: "json",
            type: "GET"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams)).returnValue();
        jQuery(search.options.selectors.searchButton).click();
        ajaxMock.verify();              
        ajaxMock.restore();
    });


})();
