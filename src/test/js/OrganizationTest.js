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
    
    var organization;

    var organizationTests = new jqUnit.TestCase("Organization Tests", function () {
        cspace.util.isTest = true;
    });
    
    var setupOrganization = function (options) {
        options = fluid.merge(null, {
            configURL: "../../main/webapp/defaults/config/organization.json",
            pageBuilderIO: {
                options: {
                    pageSpec: {
                        recordEditor: {
                            href: "../../main/webapp/defaults/html/pages/OrganizationTemplate.html"
                        }
                    }
                }
            }
        }, options);
        organization = cspace.globalSetup("cspace.record", options);
    };
    
    organizationTests.asyncTest("Initialization", function () {
        var options = {
            pageBuilderIO: {
                options: {
                    listeners: {
                        "pageReady.organizationInitTest": function () {
                            var pageBuilder = cspace.tests.getPageBuilderIO(organization).pageBuilder;
                            jqUnit.assertValue("Organization should have a record editor", pageBuilder.recordEditor);
                            jqUnit.assertValue("Organization should have a side bar", pageBuilder.sidebar);
                            jqUnit.assertValue("Organization should have a title bar", pageBuilder.titleBar);
                            jqUnit.assertValue("Organization should have tabs", pageBuilder.tabs);
                            start();
                        }
                    }
                }
            }
        };
        setupOrganization(options);
    });

    organizationTests.asyncTest("Repeatable fields: existence", function () {
        var options = {
            pageBuilderIO: {
                options: {
                    csid: "987.654.321"
                }
            },
            pageBuilder: {
                options: {
                    components: {
                        recordEditor: {
                            options: {
                                listeners: {
                                    "afterRender.orgTest": function (recordEditor) {
                                        var repeatableField = [
                                            "organizationAuthority-group",
                                            "organizationAuthority-function",
                                            "organizationAuthority-history",
                                            "organizationAuthority-contactName",
                                            "organizationAuthority-subBodyName"
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
        setupOrganization(options);
    });    
}(jQuery));

