/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, expect*/
"use strict";

var relatedRecordsTabTester = function ($) {
    var testApplier = {};
    var model, applier, pbIO;

    $.ajax({
        url: "../data/cataloging/1984.068.0338.json",
        async: false,
        dataType: "json",
        success: function (data) {
            model = data;
            applier = fluid.makeChangeApplier(model);
        },
        error: function (xhr, textStatus, error) {
            fluid.log("Unable to load cataloging data for testing");
        }
    });
    
    var bareRelatedRecordsTabTest = new jqUnit.TestCase("Related Records Tab Tests", function () {
        bareRelatedRecordsTabTest.fetchTemplate("../../main/webapp/html/components/TabsTemplate.html", ".csc-tabs-tabList", $(".template1"));
        fluid.model.copyModel(testApplier, applier);        
    });
    
    var relatedRecordsTabTest = cspace.tests.testEnvironment({testCase: bareRelatedRecordsTabTest});

    var setupTab = function (opts) {
        var testPrimaryType = "intake";
        var testRelatedType = "cataloging";
        var options = {
            pageBuilder: {
                options: {
                    primary: testPrimaryType,
                    related: testRelatedType,
                    userLogin: cspace.tests.userLogin,
                    listeners: {
                        onDependencySetup: function (uispec) {
                            // Change the template URL for the number pattern chooser.
                            uispec.details[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl = "../../main/webapp/html/components/NumberPatternChooser.html";
                        }
                    },
                    applier: testApplier,
                    model: testApplier.model,
                    pageType: "cataloging-tab",
                    selectors: {
                        relatedRecordsTab: ".csc-relatedRecordsTab-cataloging"
                    },
                    components: {
                        relatedRecordsTab: {
                            type: "cspace.relatedRecordsTab",
                            options: {
                                primary: "{pageBuilder}.options.primary",
                                related: "{pageBuilder}.options.related",
                                applier: "{pageBuilder}.applier",
                                model: "{pageBuilder}.model",
                                uispec: "{pageBuilder}.options.uispec",
                                components: {
                                    listEditor: {
                                        options: {
                                            listeners: opts.listEditorListeners,
                                            initList: cspace.listEditor.receiveData,
                                            data: testApplier.model.relations.cataloging,
                                            dataContext: {
                                                options: {
                                                    recordType: testRelatedType
                                                }
                                            },
                                            list: {
                                                options: {
                                                    listeners: opts.listListeners
                                                }
                                            },
                                            details: {
                                                options: {
                                                    listeners: opts.detailsListeners
                                                }
                                            }
                                        }
                                    },
                                    relationManager: {
                                        options: {
                                            primary: "{pageBuilder}.options.primaryRecordType",
                                            related: "cataloging",
                                            model: "{pageBuilder}.model",
                                            applier: "{pageBuilder}.applier",
                                            components: {
                                                searchToRelateDialog: {
                                                    options: {
                                                        listeners: opts.searchToRelateListeners
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
            pageBuilderIO: {
                options: {
                    uispecUrl: "../uispecs/cataloging-tab.json",
                    listeners: {
                        pageReady: opts.pageReadyListener
                    },
                    pageSpec: {
                        details: {
                            href: "../../main/webapp/html/pages/CatalogingTemplate.html",
                            templateSelector: ".csc-cataloging-template",
                            targetSelector: ".csc-relatedRecordsTab-cataloging .csc-relatedRecordsTab-recordEditor"
                        }
                    }
                }
            }
        };
        pbIO = cspace.pageBuilderIO(options.pageBuilderIO.options);
        pbIO.initPageBuilder(options.pageBuilder.options);
    };
    
    relatedRecordsTabTest.asyncTest("Initialization", function () {
        setupTab({
            pageReadyListener: function () {
                var le = pbIO.pageBuilder.relatedRecordsTab.listEditor;
                le.details.events.afterRender.addListener(function () {
                    jqUnit.isVisible("Related record tab details should have visible link 'Go to record'", $(".csc-goto", le.details.container));
                    jqUnit.assertEquals("href for the 'Go to record' should be", "../../main/webapp/html/cataloging.html?csid=2005.018.1383", $(".csc-goto").attr("href"));
                    start();
                });
                le.list.locate("row").eq(1).click();
            }
        });
    });
    
    relatedRecordsTabTest.asyncTest("Changing Record", function () {
        setupTab({
            pageReadyListener: function () {
                var le = pbIO.pageBuilder.relatedRecordsTab.listEditor;
                le.details.events.afterRender.addListener(function () {
                    le.details.events.afterRender.removeListener("firstSelect");
                    jqUnit.isVisible("Related record tab details should have visible link 'Go to record'", $(".csc-goto", le.details.container));
                    jqUnit.assertEquals("Initial href for the 'Go to record' should be", "../../main/webapp/html/cataloging.html?csid=2005.018.1383", $(".csc-goto").attr("href"));
                    le.details.events.afterRender.addListener(function () {
                        jqUnit.isVisible("Related record tab details should still have visible link 'Go to record'", $(".csc-goto", le.details.container));
                        jqUnit.assertEquals("href for the 'Go to record' should now be", "../../main/webapp/html/cataloging.html?csid=1984.068.0338", $(".csc-goto").attr("href"));
                        start();
                    });
                    le.list.locate("row").eq(0).click();
                }, "firstSelect");
                le.list.locate("row").eq(1).click();
            }
        });
    });
    
    relatedRecordsTabTest.asyncTest("Validation of required fields in related records (CSPACE-2294)", function () {
        var  objTab, primaryApplier, model;
        $.ajax({
            url: "../data/intake/IN2004.002.json",
            async: false,
            dataType: "json",
            success: function (data) {
                model = data;
                primaryApplier = fluid.makeChangeApplier(model);
            },
            error: function (xhr, textStatus, error) {
                fluid.log("Unable to load cataloging data for testing");
            }
        });
        var options = {
            pageBuilder: {
                options: {
                    userLogin: cspace.tests.userLogin,
                    model: model,
                    applier: primaryApplier,
                    related: "cataloging",
                    primary: "intake",
                    pageType: "cataloging-tab",
                    listeners: {
                        onDependencySetup: function (uispec) {
                            // Change the template URL for the number pattern chooser.
                            uispec.details[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl
                                = "../../main/webapp/html/components/NumberPatternChooser.html";
                        }
                    },
                    components: {
                        relatedRecordsTab: {
                            options: {
                                components: {
                                    listEditor: {
                                        options: {
                                            dataContext: {
                                                options: {
                                                    recordType: "cataloging"
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
            pageBuilderIO: {
                options: {
                    uispecUrl: "../uispecs/cataloging-tab.json",
                    pageSpec: {
                        details: {
                            href: "../../main/webapp/html/pages/CatalogingTemplate.html"
                        }
                    },
                    listeners: {
                        pageReady: function () {
                            var details = objTab.pageBuilderIO.pageBuilder.relatedRecordsTab.listEditor.details;
                            details.events.afterRender.addListener(function () {
                                var reSelectors = details.options.selectors;
                                jqUnit.notVisible("Before testing, message should not be visible", details.options.messageBar.container);
                                $(".csc-object-identification-object-number", details.container).val("");
                                var ret = details.requestSave();
                                jqUnit.isVisible("After clicking save, message should be visible", details.options.messageBar.container);
                                jqUnit.assertEquals("Message should be ", "Please specify an Identification Number", details.options.messageBar.locate("message").text());
                                details.events.afterRender.removeListener("testFunc");
                                start();
                            }, "testFunc");
                            jqUnit.assertEquals("Verify that the model is still primary model", 
                                model, objTab.pageBuilderIO.pageBuilder.relatedRecordsTab.model);
                            jqUnit.assertEquals("Verify that the model is still primary applier", 
                                primaryApplier, objTab.pageBuilderIO.pageBuilder.relatedRecordsTab.applier);
                            $(".csc-recordList-row:first").click();
                        }
                    }
                }
            },
            configURL: "../../main/webapp/config/cataloging-tab.json"
        };
        objTab = cspace.globalSetup("cspace.tabs", options);
    });
};

jQuery(document).ready(function () {
    relatedRecordsTabTester(jQuery);
});