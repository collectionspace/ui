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

var titlebarTester = function ($) {
    
    var container = "#main";
    
    var bareTitlebarTest = new jqUnit.TestCase("Title Bar Tests");
    
    var titlebarTest = cspace.tests.testEnvironment({testCase: bareTitlebarTest});
    
    var setupTitlebar = function (options) {
        var recordModel = {
            test1: "123",
            test2: "TEST2",
            test3: [{
                value: "rep1"
            }, {
                value: "rep2",
                _primary: true
            }],
            test4: [{
                value: "rep3",
                _primary: true
            },{
                value: "rep4",
                _primary: false
            }],
            test6: [{}],
            test7: "Montgomery Burns",
            test8: "urn:cspace:core.collectionspace.org:personauthorities:name(person):item:name(KenBurns1377635804213)'Ken Burns'"
        };
        var opts = {
            model: {
                recordType: "cataloging"
            },
            recordModel: recordModel,
            recordApplier: fluid.makeChangeApplier(recordModel)
        };
        fluid.merge({
            model: "preserve",
            recordModel: "preserve",
            recordApplier: "preserve"
        }, opts, options);
        return cspace.titleBar(container, opts);
    };
    
    titlebarTest.test("Initialization with no fields", function () {
        expect(1);
        var titleBar = setupTitlebar();
        jqUnit.assertEquals("Record Type should be rendered correctly", "Cataloging", titleBar.locate("recordType").text());
    });
    titlebarTest.test("Initialization with fields", function () {
        expect(1);
        var titleBar = setupTitlebar({
            fields: ["test1", "test2"]
        });
        jqUnit.assertEquals("Record Type should be rendered correctly", "123 - TEST2", titleBar.locate("title").text());
    });
    titlebarTest.test("Initialization with empty fields", function () {
        expect(1);
        var titleBar = setupTitlebar({
            fields: ["test5", {
                type: "repeatableMatch",
                queryPath: "test6",
                childPath: "_primary",
                value: true,
                path: "value"
            }]
        });
        jqUnit.assertEquals("Record Type should be rendered correctly", "", titleBar.locate("title").text());
    });
    titlebarTest.test("Initialization with fields later update", function () {
        expect(5);
        var titleBar = setupTitlebar({
            fields: ["test1", "test2"]
        });
        jqUnit.assertEquals("Record Type should be rendered correctly", "123 - TEST2", titleBar.locate("title").text());
        titleBar.options.recordApplier.requestChange("test1", "NEW_TEST_1");
        jqUnit.assertEquals("Record Type should be rendered correctly", "NEW_TEST_1 - TEST2", titleBar.locate("title").text());
        titleBar.options.recordApplier.requestChange("test2", "NEW_TEST_2");
        jqUnit.assertEquals("Record Type should be rendered correctly", "NEW_TEST_1 - NEW_TEST_2", titleBar.locate("title").text());
        titleBar.options.recordApplier.requestChange("test1", undefined);
        jqUnit.assertEquals("Record Type should be rendered correctly", "NEW_TEST_2", titleBar.locate("title").text());
        titleBar.options.recordApplier.requestChange("test1", "urn:'TEST'");
        jqUnit.assertEquals("Record Type should be rendered correctly", "TEST - NEW_TEST_2", titleBar.locate("title").text());
    });
    titlebarTest.test("Different separators", function () {
        expect(1);
        var titleBar = setupTitlebar({
            fields: ["test1", "test2"],
            separator: ":"
        });
        jqUnit.assertEquals("Record Type should be rendered correctly", "123:TEST2", titleBar.locate("title").text());
    });
    titlebarTest.test("Repeatables in title bar", function () {
        expect(2);
        var titleBar = setupTitlebar({
            fields: [{
                type: "repeatableMatch",
                queryPath: "test3",
                childPath: "_primary",
                value: true,
                path: "value"
            }, {
                type: "repeatableMatch",
                queryPath: "test4",
                childPath: "_primary",
                value: true,
                path: "value"
            }]
        });
        jqUnit.assertEquals("Record Type should be rendered correctly", "rep2 - rep3", titleBar.locate("title").text());
        var repeat = fluid.copy(fluid.get(titleBar.options.recordModel, "test3"));
        repeat[1]._primary = false;
        repeat.push({
            value: "new repeat",
            _primary: true
        });
        titleBar.options.recordApplier.requestChange("test3", repeat);
        jqUnit.assertEquals("Record Type should be rendered correctly", "new repeat - rep3", titleBar.locate("title").text());
    });
    titlebarTest.test("One of Repeatables in title bar", function () {
        expect(1);
        var titleBar = setupTitlebar({
            fields: [{
                type: "repeatableMatch",
                queryPath: "test3",
                childPath: "_primary",
                value: true,
                path: "value"
            }, "test1"]
        });
        jqUnit.assertEquals("Record Type should be rendered correctly", "rep2 - 123", titleBar.locate("title").text());
    });
    // CSPACE-6164
    titlebarTest.test("Strings containing 'urn'", function () {
        expect(1);
        var titleBar = setupTitlebar({
            fields: ["test7", "test8"],
            separator: " - "
        });
        jqUnit.assertEquals("Record Type should be rendered correctly", "Montgomery Burns - Ken Burns", titleBar.locate("title").text());
    });
};

(function () {
    titlebarTester(jQuery);
}());