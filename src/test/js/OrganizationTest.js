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
            configURL: "../../main/webapp/config/organization.json",
            pageBuilderIO: {
                options: {
                    pageSpec: {
                        recordEditor: {
                            href: "../../main/webapp/html/pages/OrganizationTemplate.html"
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
                        pageReady: function () {
                            var pageBuilder = organization.pageBuilderIO.pageBuilder;
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
                                    afterRender: function () {
                                        jqUnit.assertTrue("Group field is repeatable", $(".csc-organizationAuthority-group").parent().hasClass("csc-repeatable-repeat"));
                                        jqUnit.assertTrue("Function field is repeatable", $(".csc-organizationAuthority-function").parent().hasClass("csc-repeatable-repeat"));
                                        jqUnit.assertTrue("History field is repeatable", $(".csc-organizationAuthority-history").parent().hasClass("csc-repeatable-repeat"));
        
                                        // authority fields are inside a container, and so we must check the grandparent for the repeatability indicator
                                        jqUnit.assertTrue("Contact Name field is repeatable", $(".csc-organizationAuthority-contactName").parent().hasClass("csc-repeatable-repeat"));
                                        jqUnit.assertTrue("Sub-body field is repeatable", $(".csc-organizationAuthority-subBodyName").parent().hasClass("csc-repeatable-repeat"));
        
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

