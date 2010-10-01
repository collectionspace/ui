/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/
"use strict";

var searchToRelateDialogTester = function () {
    var baseModel = {
        csid : "123.456.789",
        relations : []
    };

    var baseTestOpts = {
        templates : {
            dialog : "../../main/webapp/html/searchToRelate.html"
        }
    };

    var testModel;
    var testOpts;
    var applier;
    var searchToRelateDialog;

    var searchToRelateDialogTest = new jqUnit.TestCase("SearchToRelateDialog Tests", 
        function () { // setUp
            testModel = {};
            fluid.model.copyModel(testModel, baseModel);
            applier = fluid.makeChangeApplier(testModel);
            testOpts = {};
            fluid.model.copyModel(testOpts, baseTestOpts);
        }, function () { // tearDown
            $(".ui-dialog").detach();
        });

    /**
     * note that intake is the first value on the record types list should
     * parameterize this function and set the record type rather than hard
     * coding in intake.
     */
    var testSearchUrlBuilder = function () {
        return "../../main/webapp/html/data/intake/search/list.json";
    };
    
    var createSearchToRelate = function (primary, related, listeners, searchOpts) {
        fluid.merge(null, testOpts, {
            related: related,
            primary: primary,
            applier: applier,
            model: testModel,
            listeners: listeners,
            search: {
                options: searchOpts
            }
        });
        searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", testOpts);
        stop();
    };

    searchToRelateDialogTest.test("Creation for particular record type (objects, relating to acquisition)", function () {
        createSearchToRelate("acquisition", "objects", {
            afterRender: function () {
                // 1) The dialog should render
                searchToRelateDialog.dlg.dialog("open");
                jqUnit.notVisible("Searching for a particular record type, the drop-down should not be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                $(searchToRelateDialog.search.options.selectors.searchButton).click();
            }
        }, {
            searchUrlBuilder: function (searchModel) {
                return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
            },
            listeners: {
                onSearch: function () {
                    jqUnit.assertEquals("Search should be set up to search for the correct record type", testOpts.related, searchToRelateDialog.search.model.searchModel.recordType);
                },
                afterSearch: function () {
                    $(searchToRelateDialog.options.selectors.closeButton).click();
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.test("Creation for generic 'procedures' (using no specification) (will try to relate a loanout to the primary loanin)", function () {
        var testRecordType = "loanout";
        createSearchToRelate("loanin", "procedures", {
            afterRender: function () {
                // 1) The dialog should render
                searchToRelateDialog.dlg.dialog("open");
                jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                $(searchToRelateDialog.search.options.selectors.searchButton).click();
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
                    $(searchToRelateDialog.options.selectors.closeButton).click();
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.test("Creation for generic 'procedures' (using 'procedures' specification) (will try to relate an intake to the primary acquisition)", function () {
        var testRecordType = "intake";
        createSearchToRelate("acquisition", "procedures", {
            afterRender: function () {
                // 1) The dialog should render
                searchToRelateDialog.dlg.dialog("open");
                jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                $(searchToRelateDialog.search.options.selectors.searchButton).click();
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
                    $(searchToRelateDialog.options.selectors.closeButton).click();
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.test("Search results display", function () {
        var testRecordType = "intake";
        createSearchToRelate("acquisition", "procedures", {
            afterRender: function () {
                // 1) The dialog should render
                searchToRelateDialog.dlg.dialog("open");
                jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                $(searchToRelateDialog.search.options.selectors.searchButton).click();
            },
            addRelations: function (data) {
                // 3) The new relation should be submitted
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 1, data.items.length);
                jqUnit.assertEquals("On creation of new relation, source recordType should be correct", primaryRecordType, data.items[0].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, target recordType should be correct", testRecordType, data.items[0].target.recordtype);
                start();
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
        createSearchToRelate("loanout", "procedures", {
            afterRender: function () {
                // 1) The dialog should render
                searchToRelateDialog.dlg.dialog("open");
                jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                $(searchToRelateDialog.search.options.selectors.searchButton).click();
            }
        }, {
            // no search url builder - rely on default - which will return an error
            listeners : {
                onError : function () {
                    jqUnit.assertTrue("On error should be triggered", true);
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.test("Create all-new record", function () {
        createSearchToRelate("objects", "intake", {
            afterRender: function () {
                $(searchToRelateDialog.options.selectors.createNewButton).click();
            },
            onCreateNewRecord : function () {
                jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                start();
            }
        }, {
            // no search url builder - rely on default - which will return an error
            listeners : {
                onError : function () {
                    jqUnit.assertTrue("On error should be triggered", true);
                    start();
                }
            }
        });
    });

    searchToRelateDialogTest.test("Create relationship from search results", function () {
        var primaryRecordType = "intake";
        var testRecordType = "loanout";
        createSearchToRelate(primaryRecordType, "procedures", {
            afterRender: function () {
                $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                $(searchToRelateDialog.search.options.selectors.searchButton).click();
            },
            addRelations: function (data) {
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 1, data.items.length);
                jqUnit.assertEquals("On creation of new relation, source recordType should be correct", primaryRecordType, data.items[0].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, target recordType should be correct", testRecordType, data.items[0].target.recordtype);
                start();
            }
        }, {
            searchUrlBuilder: function (searchModel) {
                return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
            },
            listeners: {
                afterSearch : function () {
                    searchToRelateDialog.search.model.results[0].selected = true;
                    $(searchToRelateDialog.options.selectors.addButton).click();
                }
            }
        });
    });

    searchToRelateDialogTest.test("Create multiple relationships from search results", function () {
        var primaryRecordType = "loanin";
        var testRecordType = "intake";
        createSearchToRelate(primaryRecordType, "procedures", {
            afterRender: function () {
                $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                $(searchToRelateDialog.search.options.selectors.searchButton).click();
            },
            addRelations: function (data) {
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 2, data.items.length);
                jqUnit.assertEquals("On creation of new relation, first source recordType should be correct", primaryRecordType, data.items[0].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, first target recordType should be correct", testRecordType, data.items[0].target.recordtype);
                jqUnit.assertEquals("On creation of new relation, second source recordType should be correct", primaryRecordType, data.items[1].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, second target recordType should be correct", testRecordType, data.items[1].target.recordtype);
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
                    $(searchToRelateDialog.options.selectors.addButton).click();
                }
            }
        });
    });
};

(function () {
    searchToRelateDialogTester();
}());
