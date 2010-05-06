/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/

var listEditorTester = function(){
    var listEditorTest = new jqUnit.TestCase("ListEditor Tests", function () {
        listEditorTest.fetchTemplate("../../main/webapp/html/administration.html", ".csc-users-userAdmin");
    });
    
    listEditorTest.test("Initial setup", function () {
        var testOpts = {
            uispec: {list: {}, details: {}},
            listDataContext: {                    
                options: {
                    baseUrl: "../../main/webapp/html/data",
                    fileExtension: ".json",
                    recordType: "users"
                }
            },
            dataContext: {                    
                options: {
                    baseUrl: "../../main/webapp/html/data",
                    fileExtension: ".json",
                    recordType: "users"
                }
            },
            listeners: {
                afterRender: function () {
                    jqUnit.assertEquals("List should have right number of entries", 4, listEditor.model.list.items.length);
                    jqUnit.assertEquals("List should contain expected entry", "Megan Forbes", listEditor.model.list.items[1].screenName);
                    jqUnit.notVisible("Details should be invisible initially", listEditor.options.selectors.details);
                    listEditor.showDetails(true);
                    jqUnit.isVisible("Details should be visible after showDetails", listEditor.options.selectors.details);
                    jqUnit.notVisible("New Entry row should be invisible initially", listEditor.options.selectors.newListRow);
                    listEditor.showNewListRow(true);
                    jqUnit.isVisible("New Entry row should be visible after showNewListRow true", listEditor.options.selectors.newListRow);
                    listEditor.showNewListRow(false);
                    jqUnit.notVisible("New Entry row should be invisible after showNewListRow false", listEditor.options.selectors.newListRow);
                    start();
                }
            }
        };
        stop();
        var listEditor = cspace.listEditor(".csc-users-userAdmin", testOpts);
    });
};

(function () {
    listEditorTester();
}());


