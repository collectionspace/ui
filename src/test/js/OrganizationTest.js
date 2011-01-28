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
        options = $.extend(true, {
            configURL: "../../main/webapp/config/organization.json",
            components: {
                pageBuilderSetup: {
                    options: {
                        pageSpec: {
                            recordEditor: {
                                href: "../../main/webapp/html/organizationTemplate.html"
                            },
                            footer: {
                                href: "../../main/webapp/html/footer.html"
                            }
                        },
                        components: {
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
                        }
                    }
                }
            }
        }, options);
        organization = cspace.globalSetup()("cspace.record", options);
    };
    
    organizationTests.test("Initialization", function () {
        var options = {
            components: {
                pageBuilderSetup: {
                    options: {
                        listeners: {
                            pageReady: function () {
                                var pageBuilder = organization.pageBuilderSetup.pageBuilder;
                                jqUnit.assertValue("Organization should have a record editor", pageBuilder.recordEditor);
                                jqUnit.assertValue("Organization should have a side bar", pageBuilder.sidebar);
                                jqUnit.assertValue("Organization should have a title bar", pageBuilder.titleBar);
                                jqUnit.assertValue("Organization should have tabs", pageBuilder.tabs);
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

    organizationTests.test("Repeatable fields: existence", function () {
        var options = {
            components: {
                pageBuilderSetup: {
                    options: {
                        csid: "987.654.321",
                        dataContext: {
                            options: {
                                baseUrl: "../../main/webapp/html/data"
                            }
                        },
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
            }
        };
        setupOrganization(options);
        stop();        
    });    
}(jQuery));

