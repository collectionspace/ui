/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, jqUnit, jQuery, start, stop, expect*/
"use strict";

cspace = cspace || {};

(function ($) {
    /*
     * Utility to call qUnit's start() only once all tests have executed
     */
    var done; 
    var startIfDone = function (numTests) {
        if (++done === numTests) {
            done = 0;
            start();
        }
    };

    cspace.testData = cspace.testData || {};

    var testPageSpec = {
        recordEditor: {
            href: "test-data/template1.html",
            templateSelector: "#template1mainNode",
            targetSelector: "#insertTemplate1here"
        },
        sidebar: {
            href: "test-data/template2.html",
            templateSelector: "#template2mainNode",
            targetSelector: "#insertTemplate2here"
        }
    };

    var pageBuilderTester = function () {
        
        var pageBuilderTest = new jqUnit.TestCase("PageBuilder Tests", function () {
            cspace.util.isTest = true;
        });
        
        var basicTestListeners = {
            pageReady: function () {
                start();
            }
        };
        
        var testIOCoptions = {
            option1: "bar", 
            option2: "cat",
            listeners: basicTestListeners,
            selectors: {
                recordEditor: "#recordEditorContainer",
                relatedRecords: "#linksContainer"
            },
            components: {
                recordEditor: {
                    type: "cspace.testComponent2"
                },
                relatedRecords: {
                    type: "cspace.testComponent3"
                }
            },
            permissions: cspace.tests.sampleUserPerms
        };
        
        var optionsWithComponentsWithOptions = {
            selectors: {
                recordEditor: "#recordEditorContainer",
                relatedRecords: "#linksContainer"
            },
            components: {
                recordEditor: {
                    type: "cspace.testComponent4",
                    options: {
                        foo: "bar",
                        bat: "cat"
                    }
                },
                relatedRecords: {
                    type: "cspace.testComponent5",
                    options: {
                        foo: {
                            bar: "bat",
                            cat: "CATT"
                        }
                    }
                }
            },
            listeners: basicTestListeners,
            permissions: cspace.tests.sampleUserPerms
        };
        
        var optionsWithComponentsWithIOCdemands = {
            selectors: {
                recordEditor: "#recordEditorContainer"
            },
            components: {
                recordEditor: {
                    type: "cspace.testComponent6",
                    options: {
                        foo: "{pageBuilder}.options.option1",
                        bat: "{pageBuilder}.options.option2",
                        options: {
                            foobarSubcomponent: "{pageBuilder}.options.option1"
                        }
                    }
                }
            },
            option1: "September",
            option2: "Toronto",
            listeners: basicTestListeners,
            permissions: cspace.tests.sampleUserPerms
        };
        
        var optionsWithComponentsWithAdditionalParameters = {
            selectors: {
                recordEditor: "#recordEditorContainer"
            },
            components: {
                recordEditor: {
                    type: "cspace.testComponent7",
                    options: {
                        option1: "Danny Kaye"
                    }
                }
            },
            listeners: basicTestListeners,
            permissions: cspace.tests.sampleUserPerms
        };
        
        var optionsWithComponentsWithDemandInParameters = {
            selectors: {
                recordEditor: "#recordEditorContainer"
            },
            components: {
                recordEditor: {
                    type: "cspace.testComponent8",
                    options: {
                        option1: "Danny Kaye"
                    }
                }
            },
            pbOpt: "Jacob",
            listeners: basicTestListeners,
            permissions: cspace.tests.sampleUserPerms
        };
        
        cspace.testComponent1 = function (container, options) {
            var body = $("body");
            jqUnit.assertEquals("Template 1 inserted", 1, $("#testText1").length);
            jqUnit.assertEquals("Template 2 inserted", 1, $("#testText2").length);
            jqUnit.assertEquals("Rest of doc wasn't inserted", 0, $("#shouldntbehere", body).length);
            start();
        };
        
        cspace.testComponent2 = function (container, options) {
            var jContainer = $(container);
            jqUnit.assertTrue("testComponent2 instantiated", true);
            jqUnit.assertEquals("testComponent2 initiated with correct container", "#recordEditorContainer", container);
        };
    
        cspace.testComponent3 = function (container, options) {
            var jContainer = $(container);
            jqUnit.assertTrue("testComponent3 instantiated", true);
            jqUnit.assertEquals("testComponent3 initiated with correct container", "#linksContainer", container);
        };
        
        cspace.testComponent4 = function (container, options) {
            jqUnit.assertTrue("TestComponent4 instantiated", true);
            jqUnit.assertEquals("TestComponent4 initiated with correct container", "#recordEditorContainer", container);
            delete options["targetTypeName"];
            jqUnit.assertDeepEq("TestComponent4 initiated with correct options", optionsWithComponentsWithOptions.components.recordEditor.options, options);
        };
    
        cspace.testComponent5 = function (container, options) {
            jqUnit.assertTrue("TestComponent5 instantiated", true);
            jqUnit.assertEquals("TestComponent5 initiated with correct container", "#linksContainer", container);
            delete options["targetTypeName"];
            jqUnit.assertDeepEq("TestComponent5 initiated with correct options", optionsWithComponentsWithOptions.components.relatedRecords.options, options);
        };
        
        cspace.testComponent6 = function (container, options) {
            jqUnit.assertTrue("testComponent6 instantiated", true);
            jqUnit.assertEquals("testComponent6 initiated with correct container", optionsWithComponentsWithIOCdemands.selectors.recordEditor, container);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option1", "September", options.foo);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option2", "Toronto", options.bat);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option1 for subcomponent", "September", options.options.foobarSubcomponent);
        };
        
        cspace.testComponent7 = function (container, stringParam, options) {
            jqUnit.assertTrue("testComponent7 instantiated", true);
            jqUnit.assertEquals("testComponent7 initiated with correct container", optionsWithComponentsWithAdditionalParameters.selectors.recordEditor, container);
            jqUnit.assertDeepEq("testComponent7 initiated with correct extra parameter", "extraParameter", stringParam);
            jqUnit.assertDeepEq("testComponent7 initiated with correct option", "Danny Kaye", options.option1);
        };
        
        cspace.testComponent8 = function (container, nameParam, options) {
            jqUnit.assertTrue("testComponent8 instantiated", true);
            jqUnit.assertEquals("testComponent8 initiated with correct container", optionsWithComponentsWithDemandInParameters.selectors.recordEditor, container);
            jqUnit.assertDeepEq("testComponent8 initiated with correct extra parameter demanded from PageBuilder", "Jacob", nameParam);
            jqUnit.assertDeepEq("testComponent8 initiated with correct option", "Danny Kaye", options.option1);
        };
            
        pageBuilderTest.asyncTest("Assembly of HTML only", function () {
            var options = {
                pageSpec: testPageSpec,
                htmlOnly: true,
                listeners: {
                    pageReady: function () {
                        var body = $("body");
                        jqUnit.assertEquals("Template 1 inserted", 1, $("#testText1").length);
                        jqUnit.assertEquals("Template 2 inserted", 1, $("#testText2").length);
                        jqUnit.assertEquals("Rest of doc wasn't inserted", 0, $("#shouldntbehere", body).length);
                        $("#testText1").remove();
                        $("#testText2").remove();
                        start();
                    }
                }
            };
            done = 0;
            cspace.pageBuilder(options);
        });

        pageBuilderTest.asyncTest("Assembly of HTML", function () {
            expect(3);
            
            fluid.demands("recordEditor", "cspace.pageBuilder", 
                ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]);
                
            var options = {
                pageSpec: testPageSpec,
                selectors: {
                    recordEditor: "#recordEditorContainer"
                },
                components: {
                    recordEditor: {
                        type: "cspace.testComponent1"
                    }
                },
                permissions: cspace.tests.sampleUserPerms
            };
            done = 0;
            cspace.pageBuilder(options);
        });

    
        pageBuilderTest.asyncTest("Invocation of dependent components: container parameter", function () {
            expect(4);    // this is total num of assertions in the test components
            fluid.demands("recordEditor", "cspace.pageBuilder", 
                ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]);
            fluid.demands("relatedRecords", "cspace.pageBuilder", 
                ["{pageBuilder}.options.selectors.relatedRecords", fluid.COMPONENT_OPTIONS]);
            cspace.pageBuilder(testIOCoptions);
        });
    
        pageBuilderTest.asyncTest("Invocation of dependent components: container plus options only", function () {
            expect(6);
            fluid.demands("recordEditor", "cspace.pageBuilder", 
                ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]);
            fluid.demands("relatedRecords", "cspace.pageBuilder", 
                ["{pageBuilder}.options.selectors.relatedRecords", fluid.COMPONENT_OPTIONS]);
            cspace.pageBuilder(optionsWithComponentsWithOptions);
        });
        
        pageBuilderTest.asyncTest("Invocation of dependent components: mini IOC", function () {
            expect(5);
            fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.test1");
            fluid.demands("recordEditor", ["cspace.pageBuilder", "cspace.test1"], 
                ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]);
            cspace.pageBuilder(optionsWithComponentsWithIOCdemands);
        });
        
        pageBuilderTest.asyncTest("Invocation of dependent components: additional parameters to components", function () {
            expect(4);
            fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.test2");
            fluid.demands("recordEditor", ["cspace.pageBuilder", "cspace.test2"], 
                ["{pageBuilder}.options.selectors.recordEditor", "extraParameter", fluid.COMPONENT_OPTIONS]);
            cspace.pageBuilder(optionsWithComponentsWithAdditionalParameters);
        });
        
        pageBuilderTest.asyncTest("Invocation of dependent components: IOC in additional parameters", function () {
            expect(4);
            fluid.staticEnvironment.cspacePage = fluid.typeTag("cspace.test3");
            fluid.demands("recordEditor", ["cspace.pageBuilder", "cspace.test3"], 
                ["{pageBuilder}.options.selectors.recordEditor", "{pageBuilder}.options.pbOpt", fluid.COMPONENT_OPTIONS]);
            cspace.pageBuilder(optionsWithComponentsWithDemandInParameters);
        });
    };
    
    $(document).ready(function () {
        pageBuilderTester();
    });

})(jQuery);
    

