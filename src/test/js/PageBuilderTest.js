/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, jqUnit, jQuery, start, stop, expect*/

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
        
        pageBuilderTest.test("Assembly of HTML only", function () {
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
            stop();
            cspace.pageBuilder(null, options);
        });

        cspace.testComponent1 = function (container, options) {
            var body = $("body");
            jqUnit.assertEquals("Template 1 inserted", 1, $("#testText1").length);
            jqUnit.assertEquals("Template 2 inserted", 1, $("#testText2").length);
            jqUnit.assertEquals("Rest of doc wasn't inserted", 0, $("#shouldntbehere", body).length);
            start();
        };

        pageBuilderTest.test("Assembly of HTML", function () {
            expect(3);
            var dependencies = {
                dateEntry: {
                    funcName: "cspace.testComponent1",
                    args: ["#recordEditorContainer"]   // container
                }
            };
            var options = {
                pageSpec: testPageSpec
            };
            done = 0;
            stop();
            cspace.pageBuilder(dependencies, options);
        });

        var basicDependencies = {
            dateEntry: {
                funcName: "cspace.testComponent2",
                args: ["#recordEditorContainer"]   // container
            },
            relatedRecords: {
                funcName: "cspace.testComponent3",
                args: ["#linksContainer"]           // container
            }
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
    
        var testIOCoptions = {option1: "bar", option2: "cat"};

        pageBuilderTest.test("Invocation of dependent components: container parameter", function () {
            expect(4);    // this is total num of assertions in the test components
            cspace.pageBuilder(basicDependencies, testIOCoptions);
        });
    
        var dependenciesWithOptions = {
            dateEntry: {
                funcName: "cspace.testComponent4",
                args: [
                    "#recordEditorContainer",   // container
                    {               // options
                        foo: "bar",
                        bat: "cat"
                    }  
                ]
            },
            relatedRecords: {
                funcName: "cspace.testComponent5",
                args: [
                    "#linksContainer",           // container
                    {               // options
                        foo: {
                            bar: "bat",
                            cat: "CATT"
                        }
                    }  
                ]
            }
        };
    
        cspace.testComponent4 = function (container, options) {
            jqUnit.assertTrue("TestComponent4 instantiated", true);
            jqUnit.assertEquals("TestComponent4 initiated with correct container", "#recordEditorContainer", container);
            jqUnit.assertDeepEq("TestComponent4 initiated with correct options", dependenciesWithOptions.dateEntry.args[1], options);
        };
    
        cspace.testComponent5 = function (container, options) {
            jqUnit.assertTrue("TestComponent5 instantiated", true);
            jqUnit.assertEquals("TestComponent5 initiated with correct container", "#linksContainer", container);
            jqUnit.assertDeepEq("TestComponent5 initiated with correct options", dependenciesWithOptions.relatedRecords.args[1], options);
        };

        pageBuilderTest.test("Invocation of dependent components: container plus options only", function () {
            expect(6);
            cspace.pageBuilder(dependenciesWithOptions);
        });
    
        var dependenciesWithIOCdemands = {
            recordEditor: {
                funcName: "cspace.testComponent6",
                args: [
                    "#recordEditorContainer",   // container
                    {               // options with IOC demands
                        foo: "{pageBuilder}.options.option1",
                        bat: "{pageBuilder}.options.option2",
                        options: {
                            foobarSubcomponent: "{pageBuilder}.options.option1"
                        }
                    }  
                ]
            }
        };
    
        cspace.testComponent6 = function (container, options) {
            jqUnit.assertTrue("testComponent6 instantiated", true);
            jqUnit.assertEquals("testComponent6 initiated with correct container", dependenciesWithIOCdemands.recordEditor.args[0], container);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option1", "September", options.foo);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option2", "Toronto", options.bat);
            jqUnit.assertDeepEq("testComponent6 initiated with correct IOC demanded option1 for subcomponent", "September", options.options.foobarSubcomponent);
        };
    
        pageBuilderTest.test("Invocation of dependent components: mini IOC", function () {
            expect(5);
            var pbOpts = {
                option1: "September",
                option2: "Toronto"
            };
            cspace.pageBuilder(dependenciesWithIOCdemands, pbOpts);
        });
    
        var dependenciesWithAdditionalParameters = {
            recordEditor: {
                funcName: "cspace.testComponent7", 
                args: [
                    "#recordEditorContainer",
                    "extraParameter",
                    {option1: "Danny Kaye"}
                ]
            }
        };
        cspace.testComponent7 = function (container, stringParam, options) {
            jqUnit.assertTrue("testComponent7 instantiated", true);
            jqUnit.assertEquals("testComponent7 initiated with correct container", dependenciesWithIOCdemands.recordEditor.args[0], container);
            jqUnit.assertDeepEq("testComponent7 initiated with correct extra parameter", "extraParameter", stringParam);
            jqUnit.assertDeepEq("testComponent7 initiated with correct option", "Danny Kaye", options.option1);
        };

        pageBuilderTest.test("Invocation of dependent components: additional parameters to components", function () {
            expect(4);
            cspace.pageBuilder(dependenciesWithAdditionalParameters);
        });
    
        var dependenciesWithDemandInParameters = {
            recordEditor: {
                funcName: "cspace.testComponent8", 
                args: [
                    "#recordEditorContainer",
                    "{pageBuilder}.options.pbOpt",
                    {option1: "Danny Kaye"}
                ]
            }
        };
        cspace.testComponent8 = function (container, nameParam, options) {
            jqUnit.assertTrue("testComponent8 instantiated", true);
            jqUnit.assertEquals("testComponent8 initiated with correct container", dependenciesWithIOCdemands.recordEditor.args[0], container);
            jqUnit.assertDeepEq("testComponent8 initiated with correct extra parameter demanded from PageBuilder", "Jacob", nameParam);
            jqUnit.assertDeepEq("testComponent8 initiated with correct option", "Danny Kaye", options.option1);
        };

        pageBuilderTest.test("Invocation of dependent components: IOC in additional parameters", function () {
            expect(4);
            cspace.pageBuilder(dependenciesWithDemandInParameters, {pbOpt: "Jacob"} );
        });
    };
    
    $(document).ready(function () {
        pageBuilderTester();
    });

})(jQuery);
    

