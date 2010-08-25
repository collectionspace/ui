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
        url: "../../main/webapp/html/data/objects/1984.068.0335b.json",
        async: false,
        dataType: "json",
        success: function (data) {
            model = data;
            applier = fluid.makeChangeApplier(model);
        },
        error: function (xhr, textStatus, error) {
            fluid.log("Unable to load object's data for testing");
        }
    });
    
    var relatedRecordsTabTest = new jqUnit.TestCase("Related Records Tab Tests", function () {
        cspace.util.isTest = true;
        relatedRecordsTabTest.fetchTemplate("../../main/webapp/html/tabsTemplate.html", ".csc-tabs-template", $(".template1"));
        relatedRecordsTabTest.fetchTemplate("../../main/webapp/html/objectTabPlaceholder.html", ".csc-object-tab", $(".template2"));
        fluid.model.copyModel(testApplier, applier);        
    });

    var setupTab = function (opts) {
        var testPrimaryType = "intake";
        var testRelatedType = "objects";
        var options = {
            uispecUrl: "../../main/webapp/html/uispecs/object-tab/uispec.json",
            listeners: {
                onDependencySetup: function (uispec) {
                    // Change the template URL for the number pattern chooser.
                    uispec.details[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl = "../../main/webapp/html/NumberPatternChooser.html";
                },
                pageReady: opts.pageReadyListener
            },
            pageSpec: {
                list: {
                    href: "../../main/webapp/html/objectTabRecordListTemplate.html",
                    templateSelector: ".csc-object-tab-record-list",
                    targetSelector: ".div-for-list-of-records"
                },
                details: {
                    href: "../../main/webapp/html/ObjectEntryTemplate.html",
                    templateSelector: ".csc-object-entry-template",
                    targetSelector: ".div-for-recordEditor"
                } 
            },
            pageType: "object-tab"
        };
        var dependencies = {
            relatedRecordsTab: {
                funcName: "cspace.relatedRecordsTab",
                args: [".csc-object-tab", testPrimaryType, testRelatedType, "{pageBuilder}.uispec", testApplier, {
                    listEditor: {
                        options: {
                            listeners: opts.listEditorListeners,
                            initList: cspace.listEditor.receiveData,
                            data: testApplier.model.relations.objects,
                            dataContext: {
                                options: {
                                    recordType: testRelatedType,
                                    fileExtension: ".json",
                                    baseUrl: "../../main/webapp/html/data/"
                                }
                            },
                            list: {
                                options: {
                                    listeners: opts.listListeners
                                }
                            },
                            details: {
                                options: {
                                    confirmation: {
                                        options: {
                                            confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
                                        }
                                    },
                                    listeners: opts.detailsListeners
                                }
                            }
                        }
                    },
                    relationManager: {
                        options: {
                            dataContext: {
                                options: {
                                    baseUrl: "data/",
                                    fileExtension: ".json"
                                }
                            },
                            searchToRelateDialog: {
                                options: {
                                    templates: {
                                        dialog: "../../main/webapp/html/searchToRelate.html"
                                    },
                                    listeners: opts.searchToRelateListeners
                                }
                            }
                        }
                    }
                }]
            }
        };
        pageBuilder = cspace.pageBuilder(dependencies, options);
    };
    
    relatedRecordsTabTest.test("Initialization", function () {
        setupTab({
            pageReadyListener: function () {
                var le = pageBuilder.components.relatedRecordsTab.listEditor;
                le.details.events.afterRender.addListener(function () {
                    jqUnit.isVisible("Related record tab details should have visible link 'Go to record'", $(".csc-goto", le.details.container));
                    jqUnit.assertEquals("href for the 'Go to record' should be", "./objects.html?csid=2005.018.1383", $(".csc-goto").attr("href"));
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
                var le = pageBuilder.components.relatedRecordsTab.listEditor;
                le.details.events.afterRender.addListener(function () {
                    le.details.events.afterRender.removeListener("firstSelect");
                    jqUnit.isVisible("Related record tab details should have visible link 'Go to record'", $(".csc-goto", le.details.container));
                    jqUnit.assertEquals("Initial href for the 'Go to record' should be", "./objects.html?csid=2005.018.1383", $(".csc-goto").attr("href"));
                    le.details.events.afterRender.addListener(function () {
                        jqUnit.isVisible("Related record tab details should still have visible link 'Go to record'", $(".csc-goto", le.details.container));
                        jqUnit.assertEquals("href for the 'Go to record' should now be", "./objects.html?csid=1984.068.0338", $(".csc-goto").attr("href"));
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
            url: "../../main/webapp/html/data/intake/IN2004.002.json",
            async: false,
            dataType: "json",
            success: function (data) {
                model = data;
                primaryApplier = fluid.makeChangeApplier(model);
            },
            error: function (xhr, textStatus, error) {
                fluid.log("Unable to load object's data for testing");
            }
        });
        var options = {
            // TODO: These record types are required, not options. They need to be factored
            //       into the function signature proper
            primaryRecordType: "intake",
            relatedRecordType: "objects",
            configURL: "../../main/webapp/html/config/object-tab.json",
            pageBuilder: {
                options: {
                    pageType: "intake",
                    uispecUrl: "../../main/webapp/html/uispecs/object-tab/uispec.json",
                    pageSpec: {
                        list: {
                            href: "../../main/webapp/html/objectTabRecordListTemplate.html"
                        },
                        details: {
                            href: "../../main/webapp/html/ObjectEntryTemplate.html"
                        }
                    },
                    listeners: {
                        onDependencySetup: function (uispec) {
                            // Change the template URL for the number pattern chooser.
                            uispec.details[".csc-object-identification-object-number-container"].decorators[0].options.templateUrl
                                = "../../main/webapp/html/NumberPatternChooser.html";
                        },
                        pageReady: function () {
                                var details = objTab.pageBuilder.components.relatedRecordsTab.listEditor.details;
                                details.events.afterRender.addListener(function () {
                                    var reSelectors = details.options.selectors;
                                    var messageContainer = $(reSelectors.messageContainer, details.container);
                                    var message = $($(reSelectors.feedbackMessage, messageContainer)[0]);
                                    jqUnit.notVisible("Before testing, message should not be visible", message);
                                    $(".csc-object-identification-object-number", details.container).val("");
                                    var ret = details.requestSave();
                                    jqUnit.isVisible("After clicking save, message should be visible", message);
                                    jqUnit.assertEquals("Message should be ", "Please specify an Identification Number", message.text());
                                    details.events.afterRender.removeListener("testFunc");
                                    start();
                                }, "testFunc");
                                $(".csc-recordList-row:first").click();
                            }
                    }
                }
            },
            depOpts: {
                relatedRecordsTab: {
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
                        },
                        listEditor: {
                            options: {
                                dataContext: {
                                    options: {
                                        baseUrl: "../../main/webapp/html/data"
                                    }
                                },
                                details: {
                                    options: {
                                        confirmation: {
                                            options: {
                                                confirmationTemplateUrl: "../../main/webapp/html/Confirmation.html"
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
        objTab = cspace.tabSetup(primaryApplier, options);
        stop();
    });

    // TODO: this is ready to have tests added here.
    relatedRecordsTabTest.test("Using SearchToRelateDialog", function () {
        setupTab({
            pageReadyListener: function () {
                var le = pageBuilder.components.relatedRecordsTab.listEditor;
                $(pageBuilder.components.relatedRecordsTab.relationManager.options.selectors.addButton).click();
            },
            searchToRelateListeners: {
                afterRender: function(){
                    $(pageBuilder.components.relatedRecordsTab.relationManager.addDialog.options.selectors.closeButton).click();
                    start();
                }
            }
        });
        stop();
    });
    
};

(function () {
    relatedRecordsTabTester(jQuery);
}());