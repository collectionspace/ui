/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jqUnit, cspace, fluid, start */
"use strict";

fluid.setLogging(false);

var searchToRelateDialogTester = function () {

    fluid.defaults("cspace.test.RelationManager", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });

    var searchToRelateDialog,
        bareSearchToRelateDialogTest = new jqUnit.TestCase("SearchToRelateDialog Tests"),
        searchToRelateDialogTest = cspace.tests.testEnvironment({
            testCase: bareSearchToRelateDialogTest,
            components: {
                RelationManager: {
                    type: "cspace.test.RelationManager"
                }
            }
        }),
        createSearchToRelate = function (testScenario) {
            var testOpts = {},
                testModel = {},
                applier = fluid.makeChangeApplier(testModel),

                // The dialog may now render synchronously - acquire its object reference using this listener
                acquireDialogListener = function (dialog) {
                    searchToRelateDialog = dialog;
                };

            fluid.merge(null, testOpts, {
                related: testScenario.related,
                primary: testScenario.primary,
                applier: applier,
                model: testModel,
                listeners: testScenario.listeners,
                showCreate: true,
                components: {
                    search: {
                        options: testScenario.searchOpts
                    }
                }
            }),
            testOpts.listeners.afterSetup = [acquireDialogListener].concat(fluid.makeArray(testOpts.listeners.afterSetup));
            cspace.searchToRelateDialog("#main .csc-search-related-dialog", testOpts);
        },
        readAllPermissions = {
            loanin: ["list", "read", "create", "update"],
            loanout: ["list", "read", "create", "update"],
            intake: ["list", "read", "create", "update"]
        },
        readPermsTest = cspace.tests.testEnvironment({
            testCase: bareSearchToRelateDialogTest,
            permissions: readAllPermissions
        }),

        testScenarios = {
            "Creation for particular record type (cataloging, relating to acquisition)": {
                testEnvironment: searchToRelateDialogTest,
                primary: "acquisition",
                related: "cataloging",
                listeners: {
                    afterSetup: function (dialog) {
                        var mainSearch = dialog.search.mainSearch;
                        dialog.open();
                        jqUnit.assertTrue("Searching for a particular record type, the drop-down should not be enabled", mainSearch.locate("recordTypeSelect").is(":disabled"));
                        mainSearch.locate("searchButton").click();
                    }
                },
                searchOpts: {
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
                }
            },
            "Creation for procedures (will try to relate a loanout to the primary movement)": {
                testEnvironment: searchToRelateDialogTest,
                primary: "movement",
                related: "procedures",
                listeners: {
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
                        recordType.val("loanout");
                        dialog.search.mainSearch.locate("searchButton").click();
                    }
                },
                searchOpts: {
                    listeners: {
                        onSearch: function () {
                            jqUnit.assertEquals("Search should be set up to search for the correct record type", "loanout", searchToRelateDialog.search.model.searchModel.recordType);
                        },
                        afterSearch: function () {
                            searchToRelateDialog.locate("closeButton").click();
                            start();
                        }
                    }
                }
            },
            "Search results display": {
                testEnvironment: readPermsTest,
                primary: "acquisition",
                related: "procedures",
                listeners: {
                    afterSetup: function (dialog) {
                        // 1) The dialog should render
                        dialog.open();
                        jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", dialog.search.mainSearch.locate("recordTypeSelect"));
                        dialog.locate("recordType").val("intake");
                        dialog.search.mainSearch.locate("searchButton").click();
                    }
                },
                searchOpts: {
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
                            jqUnit.assertEquals("After clicking search, search results should be of the expected type", "intake", searchToRelateDialog.search.model.results[0].recordtype);
                            jqUnit.isVisible("After clicking search, search results are visible", $(selectors.resultsContainer));
                            jqUnit.isVisible("After clicking search, search results count container is visible - http://issues.collectionspace.org/browse/CSPACE-2290", $(selectors.resultsCountContainer));
                            jqUnit.notVisible("After clicking search, 'looking' message should be hidden - http://issues.collectionspace.org/browse/CSPACE-2289", $(selectors.lookingContainer));
                            searchToRelateDialog.locate("closeButton").click();
                            start();
                        }
                    }
                }
            },
            "Results display on search error": {
                testEnvironment: searchToRelateDialogTest,
                primary: "loanout",
                related: "procedures",
                listeners: {
                    afterSetup: function (dialog) {
                        dialog.open();
                        dialog.search.events.onError.fire();
                    }
                },
                searchOpts: {
                    // no search url builder - rely on default - which will return an error
                    listeners : {
                        onError : function () {
                            jqUnit.assertTrue("On error should be triggered", true);
                            searchToRelateDialog.locate("closeButton").click();
                            start();
                        }
                    }
                }
            },
            "Create relationship from search results": {
                testEnvironment: readPermsTest,
                primary: "intake",
                related: "procedures",
                listeners: {
                    afterSetup: function (dialog) {
                        var mainSearch = dialog.search.mainSearch;
                        mainSearch.locate("recordTypeSelect").val("loanout").change();
                        mainSearch.locate("searchButton").click();
                    },
                    addRelations: function (data) {
                        var items = data.items,
                            firstItem = items[0];
                        jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 1, items.length);
                        jqUnit.assertEquals("On creation of new relation, source recordType should be correct", "intake", firstItem.source.recordtype);
                        jqUnit.assertEquals("On creation of new relation, target recordType should be correct", "loanout", firstItem.target.recordtype);
                        searchToRelateDialog.locate("closeButton").click();
                        start();
                    }
                },
                searchOpts: {
                    listeners: {
                        afterSearch : function () {
                            searchToRelateDialog.search.model.results[0].selected = true;
                            searchToRelateDialog.locate("addButton").click();
                        }
                    }
                }
            },
            "Create multiple relationships from search results": {
                testEnvironment: readPermsTest,
                primary: "movement",
                related: "procedures",
                listeners: {
                    afterSetup: function (dialog) {
                        dialog.locate("recordType").val("intake");
                        dialog.search.mainSearch.locate("searchButton").click();
                    },
                    addRelations: function (data) {
                        var items = data.items,
                            firstItem = items[0],
                            secondItem = items[1];
                        jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 2, items.length);
                        jqUnit.assertEquals("On creation of new relation, first source recordType should be correct", "movement", firstItem.source.recordtype);
                        jqUnit.assertEquals("On creation of new relation, first target recordType should be correct", "intake", firstItem.target.recordtype);
                        jqUnit.assertEquals("On creation of new relation, second source recordType should be correct", "movement", secondItem.source.recordtype);
                        jqUnit.assertEquals("On creation of new relation, second target recordType should be correct", "intake", secondItem.target.recordtype);
                        searchToRelateDialog.locate("closeButton").click();
                        start();
                    }
                },
                searchOpts: {
                    listeners: {
                        afterSearch : function () {
                            var results = searchToRelateDialog.search.model.results;
                            results[0].selected = true;
                            results[1].selected = true;
                            searchToRelateDialog.locate("addButton").click();
                        }
                    }
                }
            }
        };

    $.each(testScenarios, function(message, testScenario) {
        testScenario.testEnvironment.asyncTest(message, function () {
            createSearchToRelate(testScenario);
        });
    });
};

(function () {
    searchToRelateDialogTester();
}());
