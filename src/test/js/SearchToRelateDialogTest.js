/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

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

	searchToRelateDialogTest.test("Create search to relate dialog",
		function () {
			expect(2);
			testOpts.listeners = {
				afterRender : function () {
					jqUnit.notVisible("After initializing the search to relate dialog, it is on the page but not visible", jQuery(".cs-add-related-records-dialog"));
					searchToRelateDialog.dlg.dialog("open");
					jqUnit.isVisible("After issuing a call to open, the dialog is visible",
							jQuery(".cs-add-related-records-dialog"));
					start();
				}
			};

			searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", applier, testOpts);
			stop();
		}
	);
	
	searchToRelateDialogTest.test("Click search in search to relate dialog",
		function () {
			expect(6);

			testOpts.search = {
				options : {
					searchUrlBuilder : testSearchUrlBuilder,
					listeners : {
						onSearch : function () {
							jqUnit.notVisible("When search submitted, search results should be hidden",
								jQuery(searchToRelateDialog.search.options.selectors.resultsContainer));
							jqUnit.notVisible("When search submitted, results count should be hidden - http://issues.collectionspace.org/browse/CSPACE-2290",
								jQuery(searchToRelateDialog.search.options.selectors.resultsCountContainer));
							jqUnit.isVisible("When search submitted, 'looking' message should be visible - http://issues.collectionspace.org/browse/CSPACE-2289",
								jQuery(searchToRelateDialog.search.options.selectors.lookingContainer));
						},
						afterSearch : function () {
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

			testOpts.listeners = {
				afterRender : function () {
					searchToRelateDialog.prepareDialog("procedures");
					searchToRelateDialog.dlg.dialog("open");
					jQuery(searchToRelateDialog.search.options.selectors.searchButton).click();
				}
			};

			searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", applier, testOpts);
			stop();
		}
	);

	searchToRelateDialogTest.test("Click search in search to relate dialog when search results will return error",
		function () {
			expect(2);

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

			testOpts.listeners = {
				afterRender : function () {
					searchToRelateDialog.prepareDialog("procedures");
					searchToRelateDialog.dlg.dialog("open");
					jQuery(searchToRelateDialog.search.options.selectors.searchButton).click();
					//onError function runs here
					jQuery(searchToRelateDialog.options.selectors.closeButton).click();
					searchToRelateDialog.prepareDialog("procedures");
					searchToRelateDialog.dlg.dialog("open");
					jqUnit.notVisible("After re-opening the dialog2, error message should not be visible",
						jQuery(searchToRelateDialog.search.options.selectors.errorMessage));
				}
			};

			searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", applier, testOpts);
			stop();
		}
	);

	searchToRelateDialogTest.test("Create new record event",
		function () {
			expect(1);
			testOpts.listeners = {
				onCreateNewRecord : function () {
					jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
					start();
				},
				afterRender : function () {
					searchToRelateDialog.dlg.dialog("open");
					searchToRelateDialog.locate("createNewButton", searchToRelateDialog.dlg).click();
				}
			};
	
			searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", applier, testOpts);
			stop();
		}
	);

};

(function () {
	searchToRelateDialogTester();
}());
