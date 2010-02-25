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
                "#dataEntryContainer"   // container
            ]
        },
        relatedRecords: {
            funcName: "cspace.testComponent2",
            args: [
                "#linksContainer"           // container
            ]
        }
    };

    cspace.testData.testPageSpec = {
        dataEntry: {
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
        jqUnit.assertEquals("Rest of doc wasn't inseted", 0, $("#shouldntbehere", body).length);
        start();
    };

    var pageBuilderTester = function () {
        var pageBuilderTest = new jqUnit.TestCase("PageBuilder Tests");
        
        pageBuilderTest.test("Invocation of dependent components", function () {
            expect(4);    // this is total num of assertions in the test components
            cspace.pageBuilder(cspace.testData.basicDependencies);
        });
    
        pageBuilderTest.test("Assembly of HTML", function () {
            expect(3);
            var dependencies = {
                dateEntry: {
                    funcName: "cspace.testComponent3",
                    args: [
                        "#dataEntryContainer"   // container
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

        pageBuilderTest.test("Constructing dependency options", function () {});

    };
    

    $(document).ready(function () {
        pageBuilderTester();
    });

})(jQuery);
    

