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
			jQuery(".ui-dialog-content").remove();
			searchToRelateDialog.dlg.dialog("destroy");
		});

	/**
	 * note that intake is the first value on the record types list should
	 * parameterize this function and set the record type rather than hard
	 * coding in intake.
	 */
	var testSearchUrlBuilder = function () {
		return "../../main/webapp/html/data/intake/search/list.json";
	};

    searchToRelateDialogTest.test("Creation for particular record type (objects, relating to acquisition)",
        function () {
            testOpts.relatedRecordType = "objects";
            testOpts.listeners = {
                afterRender: function () {
                    // 1) The dialog should render
                    jqUnit.notVisible("Searching for a particular record type, the drop-down should not be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                    $(searchToRelateDialog.search.options.selectors.searchButton).click();
                }
            };
            testOpts.search = {
                options: {
                    searchUrlBuilder: function (searchModel) {
                        return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
                    },
                    listeners: {
                        onSearch: function () {
                            jqUnit.assertEquals("Search should be set up to search for the correct record type", testOpts.relatedRecordType, searchToRelateDialog.search.model.searchModel.recordType);
                        },
                        afterSearch: function () {
                            $(searchToRelateDialog.options.selectors.closeButton).click();
                            start();
                        }
                    }
                }
            };
            searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", "acquisition", applier, testOpts);
            stop();
        }
    );

    searchToRelateDialogTest.test("Creation for generic 'procedures' (using no specification) (will try to relate a loanout to the primary loanin)",
        function () {
            var testRecordType = "loanout";
            testOpts.listeners = {
                afterRender: function () {
                    // 1) The dialog should render
                    jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                    $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                    $(searchToRelateDialog.search.options.selectors.searchButton).click();
                }
            };
            testOpts.search = {
                options: {
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
                }
            };
            searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", "loanin", applier, testOpts);
            stop();
        }
    );

    searchToRelateDialogTest.test("Creation for generic 'procedures' (using 'procedures' specification) (will try to relate an intake to the primary acquisition)",
        function () {
            testOpts.relatedRecordType = "procedures";
            var testRecordType = "intake";
            testOpts.listeners = {
                afterRender: function () {
                    // 1) The dialog should render
                    jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                    $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                    $(searchToRelateDialog.search.options.selectors.searchButton).click();
                }
            };
            testOpts.search = {
                options: {
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
                }
            };
            searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", "acquisition", applier, testOpts);
            stop();
        }
    );

    searchToRelateDialogTest.test("Search results display",
        function () {
            var primaryRecordType = "acquisition";
            testOpts.relatedRecordType = "procedures";
            var testRecordType = "intake";
            testOpts.listeners = {
                afterRender: function () {
                    // 1) The dialog should render
                    jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                    $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                    $(searchToRelateDialog.search.options.selectors.searchButton).click();
                }
            };
            testOpts.search = {
                options: {
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
                }
            };
            testOpts.listeners.addRelations = function (data) {
                // 3) The new relation should be submitted
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 1, data.items.length);
                jqUnit.assertEquals("On creation of new relation, source recordType should be correct", primaryRecordType, data.items[0].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, target recordType should be correct", testRecordType, data.items[0].target.recordtype);
                start();
            };
            searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", primaryRecordType, applier, testOpts);
            stop();
        }
    );

    searchToRelateDialogTest.test("Results display on search error",
        function () {
            testOpts.relatedRecordType = "procedures";
            var testRecordType = "intake";
            testOpts.listeners = {
                afterRender: function () {
                    // 1) The dialog should render
                    jqUnit.isVisible("Searching for all procedure types, the drop-down should be visible", searchToRelateDialog.options.selectors.recordTypeSelector);
                    $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                    $(searchToRelateDialog.search.options.selectors.searchButton).click();
                }
            };
            // no search url builder - rely on default - which will return an error
            testOpts.search = {
                options : {
                    listeners : {
                        onError : function () {
                            jqUnit.assertTrue("On error should be triggered", true);
                            start();
                        }
                    }
                }
            };
            searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", "loanout", applier, testOpts);
            stop();
        }
    );

    searchToRelateDialogTest.test("Create all-new record",
        function () {
            testOpts.relatedRecordType = "intake";
            testOpts.listeners = {
                afterRender: function () {
                    $(searchToRelateDialog.options.selectors.createNewButton).click();
                },
                onCreateNewRecord : function () {
                    jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                    start();
                }
            };
            searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", "objects", applier, testOpts);
            stop();
        }
    );

    searchToRelateDialogTest.test("Create relationship from search results",
        function () {
            var primaryRecordType = "intake";
            testOpts.relatedRecordType = "procedures";
            var testRecordType = "loanout";
            testOpts.listeners = {
                afterRender: function () {
                    $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                    $(searchToRelateDialog.search.options.selectors.searchButton).click();
                }
            };
            testOpts.search = {
                options: {
                    searchUrlBuilder: function (searchModel) {
                        return "../../main/webapp/html/data/" + searchModel.recordType + "/search/list.json";
                    },
                    listeners: {
                        afterSearch : function () {
                            searchToRelateDialog.search.model.results[0].selected = true;
                            $(searchToRelateDialog.options.selectors.addButton).click();
                        }
                    }
                }
            };
            testOpts.listeners.addRelations = function (data) {
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 1, data.items.length);
                jqUnit.assertEquals("On creation of new relation, source recordType should be correct", primaryRecordType, data.items[0].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, target recordType should be correct", testRecordType, data.items[0].target.recordtype);
                start();
            };
            searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", primaryRecordType, applier, testOpts);
            stop();
        }
    );

    searchToRelateDialogTest.test("Create multiple relationships from search results",
        function () {
            var primaryRecordType = "loanin";
            testOpts.relatedRecordType = "procedures";
            var testRecordType = "intake";
            testOpts.listeners = {
                afterRender: function () {
                    $(searchToRelateDialog.options.selectors.recordTypeSelector).val(testRecordType);
                    $(searchToRelateDialog.search.options.selectors.searchButton).click();
                }
            };
            testOpts.search = {
                options: {
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
                }
            };
            testOpts.listeners.addRelations = function (data) {
                jqUnit.assertEquals("On creation of one new relation, number of relations submitted should be correct", 2, data.items.length);
                jqUnit.assertEquals("On creation of new relation, first source recordType should be correct", primaryRecordType, data.items[0].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, first target recordType should be correct", testRecordType, data.items[0].target.recordtype);
                jqUnit.assertEquals("On creation of new relation, second source recordType should be correct", primaryRecordType, data.items[1].source.recordtype);
                jqUnit.assertEquals("On creation of new relation, second target recordType should be correct", testRecordType, data.items[1].target.recordtype);
                start();
            };
            searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", primaryRecordType, applier, testOpts);
            stop();
        }
    );
};

(function () {
	searchToRelateDialogTester();
}());
