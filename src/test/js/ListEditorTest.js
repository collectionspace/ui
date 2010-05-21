/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/

var listEditorTester = function(){
    fluid.setLogging(true);

    var testUISpec = {};
    $.ajax({
        async: false,
        url: "../../main/webapp/html/uispecs/admin/uispec.json",
        dataType: "json",
        success: function (data) {
            testUISpec = data;
        },
        error: function (xhr, textStatus, error) {
            fluid.log("Unable to load admin uispec for testing");
        }
    });
    var baseTestOpts = {
        baseUrl: "../../main/webapp/html/data/",
        dataContext: {                    
            options: {
                baseUrl: "../../main/webapp/html/data/",
                fileExtension: ".json",
                recordType: "users"
            }
        }
    };
    var testOpts = {};
    var listEditorTest = new jqUnit.TestCase("ListEditor Tests", function () {
        fluid.model.copyModel(testOpts, baseTestOpts);
        listEditorTest.fetchTemplate("../../main/webapp/html/administration.html", ".csc-users-userAdmin");
    });
    
    listEditorTest.test("Initial setup (default strategy: fetch)", function () {
        var listEditor;
        testOpts.list = {
            options: {
                listeners: {
                    afterRender: function(){
                        jqUnit.assertEquals("Model should have right number of entries", 4, listEditor.model.list.length);
                        jqUnit.assertEquals("Model should contain expected entry", "Megan Forbes", listEditor.model.list[1].screenName);
                        jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, $(".csc-recordList-row", "#main").length);
                        jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
                        jqUnit.notVisible("Add new row should be invisible initially", listEditor.options.selectors.newListRow);
                        start();
                    }
                }
            }
        };
        listEditor = cspace.listEditor(".csc-users-userAdmin", "users/records/list.json", testUISpec, testOpts);
        stop();
    });
    
    listEditorTest.test("Initial setup (receive strategy)", function () {
        var listEditor;
        testOpts.listPopulationStrategy = cspace.listEditor.receiveStrategy;
        $.ajax({
            async: false,
            url: "../../main/webapp/html/data/users/records/list.json",
            dataType: "json",
            success: function (data) {testOpts.data = data.items;}
        });
        testOpts.list = {
            options: {
                listeners: {
                    afterRender: function(){
                        jqUnit.assertEquals("Model should have right number of entries", 4, listEditor.model.list.length);
                        jqUnit.assertEquals("Model should contain expected entry", "Megan Forbes", listEditor.model.list[1].screenName);
                        jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, $(".csc-recordList-row", "#main").length);
                        jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
                        jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
                        start();
                    }
                }
            }
        };
        listEditor = cspace.listEditor(".csc-users-userAdmin", "users/records/list.json", testUISpec, testOpts);
        stop();
    });
    
    listEditorTest.test("onSelect: details showing", function () {
        var listEditor;
        var detailsTester = function(){
            jqUnit.isVisible("Details should be visible after activating an item in the list", listEditor.options.selectors.details);
            jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
            jqUnit.isVisible("We can see the details that should be visible on edit", listEditor.options.selectors.hideOnCreate);
            jqUnit.notVisible("We can't see the details that are invisible on edit", listEditor.options.selectors.hideOnEdit);
            jqUnit.assertEquals("Details should be from the correct item", "Megan Forbes", $(".csc-user-userName").val());
            start();
        };
        testOpts.listeners = {
            pageReady: function () {
                listEditor.details.events.afterRender.addListener(detailsTester);
                $(".csc-recordList-row:eq(1)", "#main").click();
            }
        };
        listEditor = cspace.listEditor(".csc-users-userAdmin", "users/records/list.json", testUISpec, testOpts);
        stop();
    });
    
    listEditorTest.test("addNewListRow", function () {
        var listEditor;
        testOpts.listeners = {
            pageReady: function() {
                jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
                jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
                jqUnit.deepEq("Details Model should be empty initially", {}, listEditor.model.details);
                listEditor.addNewListRow();
                jqUnit.isVisible("Details should be visible", listEditor.options.selectors.details);
                jqUnit.isVisible("New Entry row should be visible", listEditor.options.selectors.newListRow);
                jqUnit.deepEq("Details Model should still be empty when trying to create a new row", {}, listEditor.model.details);
                start();
            }
        };
        listEditor = cspace.listEditor(".csc-users-userAdmin", "users/records/list.json", testUISpec, testOpts);
        stop();
    });
    
    listEditorTest.test("addNewListRow after something was selected", function () {
        var listEditor;
        var detailsTester = function(){
            listEditor.details.events.afterRender.removeListener("afterRenderHandler");
            jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
            jqUnit.isVisible("Details should be visible initially", listEditor.options.selectors.details);
            jqUnit.deepEq("Details Model should be empty initially", listEditor.model.list[1], listEditor.model.details);
            listEditor.addNewListRow();
            jqUnit.isVisible("Details should be visible", listEditor.options.selectors.details);
            jqUnit.isVisible("New Entry row should be visible", listEditor.options.selectors.newListRow);
            jqUnit.deepEq("Details Model should still be empty when trying to create a new row", {}, listEditor.model.details);
            start();
        };
        testOpts.listeners = {
            pageReady: function () {
                listEditor.details.events.afterRender.addListener(detailsTester, "afterRenderHandler");
                $(".csc-recordList-row:eq(1)", "#main").click();
            }
        };
        listEditor = cspace.listEditor(".csc-users-userAdmin", "users/records/list.json", testUISpec, testOpts);
        stop();
    });

};

(function () {
    listEditorTester();
}());


