/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, jqUnit, cspace*/
"use strict";

(function ($) {
    
    var testUISpec = {
        ".csc-recordList-row:": {
            "children": [
                {
                    ".csc-recordList-field1": "${items.0.field1}",
                    ".csc-recordList-field2": "${items.0.field2}"
                }
            ]
        }
    };
    var recordListTest = new jqUnit.TestCase("RecordList Tests", function () {
        cspace.util.isTest = true;
        recordListTest.fetchTemplate("test-data/RecordListTestTemplate.html", ".csc-recordList");
    });

    recordListTest.test("Construction: empty model", function () {
        var testModel = {
            items: [],
            selectionIndex: -1
        };
        var recordList = cspace.recordList("#main", testModel,testUISpec);
        jqUnit.assertDeepEq("RecordList correctly initialized with empty model", testModel, recordList.model);
        jqUnit.assertEquals("Rendered table has no data field visible", 0, $("[class^=csc-recordList-field]", "#main").length);
        jqUnit.isVisible("Rendered table 'no items' row visible", $(".csc-no-items-message", "#main"));
    });

    recordListTest.test("Construction: 3 rows", function () {
        var testModel = {
            items: [
                {field1: "food", field2: "bar"},
                {field1: "good", field2: "bat"},
                {field1: "goop", field2: "cat"}
            ],
            selectionIndex: -1
        };
        var recordList = cspace.recordList("#main", testModel, testUISpec);
        jqUnit.assertDeepEq("RecordList correctly initialized with 3-item model", testModel, recordList.model);
        jqUnit.assertEquals("Rendered table has 3 data rows visible", 3, $(".csc-recordList-row", "#main").length);
        jqUnit.assertEquals("Rendered table 'no items' row not visible", 0, $(".csc-no-items-message", "#main").length);
    });
    
    recordListTest.test("Selecting (no activation)", function () {
        var recordList;
        var testModel = {
            items: [
                {field1: "food", field2: "bar"},
                {field1: "good", field2: "bat"},
                {field1: "goop", field2: "cat"}
            ],
            selectionIndex: -1
        };
        stop();
        recordList = cspace.recordList("#main", testModel, testUISpec);
        jqUnit.assertEquals("Initially, selected index should be correct", -1, recordList.model.selectionIndex);
        jqUnit.assertFalse("Nothing should have selecting class", $(".csc-recordList-row", "#main").hasClass(recordList.options.styles.selecting));
        $(".csc-recordList-row").focus(function (model) {
            jqUnit.assertEquals("After selection, selected index should still be -1", -1, recordList.model.selectionIndex);
            jqUnit.assertTrue("Selecting row should have selecting class", $(".csc-recordList-row:eq(1)", "#main").hasClass(recordList.options.styles.selecting));
            jqUnit.assertFalse("Other row should not have selecting class", $(".csc-recordList-row:eq(0)", "#main").hasClass(recordList.options.styles.selecting));
            start();
        });
        $(".csc-recordList-row:eq(1)", "#main").focus();
    });

    recordListTest.test("Activation via click", function () {
        var recordList;
        var testModel = {
            items: [
                {field1: "food", field2: "bar"},
                {field1: "good", field2: "bat"},
                {field1: "goop", field2: "cat"}
            ],
            selectionIndex: -1
        };
        var opts = {
            listeners: {
                onSelect: function (model) {
                    jqUnit.assertEquals("After activation, selected index should be correct", 1, model.selectionIndex);
                    jqUnit.deepEq("Model of selected index should be correct", testModel.items[1], model.items[model.selectionIndex]);
                    jqUnit.assertTrue("Selected row should have selected class", $(".csc-recordList-row:eq(1)", "#main").hasClass(recordList.options.styles.selected));
                    jqUnit.assertFalse("Unselected row should not have selected class", $(".csc-recordList-row:eq(0)", "#main").hasClass(recordList.options.styles.selected));
                    start();
                }
            }
        };
        stop();
        recordList = cspace.recordList("#main", testModel, testUISpec, opts);
        jqUnit.assertEquals("Initially, selected index should be correct", -1, recordList.model.selectionIndex);
        jqUnit.assertFalse("Nothing should have selected class", $(".csc-recordList-row", "#main").hasClass(recordList.options.styles.selected));
        $(".csc-recordList-row:eq(1)", "#main").click();
    });
})(jQuery);