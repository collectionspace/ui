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
                csid: "IN2004.002",
                dataContext: {
                    options: {
                        baseUrl: "../../main/webapp/html/data"
                    }
                },
                uispecUrl: "../../main/webapp/html/uispecs/intake/uispec.json",
                listeners: {
                    pageReady: function () {
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
                                            var reSelectors = intake.components.recordEditor.options.selectors;
                                            var details = $(".ui-tabs-panel:not('.ui-tabs-hide') .csc-listEditor-details");
                                            var messageContainer = $(reSelectors.messageContainer, details);
                                            var message = $($(reSelectors.feedbackMessage, messageContainer)[0]);
                                            jqUnit.notVisible("Before testing, message should not be visible", message);
                                            $(reSelectors.save, details).click();
                                            jqUnit.isVisible("After clicking save, message should be visible", message);
                                            jqUnit.assertEquals("Message should be ", "Please specify an Identification Number", message.text());
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
                                                list: {
                                                    options: {
                                                        listeners: {
                                                            afterRender: function () {
                                                                $(".csc-recordList-row:first").click();
                                                            }
                                                        }
                                                    }
                                                },
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
