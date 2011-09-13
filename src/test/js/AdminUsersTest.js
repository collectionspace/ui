/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

var adminUsersTester = function () {

    var testUISpec = {};
    var schema = {};
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
        recordType: "users",
        uispec: testUISpec,
        components: {
            globalNavigator: {
                type: "cspace.util.globalNavigator",
            },
            adminListEditor: {
                options: {
                    components: {
                        detailsDC: {
                            options: {
                                schema: schema
                            } 
                        },
                        details: {
                            options: {
                                navigationEventNamespace: "onPerformNavigationRecordEditor"
                            }
                        }
                    }
                }
            },
            passwordValidator: {
                type: "cspace.passwordValidator"
            }
        },
        login: cspace.util.login(cspace.tests.userLogin),
        queryURL: "../../../chain/users/search?query=",
        events: {
            afterTreeRender: null,
            afterSetup: null
        },
        selectorsToIgnore: ["searchField", "deleteButton", "searchButton", "unSearchButton", "userId", "email", "userName", "password", "passwordConfirm"],
        selectors: {
            searchField: ".csc-user-searchField",
            deleteButton: ".csc-delete",
            searchButton: ".csc-user-searchButton",
            unSearchButton: ".csc-user-unSearchButton",
            userId: ".csc-user-userID",
            email: ".csc-user-email",
            userName: ".csc-user-userName",
            password: ".csc-user-password",
            passwordConfirm: ".csc-user-passwordConfirm"
        },
        invokers: {
            validate: {
                funcName: "cspace.admin.validate",
                args: ["{admin}.adminListEditor.options.messageBar", "{admin}.dom", "{admin}.adminListEditor.options.detailsApplier", "{admin}.passwordValidator", "{admin}.options.strings"]
            },
            bindEvents: {
                funcName: "cspace.admin.bindEventHandlers",
                args: "{admin}"
            }
        },
        finalInitFunction: "cspace.admin.finalInit"
    };
    
    var testDataCreateUser = {
        email: "rj@dio.com",
        userName: "R J Dio",
        validPassword: "123456789",
        invalidPassword: "123"
    };
    
    cspace.tests.onTearDown = fluid.event.getEventFirer();
    
    cspace.tests.updateListUsers = function (that, searchField, callback) {
        callback = (typeof callback === "function") ? callback : function (listModel) {
            that.list.applier.requestChange(that.list.options.elPaths.items, listModel[that.list.options.elPaths.items] || listModel.results);
            that.refreshView();
        };
        that.events.onListUpdate.fire();
        var query = searchField.val();
        that[query ? "listSearchSource" : "listSource"].get({
            recordType: that.options.recordType
        }, callback);
    };

    var bareAdminUsersTest = new jqUnit.TestCase("AdminUsers Tests", function () {
        bareAdminUsersTest.fetchTemplate("../../main/webapp/defaults/html/pages/Administration-users.html", ".csc-admin-users");
        cspace.tests.onTearDown.addListener(function (re) {
            re.options.globalNavigator.events.onPerformNavigation.removeListener("onPerformNavigationRecordEditor");
            re.confirmation.popup.dialog("destroy").remove();
        }, "tearDown");
    }, cspace.tests.onTearDown.removeListener("tearDown"));
    
    fluid.defaults("cspace.tests.pageBuilderIO", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        recordType: "users"
    });
    var adminUsersTest = cspace.tests.testEnvironment({testCase: bareAdminUsersTest, components: {
        pageBuilderIO: {
            type: "cspace.tests.pageBuilderIO"
        }
    }});
    
    var changeDetails = function (adminUsersSelectors, testDataCreateUser, confPassword) {
        jQuery(adminUsersSelectors.email).val(testDataCreateUser.email).change();
        jQuery(adminUsersSelectors.userName).val(testDataCreateUser.userName).change();
        jQuery(adminUsersSelectors.password).val(testDataCreateUser.validPassword).change();
        jQuery(adminUsersSelectors.passwordConfirm).val(confPassword).change();
    };
    
    var basicAdminUsersSetup = function (callback, opts) {
        var adminUsers;
        var testOpts = fluid.copy(baseTestOpts);
        fluid.merge(null, testOpts, opts);
        fluid.model.setBeanValue(testOpts, "listeners", {
            afterTreeRender: function () {
                callback(adminUsers, adminUsers.adminListEditor, adminUsers.adminListEditor.details);
            }
        });
        fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.users");
        fluid.staticEnvironment.cspaceTestEnv = fluid.typeTag("cspace.userAdminTests");
        adminUsers = cspace.admin(".csc-admin-users", testOpts);
    };
    
    var setupSaveNewUserInvalidPassword = function (confPassword, message) {
        basicAdminUsersSetup(function (adminUsers, le, re) {
            le.events.afterAddNewListRow.addListener(function () {
                changeDetails(adminUsers.options.selectors, testDataCreateUser, confPassword);
                var saveResult = re.requestSave();
                jqUnit.assertFalse("details.save returns false if " + message, saveResult);
                jqUnit.isVisible("message container is visible", le.options.messageBar.container);
                cspace.tests.onTearDown.fire(re);
                start();
            });
            le.locate("addNewListRowButton").click();
        });
    };
    
    adminUsersTest.asyncTest("Creation", function () {
        basicAdminUsersSetup(function (adminUsers, le, re) {
            var list =le.list.model.items;
            var selectors = le.options.selectors;
            jqUnit.assertEquals("User list model should have right number of entries", 4, list.length);
            jqUnit.assertEquals("User list model should contain expected user", "Megan Forbes", list[1].screenName);
            jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, le.list.locate("row").length);
            jqUnit.notVisible("message container is hidden", le.options.messageBar.container);
            jqUnit.isVisible("details none is visible", selectors.detailsNone);
            jqUnit.notVisible("details is not visible", selectors.details);
            jqUnit.notVisible("hide on edit is visible", selectors.hideOnEdit);
            jqUnit.notVisible("new list row is hidden", le.list.options.selectors.newRow);
            cspace.tests.onTearDown.fire(re);
            start();
        });
    });
    
    adminUsersTest.asyncTest("Click new user button", function () {
        basicAdminUsersSetup(function (adminUsers, le, re) {
            var selectors = le.options.selectors;
            le.events.afterShowDetails.addListener(function () {
                jqUnit.assertEquals("Email is blank", adminUsers.locate("email").val(), "");
                jqUnit.assertEquals("Full name is blank", adminUsers.locate("userName").val(), "");
                jqUnit.assertEquals("Password is blank", adminUsers.locate("password").val(), "");
                jqUnit.assertEquals("Password confirm is blank", adminUsers.locate("passwordConfirm").val(), "");
                jqUnit.assertTrue("Delete button is disabled", re.locate("deleteButton").attr("disabled"));
                jqUnit.notVisible("message container is hidden", le.options.messageBar.container);
                jqUnit.notVisible("details none is hidden", selectors.detailsNone);
                jqUnit.isVisible("details is visible", selectors.details);
                jqUnit.isVisible("hide on edit is visible", selectors.hideOnEdit);
                jqUnit.isVisible("new list row is visible", le.list.options.selectors.newRow);
                cspace.tests.onTearDown.fire(re);
                start();
            });
            le.locate("addNewListRowButton").click();
        });
    });
        
    adminUsersTest.asyncTest("Save new user - successful save - save function returns true", function () {
        basicAdminUsersSetup(function (adminUsers, le, re) {
            le.events.afterAddNewListRow.addListener(function () {
                changeDetails(adminUsers.options.selectors, testDataCreateUser, testDataCreateUser.validPassword);
                var preSaveResult = re.events.onSave.fire(re.model);
                jqUnit.assertNotEquals("details.save returns true for successful save", preSaveResult, false);
                cspace.tests.onTearDown.fire(re);
                start();
            });
            le.locate("addNewListRowButton").click();
        });
    });  
    
    adminUsersTest.asyncTest("Save new user - empty form field - expect save to return false", function () {
        basicAdminUsersSetup(function (adminUsers, le, re) {
            le.events.afterAddNewListRow.addListener(function () {
                changeDetails(adminUsers.options.selectors, testDataCreateUser, testDataCreateUser.validPassword);
                adminUsers.locate("email").val("").change();
                var saveResult = re.requestSave();
                jqUnit.assertFalse("details.save returns false if passwords do not match", saveResult);
                jqUnit.isVisible("message container is visible", le.options.messageBar.container);
                cspace.tests.onTearDown.fire(re);
                start();
            });
            le.locate("addNewListRowButton").click();
        });
    });
    
    adminUsersTest.asyncTest("Save new user - mismatched passwords - expect save to return false", function () {
        setupSaveNewUserInvalidPassword("1234567890", "passwords do not match");
    });  

    adminUsersTest.asyncTest("Save new user - invalid length passwords - expect save to return false", function () {
        setupSaveNewUserInvalidPassword(testDataCreateUser.invalidPassword, "passwords are invalid");
    });    
    
    adminUsersTest.asyncTest("Valid edit of existing user: save should succeed", function () {
        basicAdminUsersSetup(function (adminUsers, le, re) {
            le.events.afterShowDetails.addListener(function () {
                le.events.afterShowDetails.removeListener("initialSelect");
                re.options.dataContext.events.afterSave.addListener(function () {
                    jqUnit.assertTrue("Save should succeed (validation should not prevent save)", saveResult);
                    jqUnit.isVisible("message container is visible", le.options.messageBar.container);
                    cspace.tests.onTearDown.fire(re);
                    start();
                });      
                var saveResult = re.requestSave();
            }, "initialSelect");
            adminUsers.adminListEditor.list.locate("row").eq(2).click();
        });
    });
    
    adminUsersTest.asyncTest("Test search/unsearch functionality", function () {
        var adminUsers;
        var testOpts = fluid.copy(baseTestOpts);
        fluid.model.setBeanValue(testOpts, "queryURL", "../data/users/search.json");
        fluid.model.setBeanValue(testOpts, "components.adminListEditor.options.listeners", {
            "afterListUpdate.initalEvent": function () {
                adminUsers.adminListEditor.events.afterListUpdate.removeListener("initalEvent");
                jqUnit.assertEquals("Initially there are 4 users in the list", 4, adminUsers.adminListEditor.list.model.items.length);
                jqUnit.notVisible("Unsearch is invisible initially", adminUsers.options.selectors.unSearchButton);
                adminUsers.locate("searchField").val("test").change();
                jqUnit.assertEquals("Value in seatch fiels is 'test'", "test", adminUsers.locate("searchField").val());
                adminUsers.adminListEditor.events.afterListUpdate.addListener(function () {
                    adminUsers.adminListEditor.events.afterListUpdate.removeListener("afterListUpdate");
                    jqUnit.isVisible("Unsearch is visible after search", adminUsers.options.selectors.unSearchButton);
                    jqUnit.assertEquals("There are 2 users in the list after search", 2, adminUsers.adminListEditor.list.model.items.length);
                    adminUsers.adminListEditor.list.events.afterRender.addListener(function () {
                        jqUnit.notVisible("Unsearch is invisible after unsearch", adminUsers.options.selectors.unSearchButton);
                        jqUnit.assertEquals("There are 4 users in the list after unsearch", 4, adminUsers.adminListEditor.list.model.items.length);
                        cspace.tests.onTearDown.fire(adminUsers.adminListEditor.details);
                        start();
                    });
                    adminUsers.locate("unSearchButton").click();
                }, "afterListUpdate");
                adminUsers.locate("searchButton").click();
            }
        });
        fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.users");
        fluid.staticEnvironment.cspaceTestEnv = fluid.typeTag("cspace.userAdminTests");
        adminUsers = cspace.admin(".csc-admin-users", testOpts);
    });
    
    var setupConfirmation = function (testFunc) {
        var waitMultiple;
        fluid.log("Begin setupConfirmation");
        var callback = function() {
            fluid.log("Final test callback firing"); 
            var pageReadyArgs = waitMultiple.waitSet.pageReady.args;
            var setupArgs = waitMultiple.waitSet.afterSetup.args;
            var adminUsers = setupArgs[0];
            adminUsers.adminListEditor.events.afterShowDetails.addListener(waitMultiple.getListener("afterShowDetails"));
            waitMultiple.clear(function() {
                testFunc.apply(null, [pageReadyArgs[0].details, adminUsers]);
            });
            delete waitMultiple.waitSet["pageReady"];
            delete waitMultiple.waitSet["afterSetup"];
            $(adminUsers.adminListEditor.list.locate("row")[2]).click();
        }; 
        waitMultiple = cspace.util.waitMultiple(
            {outerKey: "pageReady",
             callback: callback,
             once: true}); 
        var testOpts = fluid.copy(baseTestOpts);
        fluid.model.setBeanValue(testOpts, "components.adminListEditor.options.listeners", {
            pageReady: waitMultiple.getListener("pageReady")
        });
        fluid.model.setBeanValue(testOpts, "listeners", {
            afterSetup: waitMultiple.getListener("afterSetup")
        });
        fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.users");
        fluid.staticEnvironment.cspaceTestEnv = fluid.typeTag("cspace.userAdminTests");
        cspace.admin(".csc-admin-users", testOpts);
    };
    
    adminUsersTest.asyncTest("Confirmation", function () {
        setupConfirmation(function (re, adminUsers) {
            jqUnit.assertEquals("Selected username is", "Anastasia Cheethem", adminUsers.locate("userName").val());
            jqUnit.notVisible("Confiration dialog is invisible initially", re.confirmation.popup);
            adminUsers.locate("userName").val("New Name").change();
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.isVisible("Confirmation dialog should now be visible", re.confirmation.popup);
                cspace.tests.onTearDown.fire(re);
                start();
            });
            adminUsers.adminListEditor.list.locate("row").eq(1).click();
        });
    });
    
    adminUsersTest.asyncTest("Confirmation cancel", function () {
        setupConfirmation(function (re, adminUsers) {
            adminUsers.locate("userName").val("New Name").change();
            re.confirmation.popup.bind("dialogopen", function () {
                re.confirmation.popup.bind("dialogclose", function () {
                    jqUnit.notVisible("Confirmation dialog is now invisible", re.confirmation.popup);
                    jqUnit.assertEquals("User Name should still be", "New Name", adminUsers.locate("userName").val());
                    cspace.tests.onTearDown.fire(re);
                    start();
                });
                re.confirmation.confirmationDialog.locate("cancel").click();                        
            });
            adminUsers.adminListEditor.list.locate("row").eq(1).click();
         });
    });
    
    adminUsersTest.asyncTest("Confirmation proceed", function () {
        setupConfirmation(function (re, adminUsers) {
            adminUsers.locate("userName").val("New Name").change();
            re.confirmation.popup.bind("dialogopen", function () {
                adminUsers.adminListEditor.detailsDC.events.afterFetch.addListener(function () {
                    jqUnit.notVisible("Confirmation dialog is now invisible", re.confirmation.popup);
                    jqUnit.assertEquals("User Name should now be", "Megan Forbes", adminUsers.locate("userName").val());
                    cspace.tests.onTearDown.fire(re);
                    start();
                });
                re.confirmation.confirmationDialog.locate("proceed").click();
            });
            adminUsers.adminListEditor.list.locate("row").eq(1).click();
        });
    });
    
    adminUsersTest.asyncTest("Confirmation delete", function () {
        setupConfirmation(function (re) {
            re.events.afterRender.removeListener("initialSelect");
            re.remove();
            jqUnit.assertEquals("Confirmation Text Should Say", "Delete this User?", re.confirmation.confirmationDialog.locate("message:").text());
            jqUnit.isVisible("Delete button should be visible", re.confirmation.confirmationDialog.locate("act"));
            jqUnit.isVisible("Cancel button should be visible", re.confirmation.confirmationDialog.locate("cancel"));
            jqUnit.assertEquals("Proceed / Don't Save button should not be rendered", 0, re.confirmation.confirmationDialog.locate("proceed").length);
            cspace.tests.onTearDown.fire(re);
            start();
        });
    });
    
    adminUsersTest.asyncTest("Confirmation delete + cancel", function () {
        setupConfirmation(function (re, adminUsers) {
            re.events.afterRender.removeListener("initialSelect");
            re.remove();
            jqUnit.assertEquals("Selected username is", "Anastasia Cheethem", adminUsers.locate("userName").val());
            jqUnit.isVisible("Confirmation Dialog is now visible", re.confirmation.popup);
            re.confirmation.confirmationDialog.locate("cancel").click();
            jqUnit.notVisible("Confirmation Dialog is now invisible", re.confirmation.popup);
            jqUnit.assertEquals("Selected username is still", "Anastasia Cheethem", adminUsers.locate("userName").val());
            cspace.tests.onTearDown.fire(re);
            start();
        });
    });
    
    adminUsersTest.asyncTest("Confirmation delete + proceed", function () {
        setupConfirmation(function (re, adminUsers) {
            re.events.afterRender.removeListener("initialSelect");
            re.remove();
            jqUnit.assertEquals("Selected username is", "Anastasia Cheethem", adminUsers.locate("userName").val());                        
            re.options.dataContext.events.afterSave.addListener(function () {                        
                jqUnit.assertTrue("Successfully executed remove", true);
                jqUnit.notVisible("Confirmation Dialog is now invisible", re.confirmation.popup);
                jqUnit.notVisible("No record selected", adminUsers.locate("userName"));
                cspace.tests.onTearDown.fire(re);
                start();
            }, undefined, undefined, "last");
            re.confirmation.confirmationDialog.locate("act").click();
        });
    });
    
    adminUsersTest.asyncTest("Confirmation navigate + delete", function () {
        setupConfirmation(function (re, adminUsers) {
            re.events.afterRender.removeListener("initialSelect");                    
            adminUsers.locate("userName").val("New Name").change();
            adminUsers.adminListEditor.list.locate("row").eq(1).click();
            jqUnit.assertEquals("Confirmation Text Should Say", "You are about to leave this record.", re.confirmation.confirmationDialog.locate("message:").eq(0).text());
            jqUnit.assertEquals("Confirmation Text Should Say", "Save Changes?", re.confirmation.confirmationDialog.locate("message:").eq(1).text());
            re.confirmation.confirmationDialog.locate("close").click();
            re.remove();
            jqUnit.assertEquals("Confirmation Text Should Say", "Delete this User?", re.confirmation.confirmationDialog.locate("message:").text());
            cspace.tests.onTearDown.fire(re);
            start();
        });
    });
    
    adminUsersTest.asyncTest("Confirmation delete + navigate (CSPACE-2646)", function () {
        setupConfirmation(function (re, adminUsers) {
            re.events.afterRender.removeListener("initialSelect");                    
            re.remove();
            jqUnit.assertEquals("After delete clicked, confirmation text should say", "Delete this User?", re.confirmation.confirmationDialog.locate("message:").text());
            re.confirmation.confirmationDialog.locate("close").click();
            adminUsers.locate("userName").val("New Name").change();
            adminUsers.adminListEditor.list.locate("row").eq(1).click();
            jqUnit.assertEquals("Delete cancelled, record edited, attempt to edit other user, confirmation text should say", "You are about to leave this record.", re.confirmation.confirmationDialog.locate("message:").eq(0).text());
            jqUnit.assertEquals("Confirmation text should also say", "Save Changes?", re.confirmation.confirmationDialog.locate("message:").eq(1).text());
            cspace.tests.onTearDown.fire(re);
            start();
        });
    });
    
    adminUsersTest.asyncTest("Confirmation on navigation away after canceled changes", function () {
        setupConfirmation(function (re, adminUsers) {
            re.events.afterRender.removeListener("initialSelect");                    
            adminUsers.locate("userName").val("New Name").change();
            re.confirmation.popup.bind("dialogopen", function () {
                re.confirmation.popup.unbind("dialogopen");
                jqUnit.isVisible("Navigating without cancelling, confirmation should be visible", re.confirmation.popup);
                jqUnit.assertEquals("Confirmation Text Should Say", "You are about to leave this record.", re.confirmation.confirmationDialog.locate("message:").eq(0).text());
                jqUnit.assertEquals("Confirmation Text Should Say", "Save Changes?", re.confirmation.confirmationDialog.locate("message:").eq(1).text());
                re.confirmation.confirmationDialog.locate("close").click();
                jqUnit.notVisible("Dialog should close", re.confirmation.popup);
                jqUnit.assertEquals("Record name should still be changed.", "New Name", adminUsers.locate("userName").val());
                re.locate("cancel").click();
                jqUnit.assertEquals("Record should be rolled back.", "Anastasia Cheethem", adminUsers.locate("userName").val());
                cspace.tests.onTearDown.fire(re);
                start();
            });
            adminUsers.adminListEditor.list.locate("row").eq(1).click();
        });
    });
    
    var currentUserTests = function (userCSID, index, visibility) {
        basicAdminUsersSetup(function (adminUsers, le, re) {
            le.events.afterShowDetails.addListener(function () {
                jqUnit[visibility]("Delete button is " + visibility + " current user", adminUsers.options.selectors.deleteButton);
                cspace.tests.onTearDown.fire(re);
                start();
            });
            adminUsers.adminListEditor.list.locate("row").eq(index).click();
        }, {
            login: cspace.util.login({csid: userCSID})
        });
    };
    
    adminUsersTest.asyncTest("Currently logged in user should have invisible delete button", function () {
        currentUserTests("147258369", 2, "notVisible");
    });
    
    adminUsersTest.asyncTest("Currently logged in user should see delete button for other users", function () {
        currentUserTests("1111", 1, "isVisible");
    }); 
};

jQuery(document).ready(function () {
    adminUsersTester();
});