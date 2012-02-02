/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0.
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var rtTester = function ($) {

    var container = "#main";
    
    var searchResult = {
        "results": [
            {
                "summary": "Zsa Zsa Gabor",
                "number": "Zsa Zsa Gabor",
                "csid": "0db43bf2-533b-4a0b-9ea5",
                "displayName": "Zsa Zsa Gabor",
                "refid": "urn:cspace.org.collectionspace.demo.personauthority:name(cc025527-3f1f-4a21-84fc):person:name(e4a1d777-9226-4a69-86c0)'Fred Bloggs'",
                "recordtype": "person"
            },
            {
                "summary": "Fred Bloggs",
                "number": "Fred Bloggs",
                "csid": "123.456.789",
                "displayName": "Fred Bloggs",
                "refid": "urn:cspace.org.collectionspace.demo.personauthority:name(cc025527-3f1f-4a21-84fc):person:name(e4a1d777-9226-4a69-86c0)'Fred Bloggs'",
                "recordtype": "person"
            },
            {
                "summary": "Mary Alden",
                "number": "Mary Alden",
                "csid": "e4a1d777-9226-4a69-86c0",
                "displayName": "Mary Alden",
                "refid": "urn:cspace.org.collectionspace.demo.personauthority:name(cc025527-3f1f-4a21-84fc):person:name(e4a1d777-9226-4a69-86c0)'Mary+Alden'",
                "recordtype": "person"
            },
            {
                "summary": "Rex Allen",
                "number": "Rex Allen",
                "csid": "eeb01f46-2480-458f-821f",
                "displayName": "Rex Allen",
                "refid": "urn:cspace.org.collectionspace.demo.personauthority:name(cc025527-3f1f-4a21-84fc):person:name(eeb01f46-2480-458f-821f)'Rex+Allen'",
                "recordtype": "person"
            }
        ],
        "pagination": {
            "totalItems": 4,
            "pageSize": 5,
            "itemsInPage": 4,
            "pageNum": 0
        },
        "selected" : 0
    };

    var bareRecordTraverserTest = new jqUnit.TestCase("recordTraverser Tests");

    var recordTraverserTest = cspace.tests.testEnvironment({testCase: bareRecordTraverserTest});
    
    var setupRecordTraverser = function (options) {
        return cspace.recordTraverser(container, options);
    };

    recordTraverserTest.test("Creation with no Local Storage", function () {
        var rt = setupRecordTraverser();
        
        jqUnit.assertNoValue("Record Traverser found nothing in the local storage", rt.model.recordsData);
        
        jqUnit.assertEquals("Record Traverser did not render linkNext", 0, rt.locate("linkNext").length);
        jqUnit.assertEquals("Record Traverser did not render linkPrevious", 0, rt.locate("linkPrevious").length);
        jqUnit.assertEquals("Record Traverser did not render current", 0, rt.locate("current").length);
    });
    
    recordTraverserTest.test("Creation with Local Storage", function () {
        
        var webapp = fluid.invoke("cspace.urlExpander")("%webapp/html/");
        
        var ls = cspace.util.localStorageDataSource({
            elPath: "recordsData"
        });
        
        ls.set(searchResult);
        
        var rt = setupRecordTraverser();
        jqUnit.assertValue("Record Traverser found nothing in the local storage", rt.model.recordsData);
        
        jqUnit.assertEquals("Record Traverser render linkNext", 1, rt.locate("linkNext").length);
        jqUnit.assertEquals("Record Traverser render linkPrevious", 1, rt.locate("linkPrevious").length);
        jqUnit.assertEquals("Record Traverser render current", 1, rt.locate("current").length);
        
        jqUnit.assertEquals("Selected retreived correctly", searchResult.selected, rt.model.recordsData.selected);
        
        jqUnit.assertEquals("linkPrevious is rendered correctly", searchResult.results[0].number, rt.locate("linkPrevious").text());
        jqUnit.assertEquals("current is rendered correctly", searchResult.results[1].number, rt.locate("current").text());
        jqUnit.assertEquals("linkNext is rendered correctly", searchResult.results[2].number, rt.locate("linkNext").text());
        
        var a = rt.locate("linkPrevious");
        
        jqUnit.assertEquals("linkPrevious is rendered correctly", webapp + searchResult.results[0].recordtype + ".html?csid=" + searchResult.results[0].csid, rt.locate("linkPrevious").attr("href"));
        jqUnit.assertEquals("linkNext is rendered correctly", webapp + searchResult.results[2].recordtype + ".html?csid=" + searchResult.results[2].csid, rt.locate("linkNext").attr("href"));
    });

};

jQuery(document).ready(function () {
    rtTester(jQuery);
});