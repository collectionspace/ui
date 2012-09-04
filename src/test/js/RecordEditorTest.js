/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0.
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/

(function () {

    "use strict";

    var bareRecordEditorTest = new jqUnit.TestCase("recordEditor Tests");

    // Stub for pageBuilderIO
    fluid.defaults("cspace.tests.pageBuilderIO", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        recordType: "objectexit",
        readOnly: false
    });

    fluid.defaults("cspace.pageBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        resources: {
            objectexit: cspace.resourceSpecExpander({
                url: "%test/uischema/%schemaName.json",
                fetchClass: "testResource",
                options: {
                    dataType: "json"
                }
            }),
            namespaces: cspace.resourceSpecExpander({
                url: "%test/uischema/%schemaName.json",
                fetchClass: "testResource",
                options: {
                    dataType: "json"
                }
            }),
            recordtypes: cspace.resourceSpecExpander({
                url: "%test/uischema/%schemaName.json",
                fetchClass: "testResource",
                options: {
                    dataType: "json"
                }
            }),
            recordlist: cspace.resourceSpecExpander({
                url: "%test/uischema/%schemaName.json",
                fetchClass: "testResource",
                options: {
                    dataType: "json"
                }
            }),
            uispec: cspace.resourceSpecExpander({
                url: "%test/uispecs/objectexit.json",
                fetchClass: "testResource",
                options: {
                    dataType: "json"
                }
            })
        },
        selectors: {
            recordEditor: "#main"
        },
        schema: ["objectexit", "namespaces", "recordtypes", "recordlist"],
        preInitFunction: "cspace.pageBuilder.preInit"
    });

    fluid.demands("cspace.tests.pageBuilderIO", "cspace.test", {
        options: fluid.COMPONENT_OPTIONS
    });

    fluid.demands("cspace.tests.pageBuilderIO", ["cspace.test", "cspace.testMedia"], {
        options: {
            recordType: "media"
        }
    });

    fluid.demands("cspace.tests.pageBuilderIO", ["cspace.test", "cspace.testPerson"], {
        options: {
            recordType: "person"
        }
    });

    fluid.demands("cspace.tests.pageBuilderIO", ["cspace.test", "cspace.testReadOnly"], {
        options: {
            readOnly: true
        }
    });

    fluid.demands("cspace.pageBuilder", ["cspace.pageBuilderIO", "cspace.testPerson"], {
        options: {
            schema: ["person", "namespaces", "recordtypes", "recordlist"],
            resources: {
                person: cspace.resourceSpecExpander({
                    url: "%test/uischema/%schemaName.json",
                    fetchClass: "testResource",
                    options: {
                        dataType: "json"
                    }
                }),
                uispec: cspace.resourceSpecExpander({
                    url: "%test/uispecs/person.json",
                    fetchClass: "testResource",
                    options: {
                        dataType: "json"
                    }
                })
            }
        }
    });

    fluid.demands("cspace.pageBuilder", ["cspace.pageBuilderIO", "cspace.testMedia"], {
        options: {
            schema: ["media", "namespaces", "recordtypes", "recordlist"],
            resources: {
                media: cspace.resourceSpecExpander({
                    url: "%test/uischema/%schemaName.json",
                    fetchClass: "testResource",
                    options: {
                        dataType: "json"
                    }
                }),
                uispec: cspace.resourceSpecExpander({
                    url: "%test/uispecs/media.json",
                    fetchClass: "testResource",
                    options: {
                        dataType: "json"
                    }
                })
            }
        }
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

    fluid.each(["afterRecordRender", "afterRemove"], function (eventName) {
        fluid.demands(eventName, ["cspace.recordEditor", "cspace.test"], {
            args: ["{cspace.recordEditor}"]
        });
    });

    var recordEditorTest = cspace.tests.testEnvironment({testCase: bareRecordEditorTest, components: {
        pageBuilderIO: {
            type: "cspace.tests.pageBuilderIO"
        },
        pageBuilder: {
            type: "cspace.pageBuilder"
        }
    }});

    var recordEditorMediaTest = cspace.tests.testEnvironment({testCase: bareRecordEditorTest, components: {
        testMedia: {
            type: "fluid.typeFount",
            options: {
                targetTypeName: "cspace.testMedia"
            }
        },
        pageBuilderIO: {
            type: "cspace.tests.pageBuilderIO"
        },
        pageBuilder: {
            type: "cspace.pageBuilder"
        }
    }});

    var recordEditorPersonTest = cspace.tests.testEnvironment({testCase: bareRecordEditorTest, components: {
        testPerson: {
            type: "fluid.typeFount",
            options: {
                targetTypeName: "cspace.testPerson"
            }
        },
        authority: {
            type: "fluid.typeFount",
            options: {
                targetTypeName: "cspace.authority"
            }
        },
        pageBuilderIO: {
            type: "cspace.tests.pageBuilderIO"
        },
        pageBuilder: {
            type: "cspace.pageBuilder"
        }
    }});

    var recordEditorReadonlyTest = cspace.tests.testEnvironment({testCase: bareRecordEditorTest, components: {
        testReadOnly: {
            type: "fluid.typeFount",
            options: {
                targetTypeName: "cspace.testReadOnly"
            }
        },
        pageBuilderIO: {
            type: "cspace.tests.pageBuilderIO"
        },
        pageBuilder: {
            type: "cspace.pageBuilder"
        }
    }});

    var setupRecordEditor = function (options, testEnv) {
        testEnv = testEnv || recordEditorTest;
        var instantiator = testEnv.instantiator;
        if (testEnv.recordEditor) {
            instantiator.clearComponent(testEnv, "recordEditor");
        }
        testEnv.options.components["recordEditor"] = {
            type: "cspace.recordEditor",
            options: fluid.merge(null, options, {})
        };
        fluid.fetchResources({}, function () {
            fluid.initDependent(testEnv, "recordEditor", instantiator);
        }, {amalgamateClasses: ["testResource"]});
    };

    var testConfig = {
        "Creation of new record": {
            testType: "asyncTest",
            recordEditorOptions: {
                selectors: {
                    identificationNumber: ".csc-objectexit-exitNumber"
                },
                uispec: "{pageBuilder}.options.uispec.recordEditor",
                fieldsToIgnore: ["csid", "fields.csid", "fields.exitNumber"]
            },
            afterRecordRenderTest: {
                start: true,
                test: function (recordEditor) {
                    jqUnit.assertValue("Record editor should be created", recordEditor);
                    jqUnit.assertDeepEq("Model should be properly obtained using schema",
                        cspace.util.getBeanValue({}, recordEditor.options.recordType,
                        recordEditor.recordDataSource.options.schema), recordEditor.model);
                    fluid.each(recordEditor.options.components, function (val, subcomponentName) {
                        // This event is fired within the recordRenderer component.
                        if ($.inArray(subcomponentName, ["recordRenderer", "readOnly", "recordEditorTogglable"]) > -1) {return;}
                        jqUnit.assertValue(subcomponentName + " should be initialized", recordEditor[subcomponentName]);
                    });
                    fluid.each(recordEditor.options.uispec, function (val, selector) {
                        if (!val.messagekey) {
                            return;
                        }
                        var field = $(selector);
                        if (field.length < 1) {
                            return;
                        }
                        jqUnit.assertEquals("The record data should be rendered correctly", recordEditor.options.parentBundle.resolve(val.messagekey), field.text());
                    });
                }
            }
        },
        "Creation when the record exists": {
            testType: "asyncTest",
            recordEditorOptions: {
                selectors: {
                    identificationNumber: ".csc-objectexit-exitNumber"
                },
                model: {
                    csid: "aa643807-e1d1-4ca2-9f9b"
                },
                uispec: "{pageBuilder}.options.uispec.recordEditor",
                fieldsToIgnore: ["csid", "fields.csid", "fields.exitNumber"]
            },
            afterRecordRenderTest: {
                start: true,
                test: function (recordEditor) {
                    fluid.each(recordEditor.options.uispec, function (val, selector) {
                        if (typeof val !== "string") {
                            return;
                        }
                        var elPath = val.replace("${", "").replace("}", ""),
                            field = $(selector);
                        if (field.length < 1) {
                            return;
                        }
                        jqUnit.assertEquals("The record data should be rendered correctly", fluid.get(recordEditor.model, elPath) || "", field.val());
                    });
                }
            }
        },
        "Remove": {
            testType: "asyncTest",
            recordEditorOptions: {
                selectors: {
                    identificationNumber: ".csc-objectexit-exitNumber"
                },
                events: {
                    afterRemove: "preventable"
                },
                model: {
                    csid: "aa643807-e1d1-4ca2-9f9b"
                },
                uispec: "{pageBuilder}.options.uispec.recordEditor",
                fieldsToIgnore: ["csid", "fields.csid", "fields.exitNumber"]
            },
            expect: 1,
            afterRecordRenderTest: function (recordEditor) {
                recordEditor.confirmation.popup.bind("dialogopen", function () {
                    recordEditor.confirmation.confirmationDialog.locate("act").click();
                });
                recordEditor.events.onRemove.fire();
            },
            afterRemoveTest: {
                test: function (recordEditor) {
                    jqUnit.assertTrue("Successfully executed remove", true);
                },
                priority: "first",
                prevent: true,
                start: true
            }
        },
        "Rollback test": {
            testType: "asyncTest",
            expect: 3,
            recordEditorOptions: {
                selectors: {
                    identificationNumber: ".csc-objectexit-exitNumber"
                },
                events: {
                    afterRemove: "preventable"
                },
                model: {
                    csid: "aa643807-e1d1-4ca2-9f9b"
                },
                uispec: "{pageBuilder}.options.uispec.recordEditor",
                fieldsToIgnore: ["csid", "fields.csid", "fields.exitNumber"]
            },
            onCancelTest: {
                test: function () {
                    jqUnit.assertEquals("Original value of the exitNumber field should be again", "EX2012.1", jQuery(".csc-objectexit-exitNumber").val());
                },
                priority: "last",
                start: true
            },
            afterRecordRenderTest: {
                test: function (recordEditor) {
                    var field = jQuery(".csc-objectexit-exitNumber");
                    jqUnit.assertEquals("Original value of the exitNumber field is", "EX2012.1", field.val());
                    field.val("NEW VALUE").change();
                    jqUnit.assertEquals("New value of the exitNumber field is", "NEW VALUE", field.val());
                    recordEditor.events.onCancel.fire();
                },
                once: true
            }
        },
        "Test delete-confirmation text - media and related": {
            testType: "asyncTest",
            expect: 1,
            recordEditorOptions: {
                selectors: {
                    identificationNumber: ".csc-objectexit-exitNumber"
                },
                events: {
                    afterRemove: "preventable"
                },
                model: {
                    csid: "aa643807-e1d1-4ca2-9f9b"
                },
                uispec: "{pageBuilder}.options.uispec.recordEditor",
                fieldsToIgnore: ["csid", "fields.csid", "fields.exitNumber"]
            },
            afterRecordRenderTest: {
                test: function (recordEditor) {
                    recordEditor.confirmation.popup.bind("dialogopen", function () {
                        jqUnit.assertEquals("Checking correct text: ", "Delete this Object Exit  and its relationships?",
                            recordEditor.confirmation.confirmationDialog.locate("message:").text());
                    });
                    recordEditor.events.onRemove.fire();
                },
                start: true
            }
        },
        "Test delete-confirmation text - media only": {
            testType: "asyncTest",
            testEnv: recordEditorMediaTest,
            expect: 1,
            recordEditorOptions: {
                fieldsToIgnore: ["csid", "fields.csid", "fields.identificationNumber"],
                selectors: {
                    "identificationNumber": ".csc-media-identificationNumber"
                },
                originalMediaDimensions: {
                    width: "800",
                    height: "600"
                },
                uispec: "{pageBuilder}.options.uispec.recordEditor",
                model: {
                    csid: "5a03b49b-7861-4ff9-a73d"
                }
            },
            afterRecordRenderTest: {
                test: function (recordEditor) {
                    recordEditor.confirmation.popup.bind("dialogopen", function () {
                        jqUnit.assertEquals("Checking correct text: ", "Delete this Media Handling and its attached media ?", recordEditor.confirmation.confirmationDialog.locate("message:").text());
                    });
                    recordEditor.events.onRemove.fire();
                },
                start: true
            }
        },
        "Test delete-confirmation text - no media and no related": {
            testType: "asyncTest",
            expect: 1,
            recordEditorOptions: {
                selectors: {
                    identificationNumber: ".csc-objectexit-exitNumber"
                },
                events: {
                    afterRemove: "preventable"
                },
                model: {
                    csid: "ba97ae73-1016-4c62-b4eb"
                },
                uispec: "{pageBuilder}.options.uispec.recordEditor",
                fieldsToIgnore: ["csid", "fields.csid", "fields.exitNumber"]
            },
            afterRecordRenderTest: {
                test: function (recordEditor) {
                    recordEditor.confirmation.popup.bind("dialogopen", function () {
                        jqUnit.assertEquals("Checking correct text: ", "Delete this Object Exit  ?",
                            recordEditor.confirmation.confirmationDialog.locate("message:").text());
                    });
                    recordEditor.events.onRemove.fire();
                },
                start: true
            }
        },
        "Test cannot delete-confirmation text - record is used by other records. Record of type person": {
            testType: "asyncTest",
            expect: 1,
            testEnv: recordEditorPersonTest,
            recordEditorOptions: {
                selectors: {
                    identificationNumber: ".csc-personAuthority-termDisplayName"
                },
                uispec: "{pageBuilder}.options.uispec.recordEditor",
                fieldsToIgnore: ["csid", "fields.csid", "fields.shortIdentifier"],
                model: {
                    csid: "a8d3d7c1-9e51-4151-8ffe"
                }
            },
            afterRecordRenderTest: {
                test: function (recordEditor) {
                    recordEditor.confirmation.popup.bind("dialogopen", function () {
                        jqUnit.assertEquals("Checking correct text: ", "This Person record can not be removed. It is used by other records.", recordEditor.confirmation.confirmationDialog.locate("message:").text());
                    });
                    recordEditor.events.onRemove.fire();
                },
                start: true
            }
        }
    };

    var testRunner = function (testsConfig) {
        fluid.each(testsConfig, function (config, testName) {
            var testEnv = config.testEnv || recordEditorTest;
            testEnv[config.testType](testName, function () {
                if (config.expect) {
                    expect(config.expect);
                }
                var listeners = {};
                fluid.each(["afterRecordRender", "afterRemove", "onCancel"], function (eventName) {
                    var testName = eventName + "Test",
                        test = config[testName];
                    if (!test) {
                        return;
                    }
                    listeners[eventName] = {};
                    if (test.priority) {
                        listeners[eventName].priority = test.priority;
                    }
                    if (test.once) {
                        listeners[eventName].namespace = testName;
                    }
                    listeners[eventName].listener = function (recordEditor) {
                        if (test.once) {
                            recordEditor.events[eventName].removeListener(testName);
                        }
                        if (typeof test === "function") {
                            test(recordEditor);
                        } else {
                            test.test(recordEditor);
                        }
                        if (config.testType === "test") {return;}
                        if (test.start) {start();}
                        if (test.prevent) {
                            return false;
                        }
                    };
                });
                var options = fluid.merge(null, {
                    listeners: listeners
                }, config.recordEditorOptions);
                setupRecordEditor(options, testEnv);
            });
        });
    };

    testRunner(testConfig);
/*
    
    // Test for the removal of the record which is referenced somewhere else and it is a Person  
    recordEditorTestUsedBy.asyncTest("Test cannot delete-confirmation text - record is used by other records. Record of type person", function () {
         var model = {
            csid: "somecsid",
            relations: {},
            fields: {},
            refobjs: [
                {someobj: "This record "}
            ]
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            recordType: "person"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("Checking correct text: ", "This Person record can not be removed. It is used by other records.", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });
    /////
    // End of the test block
    /////
    
    // Test if there is Narrower Context
    recordEditorTestUsedBy.asyncTest("Test delete-confirmation text - NO Narrower and NO Broader Contexts", function () {
         var model = {
            csid: "somecsid",
            relations: {},
            fields: {
                broaderContext: "",
                narrowerContexts: [ { _primary : 0} ]
            },
            refobjs: []
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            recordType: "person"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("Checking correct text: ", "Delete this Person?", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });
    
    // Test if there is Narrower Context
    recordEditorTestUsedBy.asyncTest("Test cannot delete-confirmation text - record has Narrower context.", function () {
         var model = {
            csid: "somecsid",
            relations: {},
            fields: {
                broaderContext: "",
                narrowerContexts: [ { narrowerContext : "some narrower context"} ]
            },
            refobjs: []
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            recordType: "person"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("Checking correct text: ", "This Person record can not be removed. It has a Narrower Context.", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });
    
    // Test if there is Broader Context
    recordEditorTestUsedBy.asyncTest("Test cannot delete-confirmation text - record has Broader context.", function () {
         var model = {
            csid: "somecsid",
            relations: {},
            fields: {
                broaderContext: "some stuff here",
                narrowerContexts: [ ]
            },
            refobjs: []
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            recordType: "person"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("Checking correct text: ", "This Person record can not be removed. It has a Broader Context.", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });

    recordEditorTest.asyncTest("Record editor's fields to ignore (cloneAndStore)", function () {
         var model = {
            csid: "somecsid",
            relations: {},
            fields: {},
            fieldToIgnore: "IGNORE"
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            fieldsToIgnore: ["fieldToIgnore"]
        }, function (recordEditor) {
            jqUnit.assertValue("Model should contain fieldToIgnore", recordEditor.model.fieldToIgnore);
            jqUnit.assertUndefined("Local storage should have nothing there", recordEditor.localStorage.get());
            recordEditor.cloneAndStore();
            var modelToClone = recordEditor.localStorage.get();
            jqUnit.assertValue("Model to clone exists", modelToClone);
            jqUnit.assertUndefined("Ignored fields are removed", modelToClone.fieldToIgnore);
            start();
        });
    });
*/

}());
