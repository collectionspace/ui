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
    // jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;

    var baseOpts = {
        confirmation: {
            options: {
                confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
            }
        }
    };

    var recordEditorTest = new jqUnit.TestCase("recordEditor Tests", function () {
        cspace.util.isTest = true;
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
        var recordEditor = cspace.recordEditor("#main", dc, applier, uispec, baseOpts);
        jqUnit.assertEquals("foo", testModel.fields.field1, jQuery(".csc-test-1").val());
    });

    recordEditorTest.test("Delete", function () {
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "http://mymuseum.org/thisRecordType/123.456.789",
            dataType: "json",
            type: "DELETE"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams));

        var testModel = {
            csid: "123.456.789",
            fields: {}
        };
        var dc = cspace.dataContext(testModel, {baseUrl: "http://mymuseum.org", recordType: "thisRecordType"});
        var uispec = {};
        var applier = fluid.makeChangeApplier(testModel);
        var recordEditor = cspace.recordEditor("#main", dc, applier, uispec, baseOpts);
        recordEditor.remove();
        ajaxMock.verify();
        ajaxMock.restore();
    });

}());

