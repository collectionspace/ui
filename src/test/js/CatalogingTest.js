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

    var catalogingTests = new jqUnit.TestCase("Cataloging Tests", function () {
        cspace.util.isTest = true;
        catalogingTests.fetchTemplate("../../main/webapp/defaults/html/record.html", ".fl-container-1024");
    });
    
    var setupCataloging = function (options) {
        options = $.extend(true, {
            configURL: "../../main/webapp/defaults/config/cataloging.json",
            pageBuilderIO: {
                options: {
                    recordType: "cataloging",
                    pageSpec: {
                        recordEditor: {
                            href: "../../main/webapp/defaults/html/pages/CatalogingTemplate.html"
                        }
                    }
                }
            }
        }, options);
        cataloging = cspace.globalSetup("cspace.record", options);
    };
    
    catalogingTests.asyncTest("Initialization", function () {
        var options = {
            pageBuilderIO: {
                options: {
                    listeners: {
                        "pageReady.catalogingInitializationTest": function () {
                            var pageBuilder = cspace.tests.getPageBuilderIO(cataloging).pageBuilder;
                            jqUnit.assertValue("Cataloging should have a record editor", pageBuilder.recordEditor);
                            jqUnit.assertValue("Cataloging should have a side bar", pageBuilder.sidebar);
                            jqUnit.assertValue("Cataloging should have a title bar", pageBuilder.titleBar);
                            jqUnit.assertValue("Cataloging should have tabs", pageBuilder.tabs);
                            start();
                        }
                    }
                }
            }
        };
        setupCataloging(options);
    });
        
    catalogingTests.asyncTest("Go To Record", function () {
        var options = {
            pageBuilder: {
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
        };
        setupCataloging(options);
    });
}(jQuery));

