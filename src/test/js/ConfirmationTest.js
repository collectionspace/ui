/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace jqUnit start stop expect fluid jQuery*/
"use strict";

(function () {
    
    var bareConfirmationTest = new jqUnit.TestCase("Confirmation Tests");
    
    var confirmationTest = cspace.tests.testEnvironment({
        testCase: bareConfirmationTest
    });
    
    var setupConfirmation = function (options) {
        return cspace.confirmation(options);
    };
    
    var testBasicRenderedConfirmation = function (confirmation, strings) {
        jqUnit.isVisible("Confirmation should be visible", confirmation.popup);
        fluid.each(strings, function (value, str) {
            jqUnit.isVisible(str + " should be visible", confirmation.confirmationDialog.locate(str));
            jqUnit.assertEquals(str + " should read", value, confirmation.confirmationDialog.locate(str).val());
        });
    };
    
    var testConfirmationEvents = function (button, strategy, event) {
        var confirmation = setupConfirmation({
            listeners: {
                afterClose: function (event) {
                    jqUnit.assertEquals("The confirmation is closed due to", event || button, event);
                }
            }
        });
        confirmation.open(strategy);
        confirmation.confirmationDialog.locate(button).click();
    };
    
    var testDelete = function (confirmation) {
        confirmation.open("cspace.confirmation.deleteDialog");
        jqUnit.assertEquals("Proceed should not be rendered", 0, confirmation.confirmationDialog.locate("proceed").length);
        testBasicRenderedConfirmation(confirmation, {
            act: "Delete",
            cancel: "Cancel"
        });
    };
    
    var testSave = function (confirmation) {
        confirmation.open("cspace.confirmation.saveDialog");
        jqUnit.isVisible("Proceed should be visible", confirmation.confirmationDialog.locate("proceed"));
        jqUnit.assertEquals("Proceed should read", "Don't Save", confirmation.confirmationDialog.locate("proceed").val());
        testBasicRenderedConfirmation(confirmation, {
            act: "Save",
            cancel: "Cancel"
        });
    };
    
    confirmationTest.test("Initialize confirmation delete", function () {
        var confirmation = setupConfirmation();
        testDelete(confirmation);
        testConfirmationEvents("close", "cspace.confirmation.deleteDialog", "cancel");
        testConfirmationEvents("act", "cspace.confirmation.deleteDialog");
        testConfirmationEvents("cancel", "cspace.confirmation.deleteDialog");
    });
    
    confirmationTest.test("Initialize confirmation save", function () {
        var confirmation = setupConfirmation();
        testSave(confirmation);
        testConfirmationEvents("close", "cspace.confirmation.saveDialog", "cancel");
        testConfirmationEvents("act", "cspace.confirmation.saveDialog");
        testConfirmationEvents("cancel", "cspace.confirmation.saveDialog");
        testConfirmationEvents("proceed", "cspace.confirmation.saveDialog");
    });
    
    confirmationTest.test("Test both save and delete", function () {
        var confirmation = setupConfirmation();
        testDelete(confirmation);
        confirmation.popup.dialog("close");
        testSave(confirmation);
        confirmation.popup.dialog("close");
        testDelete(confirmation);
    });
}());
