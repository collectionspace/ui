/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/

var adminUsersTester = function () {

	// jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;
    
    var testUISpec = {};
    jQuery.ajax({
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
        recordType: "users/records/list.json",
        uispec: testUISpec,
        userListEditor: {
            options: {
                baseUrl: "../../main/webapp/html/data/"
            }
        }
    };

    var testOpts;

    var adminUsersTest = new jqUnit.TestCase("AdminUsers Tests", function () {
        adminUsersTest.fetchTemplate("../../main/webapp/html/administration.html", ".csc-users-userAdmin");
        testOpts = {};
        fluid.model.copyModel(testOpts, baseTestOpts);
    });
    
    adminUsersTest.test("Creation", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
                jqUnit.assertEquals("User list model should have right number of entries", 4, adminUsers.userListEditor.model.list.length);
                jqUnit.assertEquals("User list model should contain expected user", "Megan Forbes", adminUsers.userListEditor.model.list[1].screenName);
                jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, jQuery(".csc-recordList-row", "#main").length);
                
                //check for details view visibility
                var userListEditorSelectors = adminUsers.userListEditor.options.selectors;
                jqUnit.notVisible("message container is hidden", userListEditorSelectors.messageContainer);
                jqUnit.isVisible("details none is visible", userListEditorSelectors.detailsNone);
                jqUnit.notVisible("details is not visible", userListEditorSelectors.details);
                jqUnit.notVisible("hide on create is hidden", userListEditorSelectors.hideOnCreate);
                jqUnit.notVisible("hide on edit is visible", userListEditorSelectors.hideOnEdit);
                jqUnit.notVisible("new list row is hidden", userListEditorSelectors.newListRow);
                start();
            }
        };
        
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Click new user button", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
                jQuery(adminUsers.userListEditor.options.selectors.addNewListRowButton).click();
                
                jqUnit.assertEquals("Email is blank", jQuery(adminUsers.options.selectors.email).val(), "");
                jqUnit.assertEquals("Full name is blank", jQuery(adminUsers.options.selectors.userName).val(), "");
                jqUnit.assertEquals("Password is blank", jQuery(adminUsers.options.selectors.password).val(), "");
                jqUnit.assertEquals("Password confirm is blank", jQuery(adminUsers.options.selectors.passwordConfirm).val(), "");
                
                var deleteButton = jQuery(adminUsers.userListEditor.details.options.selectors.deleteButton);
                jqUnit.assertTrue("Delete button has deactivated style", deleteButton.hasClass("deactivate"));
                jqUnit.assertTrue("Delete button is disabled", deleteButton.attr("disabled"));
                
                var userListEditorSelectors = adminUsers.userListEditor.options.selectors;
                jqUnit.notVisible("message container is hidden", userListEditorSelectors.messageContainer);
                jqUnit.notVisible("details none is hidden", userListEditorSelectors.detailsNone);
                jqUnit.isVisible("details is visible", userListEditorSelectors.details);
                jqUnit.notVisible("hide on create is hidden", userListEditorSelectors.hideOnCreate);
                jqUnit.isVisible("hide on edit is visible", userListEditorSelectors.hideOnEdit);
                jqUnit.isVisible("new list row is visible", userListEditorSelectors.newListRow);
                start();
            }
        };
        
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });

};

(function () {
    adminUsersTester();
}());

