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
                            href: "../../main/webapp/html/bjectTitleBar.html"
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
            depOpts: {
                sidebar: {
                    options: {
                        relatedRecordsList: {
                            options: {
                                relationManager: {
                                    options: {
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
                recordEditor: {
                    options: {
                        confirmation: {
                            options: {
                                confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
                            }
                        }
                    }
                }
            }
        }, options);
        pageBuilder = cspace.objectSetup(options, "../../main/webapp/html/config/objects.json").pageBuilder;
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
    
    objectsTests.test("Test Repeatable Field Add", function () {
        var options = {
            pageBuilder: {
                options: {
                    csid: "1984.068.0335b",
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
                            afterRender: function(){
                                jqUnit.assertEquals("Initally, there is 1 row in the 'brief description' repeatable fields", 1, $(".csc-object-identification-brief-description").length);
                                jqUnit.assertEquals("Initally, Repeatable field has a value of ", "This is brief description.", $(".csc-object-identification-brief-description").val());
                                pageBuilder.applier.modelChanged.addListener("*", function(model, oldModel, changeRequest){
                                    jqUnit.assertEquals("Request model elPath should be ", "fields.briefDescriptions", changeRequest.path);
                                    jqUnit.assertEquals("After '+field' clicked, there have to be 2 brief descriptions", 2, model.fields.briefDescriptions.length);
                                    jqUnit.assertDeepEq("(In the model) First brief descriptions is still correct", {
                                        "briefDescription": "This is brief description.",
                                        "_primary": true
                                    }, model.fields.briefDescriptions[0]);
                                    jqUnit.assertDeepEq("(In the model) Second brief descriptions is empty", {}, model.fields.briefDescriptions[1]);
                                    // TODO: The index of '2' requires careful knowledge of how many repeated fields, and which one is the brief description
                                    var repeatableContainer = $(".csc-repeatable-add").eq(2).parent("div");
                                    var domModifiedListener = function(){
                                        // The first DOMSubtreeModified will be the Renderer clearing the DOM; we want
                                        // to test after the second event, which will be after the new DOM is rendered
                                        repeatableContainer.unbind("DOMSubtreeModified", this);
                                        repeatableContainer.bind("DOMSubtreeModified", function(){
                                            jqUnit.assertDeepEq("(On the page) First brief descriptions is still", "This is brief description.", $(".csc-object-identification-brief-description").eq(0).val());
                                            jqUnit.assertDeepEq("(On the page) Second brief descriptions is empty", "", $(".csc-object-identification-brief-description").eq(1).val());
                                            start();
                                        });
                                    };
                                    repeatableContainer.bind("DOMSubtreeModified", domModifiedListener);
                                });
                                // TODO: The index of '2' requires careful knowledge of how many repeated fields, and which one is the brief description
                                $(".csc-repeatable-add").eq(2).click();
                            }
                        },
                        confirmation: {
                            options: {
                                confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
                            }
                        }
                    }
                }
            }
        };
        setupObjects(options);
        stop();        
        
    });
    
    objectsTests.test("Test Repeatable Field Update + Add", function () {
        var options = {
            pageBuilder: {
                options: {
                    csid: "1984.068.0335b",
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
                                jqUnit.assertEquals("Initally, there is 1 row of repeatable fields", 
                                    1, $(".csc-object-identification-brief-description").length);
                                jqUnit.assertEquals("Initally, Repeatable field has a value of ", 
                                    "This is brief description.", $(".csc-object-identification-brief-description").val());
                                $(".csc-object-identification-brief-description").val("New Test Description").change();
                                pageBuilder.applier.modelChanged.addListener("*", function (model, oldModel, changeRequest) {
                                    jqUnit.assertEquals("Request model elPath should be ", 
                                        "fields.briefDescriptions", changeRequest.path);
                                    jqUnit.assertEquals("After '+field' clicked, there have to be 2 bried descriptions", 
                                        2, model.fields.briefDescriptions.length);
                                    jqUnit.assertDeepEq("(In the model) First brief descriptions is still", {
                                        "briefDescription": "New Test Description",
                                        "_primary": true
                                    }, model.fields.briefDescriptions[0]);
                                    jqUnit.assertDeepEq("(In the model) Second brief descriptions is empty", 
                                        {}, model.fields.briefDescriptions[1]);
                                    // TODO: The index of '2' requires careful knowledge of how many repeated fields, and which one is the brief description
                                    var repeatableContainer = $(".csc-repeatable-add").eq(2).parent("div");
                                    var domModifiedListener = function () {
                                        // The first DOMSubtreeModified will be the Renderer clearing the DOM; we want
                                        // to test after the second event, which will be after the new DOM is rendered
                                        repeatableContainer.unbind("DOMSubtreeModified", this);
                                        repeatableContainer.bind("DOMSubtreeModified", function () { 
                                            jqUnit.assertDeepEq("(On the page) First brief descriptions is still", 
                                                "New Test Description", $(".csc-object-identification-brief-description").eq(0).val());
                                            jqUnit.assertDeepEq("(On the page) Second brief descriptions is empty", 
                                                "", $(".csc-object-identification-brief-description").eq(1).val());
                                            start();
                                        });
                                    };
                                    repeatableContainer.bind("DOMSubtreeModified", domModifiedListener);
                                });
                                
                                // TODO: The index of '2' requires careful knowledge of how many repeated fields, and which one is the brief description
                                $(".csc-repeatable-add").eq(2).click();
                            }
                        }
                    },
                    confirmation: {
                        options: {
                            confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
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

