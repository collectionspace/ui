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
    
    var work;

    var workTests = new jqUnit.TestCase("Work Tests", function () {
        cspace.util.isTest = true;
    });
    
    var setupWork = function (options) {
        options = fluid.merge(null, {
            configURL: "../../main/webapp/defaults/config/work.json",
            pageBuilderIO: {
                options: {
                    pageSpec: {
                        recordEditor: {
                            href: "../../main/webapp/defaults/html/pages/WorkTemplate.html"
                        }
                    }
                }
            }
        }, options);
        work = cspace.globalSetup("cspace.record", options);
    };
    
    workTests.asyncTest("Initialization", function () {
        var options = {
            pageBuilderIO: {
                options: {
                    listeners: {
                        "pageReady.workInitTest": function () {
                            var pageBuilder = cspace.tests.getPageBuilderIO(work).pageBuilder;
                            jqUnit.assertValue("Work should have a record editor", pageBuilder.recordEditor);
                            jqUnit.assertValue("Work should have a side bar", pageBuilder.sidebar);
                            jqUnit.assertValue("Work should have a title bar", pageBuilder.titleBar);
                            jqUnit.assertValue("Work should have tabs", pageBuilder.tabs);
                            start();
                        }
                    }
                }
            }
        };
        setupWork(options);
    });

    workTests.asyncTest("Repeatable fields: existence", function () {
        var options = {
            pageBuilderIO: {
                options: {
                    csid: "876ac3f-3344-ac55-1234"
                }
            },
            pageBuilder: {
                options: {
                    components: {
                        recordEditor: {
                            options: {
                                listeners: {
                                    "afterRender.workTest": function (recordEditor) {
                                        var repeatableField = [
                                            "creatorGroup",
                                            "publisherGroup"
                                        ];
                                        fluid.each(repeatableField, function (repeatableName) {
                                            var found = fluid.find(recordEditor, function (property, name) {
                                                if (name.indexOf(repeatableName) > -1) {
                                                    return property;
                                                }
                                            });
                                            if (!found) {
                                                ok(false, "Repeatable " + repeatableName + " not found");
                                                return;
                                            }
                                            jqUnit.assertEquals("Type of renderer decorator subcomponent " + repeatableName + " is ", "cspace.makeRepeatable", found.typeName);
                                        });
                                        start();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        setupWork(options);
    }); 
}(jQuery));