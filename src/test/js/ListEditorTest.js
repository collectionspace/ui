/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/

var listEditorTester = function(){
    fluid.setLogging(true);

    var schema, uispec;
    fluid.fetchResources({
        uispec: {
            href: "../uispecs/users.json",
            options: {
                dataType: "json",
                success: function (data) {
                    uispec = data;
                },
                async: false
            }
        },
        schema: {
            href: "../uischema/users.json",
            options: {
                dataType: "json",
                success: function (data) {
                    schema = data;
                },
                async: false
            }
        }
    });
        
    var baseTestOpts = {
        components: {
            detailsDC: {
                options: {
                    recordType: "users",
                    schema: schema
                } 
            },
            globalNavigator: {
                type: "cspace.util.globalNavigator",
            }
        },
        uispec: uispec,
        recordType: "users/records.json"
    };
    
    var bareListEditorTest = new jqUnit.TestCase("ListEditor Tests", function () {
        bareListEditorTest.fetchTemplate("../../main/webapp/html/administration.html", ".csc-users-userAdmin");
    }, function () {
        $(".ui-dialog").detach();
    });
    
    fluid.defaults("cspace.tests.pageBuilderIO", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        recordType: "users"
    });
    var listEditorTest = cspace.tests.testEnvironment({testCase: bareListEditorTest, components: {
        pageBuilderIO: {
            type: "cspace.tests.pageBuilderIO"
        }
    }});
    
    var basicListEditorSetup = function (callback, opts) {
        var listEditor;
        var testOpts = fluid.copy(baseTestOpts);
        fluid.merge(null, testOpts, opts);
        fluid.model.setBeanValue(testOpts, "listeners", {
            pageReady: function () {
                callback(listEditor);
            }
        });
        fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.users");
        listEditor = cspace.listEditor(".csc-users-userAdmin", testOpts);
        stop();
    };
    
    listEditorTest.test("Initial setup", function () {
        basicListEditorSetup(function (listEditor) {
            jqUnit.assertEquals("Model should have right number of entries", 4, listEditor.list.model.items.length);
            jqUnit.assertEquals("Model should contain expected entry", "Megan Forbes", listEditor.list.model.items[1].screenName);
            jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, $(".csc-recordList-row", "#main").length);
            jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
            jqUnit.notVisible("Add new row should be invisible initially", listEditor.list.options.selectors.newRow);
            start();
        });
    });
    
    listEditorTest.test("onSelect: details showing", function () {
        var detailsTester = function(listEditor){
            return function () {
                listEditor.events.afterShowDetails.removeListener("afterRender");
                jqUnit.isVisible("Details should be visible after activating an item in the list", listEditor.options.selectors.details);
                jqUnit.notVisible("New Entry row should be invisible initially", listEditor.list.options.selectors.newRow);
                jqUnit.isVisible("We can see the details that should be visible on edit", listEditor.options.selectors.hideOnCreate);
                jqUnit.notVisible("We can't see the details that are invisible on edit", listEditor.options.selectors.hideOnEdit);
                jqUnit.assertEquals("Details should be from the correct item", "Megan Forbes", $(".csc-user-userName").val());
                start();
            };
        };
        basicListEditorSetup(function (listEditor) {
            listEditor.events.afterShowDetails.addListener(detailsTester(listEditor), "afterRender");
            listEditor.list.locate("row").eq(1).click();
        });
    });
    
    listEditorTest.test("addNewListRow", function () {
        basicListEditorSetup(function (listEditor) {
            jqUnit.notVisible("New Entry row should be invisible initially", listEditor.list.options.selectors.newRow);
            jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
            jqUnit.deepEq("Details Model should be empty initially", {}, listEditor.details.model);
            listEditor.addNewListRow();
            jqUnit.isVisible("Details should be visible", listEditor.options.selectors.details);
            jqUnit.isVisible("New Entry row should be visible", listEditor.list.options.selectors.newRow);
            jqUnit.assertValue("Details Model should be drawn from the schema", listEditor.details.model);
            jqUnit.assertValue("Details Model should be drawn from the schema: termsUsed", listEditor.details.model.termsUsed);
            jqUnit.assertEquals("Details Model should be drawn from the schema: termsUsed length", 0, listEditor.details.model.termsUsed.length);
            jqUnit.assertValue("Details Model should be drawn from the schema: relations", listEditor.details.model.relations);
            jqUnit.assertEquals("Details Model should be drawn from the schema: status", "Active", listEditor.details.model.fields.status);
            jqUnit.assertEquals("Details Model should be drawn from the schema: role", 3, listEditor.details.model.fields.role.length);
            start();
        });
    });
    
    listEditorTest.test("addNewListRow after something was selected", function () {
         var detailsTester = function(listEditor){
            return function () {
                listEditor.events.afterShowDetails.removeListener("afterRenderHandler");
                jqUnit.notVisible("New Entry row should be invisible initially", listEditor.list.options.selectors.newRow);
                jqUnit.isVisible("Details should be visible initially", listEditor.options.selectors.details);
                jqUnit.assertEquals("Details Model should be empty initially", listEditor.list.model.items[1].csid, listEditor.details.model.csid);
                listEditor.addNewListRow();
                jqUnit.isVisible("Details should be visible", listEditor.options.selectors.details);
                jqUnit.isVisible("New Entry row should be visible", listEditor.list.options.selectors.newRow);
                jqUnit.assertUndefined("Details Model should be 'new' when trying to create a new row", listEditor.details.model.csid);
                start();
            };
        };
        basicListEditorSetup(function (listEditor) {
            listEditor.events.afterShowDetails.addListener(detailsTester(listEditor), "afterRenderHandler");
            listEditor.list.locate("row").eq(1).click();
        });
    });

};

jQuery(document).ready(function () {
    listEditorTester();
});


