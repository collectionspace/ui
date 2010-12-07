/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/
"use strict";

(function () {
    fluid.setLogging(true);

    var bareRecordEditorTest = new jqUnit.TestCase("recordEditor Tests", null, function () {
        $(".ui-dialog").detach();
    });
    var recordEditorTest = cspace.tests.testEnvironment({testCase: bareRecordEditorTest});
    
    recordEditorTest.test("Creation", function () {
        var testModel = {
            fields: {
                field1: "A",
                field2: "B",
                field3: "C"
            }
        };
        var opts = {};
        opts.applier = fluid.makeChangeApplier(testModel);
        opts.dataContext = cspace.dataContext(testModel, {baseUrl: "."});
        opts.model = testModel,
        opts.uispec = {
            ".csc-test-1": "${fields.field1}",
            ".csc-test-2": "${fields.field2}",
            ".csc-test-3": "${fields.field3}"
        };
        opts.listeners = {
            afterRender: function () {
                jqUnit.assertEquals("foo", testModel.fields.field1, jQuery(".csc-test-1").val());
                start();
            }
        };
        var recordEditor = cspace.recordEditor("#main", opts);
        stop();
    });
    
    recordEditorTest.test("Delete", function () {
        var opts = {};
        var testModel = {
            csid: "123.456.789",
            fields: {}
        };
        var opts = {
            model: testModel,
            dataContext: cspace.dataContext(testModel, {baseUrl: "http://mymuseum.org", recordType: "thisRecordType"}),
            uispec: {},
            applier: fluid.makeChangeApplier(testModel),
            listeners: {
                afterRender: function(recordEditor) {
                    fluid.log("RETest: afterRender");
                    recordEditor.options.dataContext.events.afterRemove.addListener(function () {
                        jqUnit.assertTrue("Successfully executed remove", true);
                        start();
                    });
                    recordEditor.remove();
                    recordEditor.confirmation.locate("act", recordEditor.confirmation.dlg).click();
                }
            }
        };
        var recordEditor = cspace.recordEditor("#main", opts);
        stop();
    });

}());

