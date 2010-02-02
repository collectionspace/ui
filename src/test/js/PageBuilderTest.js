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
//                ,{modelPath: "fields"}  // options
            ]
        },
        relatedRecords: {
            funcName: "cspace.testComponent2",
            args: [
                "#linksContainer"           // container
//                ,{modelPath: "relations"}   // options
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
        var jContainer = $(container);
        jqUnit.assertEquals("Template 1 inserted", 1, $("#testText1").length);
        startIfDone(2);
    };

    cspace.testComponent4 = function (container, options) {
        var jContainer = $(container);
        jqUnit.assertEquals("Template 2 inserted", 1, $("#testText2").length);
        startIfDone(2);
    };

    var pageBuilderTester = function () {
        var pageBuilderTest = new jqUnit.TestCase("PageBuilder Tests");
        
        pageBuilderTest.test("Invocation of dependent components", function () {
            expect(4);    // this is total num of assertions in the test components
            cspace.pageBuilder(cspace.testData.basicDependencies);
        });
    
        pageBuilderTest.test("Assembly of HTML", function () {
            expect(2);
            var dependencies = {
                dateEntry: {
                    funcName: "cspace.testComponent3",
                    args: [
                        "#dataEntryContainer"   // container
                    ]
                },
                relatedRecords: {
                    funcName: "cspace.testComponent4",
                    args: [
                        "#linksContainer"           // container
                    ]
                }
            }
            var options = {
                pageSpec: cspace.testData.testPageSpec
            };
            done = 0;
            stop();
            cspace.pageBuilder(dependencies, options);
        });
    };

    $(document).ready(function () {
        pageBuilderTester();
    });

})(jQuery);
    
// The following code bits will be useful in future tests, but not right now,
// so it is temporarily commented out. I want the currently working tests to be
// as clear as possible
// I know commented code is bad, but I don't want to lose this work right now.

/*
    cspace.testData.testUISpec1 = {
        title: "${fields.objectTitle}",
        description: "${fields.briefDescription}",
        method: [
//need "children" here!!!
            {repeatFromModel: "${fields.entryMethod.0}"}
        ]
    };
    cspace.testData.testUISpec2 = {
        link: {
            target: {buildValue: "${relations.recordType}.html?csid=${csid}"},
            linktext: "${relations.number}"
        }
    };
    cspace.pageBuilder.uispec = {
        dateEntry: cspace.testData.testUISpec1,
        relatedRecords: cspace.testData.testUISpec2
    };
    cspace.testData.testModel = {
        fields: {
            objectTitle: "Rendered title",
            briefDescription: "Rendered description",
            entryMethod: ["foo", "bar", "bat"]
        },
        relations: {
            recordType: "object",
            number: "2005.1",
            csid: "12345"
        }
    };
*/

    //    pageBuilderTest.test("ProtoComponents", function () {
    //        var testProtoTree1 = {
    //            title: "${fields.objectTitle}",
    //            description: "${fields.briefDescription}",
    //            method: [
    ////need "children" here!!!
    //                {repeatFromModel: "${fields.entryMethod.0}"}
    //            ],
    //            dataEntryContainer: {
    //                decorators: [
    //                    {type: "fluid",
    //                     func: "cspace.testComponent1",
    //                     container: "#dataEntryContainer",
    //                     options: {modelPath: "fields"} }
    //                ]
    //            }
    //        };
    //        var testProtoTree2 = {
    //            link: {
    //                target: {buildValue: "${relations.recordType}.html?csid=${csid}"},
    //                linktext: "${relations.number}"
    //            },
    //            linksContainer: {
    //                decorators: [
    //                    {type: "fluid",
    //                     func: "cspace.testComponent2",
    //                     container: "#linksContainer",
    //                     options: {modelPath: "relations"} }
    //                ]
    //            }
    //        };
    //        cspace.pageBuilder.uispec = {
    //            dataEntry: testProtoTree1,
    //            relatedRecords: testProtoTree2
    //        };
    //        var testModel = {
    //            fields: {
    //                objectTitle: "Rendered title",
    //                briefDescription: "Rendered description",
    //                entryMethod: ["foo", "bar", "bat"]
    //            },
    //            relations: {
    //                recordType: "object",
    //                number: "2005.1",
    //                csid: "12345"
    //            }
    //        };
    //        done = 0;
    //        stop();
    //        var pageBuilder = cspace.pageBuilder("#protoTreeTest", {model: testModel});
    //    });
