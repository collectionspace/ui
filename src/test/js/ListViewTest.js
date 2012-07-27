/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var listViewTester = function ($) {
    
    var container = ".listView-container";
    
    var bareListViewTest = new jqUnit.TestCase("List View Tests");
    
    var listViewTest = cspace.tests.testEnvironment({
        testCase: bareListViewTest
    });
    
    var setupListView = function (callbacks, options) {
        options = fluid.merge(null, options || {}, {
            model: {
                sortable: {},
                columns: [{
                    sortable: true,
                    id: "number",
                    name: "listView-number"
                }, {
                    sortable: false,
                    id: "summary",
                    name: "listView-summary"
                }, {
                    sortable: true,
                    id: "summarylist.updatedAt",
                    name: "listView-updatedAt"
                }],
                pagerModel: {
                    pageCount: 1,
                    pageIndex: 0,
                    pageSize: 5,
                    sortDir: 1,
                    sortKey: "",
                    totalRange: 0
                },
                pageSizeList: ["1", "5", "10", "20", "50"]
            },
            recordType: "person",
            elPath: "results",
            nonSortableColumns: {
                person: ["summary", "random-stuff"]
            }
        });
        options.listeners = options.listeners || {};
        fluid.each(callbacks, function (callback, eventName) {
            options.listeners[eventName] = {
                listener: function (listView) {
                    callback(listView);
                },
                priority: eventName.split(".")[1]
            };
        });
        var listView = cspace.listView(container, options);
        return listView;
    };
    
    listViewTest.asyncTest("Init and render", function () {
        expect(31);
        setupListView({
            "afterRender.first": function (listView) {
                var headers = listView["**-renderer-headers-0"],
                    row = listView["**-renderer-row-1"],
                    headersList = headers.locate("header"),
                    columnList = row.locate("column"),
                    child,
                    pageSizeList = $("option", listView.locate("pageSize")),
                    nonSortableColumns = fluid.get(listView.options.nonSortableColumns, listView.options.recordType) || [];

                jqUnit.assertEquals("Headers block is rendered", 1, listView.locate("headers").length);
                jqUnit.assertEquals("Headers block has rsf:id", "header:", listView.locate("headers").attr("rsf:id"));
                jqUnit.assertEquals("Row block has rsf:id", "row:", listView.locate("row").attr("rsf:id"));
                jqUnit.assertEquals("Number of headers is correct", 3, headersList.length);

                fluid.each(listView.model.columns, function (column, index) {
                    jqUnit.assertEquals("Sortable class should match the model", column.sortable, headersList.eq(index).hasClass("flc-pager-sort-header"));
                    child = headersList.eq(index).children();
                    jqUnit.assertEquals("Header column has a proper sorting functionality", column.sortable, $.inArray(column["id"], nonSortableColumns) === -1);
                    jqUnit.assertEquals("Sortable header column should be ", column.sortable ? "A" : "SPAN", child[0].tagName);
                    jqUnit.assertEquals("Header column has rsf:id", column.id, child.attr("rsf:id"));
                });

                fluid.each(listView.model.columns, function (column, index) {
                    child = columnList.eq(index);
                    jqUnit.assertEquals("Header column has rsf:id", column.id, child.attr("rsf:id"));
                });

                jqUnit.assertEquals("Message for show should be", listView.options.parentBundle.messageBase["listView-show"], listView.locate("show").text());
                jqUnit.assertEquals("Message for perPage should be", listView.options.parentBundle.messageBase["listView-perPage"], listView.locate("perPage").text());
                jqUnit.assertEquals("Message for next should be", listView.options.parentBundle.messageBase["listView-next"], listView.locate("next").text());
                jqUnit.assertEquals("Message for previous should be", listView.options.parentBundle.messageBase["listView-previous"], listView.locate("previous").text());

                fluid.each(listView.model.pageSizeList, function (pageSize, index) {
                    jqUnit.assertEquals("Page Size list should contain", pageSize, pageSizeList.eq(index).val());
                });
            }, "afterRender.last": function (listView) {
                jqUnit.assertValue("Page should be initialized", listView.pager);
            }, "afterUpdate.last": function (listView) {
                jqUnit.assertTrue("List should not be empty", listView.model.list.length > 0);
                jqUnit.assertEquals("Number of rows should be equal to the limit per page", listView.model.pagerModel.pageSize, listView.locate("row").length);
                start();
            }
        }, undefined);
    });
};
$(document).ready(function () {
    listViewTester($);
    }
);