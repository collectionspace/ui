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
        "index": 22,
        "source": "advancedsearch"
    };
    
    var searchReferenceNoNext = {
        "token": "def",
        "index": 1,
        "source": "advancedsearch"
    };
    
    var searchReferenceNoPrevious = {
        "token": "ghi",
        "index": 0,
        "source": "advancedsearch"
    };
    
    var searchReferenceNoPreviousNoNext = {
        "token": "jkl",
        "index": 0,
        "source": "advancedsearch"
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

        jqUnit.assertEquals("Record Traverser did not render indexTotal", 0, rt.locate("indexTotal").length);
        jqUnit.assertEquals("Record Traverser did not render linkNext", 0, rt.locate("linkNext").length);
        jqUnit.assertEquals("Record Traverser did not render linkPrevious", 0, rt.locate("linkPrevious").length);
    });
    
    recordTraverserTest.asyncTest("Creation with Local Storage", function () {
        
        var webapp = fluid.invoke("cspace.urlExpander")("%webapp/html/");
        
        var ls = cspace.util.localStorageDataSource({
            elPath: "searchReference"
        });
        
        ls.set(searchReference);
        
        var sh = cspace.util.localStorageDataSource({
            elPath: "searchHistory"
        });
        var shs = {
            hashtoken: searchReference.token
        };
        sh.set([shs]);

        setupRecordTraverser(undefined, function (rt) {
            jqUnit.assertValue("Record Traverser found token and index in local storage", rt.model.searchReference);

            jqUnit.assertEquals("Record Traverser render indexTotal", 1, rt.locate("indexTotal").length);
            jqUnit.assertEquals("Record Traverser render linkNext", 1, rt.locate("linkNext").length);
            jqUnit.assertEquals("Record Traverser render linkPrevious", 1, rt.locate("linkPrevious").length);
            jqUnit.assertEquals("Record Traverser render returnToSearch", 1, rt.locate("returnToSearch").length);
            
            jqUnit.assertEquals("Selected retreived correctly", searchReference.index, rt.model.searchReference.index);

            jqUnit.assertEquals("Record Traverser indexTotal", "23 of 86", rt.locate("indexTotal").text());
            jqUnit.assertEquals("linkPrevious is rendered correctly", rt.model.adjacentRecords.previous.number, rt.locate("linkPrevious").attr("title"));
            jqUnit.assertEquals("linkNext is rendered correctly", rt.model.adjacentRecords.next.number, rt.locate("linkNext").attr("title"));
            
            jqUnit.assertEquals("returnToSearch is rendered correctly", "../../main/webapp/defaults/html/advancedsearch.html?hashtoken=abc", rt.locate("returnToSearch").attr("href"));
            jqUnit.assertEquals("linkPrevious is rendered correctly", webapp + rt.model.adjacentRecords.previous.recordtype + ".html?csid=" + rt.model.adjacentRecords.previous.csid, rt.locate("linkPrevious").attr("href"));
            jqUnit.assertEquals("linkNext is rendered correctly", webapp + rt.model.adjacentRecords.next.recordtype + ".html?csid=" + rt.model.adjacentRecords.next.csid, rt.locate("linkNext").attr("href"));

            sh.set();
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

            jqUnit.assertEquals("Record Traverser render indexTotal", 1, rt.locate("indexTotal").length);
            jqUnit.assertEquals("Record Traverser render linkNext", 1, rt.locate("linkNext").length);
            jqUnit.assertTrue("Record Traverser render linkNext disabled", rt.locate("linkNext").hasClass(rt.options.styles.disabled));
            jqUnit.assertEquals("Record Traverser render linkPrevious", 1, rt.locate("linkPrevious").length);
            jqUnit.assertEquals("Record Traverser render returnToSearch", 0, rt.locate("returnToSearch").length);
            
            jqUnit.assertEquals("Selected retreived correctly", searchReferenceNoNext.index, rt.model.searchReference.index);

            jqUnit.assertEquals("Record Traverser indexTotal", "2 of 2", rt.locate("indexTotal").text());
            jqUnit.assertEquals("linkPrevious is rendered correctly", rt.model.adjacentRecords.previous.number, rt.locate("linkPrevious").attr("title"));
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

            jqUnit.assertEquals("Record Traverser render indexTotal", 1, rt.locate("indexTotal").length);
            jqUnit.assertEquals("Record Traverser render linkNext", 1, rt.locate("linkNext").length);
            jqUnit.assertEquals("Record Traverser render linkPrevious", 1, rt.locate("linkPrevious").length);
            jqUnit.assertTrue("Record Traverser render linkPrevious disabled", rt.locate("linkPrevious").hasClass(rt.options.styles.disabled));
            jqUnit.assertEquals("Record Traverser render returnToSearch", 0, rt.locate("returnToSearch").length);
            
            jqUnit.assertEquals("Selected retreived correctly", searchReferenceNoPrevious.index, rt.model.searchReference.index);

            jqUnit.assertEquals("Record Traverser indexTotal", "1 of 86", rt.locate("indexTotal").text());
            jqUnit.assertUndefined("linkPrevious is undefined in the model", rt.model.adjacentRecords.previous);
            jqUnit.assertEquals("linkNext is rendered correctly", rt.model.adjacentRecords.next.number, rt.locate("linkNext").attr("title"));
            
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
        
        var sh = cspace.util.localStorageDataSource({
            elPath: "searchHistory"
        });
        var shs = {
            hashtoken: searchReferenceNoPreviousNoNext.token
        };
        sh.set([shs]);

        setupRecordTraverser(undefined, function (rt) {
            jqUnit.assertValue("Record Traverser found token and index in local storage", rt.model.searchReference);

            jqUnit.assertEquals("Record Traverser render indexTotal", 1, rt.locate("indexTotal").length);
            jqUnit.assertEquals("Record Traverser render linkNext", 1, rt.locate("linkNext").length);
            jqUnit.assertTrue("Record Traverser render linkNext disabled", rt.locate("linkNext").hasClass(rt.options.styles.disabled));
            jqUnit.assertEquals("Record Traverser render linkPrevious", 1, rt.locate("linkPrevious").length);
            jqUnit.assertTrue("Record Traverser render linkPrevious disabled", rt.locate("linkPrevious").hasClass(rt.options.styles.disabled));
            jqUnit.assertEquals("Record Traverser render returnToSearch", 1, rt.locate("returnToSearch").length);
            
            jqUnit.assertEquals("Selected retreived correctly", searchReferenceNoPreviousNoNext.index, rt.model.searchReference.index);

            jqUnit.assertEquals("returnToSearch is rendered correctly", "../../main/webapp/defaults/html/advancedsearch.html?hashtoken=jkl", rt.locate("returnToSearch").attr("href"));
            jqUnit.assertEquals("Record Traverser indexTotal", "1 of 1", rt.locate("indexTotal").text());
            jqUnit.assertUndefined("linkPrevious is undefined in the model", rt.model.adjacentRecords.previous);
            jqUnit.assertUndefined("linkNext is undefined in the model", rt.model.adjacentRecords.next);

            sh.set();
            start();
        });
    });

};

jQuery(document).ready(function () {
    rtTester(jQuery);
});