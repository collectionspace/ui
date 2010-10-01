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
    
    var pageBuilder;

    var objectsTests = new jqUnit.TestCase("Objects Tests", function () {
        cspace.util.isTest = true;
        objectsTests.fetchTemplate("../../main/webapp/html/objects.html", ".fl-container-1024");
    });
    
    var setupObjects = function (options) {
        options = $.extend(true, {
            configURL: "../../main/webapp/html/config/objects.json",
            pageBuilder: {
                options: {
                    uispecUrl: "../../main/webapp/html/uispecs/objects/uispec.json",
                    listeners: {
                        onDependencySetup: function (uispec) {
                            // Change the template URL for the number pattern chooser.
                            uispec.recordEditor[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl = "../../main/webapp/html/NumberPatternChooser.html";
                        }
                    },
                    pageSpec: {
                        header: {
                            href: "../../main/webapp/html/header.html"
                        },
                        tabs: {
                            href: "../../main/webapp/html/tabsTemplate.html"
                        },
                        titleBar: {
                            href: "../../main/webapp/html/objectTitleBar.html"
                        },
                        dateEntry: {
                            href: "../../main/webapp/html/ObjectEntryTemplate.html"
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
            templateUrlPrefix: "../../main/webapp/html/",
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
                            objects: {
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
        }, options);
        pageBuilder = cspace.recordSetup(options, "../../main/webapp/html/config/objects.json").pageBuilder;
    };
    
    objectsTests.test("Initialization", function () {
        var options = {
            pageBuilder: {
                options: {
                    listeners: {
                        pageReady: function () {
                            jqUnit.assertValue("Objects should have a record editor", pageBuilder.components.recordEditor);
                            jqUnit.assertValue("Objects should have a side bar", pageBuilder.components.sidebar);
                            jqUnit.assertValue("Objects should have a title bar", pageBuilder.components.titleBar);
                            jqUnit.assertValue("Objects should have tabs", pageBuilder.components.tabs);
                            start();
                        }
                    }
                }
            }
        };
        setupObjects(options);
        stop();
    });
        
    objectsTests.test("Go To Record", function () {
        var options = {
            depOpts: {
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
        };
        setupObjects(options);
        stop();
    });
}(jQuery));

