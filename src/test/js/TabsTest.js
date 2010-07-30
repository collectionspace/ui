/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

(function ($) {

    var tabsTest = new jqUnit.TestCase("Tabs Tests", function () {
        cspace.util.isTest = true;
        tabsTest.fetchTemplate("../../main/webapp/html/intake.html", ".fl-container-1024");
    });

    tabsTest.test("Required identification number in cataloging tab (CSPACE-2294)", function () {
        var intake;
        var opts = {
            pageBuilderOpts: {
                uispecUrl: "../../main/webapp/html/uispecs/intake/uispec.json",
                listeners: {
                    pageReady: function () {
                        jqUnit.assertValue("intake should have a record editor", intake.components.recordEditor);
                        intake.components.tabs.locate("tabsContainer").tabs("select", 1);
                    }, 
                    onDependencySetup: function (uispec) {
                        // Change the template URL for the number pattern chooser.
                        uispec.recordEditor[".csc-intake-entry-number-container"].decorators[0].options.templateUrl
                            = "../../main/webapp/html/NumberPatternChooser.html";
                    }
                }
            },
            tabsOpts: {
                tabSetups: [
                    null,   // primary tab
                    {       // first active tab at time of test writing: cataloging
                        options: {
                            configURL: "../../main/webapp/html/config/object-tab.json",
                            config: {
                                pageBuilder: {
                                    options: {
                                        uispecUrl: "../../main/webapp/html/uispecs/object-tab/uispec.json",
                                        pageSpec: {
                                            list: {
                                                href: "../../main/webapp/html/objectTabRecordListTemplate.html"
                                            },
                                            details: {
                                                href: "../../main/webapp/html/ObjectEntryTemplate.html"
                                            }
                                        },
                                        listeners: {
                                            pageReady: function () {
                                                jqUnit.assertTrue("we have arrived at the tab's pageReady", true);
                                                start();
                                            }, 
                                            onDependencySetup: function (uispec) {
                                                // Change the template URL for the number pattern chooser.
                                                uispec.details[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl
                                                    = "../../main/webapp/html/NumberPatternChooser.html";
                                            }
                                        }
                                    }
                                },
                                depOpts: {
                                    relatedRecordsTab: {
                                        options: {
                                            listEditor: {
                                                options: {
                                                    details: {
                                                        options: {
                                                            confirmation: {
                                                                options: {
                                                                    confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
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
        
        intake = cspace.intakeSetup(opts);
        stop();

    });
}(jQuery));
