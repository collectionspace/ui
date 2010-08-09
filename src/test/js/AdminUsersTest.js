/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/
"use strict";

var adminUsersTester = function () {

    // jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;
    
    var testUISpec = {};
    jQuery.ajax({
        async: false,
        url: "../../main/webapp/html/uispecs/users/uispec.json",
        dataType: "json",
        success: function (data) {
            testUISpec = data;
        },
        error: function (xhr, textStatus, error) {
            fluid.log("Unable to load users uispec for testing");
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
                        baseUrl: "../../main/webapp/html/data/",
                        fileExtension: ".json"
                    }
                },
                details: {
                    options: {
                        confirmation: {
                            options: {
                                confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
                            }
                        }
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
        cspace.util.isTest = true;
        jQuery(".ui-dialog").detach();
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
                        csid: "",
                        fields: {
                            account: [],
                            status: "",
                            email: testDataCreateUser.email,
                            screenName: testDataCreateUser.userName,
                            password: testDataCreateUser.validPassword,
                            userId: testDataCreateUser.email
                        },
                        termsUsed: [],
                        relations: {}
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
                
                var saveResult = adminUsers.userListEditor.details.requestSave();
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
                
                var saveResult = adminUsers.userListEditor.details.requestSave();
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
                
                var saveResult = adminUsers.userListEditor.details.requestSave();
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
                
                var saveResult = adminUsers.userListEditor.details.requestSave();
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
                adminUsers.userListEditor.details.events.afterRender.addListener(function () {
                    adminUsers.userListEditor.details.events.afterRender.removeListener("initialSelect");                
                    var saveResult = adminUsers.userListEditor.details.requestSave();
                    jqUnit.assertTrue("Save should succeed (validation should not prevent save)", saveResult);
                    jqUnit.isVisible("message container is visible", userListEditorSelectors.messageContainer);
                    start();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Test search/unsearch functionality", function () {
        var adminUsers;
        testOpts.queryURL = "../../main/webapp/html/data/users/search/list.json";
        testOpts.listeners = {
            afterSearch: function () {
                jqUnit.isVisible("Unsearch is visible after search", adminUsers.options.selectors.unSearchButton);
                jqUnit.assertEquals("There are 2 users in the list after search", 2, adminUsers.userListEditor.model.list.length);
                adminUsers.userListEditor.list.events.afterRender.addListener(function () {
                    jqUnit.notVisible("Unsearch is invisible after unsearch", adminUsers.options.selectors.unSearchButton);
                    jqUnit.assertEquals("There are 4 users in the list after unsearch", 4, adminUsers.userListEditor.model.list.length);
                });
                adminUsers.locate("unSearchButton").click();
                start();
            },
            afterRender: function () {               
                jqUnit.assertEquals("Initially there are 4 users in the list", 4, adminUsers.userListEditor.model.list.length);
                jqUnit.notVisible("Unsearch is invisible initially", adminUsers.options.selectors.unSearchButton);
                adminUsers.dom.locate("searchField").val("test");
                jqUnit.assertEquals("Value in seatch fiels is 'test'", "test", adminUsers.dom.locate("searchField").val());
                adminUsers.locate("searchButton").click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Confirmation", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
                adminUsers.userListEditor.details.events.afterRender.addListener(function () {
                    adminUsers.userListEditor.details.events.afterRender.removeListener("initialSelect");
                    jqUnit.assertEquals("Selected username is", "Anastasia Cheethem", adminUsers.locate("userName").val());
                    jqUnit.notVisible("Confiration dialog is invisible initially", adminUsers.userListEditor.details.confirmation.dlg);
                    adminUsers.locate("userName").val("New Name").change();
                    adminUsers.userListEditor.details.confirmation.events.afterOpen.addListener(function () {
                        jqUnit.isVisible("Confiration dialog should now be visible", adminUsers.userListEditor.details.confirmation.dlg);
                    });
                    jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[1]).click();
                    start();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Confirmation cancel", function () {
        var adminUsers;
        testOpts.listeners = {
            afterRender: function () {
                adminUsers.userListEditor.details.events.afterRender.addListener(function () {
                    adminUsers.userListEditor.details.events.afterRender.removeListener("initialSelect");                    
                    adminUsers.locate("userName").val("New Name").change();
                    adminUsers.userListEditor.details.confirmation.events.afterOpen.addListener(function () {
                        adminUsers.userListEditor.details.confirmation.events.afterClose.addListener(function () {
                            jqUnit.notVisible("Confiration dialog is now invisible", adminUsers.userListEditor.details.confirmation.dlg);
                            jqUnit.assertEquals("User Name should still be", "New Name", adminUsers.locate("userName").val());
                        });
                        adminUsers.userListEditor.details.confirmation.locate("cancel", adminUsers.userListEditor.details.confirmation.dlg).click();                        
                    });
                    jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[1]).click();
                    start();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Confirmation proceed", function () {
        var adminUsers;
        testOpts.userListEditor.options.details.options.confirmation.options.listeners = {
            afterFetchTemplate: function () {
                var re = adminUsers.userListEditor.details;
                re.events.afterRender.addListener(function () {
                    re.events.afterRender.removeListener("initialSelect");                    
                    adminUsers.locate("userName").val("New Name").change();
                    jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[1]).click();
                    re.events.afterRender.addListener(function () {
                        jqUnit.notVisible("Confiration dialog is now invisible", re.confirmation.dlg);
                        jqUnit.assertEquals("User Name should now be", "Megan Forbes", adminUsers.locate("userName").val());
                        start();
                    });
                    re.confirmation.locate("proceed", re.confirmation.dlg).click();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Confirmation delete", function () {
        var adminUsers;
        testOpts.userListEditor.options.details.options.confirmation.options.listeners = {
            afterFetchTemplate: function () {
                var re = adminUsers.userListEditor.details;
                re.events.afterRender.addListener(function () {
                    re.events.afterRender.removeListener("initialSelect");
                    re.remove();
                    jqUnit.assertEquals("Confirmation Text Should Say", "Delete this record?", re.confirmation.locate("message:", re.confirmation.dlg).text());
                    jqUnit.isVisible("Delete button should be visible", re.confirmation.locate("act", re.confirmation.dlg));
                    jqUnit.isVisible("Cancel button should be visible", re.confirmation.locate("cancel", re.confirmation.dlg));
                    jqUnit.assertEquals("Proceed / Don't Save button should not be rendered", 0, re.confirmation.locate("proceed", re.confirmation.dlg).length);
                    start();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Confirmation delete + cancel", function () {
        var adminUsers;
        testOpts.userListEditor.options.details.options.confirmation.options.listeners = {
            afterFetchTemplate: function () {
                var re = adminUsers.userListEditor.details;
                re.events.afterRender.addListener(function () {
                    re.events.afterRender.removeListener("initialSelect");
                    re.remove();
                    jqUnit.assertEquals("Selected username is", "Anastasia Cheethem", adminUsers.locate("userName").val());
                    jqUnit.isVisible("Confirmation Dialog is now visible", jQuery(".csc-confirmationDialog"));
                    re.confirmation.locate("cancel", re.confirmation.dlg).click();
                    jqUnit.notVisible("Confirmation Dialog is now invisible", jQuery(".csc-confirmationDialog"));
                    jqUnit.assertEquals("Selected username is still", "Anastasia Cheethem", adminUsers.locate("userName").val());
                    start();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Confirmation delete + proceed", function () {
        var adminUsers;
        testOpts.userListEditor.options.details.options.confirmation.options.listeners = {
            afterFetchTemplate: function () {
                var re = adminUsers.userListEditor.details;
                re.events.afterRender.addListener(function () {
                    re.events.afterRender.removeListener("initialSelect");
                    re.remove();
                    jqUnit.assertEquals("Selected username is", "Anastasia Cheethem", adminUsers.locate("userName").val());                        
                    re.dataContext.events.afterRemove.addListener(function () {                        
                        jqUnit.assertTrue("Successfully executed remove", true);
                        jqUnit.notVisible("Confirmation Dialog is now invisible", jQuery(".csc-confirmationDialog"));
                        jqUnit.notVisible("No record selected", adminUsers.locate("userName"));
                        start();
                    });
                    re.confirmation.locate("act", re.confirmation.dlg).click();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Confirmation navigate + delete", function () {
        var adminUsers;
        testOpts.userListEditor.options.details.options.confirmation.options.listeners = {
            afterFetchTemplate: function () {
                var re = adminUsers.userListEditor.details;
                re.events.afterRender.addListener(function () {
                    re.events.afterRender.removeListener("initialSelect");                    
                    adminUsers.locate("userName").val("New Name").change();
                    jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[1]).click();
                    jqUnit.assertEquals("Confirmation Text Should Say", "You are about to leave this record.", re.confirmation.locate("message:", re.confirmation.dlg).eq(0).text());
                    jqUnit.assertEquals("Confirmation Text Should Say", "Save Changes?", re.confirmation.locate("message:", re.confirmation.dlg).eq(1).text());
                    re.confirmation.close();
                    re.remove();
                    jqUnit.assertEquals("Confirmation Text Should Say", "Delete this record?", re.confirmation.locate("message:", re.confirmation.dlg).text());
                    start();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("Confirmation delete + navigate", function () {
        var adminUsers;
        testOpts.userListEditor.options.details.options.confirmation.options.listeners = {
            afterFetchTemplate: function () {
                var re = adminUsers.userListEditor.details;
                re.events.afterRender.addListener(function () {
                    re.events.afterRender.removeListener("initialSelect");                    
                    re.remove();
                    jqUnit.assertEquals("Confirmation Text Should Say", "Delete this record?", re.confirmation.locate("message:", re.confirmation.dlg).text());
                    re.confirmation.close();
                    adminUsers.locate("userName").val("New Name").change();
                    jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[1]).click();
                    jqUnit.assertEquals("Confirmation Text Should Say", "You are about to leave this record.", re.confirmation.locate("message:", re.confirmation.dlg).eq(0).text());
                    jqUnit.assertEquals("Confirmation Text Should Say", "Save Changes?", re.confirmation.locate("message:", re.confirmation.dlg).eq(1).text());                    
                    start();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
    
    adminUsersTest.test("No Confirmation on navigation away after canceled changes", function () {
        var adminUsers;
        testOpts.userListEditor.options.details.options.confirmation.options.listeners = {
            afterFetchTemplate: function () {
                var re = adminUsers.userListEditor.details;
                re.events.afterRender.addListener(function () {
                    re.events.afterRender.removeListener("initialSelect");                    
                    adminUsers.locate("userName").val("New Name").change();
                    jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[1]).click();
                    jqUnit.isVisible("Navigating without cancelling, confirmation should be visible", jQuery(".csc-confirmationDialog"));
                    jqUnit.assertEquals("Confirmation Text Should Say", "You are about to leave this record.", re.confirmation.locate("message:", re.confirmation.dlg).eq(0).text());
                    jqUnit.assertEquals("Confirmation Text Should Say", "Save Changes?", re.confirmation.locate("message:", re.confirmation.dlg).eq(1).text());
                    re.confirmation.close();
                    re.locate("cancel").click();                    
                    jqUnit.notVisible("After cancelling, user details should now be hidden", adminUsers.userListEditor.locate("details"));
                    jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[1]).click();
                    jqUnit.notVisible("Navigating away, there should be no visible confirmation", jQuery(".csc-confirmationDialog"));
                    start();
                }, "initialSelect");
                jQuery(jQuery(adminUsers.userListEditor.list.options.selectors.row)[2]).click();
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        stop();
    });
};

(function () {
    adminUsersTester();
}());
