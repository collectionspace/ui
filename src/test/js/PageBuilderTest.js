/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, jqUnit, jQuery, start, stop, expect*/

var pageBuilderTester = function () {
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

    var pageBuilderTest = new jqUnit.TestCase("PageBuilder Tests");
    
    cspace.testComponent1 = function (container, options) {
        var jContainer = $(container);
        jqUnit.assertEquals("Number of element rendered", 2, $(".inside-container", jContainer).length);
        startIfDone(2);
    };

    cspace.testComponent2 = function (container, options) {
        var jContainer = $(container);
        jqUnit.assertEquals("Number of element rendered", 1, $(".inside-container", jContainer).length);
        startIfDone(2);
    };

    pageBuilderTest.test("ProtoComponents", function () {
        var testProtoTree1 = {
            title: "${fields.objectTitle}",
            description: "${fields.briefDescription}",
            dataEntryContainer: {
                decorators: [
                    {type: "fluid",
                     func: "cspace.testComponent1",
                     container: "#dataEntryContainer",
                     options: {modelPath: "fields"} }
                ]
            }
        };
        var testProtoTree2 = {
            link: {target: "${relations.recordType}.html?csid=${csid}",
                    linktext: "${relations.number}"},
            linksContainer: {
                decorators: [
                    {type: "fluid",
                     func: "cspace.testComponent2",
                     container: "#linksContainer",
                     options: {modelPath: "relations"} }
                ]
            }
        };
        cspace.pageBuilder.uispec = {
            dataEntry: testProtoTree1,
            relatedRecords: testProtoTree2
        };
        var testModel = {
            fields: {
                objectTitle: "Rendered title",
                briefDescription: "Rendered description"
            },
            relations: {
                recordType: "object",
                number: "2005.1",
                csid: "12345"
            }
        };
        done = 0;
        stop();
        var pageBuilder = cspace.pageBuilder("#protoTreeTest", {model: testModel});
    });
};

    
(function () {
    pageBuilderTester();
}());
