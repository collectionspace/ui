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
    var testData;
    fluid.fetchResources({
        uispec: {
            href: "../uispecs/users.json",
            options: {
                dataType: "json",
                success: function (data) {
                    testUISpec = data;
                },
                async: false
            }
        },
        schema: {
            href: "../../main/webapp/html/data/users/records/list.json",
            options: {
                dataType: "json",
                success: function (data) {
                    testData = data.items;
                },
                async: false
            }
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
    
    var bareListEditorTest = new jqUnit.TestCase("ListEditor Tests", function () {
        bareListEditorTest.fetchTemplate("../../main/webapp/html/administration.html", ".csc-users-userAdmin");
    }, function () {
        $(".ui-dialog").detach();
    });
    
    var listEditorTest = cspace.tests.testEnvironment({testCase: bareListEditorTest});
    
    var basicListEditorSetup = function (callback, opts) {
        var listEditor;
        var testOpts = fluid.copy(baseTestOpts);
        fluid.merge(null, testOpts, opts);
        fluid.model.setBeanValue(testOpts, "listeners", {
            pageReady: function () {
                callback(listEditor);
            }
        });
        listEditor = cspace.listEditor(".csc-users-userAdmin", "users/records/list.json", testUISpec, testOpts);
        stop();
    };
    
    listEditorTest.test("Initial setup (default strategy: fetch)", function () {
        basicListEditorSetup(function (listEditor) {
            jqUnit.assertEquals("Model should have right number of entries", 4, listEditor.model.list.length);
            jqUnit.assertEquals("Model should contain expected entry", "Megan Forbes", listEditor.model.list[1].screenName);
            jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, $(".csc-recordList-row", "#main").length);
            jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
            jqUnit.notVisible("Add new row should be invisible initially", listEditor.options.selectors.newListRow);
            start();
        });
    });
    
    listEditorTest.test("Initial setup (receive strategy)", function () {
        basicListEditorSetup(function (listEditor) {
            jqUnit.assertEquals("Model should have right number of entries", 4, listEditor.model.list.length);
            jqUnit.assertEquals("Model should contain expected entry", "Megan Forbes", listEditor.model.list[1].screenName);
            jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, $(".csc-recordList-row", "#main").length);
            jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
            jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
            start();
        }, {
            listPopulationStrategy: cspace.listEditor.receiveStrategy
        });
    });
    
    listEditorTest.test("onSelect: details showing", function () {
        var detailsTester = function(listEditor){
            return function () {
                listEditor.details.events.afterRender.removeListener("afterRender");
                jqUnit.isVisible("Details should be visible after activating an item in the list", listEditor.options.selectors.details);
                jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
                jqUnit.isVisible("We can see the details that should be visible on edit", listEditor.options.selectors.hideOnCreate);
                jqUnit.notVisible("We can't see the details that are invisible on edit", listEditor.options.selectors.hideOnEdit);
                jqUnit.assertEquals("Details should be from the correct item", "Megan Forbes", $(".csc-user-userName").val());
                start();
            };
        };
        basicListEditorSetup(function (listEditor) {
            listEditor.details.events.afterRender.addListener(detailsTester(listEditor), "afterRender");
            listEditor.list.locate("row").eq(1).click();
        });
    });
    
    listEditorTest.test("addNewListRow", function () {
        basicListEditorSetup(function (listEditor) {
            jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
            jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
            jqUnit.deepEq("Details Model should be empty initially", {}, listEditor.model.details);
            listEditor.addNewListRow();
            jqUnit.isVisible("Details should be visible", listEditor.options.selectors.details);
            jqUnit.isVisible("New Entry row should be visible", listEditor.options.selectors.newListRow);
            jqUnit.deepEq("Details Model should still be empty when trying to create a new row", {}, listEditor.model.details);
            start();
        });
    });
    
    listEditorTest.test("addNewListRow after something was selected", function () {
         var detailsTester = function(listEditor){
            return function () {
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
        };
        basicListEditorSetup(function (listEditor) {
            listEditor.details.events.afterRender.addListener(detailsTester(listEditor), "afterRenderHandler");
            listEditor.list.locate("row").eq(1).click();
        });
    });

};

jQuery(document).ready(function () {
    listEditorTester();
});


