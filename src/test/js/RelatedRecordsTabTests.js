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

    var bareRRTTest = new jqUnit.TestCase("Related Records Tab Tests", function () {
            $("#main").html(template);
        }),
        template;

    jQuery.ajax({
        url: "../../main/webapp/defaults/html/pages/RelatedRecordsTabTemplate.html",
        dataType: "html",
        success: function (data) {
            template = data;
        }
    });

    // Stub for pageBuilderIO
    fluid.defaults("cspace.tests.pageBuilderIO", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        schema: {
            objectexit: null
        },
        recordType: "objectexit"
    });

    fluid.defaults("cspace.pageBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        resources: {
            objectexit: cspace.resourceSpecExpander({
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
                url: "%test/uispecs/objectexit-tab.json",
                fetchClass: "testResource",
                forceCache: true,
                options: {
                    dataType: "json"
                }
            })
        },
        pageType: "objectexit-tab",
        selectors: {
            relatedRecordsTab: "#main"
        },
        schema: ["objectexit", "namespaces", "recordtypes", "recordlist"],
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

    var rrtTest = cspace.tests.testEnvironment({testCase: bareRRTTest, permissions: cspace.tests.fullPerms, components: {
        tabs: {
            type: "fluid.typeFount",
            options: {
                targetTypeName: "cspace.tabs"
            }
        },
        pageBuilderIO: {
            type: "cspace.tests.pageBuilderIO"
        },
        pageBuilder: {
            type: "cspace.pageBuilder"
        }
    }});

    var setupRRT = function (options, testEnv) {
        testEnv = testEnv || rrtTest;
        var instantiator = testEnv.instantiator;
        if (testEnv.relatedRecordsTab) {
            instantiator.clearComponent(testEnv, "relatedRecordsTab");
        }
        testEnv.options.components.relatedRecordsTab = {
            type: "cspace.relatedRecordsTab",
            options: fluid.merge(null, {
                primary: "objectexit",
                related: "objectexit",
                csid: "aa643807-e1d1-4ca2-9f9b",
                strings: {
                    editRecord: "objectexit-editRecord",
                    recordList: "objectexit-recordList"
                },
                components: {
                    relatedRecordsRecordEditor: {
                        options: {
                            selectors: {
                                identificationNumber: ".csc-objectexit-exitNumber"
                            },
                            uispec: "{pageBuilder}.options.uispec.details"
                        }
                    }
                }
            }, options)
        };
        fluid.fetchResources({}, function () {
            fluid.initDependent(testEnv, "relatedRecordsTab", instantiator);
        }, {amalgamateClasses: ["testResource"]});
    };

    var checkCreatedStyling = function (relatedRecordsTab) {
        var created = relatedRecordsTab.options.styles.created,
            recordEditorContainer = relatedRecordsTab.locate("recordEditor");
        jqUnit[relatedRecordsTab.selectedRecordCsid ? "assertTrue" : "assertFalse"]("Record editor does not have a created class",
            recordEditorContainer.hasClass(created));
    };

    var testConfig = {
        "Creation": {
            testType: "asyncTest",
            testEnv: rrtTest,
            setup: setupRRT,
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (relatedRecordsTab) {
                        jqUnit.isVisible("List view is visible", relatedRecordsTab.locate("relatedRecordsListView"));
                        jqUnit.assertEquals("Related records list is initialized", 2, relatedRecordsTab.relatedRecordsListView.locate("row").length);
                        jqUnit.notVisible("Record editor is invisible", relatedRecordsTab.locate("recordEditor"));
                        jqUnit.isVisible("Banner message is visible", relatedRecordsTab.locate("record"));
                        start();
                    }
                }
            }
        },
        "Selection": {
            testType: "asyncTest",
            testEnv: rrtTest,
            setup: setupRRT,
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (relatedRecordsTab) {
                        relatedRecordsTab.relatedRecordsListView.locate("row").eq(1).click();
                    }
                },
                recordEditorReady: {
                    path: "listeners",
                    listener: function (relatedRecordsTab) {
                        checkCreatedStyling(relatedRecordsTab);
                        var controlPanels = fluid.renderer.getDecoratorComponents(relatedRecordsTab.relatedRecordsRecordEditor);
                        fluid.each(controlPanels, function (controlPanel) {
                            var goTo = controlPanel.locate("goTo");
                            jqUnit.isVisible("Delete button is disabled", goTo);
                            jqUnit.assertEquals("href for the 'Go to record' should be", "../../main/webapp/defaults/html/objectexit.html?csid=ba97ae73-1016-4c62-b4eb", goTo.attr("href"));
                        });
                        start();
                    },
                    priority: "last"
                }
            }
        },
        "Selection Again": {
            testType: "asyncTest",
            testEnv: rrtTest,
            setup: setupRRT,
            listeners: {
                "ready.test": {
                    path: "listeners",
                    listener: function (relatedRecordsTab) {
                        relatedRecordsTab.relatedRecordsListView.locate("row").eq(1).click();
                    },
                    once: true
                },
                "recordEditorReady.test": {
                    path: "listeners",
                    listener: function (relatedRecordsTab) {
                        checkCreatedStyling(relatedRecordsTab);
                        var controlPanels = fluid.renderer.getDecoratorComponents(relatedRecordsTab.relatedRecordsRecordEditor);
                        fluid.each(controlPanels, function (controlPanel) {
                            var goTo = controlPanel.locate("goTo");
                            jqUnit.isVisible("Delete button is disabled", goTo);
                            jqUnit.assertEquals("href for the 'Go to record' should be", "../../main/webapp/defaults/html/objectexit.html?csid=ba97ae73-1016-4c62-b4eb", goTo.attr("href"));
                        });
                        relatedRecordsTab.events.recordEditorReady.addListener(function (relatedRecordsTab) {
                            checkCreatedStyling(relatedRecordsTab);
                            var controlPanels = fluid.renderer.getDecoratorComponents(relatedRecordsTab.relatedRecordsRecordEditor);
                            fluid.each(controlPanels, function (controlPanel) {
                                var goTo = controlPanel.locate("goTo");
                                jqUnit.isVisible("Delete button is disabled", goTo);
                                jqUnit.assertEquals("href for the 'Go to record' should be", "../../main/webapp/defaults/html/objectexit.html?csid=ba97ae73-1016-4c62-b4ea", goTo.attr("href"));
                            });
                            start();
                        });
                        relatedRecordsTab.relatedRecordsListView.locate("row").eq(0).click();
                    },
                    priority: "last",
                    once: true
                }
            }
        },
        "RecordEditor stylings": {
            testType: "asyncTest",
            testEnv: rrtTest,
            setup: setupRRT,
            listeners: {
                "ready.test": {
                    path: "listeners",
                    listener: function (relatedRecordsTab) {
                        relatedRecordsTab.events.onCreateNewRecord.fire();
                    },
                    once: true
                },
                "recordEditorReady.test": {
                    path: "listeners",
                    listener: function (relatedRecordsTab) {
                        checkCreatedStyling(relatedRecordsTab);
                        start();
                    },
                    priority: "last",
                    once: true
                }
            }
        }
    };

    fluid.each(["ready"], function (eventName) {
        fluid.demands(eventName, ["cspace.relatedRecordsTab", "cspace.test"], {
            args: ["{cspace.relatedRecordsTab}"]
        });
    });

    cspace.tests.testRunner(testConfig);

}());