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
    var testOpts = {
        baseUrl: "../../main/webapp/html/data/",
        dataContext: {                    
            options: {
                baseUrl: "../../main/webapp/html/data/",
                fileExtension: ".json",
                recordType: "users"
            }
        }
    };

    var listEditorTest = new jqUnit.TestCase("ListEditor Tests", function () {
        listEditorTest.fetchTemplate("../../main/webapp/html/administration.html", ".csc-users-userAdmin");
    });
    
    listEditorTest.test("Initial setup", function () {
        var listEditor = cspace.listEditor(".csc-users-userAdmin", "users/records/list.json", testUISpec, testOpts);
        jqUnit.assertEquals("Model should have right number of entries", 4, listEditor.model.list.length);
        jqUnit.assertEquals("Model should contain expected entry", "Megan Forbes", listEditor.model.list[1].screenName);
        jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, $(".csc-recordList-row", "#main").length);
        jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
        listEditor.showDetails(true);
        jqUnit.isVisible("Details should be visible after showDetails", listEditor.options.selectors.details);
        jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
        listEditor.showNewListRow(true);
        jqUnit.isVisible("New Entry row should be visible after showNewListRow true", listEditor.options.selectors.newListRow);
        listEditor.showNewListRow(false);
        jqUnit.notVisible("New Entry row should be invisible after showNewListRow false", listEditor.options.selectors.newListRow);
    });
    
    listEditorTest.test("onSelect", function () {
        var listEditor;
        listEditor = cspace.listEditor(".csc-users-userAdmin", "users/records/list.json", testUISpec, testOpts);
        listEditor.events.afterRender.addListener(function () {
            jqUnit.isVisible("Details should be visible after activating an item in the list", listEditor.options.selectors.details);
            jqUnit.assertEquals("Details should be from the correct item", "Megan Forbes", $(".csc-user-userName").val());
            start();
        });
        stop();
        $(".csc-recordList-row:eq(1)", "#main").click();
    });

};

(function () {
    listEditorTester();
}());


