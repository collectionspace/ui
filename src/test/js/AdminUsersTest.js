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
                events: {
                    onSearch: null,
                    onUnSearch: null,
                    afterSearch: null,
                    afterUnSearch: null
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
                fieldd;
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

    var testConfig = {
        "Creation": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
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
        },
        "Click new user button": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
                        admin.locate("add").click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        jqUnit.assertEquals("Email is blank", locateSelector(recordRenderer, "email").val(), "");
                        jqUnit.assertEquals("Full name is blank", locateSelector(recordRenderer, "screenName").val(), "");
                        jqUnit.assertEquals("Password is blank", admin.locate("password").val(), "");
                        jqUnit.assertEquals("Password confirm is blank", admin.locate("passwordConfirm").val(), "");
                        var controlPanels = fluid.renderer.getDecoratorComponents(admin.adminRecordEditor);
                        fluid.each(controlPanels, function (controlPanel) {
                            jqUnit.assertTrue("Delete button is disabled", controlPanel.locate("deleteButton").attr("disabled"));
                        });
                        jqUnit.notVisible("message container is hidden", admin.adminListView.messageBar.container);
                        jqUnit.notVisible("banner is hidden", admin.banner.container);
                        jqUnit.isVisible("recordEditor is visible", admin.locate("recordEditor"));
                        start();
                    },
                    priority: "last"
                }
            }
        },
        "Save new user - successful save": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
                        admin.locate("add").click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        changeDetails(admin, recordRenderer, "validPassword");
                        admin.adminRecordEditor.events.onSave.fire();
                    },
                    priority: "last"
                },
                "onSave.test": {
                    path: "components.adminRecordEditor.options.listeners",
                    listener: function (admin) {
                        jqUnit.assertEquals("Model should be updated when about save - email", testDataCreateUser.email, admin.adminRecordEditor.model.fields.email);
                        jqUnit.assertEquals("Model should be updated when about save - userName", testDataCreateUser.userName, admin.adminRecordEditor.model.fields.screenName);
                        jqUnit.assertEquals("Model should be updated when about save - password", testDataCreateUser.validPassword, admin.adminRecordEditor.model.fields.password);
                        start();
                        return false;
                    },
                    priority: "first"
                }
            }
        },
        "Save new user - empty form field": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
                        admin.locate("add").click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        changeDetails(admin, recordRenderer, "validPassword");
                        locateSelector(recordRenderer, "email").val(testDataCreateUser.email).change();
                        admin.adminRecordEditor.events.onSave.fire();
                    },
                    priority: "last"
                },
                "onSave.test": {
                    path: "components.adminRecordEditor.options.listeners",
                    listener: function (admin) {
                        jqUnit.isVisible("message container is visible", admin.adminListView.messageBar.container);
                        admin.adminListView.messageBar.hide();
                        start();
                    },
                    priority: "last"
                }
            }
        },
        "Save new user - mismatched passwords": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
                        admin.locate("add").click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        changeDetails(admin, recordRenderer, "invalidPassword");
                        jqUnit.assertFalse("validator fails", admin.validate());
                        jqUnit.isVisible("message container is visible", admin.adminListView.messageBar.container);
                        admin.adminListView.messageBar.hide();
                        start();
                    },
                    priority: "last"
                }
            }
        },
        "Save new user - invalid length passwords": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
                        admin.locate("add").click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        changeDetails(admin, recordRenderer, "invalidPassword");
                        locateSelector(admin, "passwordConfirm").val(testDataCreateUser.invalidPassword).change();
                        jqUnit.assertFalse("validator fails", admin.validate());
                        jqUnit.isVisible("message container is visible", admin.adminListView.messageBar.container);
                        admin.adminListView.messageBar.hide();
                        start();
                    },
                    priority: "last"
                }
            }
        },
        "Valid edit of existing user: validation passes": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
                        admin.locate("add").click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        changeDetails(admin, recordRenderer, "validPassword");
                        admin.adminRecordEditor.events.onSave.fire();
                    },
                    priority: "last"
                },
                "onSave.test": {
                    path: "components.adminRecordEditor.options.listeners",
                    listener: function (admin) {
                        jqUnit.assertTrue("validator fails", admin.validate());
                        jqUnit.notVisible("message container is invisible", admin.adminListView.messageBar.container);
                        start();
                    },
                    priority: "last"
                }
            }
        },
        "Test search/unsearch functionality": {
            testType: "asyncTest",
            listeners: {
                "ready.initial": {
                    path: "listeners",
                    listener: function (admin) {
                        admin.events.ready.addListener(function () {
                            admin.events.ready.removeListener("afterSearch");
                            admin.events.ready.addListener(function () {
                                start();
                            });
                            admin.locate("searchField").val("TEST").change();
                            admin.locate("unSearchButton").click();
                        }, "afterSearch");
                        admin.locate("searchButton").click();
                    },
                    once: true
                },
                onUnSearch: {
                    path: "listeners",
                    listener: function (admin) {
                        jqUnit.isVisible("Unsearch button is available ", admin.locate("unSearchButton"));
                        jqUnit.assertEquals("earch Field should be filled", "TEST", admin.locate("searchField").val());
                    }
                },
                afterUnSearch: {
                    path: "listeners",
                    listener: function (admin) {
                        jqUnit.assertValue("list view component should be present", admin.adminListView);
                        jqUnit.isVisible("banner is visible", admin.banner.container);
                        jqUnit.assertValue("banner component should be present", admin.banner);
                        jqUnit.notVisible("recordEditor is not visible", admin.locate("recordEditor"));
                        jqUnit.assertNoValue("banner component should be present", admin.adminRecordEditor);
                        jqUnit.notVisible("Unsearch button is not available ", admin.locate("unSearchButton"));
                    }
                },
                onSearch: {
                    path: "listeners",
                    listener: function (admin) {
                        jqUnit.notVisible("Unsearch button is not available ", admin.locate("unSearchButton"));
                    }
                },
                afterSearch: {
                    path: "listeners",
                    listener: function (admin) {
                        jqUnit.assertValue("list view component should be present", admin.adminListView);
                        jqUnit.isVisible("banner is visible", admin.banner.container);
                        jqUnit.assertValue("banner component should be present", admin.banner);
                        jqUnit.notVisible("recordEditor is not visible", admin.locate("recordEditor"));
                        jqUnit.assertNoValue("banner component should be present", admin.adminRecordEditor);
                        jqUnit.isVisible("Unsearch button is available ", admin.locate("unSearchButton"));
                    }
                }
            }
        },
        "Confirmation": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
                        admin.adminListView.locate("row").eq(1).click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        jqUnit.assertEquals("Selected username is", "Reader", locateSelector(recordRenderer, "screenName").val());
                        jqUnit.notVisible("Confiration dialog is invisible initially", admin.adminRecordEditor.confirmation.popup);
                        locateSelector(recordRenderer, "screenName").val("New Name").change();
                        admin.adminRecordEditor.confirmation.popup.bind("dialogopen", function () {
                            jqUnit.isVisible("Confirmation dialog should now be visible", admin.adminRecordEditor.confirmation.popup);
                            admin.adminRecordEditor.confirmation.confirmationDialog.events.onClose.fire();
                            start();
                        });
                        $("a", admin.adminListView.locate("row").eq(2)).eq(0).click();
                    },
                    priority: "last"
                }
            }
        },
        "Confirmation cancel": {
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (admin) {
                        admin.adminListView.locate("row").eq(1).click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        jqUnit.assertEquals("Selected username is", "Reader", locateSelector(recordRenderer, "screenName").val());
                        jqUnit.notVisible("Confiration dialog is invisible initially", admin.adminRecordEditor.confirmation.popup);
                        locateSelector(recordRenderer, "screenName").val("New Name").change();
                        admin.adminRecordEditor.confirmation.popup.bind("dialogopen", function () {
                            jqUnit.isVisible("Confirmation dialog should now be visible", admin.adminRecordEditor.confirmation.popup);
                            admin.adminRecordEditor.confirmation.popup.bind("dialogclose", function () {
                                jqUnit.notVisible("Confirmation dialog is now invisible", admin.adminRecordEditor.confirmation.popup);
                                jqUnit.assertEquals("User Name should still be", "New Name", locateSelector(recordRenderer, "screenName").val());
                                start();
                            });
                            admin.adminRecordEditor.confirmation.confirmationDialog.locate("cancel").click();
                        });
                        $("a", admin.adminListView.locate("row").eq(2)).eq(0).click();
                    },
                    priority: "last"
                }
            }
        }/*
,
        "Confirmation proceed": {
            testType: "asyncTest",
            listeners: {
                "ready.initial": {
                    path: "listeners",
                    listener: function (admin) {
                        admin.adminListView.locate("row").eq(1).click();
                    },
                    once: true
                },
                "recordEditorReady.test": {
                    path: "listeners",
                    listener: function (admin, recordRenderer) {
                        jqUnit.assertEquals("Selected username is", "Reader", locateSelector(recordRenderer, "screenName").val());
                        jqUnit.notVisible("Confiration dialog is invisible initially", admin.adminRecordEditor.confirmation.popup);
                        locateSelector(recordRenderer, "screenName").val("New Name").change();
                        admin.adminRecordEditor.confirmation.popup.bind("dialogopen", function () {
                            jqUnit.isVisible("Confirmation dialog should now be visible", admin.adminRecordEditor.confirmation.popup);
                            admin.events.recordEditorReady.addListener(function () {
                                jqUnit.notVisible("Confirmation dialog is now invisible", admin.adminRecordEditor.confirmation.popup);
                                jqUnit.assertEquals("User Name should now be", "Administrator", locateSelector(recordRenderer, "screenName").val());
                                start();
                            });
                            admin.adminRecordEditor.confirmation.confirmationDialog.locate("proceed").click();
                        });
                        $("a", admin.adminListView.locate("row").eq(0)).eq(0).click();
                    },
                    priority: "last",
                    once: true
                }
            }
        }
*/
    };

    fluid.each(["ready", "onSearch", "afterSearch", "onUnSearch", "afterUnSearch"], function (eventName) {
        fluid.demands(eventName, ["cspace.admin", "cspace.test"], {
            args: ["{cspace.admin}"]
        });
    });
    fluid.demands("onSelect", ["cspace.admin", "cspace.test"], {
        args: ["{arguments}.0", "{cspace.admin}"]
    });
    fluid.demands("recordEditorReady", ["cspace.admin", "cspace.test"], {
        args: ["{cspace.admin}", "{arguments}.0"]
    });

    fluid.demands("onSave", ["cspace.admin", "cspace.test"], {
        args: ["{cspace.admin}"]
    });

    fluid.demands("cspace.recordEditor.dataSource", ["cspace.recordEditor", "cspace.admin", "cspace.users", "cspace.test"], {
        options: {
            finalInitFunction: "cspace.recordEditor.dataSource.finalInitUserAdmin",
            preInitFunction: "cspace.recordEditor.dataSource.preInitUserAdmin",
            csid: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.recordEditor.dataSource.resolveCsidTab",
                    args: ["{recordEditor}.model.csid", "{recordEditor}.options.csid"]
                }
            },
            urls: cspace.componentUrlBuilder({
                recordURL: "%test/data/%recordType/%csid.json",
                roleUrl: "%test/data/role/records.json"
            }),
            components: {
                sourceRole: {
                    type: "cspace.recordEditor.dataSource.sourceRole"
                }
            },
            events: {
                afterGetSource: null,
                afterGetSourceRole: null,
                afterGet: {
                    events: {
                        source: "{that}.events.afterGetSource",
                        sourceRole: "{that}.events.afterGetSourceRole"
                    },
                    args: ["{arguments}.source.0", "{arguments}.source.1", "{arguments}.sourceRole.0"]
                }
            },
            listeners: {
                afterGet: "{that}.afterGet"
            }
        }
    });

    var testRunner = function (testsConfig) {
        fluid.each(testsConfig, function (config, testName) {
            var options = {},
                testEnv = config.testEnv || adminTest;
            fluid.each(config.listeners, function (listener, eventName) {
                var listeners = fluid.get(options, listener.path),
                    originalListener = listener.listener;
                if (!listeners) {
                    fluid.set(options, listener.path, {});
                    listeners = fluid.get(options, listener.path);
                }
                if (listener.once) {
                    listener.listener = function (admin) {
                        admin.events[fluid.pathUtil.getHeadPath(eventName)].removeListener(fluid.pathUtil.getTailPath(eventName));
                        originalListener(admin);
                    };
                }
                listeners[eventName] = {
                    listener: listener.listener,
                    priority: listener.priority
                };
            });
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
                setupAdmin(options, testEnv);
            });
        });
    };

    testRunner(testConfig);

}());
/*    
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