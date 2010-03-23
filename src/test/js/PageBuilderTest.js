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

    cspace.testData.basicDependencies = {
        dateEntry: {
            funcName: "cspace.testComponent1",
            args: [
                "#recordEditorContainer"   // container
            ]
        },
        relatedRecords: {
            funcName: "cspace.testComponent2",
            args: [
                "#linksContainer"           // container
            ]
        }
    };

    cspace.testData.dependenciesWithOptions = {
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

    cspace.testData.dependenciesWithIOCdemands = {
        recordEditor: {
            funcName: "cspace.testComponent7",
            args: [
                "#recordEditorContainer",   // container
                {               // options with IOC demands
                    foo: "{pageBuilder}.options.option1",
                    bat: "{pageBuilder}.options.option2"
                }  
            ]
        }
    };

    cspace.testData.testPageSpec = {
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

    // these test components carry out tests on the markup, or on their parameters. they are
    // customized for the test functions that use them
    
    cspace.testComponent1 = function (container, options) {
        var jContainer = $(container);
        jqUnit.assertTrue("TestComponent1 instantiated", true);
        jqUnit.assertEquals("TestComponent1 initiated with correct container", cspace.testData.basicDependencies.dateEntry.args[0], container);
    };

    cspace.testComponent2 = function (container, options) {
        var jContainer = $(container);
        jqUnit.assertTrue("TestComponent2 instantiated", true);
        jqUnit.assertEquals("TestComponent2 initiated with correct container", cspace.testData.basicDependencies.relatedRecords.args[0], container);
    };

    cspace.testComponent3 = function (container, options) {
        var body = $("body");
        jqUnit.assertEquals("Template 1 inserted", 1, $("#testText1").length);
        jqUnit.assertEquals("Template 2 inserted", 1, $("#testText2").length);
        jqUnit.assertEquals("Rest of doc wasn't inserted", 0, $("#shouldntbehere", body).length);
        start();
    };

    cspace.testComponent4 = function (container, options) {
        jqUnit.assertTrue("TestComponent4 instantiated", true);
        jqUnit.assertEquals("TestComponent4 initiated with correct container", cspace.testData.dependenciesWithOptions.dateEntry.args[0], container);
        jqUnit.assertDeepEq("TestComponent4 initiated with correct options", cspace.testData.dependenciesWithOptions.dateEntry.args[1], options);
    };

    cspace.testComponent5 = function (container, options) {
        jqUnit.assertTrue("TestComponent5 instantiated", true);
        jqUnit.assertEquals("TestComponent5 initiated with correct container", cspace.testData.dependenciesWithOptions.relatedRecords.args[0], container);
        jqUnit.assertDeepEq("TestComponent5 initiated with correct options", cspace.testData.dependenciesWithOptions.relatedRecords.args[1], options);
    };

    cspace.testData.testIOCoptions = {option1: "bar", option2: "cat"};
    cspace.testComponent6 = function (container, options) {
        jqUnit.assertTrue("TestComponent6 instantiated", true);
        jqUnit.assertEquals("TestComponent6 initiated with correct container", cspace.testData.dependenciesWithOptions.relatedRecords.args[0], container);
        jqUnit.assertDeepEq("TestComponent6 initiated with correct IOC demand1", cspace.testData.testIOCoptions.option1, options.foo);
    };

    cspace.testComponent7 = function (container, options) {
        jqUnit.assertTrue("testComponent7 instantiated", true);
        jqUnit.assertEquals("testComponent7 initiated with correct container", cspace.testData.dependenciesWithIOCdemands.recordEditor.args[0], container);
        jqUnit.assertDeepEq("testComponent7 initiated with correct IOC demanded option1", cspace.testData.dependenciesWithIOCdemands.recordEditor.args[1].foo, options.foo);
        jqUnit.assertDeepEq("testComponent7 initiated with correct IOC demanded option2", cspace.testData.dependenciesWithIOCdemands.recordEditor.args[1].bat, options.bat);
    };

    cspace.testData.dependenciesWithIOCdemands = {
        recordEditor: {
            funcName: "cspace.testComponent7",
            args: [
                "#recordEditorContainer",   // container
                {               // options with IOC demands
                    foo: "{pageBuilder}.options.option1",
                    bat: "{pageBuilder}.options.option2"
                }  
            ]
        }
    };

    var pageBuilderTester = function () {
        var pageBuilderTest = new jqUnit.TestCase("PageBuilder Tests");
        
        pageBuilderTest.test("Assembly of HTML", function () {
            expect(3);
            var dependencies = {
                dateEntry: {
                    funcName: "cspace.testComponent3",
                    args: [
                        "#recordEditorContainer"   // container
                    ]
                }
            };
            var options = {
                pageSpec: cspace.testData.testPageSpec
            };
            done = 0;
            stop();
            cspace.pageBuilder(dependencies, options);
        });

        pageBuilderTest.test("Invocation of dependent components: container parameter", function () {
            expect(4);    // this is total num of assertions in the test components
            cspace.pageBuilder(cspace.testData.basicDependencies, cspace.testData.testIOCoptions);
        });
    
        pageBuilderTest.test("Invocation of dependent components: container plus options only", function () {
            expect(6);
            cspace.pageBuilder(cspace.testData.dependenciesWithOptions);
        });
    
        pageBuilderTest.test("Invocation of dependent components: mini IOC", function () {
//            expect(?);
            var pbOpts = {
                option1: "September",
                option2: "Toronto"
            };
            cspace.pageBuilder(cspace.testData.dependenciesWithIOCdemands, pbOpts);
        });
    
    };
    
    $(document).ready(function () {
        pageBuilderTester();
    });

})(jQuery);
    

