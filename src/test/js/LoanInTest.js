/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, cspace, start, stop */
"use strict";

var loaninTester = function () { 

    var bareLoanInTests = new jqUnit.TestCase("Loan In Tests", function () {
        cspace.util.isTest = true;
        bareLoanInTests.fetchTemplate("../../main/webapp/defaults/html/record.html", ".fl-container-1024");
    });
    
    var loanInTests = cspace.tests.testEnvironment({testCase: bareLoanInTests});
    
    loanInTests.asyncTest("Creation", function () {
        var opts = {
            configURL: "../../main/webapp/defaults/config/loanin.json",
            pageBuilderIO: {
                options: {
                    listeners: {
                        "pageReady.loanInCreationTest": function () {
                            jqUnit.assertValue("loan in should have a record editor", cspace.tests.getPageBuilderIO(loanIn).pageBuilder.recordEditor);
                            start();
                        }
                    },
                    pageSpec: {
                        recordEditor: {
                            href: "../../main/webapp/defaults/html/pages/LoaninTemplate.html"
                        }
                    }
                }
            }
        };
        var loanIn = cspace.globalSetup("cspace.record", opts);
    });
};

jQuery(document).ready(function () {
    loaninTester();
});