/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

(function () {
    fluid.setLogging(true);

    var bareRecordEditorTest = new jqUnit.TestCase("recordEditor Tests", null, function () {
        $(".ui-dialog").detach();
    });
    
    var recordEditorTest = cspace.tests.testEnvironment({testCase: bareRecordEditorTest});
    
    var setupRecordEditor = function (options, callback) {
        var recordEditor;
        fluid.merge(null, options, {
            applier: fluid.makeChangeApplier(options.model),
            listeners: {
                "afterRender.initialRender": callback
            }
        });
        recordEditor = cspace.recordEditor("#main", options);
        stop();
    };
    
    recordEditorTest.test("Creation", function () {
        var model = {
            fields: {
                field1: "A",
                field2: "B",
                field3: "C"
            }
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext(model, {baseUrl: "."}),
            uispec: {
                ".csc-test-1": "${fields.field1}",
                ".csc-test-2": "${fields.field2}",
                ".csc-test-3": "${fields.field3}"
            }
        }, function (re) {
            jqUnit.assertEquals("foo", model.fields.field1, jQuery(".csc-test-1").val());
            start();
        });
    });
    
    recordEditorTest.test("Delete", function () {
        var model = {
            csid: "123.456.789",
            fields: {}
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext(model, {baseUrl: "http://mymuseum.org", recordType: "thisRecordType"}),
            uispec: {}
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                re.options.dataContext.events.afterRemove.addListener(function () {
                    jqUnit.assertTrue("Successfully executed remove", true);
                    start();
                });
                re.confirmation.confirmationDialog.locate("act").click();
            });
            re.remove();
        });
    });
    
    recordEditorTest.test("Rollback test", function () {
        var model = {
            csid: "123.456.789",
            fields: {
                testField: "TEST"
            }
        };
        var field = ".csc-test-1";
        var uispec = {};
        uispec[field] = "${fields.testField}";
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext(model, {baseUrl: "http://mymuseum.org", recordType: "thisRecordType"}),
            uispec: uispec
        }, function (re) {
            re.events.afterRender.removeListener("initialRender");
            fluid.log("RETest: afterRender");
            jqUnit.assertEquals("Original value of the field is", "TEST", jQuery(field).val());
            jQuery(field).val("NEW VALUE").change();
            jqUnit.assertEquals("New value of the field is", "NEW VALUE", jQuery(field).val());
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("The value of the field should still be", "NEW VALUE", jQuery(field).val());
                re.confirmation.confirmationDialog.locate("proceed").click();
            });
            re.options.globalNavigator.events.onPerformNavigation.fire(function () {
                jqUnit.assertEquals("The value of the field should roll back to", "TEST", jQuery(field).val());
                start();
            });
        });
    });

}());

