/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, start, stop*/
"use strict";

(function ($) {
    
    var cataloging;

    var objectsTests = new jqUnit.TestCase("Objects Tests", function () {
        cspace.util.isTest = true;
        objectsTests.fetchTemplate("../../main/webapp/html/cataloging.html", ".fl-container-1024");
    });
    
    var setupObjects = function (options) {
        options = $.extend(true, {
            configURL: "../../main/webapp/html/config/cataloging.json",
            components: {
                pageBuilderSetup: {
                    options: {
                        recordType: "cataloging",
                        pageType: "cataloging",
                        listeners: {
                            onDependencySetup: function (uispec) {
                                // Change the template URL for the number pattern chooser.
                                uispec.recordEditor[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl = "../../main/webapp/html/NumberPatternChooser.html";
                            }
                        },
                        pageSpec: {
                            titleBar: {
                                href: "../../main/webapp/html/objectTitleBar.html"
                            },
                            recordEditor: {
                                href: "../../main/webapp/html/ObjectEntryTemplate.html"
                            },
                            footer: {
                                href: "../../main/webapp/html/footer.html"
                            }
                        },
                        templateUrlPrefix: "../../main/webapp/html/",
                    }
                }
            }
        }, options);
        cataloging = cspace.globalSetup()("cspace.record", options);
        stop();
    };
    
    objectsTests.test("Initialization", function () {
        var options = {
            components: {
                pageBuilderSetup: {
                    options: {
                        listeners: {
                            pageReady: function () {
                                var pageBuilder = cataloging.pageBuilderSetup.pageBuilder;
                                jqUnit.assertValue("Objects should have a record editor", pageBuilder.recordEditor);
                                jqUnit.assertValue("Objects should have a side bar", pageBuilder.sidebar);
                                jqUnit.assertValue("Objects should have a title bar", pageBuilder.titleBar);
                                jqUnit.assertValue("Objects should have tabs", pageBuilder.tabs);
                                start();
                            }
                        }
                    }
                }
            }
        };
        setupObjects(options);
    });
        
    objectsTests.test("Go To Record", function () {
        var options = {
            components: {
                pageBuilderSetup: {
                    options: {
                        components: {
                            recordEditor: {
                                options: {
                                    listeners: {
                                        afterRender: function () {
                                            jqUnit.notVisible("On the main record tab link 'Go to record' should be invisible", $(".csc-goto"));
                                            jqUnit.assertUndefined("Link for the invisible 'Go to record' should not have href attribute", $(".csc-goto").attr("href"));
                                            start();                  
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        setupObjects(options);
    });
}(jQuery));

