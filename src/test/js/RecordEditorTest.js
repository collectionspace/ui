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
    //fluid.setLogging(true);

    var bareRecordEditorTest = new jqUnit.TestCase("recordEditor Tests", null, function () {
        $(".ui-dialog").detach();
    });

    var recordEditorTest = cspace.tests.testEnvironment({testCase: bareRecordEditorTest});
    
    var recordEditorTestUsedBy = cspace.tests.testEnvironment({testCase: bareRecordEditorTest, components: {
        someComponent: fluid.typeTag("person")
    }});

    var setupRecordEditor = function (options, callback) {
        fluid.merge(null, options, {
            applier: fluid.makeChangeApplier(options.model),
            listeners: {
                "afterRender.initialRender": callback
            },
            showDeleteButton: true,
            components: {
                validator: {
                    type: "fluid.emptySubcomponent"
                }
            },
            strings: {
                updateSuccessfulMessage: "%record successfully saved",
                createSuccessfulMessage: "New %record successfully created",
                removeSuccessfulMessage: "%record successfully deleted",
                updateFailedMessage: "Error saving %record: ",
                createFailedMessage: "Error creating %record: ",
                deleteFailedMessage: "Error deleting %record: ",
                fetchFailedMessage: "Error retriving %record: ",
                addRelationsFailedMessage: "Error adding related records: ",
                removeRelationsFailedMessage: "Error removing related records: ",
                missingRequiredFields: "Required field is empty: %field",
                deleteButton: "Delete",
                deleteMessageWithRelated: " and its relationships",
                deleteMessageMediaAttached: " and its attached media"
            }
        });
        cspace.recordEditor("#main", options);
    };

    recordEditorTest.asyncTest("Creation", function () {
        var model = {
            fields: {
                field1: "A",
                field2: "B",
                field3: "C"
            }
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: ".", model: model}),
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
    
    cspace.tests.testAfterDelete = function (that) {
        jqUnit.assertTrue("Successfully executed remove", true);
        start();
    };

    recordEditorTest.asyncTest("Delete", function () {
        var model = {
            csid: "1984.068.0335b",
            fields: {}
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "../data", recordType: "cataloging", model: model, fileExtension: ".json"}),
            uispec: {},
            recordType: "cataloging"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                re.confirmation.confirmationDialog.locate("act").click();
            });
            re.remove();
        });
    });

    recordEditorTest.asyncTest("Rollback test", function () {
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
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            uispec: uispec,
            recordType: "cataloging"
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
            re.globalNavigator.events.onPerformNavigation.fire(function () {
                jqUnit.assertEquals("The value of the field should roll back to", "TEST", jQuery(field).val());
                start();
            });
        });
    });

    recordEditorTest.asyncTest("Test delete-confirmation text - media and related", function () {
         var model = {
            csid: "somecsid",
            relations: {
                cataloging: "etc"
            },
            fields: {
                blobCsid: "abcdefg"
            }
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            recordType: "cataloging"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("Checking correct text: ", "Delete this Cataloging and its attached media and its relationships?", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });

    recordEditorTest.asyncTest("Test delete-confirmation text - media only", function () {
         var model = {
            csid: "somecsid",
            relations: {},
            fields: {
                blobCsid: "abcdefg"
            }
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            recordType: "cataloging"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("Checking correct text: ", "Delete this Cataloging and its attached media?", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });

    recordEditorTest.asyncTest("Test delete-confirmation text - related only", function () {
         var model = {
            csid: "somecsid",
            relations: {
                cataloging: "etc"
            },
            fields: {}
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            recordType: "cataloging"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("Checking correct text: ", "Delete this Cataloging and its relationships?", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });

    recordEditorTest.asyncTest("Test delete-confirmation text - no media and no related", function () {
         var model = {
            csid: "somecsid",
            relations: {},
            fields: {}
        };
        setupRecordEditor({
            model: model,
            dataContext: cspace.dataContext({baseUrl: "http://mymuseum.org", recordType: "thisRecordType", model: model}),
            showDeleteButton: true,
            applier: fluid.makeChangeApplier(model),
            uispec: {},
            recordType: "cataloging"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertEquals("Checking correct text: ", "Delete this Cataloging?", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });
    
    /////
    // This test block is responsible for record Deletion tests of the records which potentially could be used by other records
    /////
    // Test for the removal of the record which is referenced somewhere else but it is not Person/Location/Organization  
    recordEditorTest.asyncTest("Test cannot delete-confirmation text - record is used by other records. Not Person/Location/Organization", function () {
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
            recordType: "cataloging"
        }, function (re) {
            fluid.log("RETest: afterRender");
            re.confirmation.popup.bind("dialogopen", function () {
                jqUnit.assertNotEquals("Checking correct text: ", "Cannot remove this Cataloging which is used by other records.", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });
    
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
                jqUnit.assertEquals("Checking correct text: ", "Can not remove this Person record which is used by other records.", re.confirmation.confirmationDialog.locate("message:").text());
                start();
            });
            re.remove();
        });
    });
    /////
    // End of the test block
    /////

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

}());
