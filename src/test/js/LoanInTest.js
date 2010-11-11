/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, cspace, start, stop */
"use strict";

(function () {

    var loanInTests = new jqUnit.TestCase("Loan In Tests", function () {
        cspace.util.isTest = true;
        loanInTests.fetchTemplate("../../main/webapp/html/loanin.html", ".fl-container-1024");
    });
    
    loanInTests.test("Creation", function () {
        var opts = {
            configURL: "../../main/webapp/html/config/loanin.json",
            pageBuilder: {
                options: {
                    schemaUrl: "../../main/webapp/html/uischema/loanin.json",
                    uispecUrl: "../../main/webapp/html/uispecs/loanin/uispec.json",
                    listeners: {
                        pageReady: function () {
                            jqUnit.assertValue("loan in should have a record editor", loanIn.pageBuilder.components.recordEditor);
                            start();
                        }, 
                        onDependencySetup: function (uispec) {
                            // Change the template URL for the number pattern chooser.
                            uispec.recordEditor[".csc-loanIn-loanInNumber-patternChooserContainer"].decorators[0].options.templateUrl = 
                                "../../main/webapp/html/NumberPatternChooser.html";
                        }
                    },
                    pageSpec: {
                        tabs: {
                            href: "../../main/webapp/html/tabsTemplate.html"
                        },
                        titleBar: {
                            href: "../../main/webapp/html/loanInTitleBar.html"
                        },
                        dateEntry: {
                            href: "../../main/webapp/html/loanInTemplate.html"
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
        };
        
        var loanIn = cspace.recordSetup(opts);
        stop();

    });

}());

