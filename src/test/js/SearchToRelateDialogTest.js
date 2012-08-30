/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

fluid.setLogging(false);

var searchToRelateDialogTester = function () {

    fluid.defaults("cspace.test.RelationManager", {
        gradeNames: ["fluid.rendererComponent", "autoInit"]
    });

    var baseModel = {
            csid : "123.456.789",
            relations : []
        },
        searchToRelateDialog,

        bareSearchToRelateDialogTest = new jqUnit.TestCase("SearchToRelateDialog Tests"),

        searchToRelateDialogTest = cspace.tests.testEnvironment({
            testCase: bareSearchToRelateDialogTest,
            components: {
                RelationManager: {
                    type: "cspace.test.RelationManager"
                }
            }
        }),

        createSearchToRelate = function (primary, related, listeners, searchOpts) {
            var testOpts = {};
            var testModel = {};
            var applier = fluid.makeChangeApplier(testModel);

            fluid.merge(null, testOpts, {
                related: related,
                primary: primary,
                applier: applier,
                model: testModel,
                listeners: listeners,
                showCreate: true,
                components: {
                    search: {
                        options: searchOpts
                    }
                }
            }),
            // The dialog may now render synchronously - acquire its object reference using this listener
            acquireDialogListener = function (dialog) {
                searchToRelateDialog = dialog;
            };

        testOpts.listeners.afterSetup = [acquireDialogListener].concat(fluid.makeArray(testOpts.listeners.afterSetup));
        cspace.searchToRelateDialog("#main .csc-search-related-dialog", testOpts);
    };

    searchToRelateDialogTest.asyncTest("Creation for particular record type (cataloging, relating to acquisition)", function () {
        createSearchToRelate("acquisition", "cataloging", {
            afterSetup: function (dialog) {
                var mainSearch = dialog.search.mainSearch;
                dialog.open();
                jqUnit.assertTrue("Searching for a particular record type, the drop-down should not be enabled", mainSearch.locate("recordTypeSelect").is(":disabled"));
                mainSearch.locate("searchButton").click();
            }
        }, {
            listeners: {
                onSearch: function () {
                    jqUnit.assertEquals("Search should be set up to search for the correct record type",
                          searchToRelateDialog.options.related, searchToRelateDialog.search.model.searchModel.recordType);
                },
                afterSearch: function () {
                    searchToRelateDialog.locate("closeButton").click();
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.asyncTest("Creation for procedures (will try to relate a loanout to the primary movement)", function () {
        var testRecordType = "loanout";
        createSearchToRelate("movement", "procedures", {
            afterSetup: function (dialog) {
                dialog.open();
                var recordType = dialog.search.mainSearch.locate("recordTypeSelect"),
                    options = $("option", recordType),
                    values = {};
                jqUnit.assertTrue("Searching for all procedure types, the drop-down should be enabled", recordType.is(":enabled"));
                // Check that missing permissions for "intake" record type have removed it from rendering
                fluid.each(options, function(option) {
                    values[$(option).attr("value")] = true;
                });
                fluid.each({loanout: true, movement: true, intake: undefined}, function(value, key) {
                    jqUnit.assertEquals("Rendering of record type " + key, value, values[key]);
                });
                recordType.val(testRecordType);
                dialog.search.mainSearch.locate("searchButton").click();
            }
        }, {
            listeners: {
                onSearch: function () {
                    jqUnit.assertEquals("Search should be set up to search for the correct record type", testRecordType, searchToRelateDialog.search.model.searchModel.recordType);
                },
                afterSearch: function () {
                    searchToRelateDialog.locate("closeButton").click();
                    start();
                }
            }
        });
    });
    
    var readAllPermissions = {
        loanin: ["list", "read", "create", "update"],
        loanout: ["list", "read", "create", "update"],
        intake: ["list", "read", "create", "update"]
    };

    var readPermsTest = cspace.tests.testEnvironment({
        testCase: bareSearchToRelateDialogTest,
        permissions: readAllPermissions
        });

    readPermsTest.asyncTest("Search results display", function () {
        expect(8);
        var testRecordType = "intake";
        createSearchToRelate("acquisition", "procedures", {
            afterSetup: function (dialog) {
                // 1) The dialog should render
                dialog.open();
                jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", dialog.search.mainSearch.locate("recordTypeSelect"));
                dialog.locate("recordType").val(testRecordType);
                dialog.search.mainSearch.locate("searchButton").click();
            }
        }, {
            listeners: {
                onSearch : function () {
                    var selectors = searchToRelateDialog.search.options.selectors;
                    jqUnit.notVisible("When search submitted, search results should be hidden", $(selectors.resultsContainer));
                    jqUnit.notVisible("When search submitted, results count should be hidden - http://issues.collectionspace.org/browse/CSPACE-2290", $(selectors.resultsCountContainer));
                    jqUnit.isVisible("When search submitted, 'looking' message should be visible - http://issues.collectionspace.org/browse/CSPACE-2289", $(selectors.lookingContainer));
                },
                afterSearch : function () {
                    // 2) Search results should be displayed
                    var selectors = searchToRelateDialog.search.options.selectors;
                    jqUnit.assertEquals("After clicking search, search results should be of the expected type", testRecordType, searchToRelateDialog.search.model.results[0].recordtype);
                    jqUnit.isVisible("After clicking search, search results are visible", $(selectors.resultsContainer));
                    jqUnit.isVisible("After clicking search, search results count container is visible - http://issues.collectionspace.org/browse/CSPACE-2290", $(selectors.resultsCountContainer));
                    jqUnit.notVisible("After clicking search, 'looking' message should be hidden - http://issues.collectionspace.org/browse/CSPACE-2289", $(selectors.lookingContainer));
                    searchToRelateDialog.locate("closeButton").click();
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.asyncTest("Results display on search error", function () {
        var testRecordType = "intake";
        expect(1);
        createSearchToRelate("loanout", "procedures", {
            afterSetup: function (dialog) {
                dialog.open();
                dialog.search.events.onError.fire();
            }
        }, {
            // no search url builder - rely on default - which will return an error
            listeners : {
                onError : function () {
                    jqUnit.assertTrue("On error should be triggered", true);
                    searchToRelateDialog.locate("closeButton").click();
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.asyncTest("Create all-new record", function () {
        createSearchToRelate("cataloging", "intake", {
            afterSetup: function (dialog) {
                dialog.locate("createNewButton").click();
            },
            onCreateNewRecord : function () {
                jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                start();
            }
        });
        // TODO: this test very incomplete
    });

    readPermsTest.asyncTest("Create relationship from search results", function () {
        var primaryRecordType = "intake",
            testRecordType = "loanout";
        createSearchToRelate(primaryRecordType, "procedures", {
            afterSetup: function (dialog) {
                var mainSearch = dialog.search.mainSearch;
                mainSearch.locate("recordTypeSelect").val(testRecordType).change();
                mainSearch.locate("searchButton").click();
            },
            addRelations: function (data) {
                var items = data.items,
                    firstItem = items[0];
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 1, items.length);
                jqUnit.assertEquals("On creation of new relation, source recordType should be correct", primaryRecordType, firstItem.source.recordtype);
                jqUnit.assertEquals("On creation of new relation, target recordType should be correct", testRecordType, firstItem.target.recordtype);
                searchToRelateDialog.locate("closeButton").click();
                start();
            }
        }, {
            listeners: {
                afterSearch : function () {
                    searchToRelateDialog.search.model.results[0].selected = true;
                    searchToRelateDialog.locate("addButton").click();
                }
            }
        });
    });

    readPermsTest.asyncTest("Create multiple relationships from search results", function () {
        var primaryRecordType = "movement",
            testRecordType = "intake";
        createSearchToRelate(primaryRecordType, "procedures", {
            afterSetup: function (dialog) {
                dialog.locate("recordType").val(testRecordType);
                dialog.search.mainSearch.locate("searchButton").click();
            },
            addRelations: function (data) {
                var items = data.items,
                    firstItem = items[0],
                    secondItem = items[1];
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 2, items.length);
                jqUnit.assertEquals("On creation of new relation, first source recordType should be correct", primaryRecordType, firstItem.source.recordtype);
                jqUnit.assertEquals("On creation of new relation, first target recordType should be correct", testRecordType, firstItem.target.recordtype);
                jqUnit.assertEquals("On creation of new relation, second source recordType should be correct", primaryRecordType, secondItem.source.recordtype);
                jqUnit.assertEquals("On creation of new relation, second target recordType should be correct", testRecordType, secondItem.target.recordtype);
                searchToRelateDialog.locate("closeButton").click();
                start();
            }
        }, {
            listeners: {
                afterSearch : function () {
                    var results = searchToRelateDialog.search.model.results;
                    results[0].selected = true;
                    results[1].selected = true;
                    searchToRelateDialog.locate("addButton").click();
                }
            }
        });
    });
};

(function () {
    searchToRelateDialogTester();
}());
