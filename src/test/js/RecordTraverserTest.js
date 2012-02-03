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
    var searchReference = {
        "token": "abc",
        "index": 1
    };
    
    var searchReferenceNoNext = {
        "token": "def",
        "index": 1
    };
    
    var searchReferenceNoPrevious = {
        "token": "ghi",
        "index": 0
    };
    
    var searchReferenceNoPreviousNoNext = {
        "token": "jkl",
        "index": 0
    };

    var bareRecordTraverserTest = new jqUnit.TestCase("recordTraverser Tests");

    var recordTraverserTest = cspace.tests.testEnvironment({testCase: bareRecordTraverserTest});
    
    var setupRecordTraverser = function (options, callback) {
        options = options || {};
        fluid.merge(null, options, {
            listeners: {
                afterRender: function (that) {
                    callback(that);
                }
            }
        });
        return cspace.recordTraverser(container, options);
    };

    recordTraverserTest.test("Creation with no Local Storage", function () {
        var rt = cspace.recordTraverser(container);
        
        jqUnit.assertNoValue("Record Traverser found nothing in the local storage", rt.model.searchReference);
        
        jqUnit.assertEquals("Record Traverser did not render linkNext", 0, rt.locate("linkNext").length);
        jqUnit.assertEquals("Record Traverser did not render linkPrevious", 0, rt.locate("linkPrevious").length);
        jqUnit.assertEquals("Record Traverser did not render current", 0, rt.locate("current").length);
    });
    
    recordTraverserTest.asyncTest("Creation with Local Storage", function () {
        
        var webapp = fluid.invoke("cspace.urlExpander")("%webapp/html/");
        
        var ls = cspace.util.localStorageDataSource({
            elPath: "searchReference"
        });
        
        ls.set(searchReference);
        
        setupRecordTraverser(undefined, function (rt) {
            jqUnit.assertValue("Record Traverser found token and index in local storage", rt.model.searchReference);

            jqUnit.assertEquals("Record Traverser render linkNext", 1, rt.locate("linkNext").length);
            jqUnit.assertEquals("Record Traverser render linkPrevious", 1, rt.locate("linkPrevious").length);
            jqUnit.assertEquals("Record Traverser render current", 1, rt.locate("current").length);
            
            jqUnit.assertEquals("Selected retreived correctly", searchReference.index, rt.model.searchReference.index);
            
            jqUnit.assertEquals("linkPrevious is rendered correctly", rt.model.adjacentRecords.previous.number, rt.locate("linkPrevious").text());
            jqUnit.assertEquals("current is rendered correctly", rt.model.adjacentRecords.current.number, rt.locate("current").text());
            jqUnit.assertEquals("linkNext is rendered correctly", rt.model.adjacentRecords.next.number, rt.locate("linkNext").text());
            
            jqUnit.assertEquals("linkPrevious is rendered correctly", webapp + rt.model.adjacentRecords.previous.recordtype + ".html?csid=" + rt.model.adjacentRecords.previous.csid, rt.locate("linkPrevious").attr("href"));
            jqUnit.assertEquals("linkNext is rendered correctly", webapp + rt.model.adjacentRecords.next.recordtype + ".html?csid=" + rt.model.adjacentRecords.next.csid, rt.locate("linkNext").attr("href"));
            start();
        });
    });
    
    recordTraverserTest.asyncTest("Creation with Local Storage without Next element", function () {
        
        var webapp = fluid.invoke("cspace.urlExpander")("%webapp/html/");
        
        var ls = cspace.util.localStorageDataSource({
            elPath: "searchReference"
        });
        
        ls.set(searchReferenceNoNext);
        
        setupRecordTraverser(undefined, function (rt) {
            jqUnit.assertValue("Record Traverser found token and index in local storage", rt.model.searchReference);

            jqUnit.assertEquals("Record Traverser render linkNext", 0, rt.locate("linkNext").length);
            jqUnit.assertEquals("Record Traverser render linkPrevious", 1, rt.locate("linkPrevious").length);
            jqUnit.assertEquals("Record Traverser render current", 1, rt.locate("current").length);
            
            jqUnit.assertEquals("Selected retreived correctly", searchReferenceNoNext.index, rt.model.searchReference.index);
            
            jqUnit.assertEquals("linkPrevious is rendered correctly", rt.model.adjacentRecords.previous.number, rt.locate("linkPrevious").text());
            jqUnit.assertEquals("current is rendered correctly", rt.model.adjacentRecords.current.number, rt.locate("current").text());
            jqUnit.assertUndefined("linkNext is undefined in the model", rt.model.adjacentRecords.next);
            
            jqUnit.assertEquals("linkPrevious is rendered correctly", webapp + rt.model.adjacentRecords.previous.recordtype + ".html?csid=" + rt.model.adjacentRecords.previous.csid, rt.locate("linkPrevious").attr("href"));
            start();
        });
    });
    
    recordTraverserTest.asyncTest("Creation with Local Storage without Previous element", function () {
        
        var webapp = fluid.invoke("cspace.urlExpander")("%webapp/html/");
        
        var ls = cspace.util.localStorageDataSource({
            elPath: "searchReference"
        });
        
        ls.set(searchReferenceNoPrevious);
        
        setupRecordTraverser(undefined, function (rt) {
            jqUnit.assertValue("Record Traverser found token and index in local storage", rt.model.searchReference);

            jqUnit.assertEquals("Record Traverser render linkNext", 1, rt.locate("linkNext").length);
            jqUnit.assertEquals("Record Traverser render linkPrevious", 0, rt.locate("linkPrevious").length);
            jqUnit.assertEquals("Record Traverser render current", 1, rt.locate("current").length);
            
            jqUnit.assertEquals("Selected retreived correctly", searchReferenceNoPrevious.index, rt.model.searchReference.index);
            
            jqUnit.assertUndefined("linkPrevious is undefined in the model", rt.model.adjacentRecords.previous);
            jqUnit.assertEquals("current is rendered correctly", rt.model.adjacentRecords.current.number, rt.locate("current").text());
            jqUnit.assertEquals("linkNext is rendered correctly", rt.model.adjacentRecords.next.number, rt.locate("linkNext").text());
            
            jqUnit.assertEquals("linkNext is rendered correctly", webapp + rt.model.adjacentRecords.next.recordtype + ".html?csid=" + rt.model.adjacentRecords.next.csid, rt.locate("linkNext").attr("href"));
            start();
        });
    });
    
    recordTraverserTest.asyncTest("Creation with Local Storage without Previous and Next element", function () {
        
        var webapp = fluid.invoke("cspace.urlExpander")("%webapp/html/");
        
        var ls = cspace.util.localStorageDataSource({
            elPath: "searchReference"
        });
        
        ls.set(searchReferenceNoPreviousNoNext);
        
        setupRecordTraverser(undefined, function (rt) {
            jqUnit.assertValue("Record Traverser found token and index in local storage", rt.model.searchReference);

            jqUnit.assertEquals("Record Traverser render linkNext", 0, rt.locate("linkNext").length);
            jqUnit.assertEquals("Record Traverser render linkPrevious", 0, rt.locate("linkPrevious").length);
            jqUnit.assertEquals("Record Traverser render current", 1, rt.locate("current").length);
            
            jqUnit.assertEquals("Selected retreived correctly", searchReferenceNoPreviousNoNext.index, rt.model.searchReference.index);
            
            jqUnit.assertUndefined("linkPrevious is undefined in the model", rt.model.adjacentRecords.previous);
            jqUnit.assertEquals("current is rendered correctly", rt.model.adjacentRecords.current.number, rt.locate("current").text());
            jqUnit.assertUndefined("linkNext is undefined in the model", rt.model.adjacentRecords.next);
            
            start();
        });
    });

};

jQuery(document).ready(function () {
    rtTester(jQuery);
});