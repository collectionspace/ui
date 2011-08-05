/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, jqUnit, cspace*/
"use strict";

cspace.test = cspace.test || {};

var recordListTester = function ($) {
    
    var container = "#main";
    
    var bareRecordListTest = new jqUnit.TestCase("Recordlist Tests");
    
    var recordListTest = cspace.tests.testEnvironment({testCase: bareRecordListTest});
    
    var setupRecordList = function (options) {
        return cspace.recordList(container, options);
    };
    
    var validateRows = function (item, columns, row, recordList) {
        fluid.each(columns, function (column, index) {
            jqUnit.assertEquals(column + " for row " + row + " should be", item[column], 
                recordList.locate("row").eq(row).children().eq(index).text());
        });
    };
    var validateRecordList = function (model, columns, recordList) {
        fluid.each(model.items, function (rowValue, row) {
            validateRows(model.items[row], columns, row, recordList);
        });
    };
    
    recordListTest.test("Initialization", function () {
        var model = {
            items: [
                {"number": "ACQ2009.2", "csid": "ACQ2009.2", "summary": "", "recordtype": "acquisition"},
                {"number": "ACQ2009.002.001", "csid": "ACQ2009.002.001", "summary": "Lebowsky", "recordtype": "acquisition"}
            ]
        };
        var columns = ["number", "summary", "recordtype"];
        var recordList = setupRecordList({
            model: model,
            columns: columns,
            elPaths: {
                items: "items"
            },
            strings: {
                number: "Number",
                summary: "Summary",
                recordtype: "Record Type"
            }
        });
        jqUnit.isVisible("Reordlist container should be visible", recordList.container);
        jqUnit.assertEquals("Nothing yet message should be invisible", 0, recordList.locate("nothingYet").length);
        jqUnit.assertEquals("Total number of records should be", model.items.length, recordList.locate("row").length);
        jqUnit.assertEquals("Total number of records should be", model.items.length.toString(), recordList.locate("numberOfItems").text());
        validateRecordList(model, columns, recordList);
        recordList.options.showNumberOfItems = false;
        recordList.renderer.refreshView();
        jqUnit.assertEquals("Total number of records should not be rendered", 0, recordList.locate("numberOfItems").length);
    });
    
    var testEmptyModel = function (message, model) {
        recordListTest.test(message, function () {
            var columns = ["number", "summary", "recordtype"];
            var recordList = setupRecordList({
                model: model,
                columns: columns,
                elPaths: {
                    items: "items"
                }
            });
            jqUnit.isVisible("Nothing yet message should be invisible", recordList.locate("nothingYet"));
            jqUnit.assertEquals("NothingYet text shouls say", recordList.options.strings.nothingYet, recordList.locate("nothingYet").text());
            jqUnit.assertEquals("There should be no records listed", 0, recordList.locate("row").length);
        });
    };
    testEmptyModel("Initialization with empty array model", {items: []});
    testEmptyModel("Initialization with undefined array model", {items: undefined});
    testEmptyModel("Initialization with undefined model", undefined);
    
    cspace.tests.selectNavigate = function (model, options, url) {
        jqUnit.assertEquals("Url should be correct", "this is test url", url);
    };
    
    recordListTest.test("Selecting", function () {
        expect(2);
        var model = {
            items: [
                {"number": "ACQ2009.2", "csid": "ACQ2009.2", "summary": "", "recordtype": "acquisition"},
                {"number": "ACQ2009.002.001", "csid": "ACQ2009.002.001", "summary": "Lebowsky", "recordtype": "acquisition"}
            ]
        };
        var columns = ["number", "summary", "recordtype"];
        var index = 1;
        var recordList = setupRecordList({
            model: model,
            columns: columns,
            elPaths: {
                items: "items"
            },
            strings: {
                number: "Number",
                summary: "Summary",
                recordtype: "Record Type"
            },
            listeners: {
                onSelect: function () {
                    jqUnit.assertEquals("Current selection is", index, recordList.model.selectonIndex);
                }
            },
            urls: {
                navigateLocalTest: "this is test url"
            }
        });
        recordList.locate("row").eq(1).click();
        index = 0;
        recordList.locate("row").eq(0).click();
    });
    
    recordListTest.test("New Row", function () {
        var model = {
            items: [
                {"number": "ACQ2009.2", "csid": "ACQ2009.2", "summary": "", "recordtype": "acquisition"},
                {"number": "ACQ2009.002.001", "csid": "ACQ2009.002.001", "summary": "Lebowsky", "recordtype": "acquisition"}
            ]
        };
        var columns = ["number", "summary", "recordtype"];
        var recordList = setupRecordList({
            model: model,
            columns: columns,
            elPaths: {
                items: "items"
            },
            strings: {
                number: "Number",
                summary: "Summary",
                recordtype: "Record Type"
            },
            urls: {
                navigateLocalTest: "this is test url"
            }
        });
        var newRow = recordList.locate("newRow");
        jqUnit.notVisible("New Row is invisible by default", newRow);
        recordList.handleNewRow("show");
        jqUnit.isVisible("New Row should now be visible", newRow);
        recordList.locate("row").eq(0).click();
        jqUnit.notVisible("New Row should be invisible again", newRow);
    });
};

(function () {
    recordListTester(jQuery);
}());