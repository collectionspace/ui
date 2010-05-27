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
    			baseUrl: "../../main/webapp/html/data/",
                dataContext: {
                    options: {
                        baseUrl: "../../main/webapp/html/data/"
                    }
                }
            }
        }
    };

    var testOpts;
    var testDataCreateUser = {
    	email: "rj@dio.com",
    	userName: "R J Dio",
    	validPassword: "123456789",
    	invalidPassword: "123"
    };

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
        		var userListEditorSelectors = adminUsers.userListEditor.options.selectors;
                jQuery(userListEditorSelectors.addNewListRowButton).click();
                
                var adminUsersSelectors = adminUsers.options.selectors;                
                jqUnit.assertEquals("Email is blank", jQuery(adminUsersSelectors.email).val(), "");
                jqUnit.assertEquals("Full name is blank", jQuery(adminUsersSelectors.userName).val(), "");
                jqUnit.assertEquals("Password is blank", jQuery(adminUsersSelectors.password).val(), "");
                jqUnit.assertEquals("Password confirm is blank", jQuery(adminUsersSelectors.passwordConfirm).val(), "");
                
                var deleteButton = jQuery(adminUsers.userListEditor.details.options.selectors.deleteButton);
                jqUnit.assertTrue("Delete button has deactivated style", deleteButton.hasClass("deactivate"));
                jqUnit.assertTrue("Delete button is disabled", deleteButton.attr("disabled"));
                
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
    
    adminUsersTest.test("Save new user - successful ajax call", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
            	jQuery(adminUsers.userListEditor.options.selectors.addNewListRowButton).click();
                
                var adminUsersSelectors = adminUsers.options.selectors;                
                jQuery(adminUsersSelectors.email).val(testDataCreateUser.email).change();
                jQuery(adminUsersSelectors.userName).val(testDataCreateUser.userName).change();
                jQuery(adminUsersSelectors.password).val(testDataCreateUser.validPassword).change();
                jQuery(adminUsersSelectors.passwordConfirm).val(testDataCreateUser.validPassword).change();
                
                var ajaxMock = new jqMock.Mock(jQuery, "ajax");
                var expectedAjaxParams = {
                    url: "../../main/webapp/html/data/users/",
                    dataType: "json",
                    type: "POST",
                    data: JSON.stringify({
               			fields: {
               				status: "",
               				email: testDataCreateUser.email,
               				screenName: testDataCreateUser.userName,
               				password: testDataCreateUser.validPassword,
               				passwordConfirm: testDataCreateUser.validPassword,
               				userId: testDataCreateUser.email
               			},
               			csid: ""
               		})
                };
                
                ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams));               
                jQuery(adminUsers.userListEditor.details.options.selectors.save).click();
                              
                ajaxMock.verify();              
                ajaxMock.restore();
                                               
                start();
            }
        };
        
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Save new user - successful save - save function returns true", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
                jQuery(adminUsers.userListEditor.options.selectors.addNewListRowButton).click();
                
                var adminUsersSelectors = adminUsers.options.selectors;                
                jQuery(adminUsersSelectors.email).val(testDataCreateUser.email).change();
                jQuery(adminUsersSelectors.userName).val(testDataCreateUser.userName).change();
                jQuery(adminUsersSelectors.password).val(testDataCreateUser.validPassword).change();
                jQuery(adminUsersSelectors.passwordConfirm).val(testDataCreateUser.validPassword).change();
                
                var saveResult = adminUsers.userListEditor.details.save();
                jqUnit.assertTrue("details.save returns true for successful save", saveResult);
                               
                start();
            }
        };
        
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });  
    
    adminUsersTest.test("Save new user - empty form field - expect save to return false", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
        		var userListEditorSelectors = adminUsers.userListEditor.options.selectors;
                jQuery(userListEditorSelectors.addNewListRowButton).click();
                
                var adminUsersSelectors = adminUsers.options.selectors;                
                jQuery(adminUsersSelectors.userName).val(testDataCreateUser.userName).change();
                jQuery(adminUsersSelectors.password).val(testDataCreateUser.validPassword).change();
                jQuery(adminUsersSelectors.passwordConfirm).val(testDataCreateUser.validPassword).change();
                
                var saveResult = adminUsers.userListEditor.details.save();
                jqUnit.assertFalse("details.save returns false if passwords do not match", saveResult);
                jqUnit.isVisible("message container is visible", userListEditorSelectors.messageContainer);

                start();
            }
        };
        
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Save new user - mismatched passwords - expect save to return false", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
        		var userListEditorSelectors = adminUsers.userListEditor.options.selectors;
                jQuery(userListEditorSelectors.addNewListRowButton).click();
                
                var adminUsersSelectors = adminUsers.options.selectors;                
                jQuery(adminUsersSelectors.email).val(testDataCreateUser.email).change();
                jQuery(adminUsersSelectors.userName).val(testDataCreateUser.userName).change();
                jQuery(adminUsersSelectors.password).val(testDataCreateUser.validPassword).change();
                jQuery(adminUsersSelectors.passwordConfirm).val("1234567890").change();
                
                var saveResult = adminUsers.userListEditor.details.save();
                jqUnit.assertFalse("details.save returns false if passwords do not match", saveResult);
                jqUnit.isVisible("message container is visible", userListEditorSelectors.messageContainer);

                start();
            }
        };
        
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });  

    adminUsersTest.test("Save new user - invalid length passwords - expect save to return false", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
        		var userListEditorSelectors = adminUsers.userListEditor.options.selectors;
                jQuery(userListEditorSelectors.addNewListRowButton).click();
                
                var adminUsersSelectors = adminUsers.options.selectors;                
                jQuery(adminUsersSelectors.email).val(testDataCreateUser.email).change();
                jQuery(adminUsersSelectors.userName).val(testDataCreateUser.userName).change();
                jQuery(adminUsersSelectors.password).val(testDataCreateUser.invalidPassword).change();
                jQuery(adminUsersSelectors.passwordConfirm).val(testDataCreateUser.invalidPassword).change();
                
                var saveResult = adminUsers.userListEditor.details.save();
                jqUnit.assertFalse("details.save returns false if passwords are invalid", saveResult);
                jqUnit.isVisible("message container is visible", userListEditorSelectors.messageContainer);

                start();
            }
        };
        
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });    
    
    adminUsersTest.test("Valid edit of existing user: save should succeed", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
                
                var userListEditorSelectors = adminUsers.userListEditor.options.selectors;
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
                
                var saveResult = adminUsers.userListEditor.details.save();
                jqUnit.assertTrue("Save should succeed (validation should not prevent save)", saveResult);
                jqUnit.isVisible("message container is visible", userListEditorSelectors.messageContainer);

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
