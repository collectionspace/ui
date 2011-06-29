/*
Copyright 2011 University of California, Berkeley; Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var structuredDateTester = function ($) {

    // ------------------------------------
    // Setup
    // ------------------------------------
    
    var container = ".csc-structuredDate-container-field";

    var bareStructuredDateBoxTest = new jqUnit.TestCase("StructuredDate Tests");
    
    var recordModel = {
        someDate: {
            dateDisplayDate: "This is a structured date value"
        }
    };
    var recordApplier = fluid.makeChangeApplier(recordModel);
    
    var structuredDateTestMain = cspace.tests.testEnvironment({
        testCase: bareStructuredDateBoxTest,
        model: recordModel,
        applier: recordApplier,
        components: {
            instantiator: "{instantiator}",
            modelHolder: {
                type: "cspace.tests.modelHolder"
            }
        }
    });
    
    var setupStructuredDate = function (options) {
        var instantiator = structuredDateTestMain.instantiator;
        if (structuredDateTestMain.structuredDate) {
            instantiator.clearComponent(structuredDateTestMain, "structuredDate");
        }
        structuredDateTestMain.options.components["structuredDate"] = {
            type: "cspace.structuredDate",
            options: options
        };
        fluid.initDependent(structuredDateTestMain, "structuredDate", instantiator);
        return structuredDateTestMain.structuredDate;
    };

    // ------------------------------------
    // Utilities
    // ------------------------------------

    // Add a custom JQuery selector to identify whether an element has focus.
    // See http://stackoverflow.com/questions/967096/using-jquery-to-test-if-an-input-has-focus/2684561#2684561
    jQuery.expr[':'].focus = function( elem ) {
      return elem === document.activeElement && ( elem.type || elem.href );
    };


    // ------------------------------------
    // Tests
    // ------------------------------------

    structuredDateTestMain.test("Initialization", function () {
        expect(3);
        var structuredDate = setupStructuredDate({
            model: "{modelHolder}.options.model",
            applier: "{modelHolder}.options.applier"
        });
        jqUnit.assertValue("Structured date should be initialized", structuredDate);
        jqUnit.assertTrue("Structured date has a correct container", structuredDate.container.hasClass(container.substring(1)));
        jqUnit.notVisible("Structured date popup container is invisible", structuredDate.popup.container);
    });
    
    structuredDateTestMain.test("Show/Hide popup", function () {
        expect(3);
        var structuredDate = setupStructuredDate({
            model: "{modelHolder}.options.model",
            applier: "{modelHolder}.options.applier"
        });
        jqUnit.notVisible("Structured date popup container is invisible", structuredDate.popup.container);
        structuredDate.showPopup();
        jqUnit.isVisible("Structured date popup container is visible", structuredDate.popup.container);
        structuredDate.hidePopup();
        jqUnit.notVisible("Structured date popup container is invisible again", structuredDate.popup.container);
    });
    
    structuredDateTestMain.test("Trigger popup on focus", function () {
        expect(3);
        var structuredDate = setupStructuredDate({
            model: "{modelHolder}.options.model",
            applier: "{modelHolder}.options.applier"
        });
        jqUnit.notVisible("Structured date popup container is invisible", structuredDate.popup.container);
        structuredDate.container.focus();
        jqUnit.isVisible("Structured date popup container is visible", structuredDate.popup.container);
        structuredDate.hidePopup();
        jqUnit.notVisible("Structured date popup container is invisible again", structuredDate.popup.container);
    });

    structuredDateTestMain.test("Trigger popup close on blur", function () {
        expect(6);
        var structuredDate = setupStructuredDate({
            model: "{modelHolder}.options.model",
            applier: "{modelHolder}.options.applier"
        });
        jqUnit.notVisible("Structured date popup container is invisible", structuredDate.popup.container);
        structuredDate.container.focus();
        jqUnit.isVisible("Structured date popup container is visible", structuredDate.popup.container);
        
        setTimeout(function() {
            var blurable = $("#blurable");
            structuredDate.container.blur();
            blurable.focus();
            setTimeout(function() {
                jqUnit.assertFalse("Current focused element is not structuredDate container", structuredDate.container.is(":focus"));
                jqUnit.assertTrue("Current focused element is blurable", blurable.is(":focus"));
                jqUnit.notVisible("Structured date popup container is invisible", structuredDate.popup.container);
                blurable.blur();
                structuredDate.container.focus();
                jqUnit.isVisible("Structured date popup container is visible", structuredDate.popup.container);
                start();
            }, 250);
        }, 250);
        stop();
    });

    structuredDateTestMain.test("Verify model is shared correctly", function () {
        expect(2);
        var structuredDate = setupStructuredDate({
            model: "{modelHolder}.options.model",
            applier: "{modelHolder}.options.applier"
        });
        jqUnit.assertEquals("Structured date component shares model passed in at creation",
            recordModel, structuredDate.model);
        jqUnit.assertEquals("Structured date component shares model with its popup sub-component",
            structuredDate.model, structuredDate.popup.model);
    });

    structuredDateTestMain.test("Write a value to the model", function () {
        expect(5);
        var structuredDate = setupStructuredDate({
            model: "{modelHolder}.options.model",
            applier: "{modelHolder}.options.applier",
            protoTree: {
                dateDisplayDate: "${someDate.dateDisplayDate}",
                dateAssociation: "${someDate.dateAssociation}",
                datePeriod: "${someDate.datePeriod}"
            }
        });

        // Note: the path to the item of interest in the model is
        // parameterized using an 'elPath' option in RepeatableTest.js.
        // We might consider that approach rather than hardcoding the
        // EL path in various places below.

        var newValue = "2011-03-16";

        structuredDate.showPopup();

        // Set the value of the dateText field in the popup to a new value,
        // much as if a customer changed that field's value via the UI, and
        // test the effect of this change on the model.
        // NOTE, 5 May 2011 (rj): dateText dropped in favor of dateDisplayDate.
        // Field name replaced throughout this file. 
        var dateDisplayDate = structuredDate.popup.locate("dateDisplayDate");
        jqUnit.assertNotEquals("Initial value in target field is different from new value",
            newValue, dateDisplayDate.val());
        dateDisplayDate.val(newValue).change();
        jqUnit.assertEquals("Target field has been updated with new value",
            newValue, dateDisplayDate.val());

        jqUnit.assertEquals("Popup sub-component's model now has new value",
            newValue, structuredDate.popup.model.someDate.dateDisplayDate);
        jqUnit.assertEquals("Structured date component's model now has new value",
            newValue, structuredDate.model.someDate.dateDisplayDate);
        jqUnit.assertEquals("Record model now has new value",
            newValue, recordModel.someDate.dateDisplayDate);
    });

    structuredDateTestMain.test("Verify container field is updated when summary field changes", function () {
        expect(4);
        var structuredDate = setupStructuredDate({
            model: "{modelHolder}.options.model",
            applier: "{modelHolder}.options.applier",
            protoTree: {
                dateDisplayDate: "${someDate.dateDisplayDate}"
            },
            elPath: "someDate.dateDisplayDate"
        });

        var newSummaryValue = "2011-04-05";

        structuredDate.showPopup();

        var summaryField = structuredDate.popup.locate("dateDisplayDate");
        var containerField = structuredDate.locate("container");

        jqUnit.assertNotEquals("Initial value in summary field is different from new value",
            newSummaryValue, summaryField.val());
        jqUnit.assertNotEquals("Initial value in container field is different from new value",
            newSummaryValue, containerField.val());

        summaryField.val(newSummaryValue).change();

        jqUnit.assertEquals("Summary field has been updated with new value",
            newSummaryValue, summaryField.val());
        jqUnit.assertEquals("Container field's value matches summary field's new value",
            summaryField.val(), containerField.val());
    });
    
};

(function () {
    structuredDateTester(jQuery);
}());
