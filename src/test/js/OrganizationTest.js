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
    
    var pageBuilder;

    var organizationTests = new jqUnit.TestCase("Organization Tests", function () {
        cspace.util.isTest = true;
    });
    
    var setupOrganization = function (options) {
        options = $.extend(true, {
            configURL: "../../main/webapp/html/config/organization.json",
            pageBuilder: {
                options: {
                    schemaUrl: "../../main/webapp/html/uischema/organization.json",
                    uispecUrl: "../../main/webapp/html/uispecs/organization/uispec.json",
                    pageSpec: {
                        tabs: {
                            href: "../../main/webapp/html/tabsTemplate.html"
                        },
                        titleBar: {
                            href: "../../main/webapp/html/organizationTitleBar.html"
                        },
                        recordEditor: {
                            href: "../../main/webapp/html/organizationTemplate.html"
                        },
                        sidebar: {
                            href: "../../main/webapp/html/right-sidebar.html"
                        },
                        footer: {
                            href: "../../main/webapp/html/footer.html"
                        }
                    }
                }
            },
            depOpts: {
                recordEditor: {
                    options: {
                        confirmation: {
                            options: {
                                confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
                            }
                        }
                    }
                },
                sidebar: {
                    options: {
                        components: {
                            cataloging: {
                                options: {
                                    components: {
                                        relationManager: {
                                            options: {
                                                components: {
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
                                }
                            },
                            procedures: {
                                options: {
                                    components: {
                                        relationManager: {
                                            options: {
                                                components: {
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
                                }
                            }
                        }
                    }
                }
            },
            templateUrlPrefix: "../../main/webapp/html/"
        }, options);
        pageBuilder = cspace.recordSetup(options, "../../main/webapp/html/config/organization.json").pageBuilder;
    };
    
    organizationTests.test("Initialization", function () {
        var options = {
            pageBuilder: {
                options: {
                    listeners: {
                        pageReady: function () {
                            jqUnit.assertValue("Organization should have a record editor", pageBuilder.components.recordEditor);
                            jqUnit.assertValue("Organization should have a side bar", pageBuilder.components.sidebar);
                            jqUnit.assertValue("Organization should have a title bar", pageBuilder.components.titleBar);
                            jqUnit.assertValue("Organization should have tabs", pageBuilder.components.tabs);
                            start();
                        }
                    }
                }
            }
        };
        setupOrganization(options);
        stop();
    });

    organizationTests.test("Repeatable fields: existence", function () {
        var options = {
            pageBuilder: {
                options: {
                    csid: "987.654.321",
                    dataContext: {
                        options: {
                            baseUrl: "../../main/webapp/html/data"
                        }
                    }
                }
            },
            depOpts: {
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
        };
        setupOrganization(options);
        stop();        
    });    
}(jQuery));

