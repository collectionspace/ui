/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jqUnit, jQuery, cspace:true, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var sidebarTester = function ($) {

    fluid.defaults("cspace.pageBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        pageType: "objectexit",
        selectors: {
            sidebar: "#main"
        }
    });
    
    fluid.demands("cspace.pageBuilder", ["cspace.mediaTest", "cspace.pageBuilderIO"], {
        options: {
            pageType: "media"
        }
    });

    var bareSidebarTest = new jqUnit.TestCase("Sidebar Tests");

    var sidebarTest = cspace.tests.testEnvironment({testCase: bareSidebarTest, permissions: cspace.tests.sampleUserPerms, components: {
        pageBuilder: {
            type: "cspace.pageBuilder"
        }
    }});

    var setupSidebar = function (options, testEnv) {
        testEnv = testEnv || sidebarTest;
        var instantiator = testEnv.instantiator;
        if (testEnv.sidebar) {
            instantiator.clearComponent(testEnv, "sidebar");
        }
        testEnv.options.components.sidebar = {
            type: "cspace.sidebar",
            options: options
        };
        fluid.initDependent(testEnv, "sidebar", instantiator);
    };

    //returns full permissions except for those specified in the array noperm,
    //which will not have any permissions
    var getLimitedPermissions = function(noperm) {
        var returnPerms = {};
        fluid.model.copyModel(returnPerms, cspace.tests.fullPerms);
        fluid.each(noperm, function(val) {
            returnPerms[val] = [];
        });
        return returnPerms;
    };

    //test not rendering cataloging
    var noCatalogingSidebarTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: getLimitedPermissions(["cataloging", "loanout"]),
        components: {
            pageBuilder: {
                type: "cspace.pageBuilder"
            }
        }
    });

    //test not rendering procedures
    var noProceduresSidebarTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: getLimitedPermissions(["intake", "loanin", "loanout", "acquisition", "movement", "objectexit", "media", "valuationcontrol"]),
        components: {
            pageBuilder: {
                type: "cspace.pageBuilder"
            }
        }
    });

    var sidebarTestMedia = cspace.tests.testEnvironment({testCase: bareSidebarTest, permissions: cspace.tests.sampleUserPerms, components: {
        mediaTest: {
            type: "fluid.typeFount",
            options: {
                targetTypeName: "cspace.mediaTest"
            }
        },
        pageBuilder: {
            type: "cspace.pageBuilder"
        }
    }});

    var testConfig = {
        "All rendered": {
            testEnv: sidebarTest,
            setup: setupSidebar,
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (sidebar, globalModel) {
                        jqUnit.isVisible("Media is rendered", sidebar.locate("media"));
                        jqUnit.isVisible("Cataloging is rendered", sidebar.locate("relatedCataloging"));
                        jqUnit.isVisible("Procedures are rendered", sidebar.locate("relatedProcedures"));
                        jqUnit.isVisible("Vocabs are rendered", sidebar.locate("relatedVocabularies"));
                        var model = {},
                            applier = fluid.makeChangeApplier(model),
                            modelSpec = {
                                primaryModel: {
                                    model: model,
                                    applier: applier
                                }
                            };
                        globalModel.attachModel(modelSpec);
                        globalModel.applier.requestChange("primaryModel.csid", "aa643807-e1d1-4ca2-9f9b");
                    }
                },
                listUpdated: [{
                    path: "components.vocabularies.options.listeners",
                    priority: "last",
                    listener: function (sidebar) {
                        var rrlView = sidebar.vocabularies.rrlListView,
                            recordtypes = ["person", "organization"];
                        jqUnit.assertEquals("Records has related vocabularies", 2, rrlView.model.list.length);
                        fluid.each(rrlView.model.list, function (item, index) {
                            jqUnit.assertEquals("Records has related vocabularies of type ", recordtypes[index], item.recordtype);
                        });
                        jqUnit.assertEquals("Related vocabularies record list is rendered", 2, rrlView.locate("row").length);
                    }
                }, {
                    path: "components.cataloging.options.listeners",
                    priority: "last",
                    listener: function (sidebar) {
                        var rrlView = sidebar.cataloging.rrlListView;
                        jqUnit.assertEquals("Records has related cataloging", 1, rrlView.model.list.length);
                        jqUnit.assertEquals("Records has related cataloging of type cataloging", "cataloging", rrlView.model.list[0].recordtype);
                        jqUnit.assertEquals("Related cataloging record list is rendered", 1, rrlView.locate("row").length);
                    }
                }, {
                    path: "components.procedures.options.listeners",
                    priority: "last",
                    listener: function (sidebar) {
                        var rrlView = sidebar.procedures.rrlListView,
                            row = rrlView.locate("row");
                        jqUnit.assertEquals("Records has related procedures", 1, rrlView.model.list.length);
                        jqUnit.assertEquals("Records has related procedures of type intake", "intake", rrlView.model.list[0].recordtype);
                        jqUnit.assertEquals("Related procedures record list is rendered", 1, row.length);
                        jqUnit.assertTrue("Given no perms for intake the row should look disabled", row.hasClass("cs-disabled"));
                        fluid.each($("a", row), function (link) {
                            jqUnit.assertEquals("Href should be ", "#", $(link).attr("href"));
                        });
                        start();
                    }
                }]
            }
        },
        "No Cataloging Permissions": {
            testEnv: noCatalogingSidebarTest,
            setup: setupSidebar,
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (sidebar, globalModel) {
                        jqUnit.assertEquals("Cataloging is not rendered", 0, sidebar.locate("relatedCataloging").length);
                        start();
                    }
                }
            }
        },
        "No Procedures Permissions": {
            testEnv: noProceduresSidebarTest,
            setup: setupSidebar,
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (sidebar, globalModel) {
                        jqUnit.assertEquals("Procedures is not rendered", 0, sidebar.locate("relatedProcedures").length);
                        start();
                    }
                }
            }
        },
        "Media": {
            testEnv: sidebarTestMedia,
            setup: setupSidebar,
            testType: "asyncTest",
            listeners: {
                ready: {
                    path: "listeners",
                    listener: function (sidebar, globalModel) {
                        jqUnit.isVisible("Media is rendered", sidebar.locate("media"));
                        var media = fluid.find(fluid.renderer.getDecoratorComponents(sidebar), function (media) {return media;}),
                            mediaView = media.mediaView;
                        mediaView.events.afterRender.addListener(function () {
                            var image = $(".csc-mediaView-mediumImage");
                            jqUnit.isVisible("Media snapshot is rendered", media.locate("mediaSnapshot"));
                            jqUnit.assertValue("Media snapshot has source", image.attr("src"));
                            jqUnit.assertTrue("Media snapshot has appropriate derivative", /Medium/.test(image.attr("src")));
                            start();
                        });
                        var model = {},
                            applier = fluid.makeChangeApplier(model),
                            modelSpec = {
                                primaryModel: {
                                    model: model,
                                    applier: applier
                                }
                            };
                        globalModel.attachModel(modelSpec);
                        globalModel.applier.requestChange("primaryModel", {
                            csid: "5a03b49b-7861-4ff9-a73d",
                            fields: {
                                blobCsid: "7d44c723-226b-4c4b-b3df",
                                blobs: [{
                                    imgMedium: "http://nightly.collectionspace.org:8180/collectionspace/tenant/core/download/7d44c723-226b-4c4b-b3df/Medium",
                                    imgOrig: "http://nightly.collectionspace.org:8180/collectionspace/tenant/core/download/7d44c723-226b-4c4b-b3df/Original",
                                    imgThumb: "http://nightly.collectionspace.org:8180/collectionspace/tenant/core/download/7d44c723-226b-4c4b-b3df/Thumbnail"
                                }]
                            }
                        });
                    }
                }
            }
        }
    };

    fluid.each(["ready"], function (eventName) {
        fluid.demands(eventName, ["cspace.sidebar", "cspace.test"], {
            args: ["{cspace.sidebar}", "{globalModel}"]
        });
    });

    cspace.tests.testRunner(testConfig);
};

jQuery(document).ready(function () {
    sidebarTester(jQuery);
});