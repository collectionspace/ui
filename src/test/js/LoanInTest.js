/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit */
"use strict";

(function () {

    var loanInTests = new jqUnit.TestCase("Loan In Tests", function () {
        cspace.util.isTest = true;
        loanInTests.fetchTemplate("../../main/webapp/html/loanin.html", ".fl-container-1024");
    });
    
    loanInTests.test("Creation", function () {
        var opts = {
            pageBuilderOpts: {
                uispecUrl: "../../main/webapp/html/uispecs/loanin/uispec.json",
                listeners: {
                    pageReady: function () {
                        jqUnit.assertValue("loan in should have a record editor", loanIn.components.recordEditor);
                        start();
                    }, 
                    onDependencySetup: function (uispec) {
                        // Change the template URL for the number pattern chooser.
                        uispec.recordEditor[".csc-loanIn-loanInNumber-patternChooserContainer"].decorators[0].options.templateUrl
                            = "../../main/webapp/html/NumberPatternChooser.html";
                    }
                }
            },
            sideBarOpts: {
                relatedRecordsList: {
                    options: {
                        relationManager: {
                            options: {
                                searchToRelateDialog: {
                                    options: {
                                        templates: {
                                            dialog: "../../main/webapp/html/searchToRelate.html"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            recordEditorOpts: {
                confirmation: {
                    options: {
                        confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
                    }
                }
            },
            templateUrlPrefix: "../../main/webapp/html/"
        };
        
        var loanIn = cspace.loanInSetup(opts);
        stop();

    });

}());

