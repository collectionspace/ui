/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace jqUnit start stop expect fluid jQuery*/
"use strict";

(function () {

    var saveAction = function () {
        console.log("save me");
    };
    
    var afterSuccessSave = function () {
        console.log("success save");
    };
    
    var onError = function () {
        console.log("error");
    };
    
    var baseTestOpts = {
        action: saveAction,
        actionSuccessEvents: afterSuccessSave,
        actionErrorEvents: onError,
        confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
    };
    
    var testOpts;
    
    var confirmationTests = new jqUnit.TestCase("Confirmation Tests", function () {
        testOpts = {};
        fluid.model.copyModel(testOpts, baseTestOpts);
    });  
    
    confirmationTests.test("Confirmation creation", function () {
        expect(6);
        var confirmation;
               
        testOpts.listeners = {
            afterRender: function () {
                var expectedDefaultHREF = "#";
                jqUnit.assertTrue("dialog is on the page", jQuery(confirmation.options.selectors.dialog).length !== 0);
                jqUnit.notVisible("dialog is not visible", jQuery(confirmation.options.selectors.dialog));
                jqUnit.assertTrue("href is expected string", confirmation.model.href === expectedDefaultHREF);

                var expectedHREF = "";
                confirmation.open(expectedHREF);
                jqUnit.isVisible("dialog is visible", jQuery(confirmation.options.selectors.dialog));
                jqUnit.assertTrue("href is expected string", confirmation.model.href === expectedHREF);
                start();
            }
        };
        
        jqUnit.assertTrue("dialog is not on the page", jQuery(".csc-confirmationDialog").length === 0);
        confirmation = cspace.confirmation(jQuery("#main"), testOpts);
        stop();
    });
    
}());
