/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

var tabsTester = function($){

    var tabsTest = new jqUnit.TestCase("Tabs Tests", function () {
        cspace.util.isTest = true;
        tabsTest.fetchTemplate("../../main/webapp/html/objects.html", ".fl-container-1024");
    });

    tabsTest.test("Required identification number in cataloging tab (CSPACE-2294)", function () {
        var opts = {
            pageBuilderOpts: {
                uispecUrl: "../../main/webapp/html/uispecs/loanin/uispec.json",
                listeners: {
                    pageReady: function () {
                        var tab = $("a[href^=#ui-tabs]")[0];
                        $(tab).click();
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
            tabsOpts: {
                tabList: [
                    {name: "Loan In", target: "#primaryTab"},
                    {name: "Cataloging", target: "../../main/webapp/html/objectTabPlaceholder.html"}
                ]
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
}(jQuery);
