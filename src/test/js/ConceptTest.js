/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, start, stop*/
"use strict";

(function ($) {
    
    var concept;

    var conceptTests = new jqUnit.TestCase("Concept Tests", function () {
        cspace.util.isTest = true;
    });
    
    var setupConcept = function (options) {
        options = fluid.merge(null, {
            configURL: "../../main/webapp/defaults/config/concept.json",
            pageBuilderIO: {
                options: {
                    pageSpec: {
                        recordEditor: {
                            href: "../../main/webapp/defaults/html/pages/ConceptTemplate.html"
                        }
                    }
                }
            }
        }, options);
        concept = cspace.globalSetup("cspace.record", options);
    };
    
    conceptTests.asyncTest("Initialization", function () {
        var options = {
            pageBuilderIO: {
                options: {
                    listeners: {
                        "pageReady.conceptInitTest": function () {
                            var pageBuilder = cspace.tests.getPageBuilderIO(concept).pageBuilder;
                            jqUnit.assertValue("Concept should have a record editor", pageBuilder.recordEditor);
                            jqUnit.assertValue("Concept should have a side bar", pageBuilder.sidebar);
                            jqUnit.assertValue("Concept should have a title bar", pageBuilder.titleBar);
                            jqUnit.assertValue("Concept should have tabs", pageBuilder.tabs);
                            start();
                        }
                    }
                }
            }
        };
        setupConcept(options);
    });  
}(jQuery));

