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
    var recordEditor;
    var baseOpts = {
        confirmation: {
            options: {
                confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
            }
        }
    };
    cspace.util.isTest = true;

    var recordEditorTest = new jqUnit.TestCase("recordEditor Tests", null, function () {
        $(".ui-dialog").detach();
    });
    
    recordEditorTest.test("Creation", function () {
        var testModel = {
            fields: {
                field1: "A",
                field2: "B",
                field3: "C"
            }
        };
        var dc = cspace.dataContext(testModel, {baseUrl: "."});
        var uispec = {
            ".csc-test-1": "${fields.field1}",
            ".csc-test-2": "${fields.field2}",
            ".csc-test-3": "${fields.field3}"
        };
        var applier = fluid.makeChangeApplier(testModel);
        var opts = {};
        fluid.model.copyModel(opts, baseOpts);
        opts.listeners = {
            afterRender: function () {
                jqUnit.assertEquals("foo", testModel.fields.field1, jQuery(".csc-test-1").val());
                start();
            }
        };
        recordEditor = cspace.recordEditor("#main", dc, applier, uispec, opts);
        stop();
    });
    
    recordEditorTest.test("Delete", function () {
        var opts = {};
        fluid.model.copyModel(opts, baseOpts);
        var testModel = {
            csid: "123.456.789",
            fields: {}
        };
        var dc = cspace.dataContext(testModel, {baseUrl: "http://mymuseum.org", recordType: "thisRecordType"});
        var uispec = {};
        var applier = fluid.makeChangeApplier(testModel);
        $.extend(true, opts, {
            confirmation: {
                options: {
                    listeners: {
                        afterFetchTemplate: function () {                                                                
                            recordEditor.remove();
                            recordEditor.dataContext.events.afterRemove.addListener(function () {
                                jqUnit.assertTrue("Successfully executed remove", true);
                                start();
                            });
                            recordEditor.confirmation.locate("act", recordEditor.confirmation.dlg).click();
                        }
                    }
                }
            }
        });
        recordEditor = cspace.recordEditor("#main", dc, applier, uispec, opts);
        stop();
    });

}());

