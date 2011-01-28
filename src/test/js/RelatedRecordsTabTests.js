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
    var model, applier, pageBuilder;

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
        bareRelatedRecordsTabTest.fetchTemplate("../../main/webapp/html/CatalogingTab.html", ".csc-cataloging-tab", $(".template2"));
        fluid.model.copyModel(testApplier, applier);        
    });
    
    var relatedRecordsTabTest = cspace.tests.testEnvironment({testCase: bareRelatedRecordsTabTest});

    var setupTab = function (opts) {
        var testPrimaryType = "intake";
        var testRelatedType = "cataloging";
        var options = {
            permissions: cspace.tests.sampleUserPerms,
            schemaUrl: "../uischema/cataloging.json",
            uispecUrl: "../uispecs/cataloging-tab.json",
            listeners: {
                onDependencySetup: function (uispec) {
                    // Change the template URL for the number pattern chooser.
                    uispec.details[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl = "../../main/webapp/html/components/NumberPatternChooser.html";
                },
                pageReady: opts.pageReadyListener
            },
            pageSpec: {
                list: {
                    href: "../../main/webapp/html/CatalogingTabRecordListTemplate.html",
                    templateSelector: ".csc-cataloging-tab-record-list",
                    targetSelector: ".div-for-list-of-records"
                },
                details: {
                    href: "../../main/webapp/html/pages/CatalogingTemplate.html",
                    templateSelector: ".csc-cataloging-template",
                    targetSelector: ".div-for-recordEditor"
                } 
            },
            applier: testApplier,
            model: testApplier.model,
            pageType: "cataloging-tab",
            selectors: {
                relatedRecordsTab: ".csc-cataloging-tab"
            },
            globalNavigator: cspace.util.globalNavigator(),
            messageBar: cspace.messageBar("body"),
            components: {
                relatedRecordsTab: {
                    type: "cspace.relatedRecordsTab",
                    options: {
                        primary: testPrimaryType,
                        related: testRelatedType,
                        uispec: "{pageBuilder}.uispec",
                        applier: testApplier,
                        model: testApplier.model,
                        listEditor: {
                            options: {
                                listeners: opts.listEditorListeners,
                                initList: cspace.listEditor.receiveData,
                                data: testApplier.model.relations.cataloging,
                                dataContext: {
                                    options: {
                                        recordType: testRelatedType,
                                        fileExtension: ".json",
                                        baseUrl: "../data/",
                                        dataSource: {
                                            options: {
                                                uispec: "{pageBuilder}.uispec.details" 
                                            }
                                        }
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
                        components: {
                            relationManager: {
                                options: {
                                    addRelations: cspace.relationManager.provideLocalAddRelations,
                                    dataContext: {
                                        options: {
                                            baseUrl: "../data/",
                                            fileExtension: ".json"
                                        }
                                    },
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
        };
        pageBuilder = cspace.pageBuilder(options);
    };
    
    relatedRecordsTabTest.test("Initialization", function () {
        setupTab({
            pageReadyListener: function () {
                var le = pageBuilder.relatedRecordsTab.listEditor;
                le.details.events.afterRender.addListener(function () {
                    jqUnit.isVisible("Related record tab details should have visible link 'Go to record'", $(".csc-goto", le.details.container));
                    jqUnit.assertEquals("href for the 'Go to record' should be", "./cataloging.html?csid=2005.018.1383", $(".csc-goto").attr("href"));
                    start();
                });
                le.list.locate("row").eq(1).click();
            }
        });
        stop();
    });
    
    relatedRecordsTabTest.test("Changing Record", function () {
        setupTab({
            pageReadyListener: function () {
                var le = pageBuilder.relatedRecordsTab.listEditor;
                le.details.events.afterRender.addListener(function () {
                    le.details.events.afterRender.removeListener("firstSelect");
                    jqUnit.isVisible("Related record tab details should have visible link 'Go to record'", $(".csc-goto", le.details.container));
                    jqUnit.assertEquals("Initial href for the 'Go to record' should be", "./cataloging.html?csid=2005.018.1383", $(".csc-goto").attr("href"));
                    le.details.events.afterRender.addListener(function () {
                        jqUnit.isVisible("Related record tab details should still have visible link 'Go to record'", $(".csc-goto", le.details.container));
                        jqUnit.assertEquals("href for the 'Go to record' should now be", "./cataloging.html?csid=1984.068.0338", $(".csc-goto").attr("href"));
                        start();
                    });
                    le.list.locate("row").eq(0).click();
                }, "firstSelect");
                le.list.locate("row").eq(1).click();
            }
        });
        stop();
    });
    
    relatedRecordsTabTest.test("Validation of required fields in related records (CSPACE-2294)", function () {
        var  objTab, primaryApplier;
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
            permissions: cspace.tests.sampleUserPerms,
            model: model,
            applier: primaryApplier,
            related: "cataloging",
            configURL: "../../main/webapp/config/cataloging-tab.json",
            components: {
                pageBuilderSetup: {
                    options: {
                        // TODO: These record types are required, not options. They need to be factored
                        //       into the function signature proper
                        primaryRecordType: "intake",
                        pageType: "cataloging-tab",
                        schemaUrl: "../uischema/cataloging.json",
                        uispecUrl: "../uispecs/cataloging-tab.json",
                        pageSpec: {
                            list: {
                                href: "../../main/webapp/html/CatalogingTabRecordListTemplate.html"
                            },
                            details: {
                                href: "../../main/webapp/html/pages/CatalogingTemplate.html"
                            }
                        },
                        listeners: {
                            onDependencySetup: function (uispec) {
                                // Change the template URL for the number pattern chooser.
                                uispec.details[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl
                                    = "../../main/webapp/html/components/NumberPatternChooser.html";
                            },
                            pageReady: function () {
                                    var details = objTab.pageBuilderSetup.pageBuilder.relatedRecordsTab.listEditor.details;
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
                                        model, objTab.pageBuilderSetup.pageBuilder.relatedRecordsTab.model);
                                        jqUnit.assertEquals("Verify that the model is still primary applier", 
                                        primaryApplier, objTab.pageBuilderSetup.pageBuilder.relatedRecordsTab.applier);
                                    objTab.pageBuilderSetup.pageBuilder.relatedRecordsTab
                                    $(".csc-recordList-row:first").click();
                                }
                        },
                        components: {
                            relatedRecordsTab: {
                                options: {
                                    primary: "{pageBuilder}.options.primaryRecordType",
                                    related: "{pageBuilder}.options.related",
                                    applier: "{pageBuilder}.applier",
                                    model: "{pageBuilder}.model",
                                    uispec: "{pageBuilder}.uispec",
                                    components: {
                                        relationManager: {
                                            options: {
                                                addRelations: cspace.relationManager.provideLocalAddRelations,
                                                primary: "{pageBuilder}.options.primaryRecordType",
                                                related: "cataloging",
                                                model: "{pageBuilder}.model",
                                                applier: "{pageBuilder}.applier"
                                            }
                                        }
                                    },
                                    listEditor: {
                                        options: {
                                            dataContext: {
                                                options: {
                                                    baseUrl: "../data",
                                                    dataSource: {
                                                        options: {
                                                            uispec: "{pageBuilder}.uispec.details" 
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
        };
        objTab = cspace.globalSetup("cspace.tabs", options);
        stop();
    });
};

jQuery(document).ready(function () {
    relatedRecordsTabTester(jQuery);
});