/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/
"use strict";

fluid.setLogging(true);

var searchToRelateDialogTester = function () {
    var baseModel = {
        csid : "123.456.789",
        relations : []
    };

    var searchToRelateDialog;

    var bareSearchToRelateDialogTest = new jqUnit.TestCase("SearchToRelateDialog Tests");
        
    var searchToRelateDialogTest = cspace.tests.testEnvironment({testCase: bareSearchToRelateDialogTest});

    var testSearchUrlBuilder = function () {
        return "../../main/webapp/html/data/intake/search/list.json";
    };
    
    var createSearchToRelate = function (primary, related, listeners, searchOpts) {
        var testOpts = {};
        var testModel = {};
        var applier = fluid.makeChangeApplier(testModel);
        
        fluid.merge(null, testOpts, {
            related: related,
            primary: primary,
            applier: applier,
            model: testModel,
            listeners: listeners,
            components: {
                search: {
                    options: searchOpts
                }
            }
        });
        // The dialog may now render synchronously - acquire its object reference using this listener
        function acquireDialogListener(dialog) {
            searchToRelateDialog = dialog;
        }
        testOpts.listeners.afterSetup = [acquireDialogListener].concat(fluid.makeArray(testOpts.listeners.afterSetup));
        cspace.searchToRelateDialog("#main .csc-search-related-dialog", testOpts);
        stop();
    };

    searchToRelateDialogTest.test("Creation for particular record type (cataloging, relating to acquisition)", function () {
        createSearchToRelate("acquisition", "cataloging", {
            afterSetup: function (dialog) {
                dialog.open();
                jqUnit.assertTrue("Searching for a particular record type, the drop-down should not be enabled", 
                    dialog.locate("recordType").is(":disabled"));
                dialog.search.locate("searchButton").click();
            }
        }, {
            searchUrlBuilder: function (searchModel) {
                return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
            },
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

    searchToRelateDialogTest.test("Creation for procedures (will try to relate a loanout to the primary loanin)", function () {
        var testRecordType = "loanout";
        createSearchToRelate("loanin", "procedures", {
            afterSetup: function (dialog) {
                dialog.open();
                var recordType = dialog.locate("recordType");
                jqUnit.assertTrue("Searching for all procedure types, the drop-down should be enabled", recordType.is(":enabled"));
                // Check that missing permissions for "intake" record type have removed it from rendering
                var options = $("option", recordType);
                var values = {};
                fluid.each(options, function(option) {
                    values[$(option).attr("value")] = true;
                });
                fluid.each({loanin: true, loanout: true, movement: true, intake: undefined}, function(value, key) {
                    jqUnit.assertEquals("Rendering of record type " + key, value, values[key]);
                });
                recordType.val(testRecordType);
                dialog.search.locate("searchButton").click();
            }
        }, {
            searchUrlBuilder: function (searchModel) {
                return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
            },
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
        loanin: ["read"],
        loanout: ["read"],
        intake: ["read"]  
    };

    var readPermsTest = cspace.tests.testEnvironment({
        testCase: bareSearchToRelateDialogTest,
        permissions: readAllPermissions
        });

    readPermsTest.test("Search results display", function () {
        expect(8);
        var testRecordType = "intake";
        createSearchToRelate("acquisition", "procedures", {
            afterSetup: function (dialog) {
                // 1) The dialog should render
                dialog.open();
                jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordType);
                dialog.locate("recordType").val(testRecordType);
                dialog.search.locate("searchButton").click();
            }
        }, {
            searchUrlBuilder: function (searchModel) {
                return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
            },
            listeners: {
                onSearch : function () {
                    jqUnit.notVisible("When search submitted, search results should be hidden",
                        jQuery(searchToRelateDialog.search.options.selectors.resultsContainer));
                    jqUnit.notVisible("When search submitted, results count should be hidden - http://issues.collectionspace.org/browse/CSPACE-2290",
                        jQuery(searchToRelateDialog.search.options.selectors.resultsCountContainer));
                    jqUnit.isVisible("When search submitted, 'looking' message should be visible - http://issues.collectionspace.org/browse/CSPACE-2289",
                        jQuery(searchToRelateDialog.search.options.selectors.lookingContainer));
                },
                afterSearch : function () {
                    // 2) Search results should be displayed
                    jqUnit.assertEquals("After clicking search, search results should be of the expected type", testRecordType, searchToRelateDialog.search.model.results[0].recordtype);
                    jqUnit.isVisible("After clicking search, search results are visible",
                        jQuery(searchToRelateDialog.search.options.selectors.resultsContainer));
                    jqUnit.isVisible("After clicking search, search results count container is visible - http://issues.collectionspace.org/browse/CSPACE-2290",
                        jQuery(searchToRelateDialog.search.options.selectors.resultsCountContainer));
                    jqUnit.notVisible("After clicking search, 'looking' message should be hidden - http://issues.collectionspace.org/browse/CSPACE-2289",
                        jQuery(searchToRelateDialog.search.options.selectors.lookingContainer));
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.test("Results display on search error", function () {
        var testRecordType = "intake";
        expect(1);
        createSearchToRelate("loanout", "procedures", {
            afterSetup: function (dialog) {
                dialog.open();
                dialog.locate("recordType").val(testRecordType);
                dialog.search.locate("searchButton").click();
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

    searchToRelateDialogTest.test("Create all-new record", function () {
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

    readPermsTest.test("Create relationship from search results", function () {
        var primaryRecordType = "intake";
        var testRecordType = "loanout";
        createSearchToRelate(primaryRecordType, "procedures", {
            afterSetup: function (dialog) {
                dialog.locate("recordType").val(testRecordType);
                dialog.search.locate("searchButton").click();
            },
            addRelations: function (data) {
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 1, data.items.length);
                jqUnit.assertEquals("On creation of new relation, source recordType should be correct", primaryRecordType, data.items[0].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, target recordType should be correct", testRecordType, data.items[0].target.recordtype);
                searchToRelateDialog.locate("closeButton").click();
                start();
            }
        }, {
            searchUrlBuilder: function (searchModel) {
                return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
            },
            listeners: {
                afterSearch : function () {
                    searchToRelateDialog.search.model.results[0].selected = true;
                    searchToRelateDialog.locate("addButton").click();
                }
            }
        });
    });

    readPermsTest.test("Create multiple relationships from search results", function () {
        var primaryRecordType = "loanin";
        var testRecordType = "intake";
        createSearchToRelate(primaryRecordType, "procedures", {
            afterSetup: function (dialog) {
                dialog.locate("recordType").val(testRecordType);
                dialog.search.locate("searchButton").click();
            },
            addRelations: function (data) {
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 2, data.items.length);
                jqUnit.assertEquals("On creation of new relation, first source recordType should be correct", primaryRecordType, data.items[0].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, first target recordType should be correct", testRecordType, data.items[0].target.recordtype);
                jqUnit.assertEquals("On creation of new relation, second source recordType should be correct", primaryRecordType, data.items[1].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, second target recordType should be correct", testRecordType, data.items[1].target.recordtype);
                searchToRelateDialog.locate("closeButton").click();
                start();
            }
        }, {
            searchUrlBuilder: function (searchModel) {
                return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
            },
            listeners: {
                afterSearch : function () {
                    searchToRelateDialog.search.model.results[0].selected = true;
                    searchToRelateDialog.search.model.results[1].selected = true;
                    searchToRelateDialog.locate("addButton").click();
                }
            }
        });
    });
};

(function () {
    searchToRelateDialogTester();
}());
