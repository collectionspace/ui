/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0.
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, cspace, fluid, start, expect*/

(function () {

    "use strict";

    var bareAdminTest = new jqUnit.TestCase("Admin Tests", function () {
            $("#main").html(template);
        }),
        template;

    jQuery.ajax({
        url: "../../main/webapp/defaults/html/pages/Administration-users.html",
        dataType: "html",
        success: function (data) {
            template = data;
        }
    });

    // Stub for pageBuilderIO
    fluid.defaults("cspace.tests.pageBuilderIO", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        schema: {
            users: null
        },
        async: false,
        recordType: "users"
    });

    fluid.defaults("cspace.pageBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        resources: {
            users: cspace.resourceSpecExpander({
                url: "%test/uischema/%schemaName.json",
                fetchClass: "testResource",
                forceCache: true,
                options: {
                    dataType: "json"
                }
            }),
            namespaces: cspace.resourceSpecExpander({
                url: "%test/uischema/%schemaName.json",
                fetchClass: "testResource",
                forceCache: true,
                options: {
                    dataType: "json"
                }
            }),
            recordtypes: cspace.resourceSpecExpander({
                url: "%test/uischema/%schemaName.json",
                fetchClass: "testResource",
                forceCache: true,
                options: {
                    dataType: "json"
                }
            }),
            recordlist: cspace.resourceSpecExpander({
                url: "%test/uischema/%schemaName.json",
                fetchClass: "testResource",
                forceCache: true,
                options: {
                    dataType: "json"
                }
            }),
            uispec: cspace.resourceSpecExpander({
                url: "%test/uispecs/users.json",
                fetchClass: "testResource",
                forceCache: true,
                options: {
                    dataType: "json"
                }
            })
        },
        selectors: {
            admin: ".csc-admin-users"
        },
        schema: ["users", "namespaces", "recordtypes", "recordlist"],
        preInitFunction: "cspace.pageBuilder.preInit"
    });

    fluid.demands("cspace.tests.pageBuilderIO", "cspace.test", {
        options: fluid.COMPONENT_OPTIONS
    });

    cspace.pageBuilder.preInit = function (that) {
        fluid.each(that.options.resources, function (resource, name) {
            resource.url = fluid.stringTemplate(resource.url, {schemaName: name});
        });
        fluid.fetchResources(that.options.resources, function (resources) {
            that.schema = {};
            fluid.each(that.options.schema, function (schemaName) {
                that.schema[schemaName] = resources[schemaName].resourceText[schemaName];
            });
            that.options.uispec = resources.uispec.resourceText;
        });
    };

    var adminTest = cspace.tests.testEnvironment({testCase: bareAdminTest, components: {
        users: {
            type: "fluid.typeFount",
            options: {
                targetTypeName: "cspace.users"
            }
        },
        userLogin: {
            type: "cspace.util.login",
            options: {
                userId: "123123123",
                csid: "123123123"
            }
        },
        pageBuilderIO: {
            type: "cspace.tests.pageBuilderIO"
        },
        pageBuilder: {
            type: "cspace.pageBuilder"
        }
    }});

    var setupAdmin = function (options, testEnv) {
        testEnv = testEnv || adminTest;
        var instantiator = testEnv.instantiator;
        if (testEnv.admin) {
            instantiator.clearComponent(testEnv, "admin");
        }
        testEnv.options.components.admin = {
            type: "cspace.admin",
            container: "{pageBuilder}.options.selectors.admin",
            options: fluid.merge(null, {
                recordType: "{pageBuilderIO}.options.recordType",
                produceTree: "cspace.admin.produceAdminUserTree",
                selectors: {
                    searchField: ".csc-user-searchField",
                    searchNote: ".csc-users-searchNote",
                    searchButton: ".csc-user-searchButton",
                    unSearchButton: ".csc-user-unSearchButton",
                    password: ".csc-user-password",
                    passwordConfirm: ".csc-user-passwordConfirm",
                    status: ".csc-user-status",
                    statusLabel: ".csc-users-status-label"
                },
                selectorsToIgnore: ["recordEditor", "listView", "banner", "password", "passwordConfirm", "status", "statusLabel"],
                invokers: {
                    search: "cspace.admin.search",
                    unSearch: "cspace.admin.unSearch",
                    validate: "cspace.admin.validate"
                },
                preInitFunction: "cspace.admin.preInitUserAdmin",
                userId: "{userLogin}.options.userId",
                components: {
                    passwordValidator: {
                        type: "cspace.passwordValidator"
                    },
                    adminRecordEditor: {
                        options: {
                            uispec: "{pageBuilder}.options.uispec.details",
                            showDeleteButton: {
                                expander: {
                                    type: "fluid.deferredInvokeCall",
                                    func: "cspace.admin.isCurrentUser",
                                    args: ["{userLogin}.options.csid", "{admin}.selectedRecordCsid"]
                                }
                            },
                            listeners: {
                                onSave: {
                                    listener: "{admin}.onSave",
                                    priority: "first"
                                },
                                "afterRecordRender.test": {
                                    listener: "{admin}.processStatus"
                                }
                            }
                        }
                    }
                }
            }, options)
        };
        fluid.fetchResources({}, function () {
            fluid.initDependent(testEnv, "admin", instantiator);
        }, {amalgamateClasses: ["testResource"]});
    };

    var locateSelector = function (component, field) {
        var uispec = component.options.uispec;
        if (!uispec) {
            return component.locate(field);
        }
        return fluid.find(uispec, function (valuebinding, selector) {
            if (typeof valuebinding !== "string") {
                return;
            }
            var elPath = valuebinding.replace("${", "").replace("}", ""),
                elPath = elPath.split("."),
                fieldd = elPath[elPath.length - 1];
            if (field === fieldd) {
                return $(selector, component.container);
            }
        });
    };

    var testDataCreateUser = {
        email: "rj@dio.com",
        userName: "R J Dio",
        validPassword: "123456789",
        invalidPassword: "123"
    };

    var changeDetails = function (admin, recordRenderer, confPassword) {
        locateSelector(recordRenderer, "email").val(testDataCreateUser.email).change();
        locateSelector(recordRenderer, "screenName").val(testDataCreateUser.userName).change();
        locateSelector(recordRenderer, "password").val(testDataCreateUser.validPassword).change();
        locateSelector(admin, "passwordConfirm").val(testDataCreateUser[confPassword]).change();
    };

    fluid.demands("cspace.admin", ["cspace.pageBuilder", "cspace.pageBuilderIO", "cspace.test", "Creation"], {
        options: {
            listeners: {
                ready: function (admin) {
                    var list = admin.adminListView.model.list;
                    jqUnit.assertEquals("User list model should have right number of entries", 7, list.length);
                    jqUnit.assertEquals("User list model should contain expected user", "Reader", list[1].screenName);
                    jqUnit.assertEquals("Rendered table has 4 data rows visible", 7, admin.adminListView.locate("row").length);
                    jqUnit.isVisible("banner is visible", admin.banner.container);
                    jqUnit.notVisible("message container is hidden", admin.adminListView.messageBar.container);
                    jqUnit.notVisible("recordEditor is not visible", admin.locate("recordEditor"));
                    start();
                }
            }
        }
    });
    fluid.demands("cspace.admin", ["cspace.pageBuilder", "cspace.pageBuilderIO", "cspace.test", "Click new user button"], {
        options: {
            listeners: {
                ready: function (admin) {
                    admin.locate("add").click();
                }
            },
            components: {
                adminRecordEditor: {
                    options: {
                        listeners: {
                            "afterRecordRender.test": {
                                listener: function (admin, recordRenderer) {
                                    jqUnit.assertEquals("Email is blank", locateSelector(recordRenderer, "email").val(), "");
                                    jqUnit.assertEquals("Full name is blank", locateSelector(recordRenderer, "screenName").val(), "");
                                    jqUnit.assertEquals("Password is blank", admin.locate("password").val(), "");
                                    jqUnit.assertEquals("Password confirm is blank", admin.locate("passwordConfirm").val(), "");
                                    var controlPanels = fluid.renderer.getDecoratorComponents(admin.adminRecordEditor);
                                    fluid.each(controlPanels, function (controlPanel) {
                                        jqUnit.assertTrue("Delete button is disabled", controlPanel.locate("deleteButton").attr("disabled"));
                                    })
                                    jqUnit.notVisible("message container is hidden", admin.adminListView.messageBar.container);
                                    jqUnit.notVisible("banner is hidden", admin.banner.container);
                                    jqUnit.isVisible("recordEditor is visible", admin.locate("recordEditor"));
                                    start();
                                },
                                priority: "last",
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.demands("cspace.admin", ["cspace.pageBuilder", "cspace.pageBuilderIO", "cspace.test", "Save new user - successful save"], {
        options: {
            listeners: {
                ready: function (admin) {
                    admin.locate("add").click();
                }
            },
            components: {
                adminRecordEditor: {
                    options: {
                        listeners: {
                            "onSave.test": {
                                listener: function (admin) {
                                    jqUnit.assertEquals("Model should be updated when about save - email", testDataCreateUser.email, admin.adminRecordEditor.model.fields.email);
                                    jqUnit.assertEquals("Model should be updated when about save - userName", testDataCreateUser.userName, admin.adminRecordEditor.model.fields.screenName);
                                    jqUnit.assertEquals("Model should be updated when about save - password", testDataCreateUser.validPassword, admin.adminRecordEditor.model.fields.password);
                                    start();
                                    return false;
                                },
                                priority: "first"
                            },
                            "afterRecordRender.test": {
                                listener: function (admin, recordRenderer) {
                                    changeDetails(admin, recordRenderer, "validPassword");
                                    admin.adminRecordEditor.events.onSave.fire();
                                },
                                priority: "last",
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.demands("cspace.admin", ["cspace.pageBuilder", "cspace.pageBuilderIO", "cspace.test", "Save new user - empty form field"], {
        options: {
            listeners: {
                ready: function (admin) {
                    admin.locate("add").click();
                }
            },
            components: {
                adminRecordEditor: {
                    options: {
                        listeners: {
                            "onSave.test": {
                                listener: function (admin) {
                                    jqUnit.isVisible("message container is visible", admin.adminListView.messageBar.container);
                                    admin.adminListView.messageBar.hide();
                                    start();
                                },
                                priority: "last"
                            },
                            "afterRecordRender.test": {
                                listener: function (admin, recordRenderer) {
                                    changeDetails(admin, recordRenderer, "validPassword");
                                    locateSelector(recordRenderer, "email").val(testDataCreateUser.email).change();
                                    admin.adminRecordEditor.events.onSave.fire();
                                },
                                priority: "last",
                            }
                        }
                    }
                }
            }
        }
    });

    var testConfig = {
        "Creation": {
            testType: "asyncTest"
        },
        "Click new user button": {
            testType: "asyncTest"
        },
        "Save new user - successful save": {
            testType: "asyncTest"
        },
        "Save new user - empty form field": {
            testType: "asyncTest"
        }
    };

    fluid.each(["ready", "onSelect"], function (eventName) {
        fluid.demands(eventName, ["cspace.admin", "cspace.test"], {
            args: ["{cspace.admin}"]
        });
    });
    fluid.demands("afterRecordRender", ["cspace.admin", "cspace.test"], {
        args: ["{cspace.admin}", "{arguments}.0"]
    });

    fluid.demands("onSave", ["cspace.admin", "cspace.test"], {
        args: ["{cspace.admin}"]
    });

    var testRunner = function (testsConfig) {
        fluid.each(testsConfig, function (config, testName) {
            var testEnv = config.testEnv || adminTest;
            testEnv[config.testType](testName, function () {
                var instantiator = testEnv.instantiator;
                if (testEnv.testContext) {
                    instantiator.clearComponent(testEnv, "testContext");
                }
                testEnv.options.components.testContext = {
                    type: "fluid.typeFount",
                    options: {
                        targetTypeName: testName
                    }
                };
                fluid.initDependent(testEnv, "testContext", instantiator);
                setupAdmin(config.adminOptions, testEnv);
            });
        });
    };

    testRunner(testConfig);

}());
/*
    
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
                    jqUnit.isVisible("message container is visible", le.messageBar.container);
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
*/