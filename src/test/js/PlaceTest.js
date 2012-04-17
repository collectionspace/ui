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
    
    var place;

    var placeTests = new jqUnit.TestCase("Place Tests", function () {
        cspace.util.isTest = true;
    });
    
    var setupPlace = function (options) {
        options = fluid.merge(null, {
            configURL: "../../main/webapp/defaults/config/place.json",
            pageBuilderIO: {
                options: {
                    pageSpec: {
                        recordEditor: {
                            href: "../../main/webapp/defaults/html/pages/PlaceTemplate.html"
                        }
                    }
                }
            }
        }, options);
        place = cspace.globalSetup("cspace.record", options);
    };
    
    placeTests.asyncTest("Initialization", function () {
        var options = {
            pageBuilderIO: {
                options: {
                    listeners: {
                        "pageReady.placeInitTest": function () {
                            var pageBuilder = cspace.tests.getPageBuilderIO(place).pageBuilder;
                            jqUnit.assertValue("Place should have a record editor", pageBuilder.recordEditor);
                            jqUnit.assertValue("Place should have a side bar", pageBuilder.sidebar);
                            jqUnit.assertValue("Place should have a title bar", pageBuilder.titleBar);
                            jqUnit.assertValue("Place should have tabs", pageBuilder.tabs);
                            start();
                        }
                    }
                }
            }
        };
        setupPlace(options);
    });

    placeTests.asyncTest("Repeatable fields: existence", function () {
        var options = {
            pageBuilderIO: {
                options: {
                    csid: "1234567"
                }
            },
            pageBuilder: {
                options: {
                    components: {
                        recordEditor: {
                            options: {
                                listeners: {
                                    "afterRender.placeTest": function (recordEditor) {
                                        var repeatableField = [
                                            "placeNameGroup",
                                            "placeOwnerGroup",
                                            "placeGeoRefGroup"
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
        setupPlace(options);
    }); 
}(jQuery));

