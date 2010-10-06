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

    var saveAction = function () {
        fluid.log("save me");
    };
    
    var afterSuccessSave = function () {
        fluid.log("success save");
    };
    
    var onError = function () {
        fluid.log("error");
    };
    
    var baseTestOpts = {
        action: saveAction,
        actionSuccessEvents: afterSuccessSave,
        actionErrorEvents: onError,
        confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
    };
    
    var testOpts;
    
    var confirmationTests = new jqUnit.TestCase("Confirmation Tests", function () {
        cspace.util.isTest = true;
        testOpts = {};
        fluid.model.copyModel(testOpts, baseTestOpts);
    });
    
    var sampleSuccessHandlerCreator = function (conf, options) {
        return function () {
            return options.href;
        };
    };
    
    confirmationTests.test("Confirmation creation", function () {
        expect(9);
        var confirmation;
        testOpts.successHandlerCreator = sampleSuccessHandlerCreator;
        testOpts.listeners = {
            afterRender: function () {
                var expectedDefaultHREF = "#";
                jqUnit.assertTrue("dialog is on the page", jQuery(".csc-confirmationDialog").length !== 0);
                jqUnit.notVisible("dialog is not visible", jQuery(".csc-confirmationDialog"));
                confirmation.successHandler = confirmation.options.successHandlerCreator(confirmation, {href: expectedDefaultHREF});
                jqUnit.assertEquals("href is expected string", expectedDefaultHREF, confirmation.successHandler());

                var expectedHREF = "";
                confirmation.open(sampleSuccessHandlerCreator, {href: expectedHREF});
                jqUnit.isVisible("dialog is visible", jQuery(".csc-confirmationDialog"));
                jqUnit.assertEquals("href is expected string", expectedHREF, confirmation.successHandler());
                jqUnit.assertTrue("Default button style should be added to cancel", jQuery(".csc-confirmationDialogButton-cancel").hasClass("cs-confirmationDialogButton-cancel"));
                jqUnit.assertTrue("Default button style should be added to proceed", jQuery(".csc-confirmationDialogButton-proceed").hasClass("cs-confirmationDialogButton-proceed"));
                jqUnit.assertTrue("Default button style should be added to act", jQuery(".csc-confirmationDialogButton-act").hasClass("cs-confirmationDialogButton-act"));
                start();
            }
        };
        
        jqUnit.assertTrue("dialog is not on the page", jQuery(".csc-confirmationDialog").length === 0);
        confirmation = cspace.confirmation(jQuery("#main"), testOpts);
        stop();
    });
    
}());
