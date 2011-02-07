/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, cspace, start, stop */
"use strict";

(function () { 

    var bareLoanInTests = new jqUnit.TestCase("Loan In Tests", function () {
        cspace.util.isTest = true;
        bareLoanInTests.fetchTemplate("../../main/webapp/html/record.html", ".fl-container-1024");
    });
    
    var loanInTests = cspace.tests.testEnvironment({testCase: bareLoanInTests});
    
    loanInTests.test("Creation", function () {
        var opts = {
            configURL: "../../main/webapp/config/loanin.json",
            components: {
                pageBuilderSetup: {
                    options: {
                        listeners: {
                            pageReady: function () {
                                jqUnit.assertValue("loan in should have a record editor", loanIn.pageBuilderSetup.pageBuilder.recordEditor);
                                start();
                            }, 
                            onDependencySetup: function (uispec) {
                                // Change the template URL for the number pattern chooser.
                                uispec.recordEditor[".csc-loanIn-loanInNumber-patternChooserContainer"].decorators[0].options.templateUrl = 
                                    "../../main/webapp/html/components/NumberPatternChooser.html";
                            }
                        },
                        pageSpec: {
                            recordEditor: {
                                href: "../../main/webapp/html/pages/LoaninTemplate.html"
                            },
                            footer: {
                                href: "../../main/webapp/html/components/footer.html"
                            }
                        }
                    }
                }
            }
        };
        
        var loanIn = cspace.setup("cspace.record", opts);
        stop();
    });
}());

