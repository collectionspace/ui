/**
 *	This document is a part of the source code and related artifacts
 *	for CollectionSpace, an open source collections management system
 *	for museums and related institutions:

 *	http://www.collectionspace.org
 *	http://wiki.collectionspace.org

 *	Copyright 2009 University of California at Berkeley

 *	Licensed under the Educational Community License (ECL), Version 2.0.
 *	You may not use this file except in compliance with this License.

 *	You may obtain a copy of the ECL 2.0 License at

 *	https://source.collectionspace.org/collection-space/LICENSE.txt

 *	Unless required by applicable law or agreed to in writing, software
 *	distributed under the License is distributed on an "AS IS" BASIS,
 *	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *	See the License for the specific language governing permissions and
 *	limitations under the License.
 *	
 *	$LastChangedRevision$
 */

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {

	"use strict";

	fluid.log("SearchResultsRelationManager.js loaded");

	// Component that handles the actual relation creation.
	fluid.defaults("cspace.searchResultsRelationManager", {
		gradeNames: ["fluid.rendererComponent", "autoInit"],
		selectors: {
			searchDialog: ".csc-search-related-dialog",
			addButton: ".csc-add-search-results-button"
		},
		styles: {
			addButton: "cs-add-search-results-button"
		},
		produceTree: "cspace.searchResultsRelationManager.produceTree",
		strings: {},
		messageKeys: {
			addRelationsMessage: "searchResultsRelationManager-addRelationsMessage",
			alreadyRelatedMessage: "searchResultsRelationManager-alreadyRelatedMessage",
			addRelationsFailedMessage: "searchResultsRelationManager-addRelationsFailedMessage"
		},
		parentBundle: "{globalBundle}",
		selectorsToIgnore: "searchDialog",
		components: {
			messageBar: "{messageBar}",
			searchToRelateDialog: {
				container: "{searchResultsRelationManager}.dom.searchDialog",
				type: "cspace.searchToRelateDialog",
				createOnEvent: "onSearchToRelateDialog",
				options: {
					related: "nonVocabularies",
					strings: {
						title: "searchResultsRelationManager-dialogTitle",
						addButton: "searchResultsRelationManager-addButton"
					}
				}
			},
			// The data source used to create relations.
			relationDataSource: {
				type: "cspace.searchResultsRelationManager.relationDataSource"
			},
			// The data source used to list existing relations for a record.
			listDataSource: {
				type: "cspace.searchResultsRelationManager.listDataSource"
			}
		},
		invokers: {
			add: {
				funcName: "cspace.searchResultsRelationManager.add",
				args: "{searchResultsRelationManager}"
			},
			addRelations: {
				funcName: "cspace.searchResultsRelationManager.addRelations",
				args: ["{searchResultsRelationManager}", "{arguments}.0", "{search}.model"]  
			},
			showAddButton: {
				funcName: "cspace.searchResultsRelationManager.showAddButton",
				args: ["{searchResultsRelationManager}", "{arguments}.0"]
			},
			updateRecordType: {
				funcName: "cspace.searchResultsRelationManager.updateRecordType",
				args: ["{searchResultsRelationManager}", "{arguments}.0", "{search}.mainSearch.recordTypeSelector.model"]
			}
		},
		events: {
			onRelateButtonClick: null,
			onSearchToRelateDialog: null,
			onAddRelation: null,
			beforeFetchExistingRelations: null,
			afterAddRelations: null,
			onError: null,
			recordTypeChanged: "{search}.mainSearch.events.recordTypeChanged"
		},
		listeners: {
			onRelateButtonClick: "{cspace.searchResultsRelationManager}.onRelateButtonClick",
			onAddRelation: "{cspace.searchResultsRelationManager}.onAddRelation",
			afterAddRelations: "{cspace.searchResultsRelationManager}.afterAddRelations",
			onError: "{cspace.searchResultsRelationManager}.onError",
			recordTypeChanged: "{cspace.searchResultsRelationManager}.handleRecordTypeChanged"
		},
		relationURL: cspace.componentUrlBuilder("%tenant/%tname/relationships"),
		listURL: cspace.componentUrlBuilder("%tenant/%tname/%primary/%related/%csid"),
		preInitFunction: "cspace.searchResultsRelationManager.preInit",
		finalInitFunction: "cspace.searchResultsRelationManager.finalInit"
	});

	// TODO: Make a local datasource file, and restore the test configuration
	// fluid.demands("cspace.searchResultsRelationManager.relationDataSource",	["cspace.localData", "cspace.searchResultsRelationManager"], {
	// 	funcName: "cspace.searchResultsRelationManager.TestRelationDataSource",
	// 	args: {
	// 		writeable: true,
	// 		targetTypeName: "cspace.searchResultsRelationManager.TestRelationDataSource"
	// 	}
	// });
	
	fluid.demands("cspace.searchResultsRelationManager.relationDataSource", "cspace.searchResultsRelationManager", {
		funcName: "cspace.URLDataSource",
		args: {
			writeable: true,
			url: "{cspace.searchResultsRelationManager}.options.relationURL",
			targetTypeName: "cspace.searchResultsRelationManager.relationDataSource"
		}
	});

	// TODO: Make a local datasource file, and restore the test configuration
	// fluid.defaults("cspace.searchResultsRelationManager.TestRelationDataSource", {
	// 	url: "%test/data/relationships.json"
	// });
	// cspace.searchResultsRelationManager.TestRelationDataSource = cspace.URLDataSource;

	fluid.demands("cspace.searchResultsRelationManager.listDataSource", "cspace.searchResultsRelationManager", {
		funcName: "cspace.URLDataSource",
		args: {
			url: "{cspace.searchResultsRelationManager}.options.listURL",
			termMap: {
				primary: "%primary",
				related: "%related",
				csid: "%csid"
			},
			targetTypeName: "cspace.searchResultsRelationManager.listDataSource"
		}
	});
	
	cspace.searchResultsRelationManager.preInit = function (that) {
		var options = that.options,
			messageKeys = options.messageKeys,
			resolve = options.parentBundle.resolve;

		that.onRelateButtonClick = function () {
			that.add();
		}
		that.onAddRelation = function (relations) {
			that.addRelations(relations);
		};
		that.afterAddRelations = function (relations, selectedRecords, alreadyRelatedRecords) {
			var counts = {};
			
			fluid.each(relations.items, function(item) {
				var source= item.source;
				var csid = source.csid;
			
				counts[csid] = ((csid in counts) ? counts[csid] : 0) + 1;
			});
			
			var sources = selectedRecords.sort(function(a, b) {
				return a.number.localeCompare(b.number);
			});
			
			var messages = [];
			
			fluid.each(sources, function(source) {
				var csid = source.csid;
				var count = (csid in counts) ? counts[csid] : 0;
				var alreadyRelatedCount = alreadyRelatedRecords[csid].length;
			
				var message = resolve(messageKeys.addRelationsMessage, [count, source.number]);
			
				if (alreadyRelatedCount > 0) {
					message = message + ' ' + resolve(messageKeys.alreadyRelatedMessage, [alreadyRelatedCount]);
				}
				
				messages.push(message);
			});

			that.messageBar.show(messages.join(". "), null, false);
		};
		that.onError = function(data) {
			data.messages = data.messages || fluid.makeArray("");
			fluid.each(data.messages, function (message) {
				message = message.message || message;
				that.messageBar.show(resolve(messageKeys.addRelationsFailedMessage, [message]), null, true);
			});
		};
		that.handleRecordTypeChanged = function(recordType) {
			that.updateRecordType(recordType);
		}
	};

	/*
	 * Adds relations between records in the current page of the search results in searchModel,
	 * and the records that were selected in the dialog.
	 */
	cspace.searchResultsRelationManager.addRelations = function(that, dialogRelations, searchModel) {
		/*
		 * The searchToRelateDialog returns a list of relations in which the targets are the records
		 * that were checked in the dialog. For each record checked in the dialog, we want to create
		 * a relation with each record in the current page of search results, in which the source is 
		 * the record selected in the dialog, and the target is the search result. We also need to
		 * filter out existing relations.
		 */
		
		var results = searchModel.results;
		var pageStart = searchModel.offset;
		var pageEnd = Math.min(pageStart + parseInt(searchModel.pagination.pageSize), parseInt(searchModel.pagination.totalItems));
		var resultsPage = results.slice(pageStart, pageEnd);
		var searchType = searchModel.searchModel.recordType;
		
		if (dialogRelations.items.length > 0 && resultsPage.length > 0) {
			that.events.beforeFetchExistingRelations.fire();

			var relatedRecords = {};
			
			fluid.each(dialogRelations.items, function(dialogRelation) {
				relatedRecords[dialogRelation.target.csid] = null;
			});
			
			fluid.each(dialogRelations.items, function(dialogRelation) {
				/*
				 * Find the related records for each record selected in the dialog, so we
				 * can filter out ones that are already related.
				 */
				
				var target = dialogRelation.target;

				var model = {
					primary: target.recordtype,
					related: (searchType == "cataloging") ? "cataloging" : "procedures",
					csid: target.csid
				};
				
				that.listDataSource.get(model, function(data) {
					if (!data || data.isError) {
						if (!data.messages) {
							data.messages = ["error retrieving existing relations for " + target.number];
						}
						
						that.events.onError.fire(data);
					}
					else {
						var relatedCsids = [];
						
						fluid.each(data.items, function(item) {
							relatedCsids.push(item.csid);
						});
						
						relatedRecords[target.csid] = relatedCsids;

						var complete = true;
						
						for (var csid in relatedRecords) {
							if (relatedRecords[csid] == null) {
								complete = false;
							}
						}
						
						if (complete) {
							filterAndAddRelations(that, dialogRelations, resultsPage, relatedRecords);
						}
					}
				});
			});
		}
	};

	/*
	 * Adds relations between records in the current page of the search results in searchModel,
	 * and the records that were selected in the dialog, using a map of already related records
	 * to prevent duplicating existing relations.
	 */
	var filterAndAddRelations = function(that, dialogRelations, resultsPage, relatedRecords) {
		var transformedItems = [];
		var selectedRecords = [];
		var alreadyRelatedRecords = {};
		
		fluid.each(dialogRelations.items, function(dialogRelation) {
			var source = dialogRelation.target;
			var relatedRecordsList = relatedRecords[source.csid];

			selectedRecords.push(source);
			alreadyRelatedRecords[source.csid] = [];
			
			fluid.each(resultsPage, function(target) {
				if (relatedRecordsList && $.inArray(target.csid, relatedRecordsList) > -1) {
					alreadyRelatedRecords[source.csid].push(target);
				}
				else {
					transformedItems.push({
						source: source,
						target: target,
						"one-way": dialogRelation["one-way"],
						type: dialogRelation.type
					});
				}
			});
		});
		
		that.relationDataSource.set({items: transformedItems}, null, function (data) {
			if (!data || data.isError) {
				if (!data.messages) {
					data.messages = ["error creating relations"];
				}
				
				that.events.onError.fire(data);
			}
			else {
				that.events.afterAddRelations.fire(data, selectedRecords, alreadyRelatedRecords);
			}
		});
	};
	
	cspace.searchResultsRelationManager.finalInit = function (that) {
		that.refreshView();
		that.dialogNode = that.locate("searchDialog"); // since blasted jQuery UI dialog will move it out of our container
		that.events.onSearchToRelateDialog.fire();
	};

	cspace.searchResultsRelationManager.add = function (that) {
		that.searchToRelateDialog.open();
	};
	
	// Render config used to render the add to record button.
	cspace.searchResultsRelationManager.produceTree = function (that) {
		return {
			 addButton: {
				 messagekey: "searchResultsRelationManager-addToRecordButton",
				 decorators: [{
					 addClass: "{styles}.addButton"
				 }, {
					 type: "jQuery",
					 func: "click",
					 args: that.add
				 }]
			 }
		};
	};

	/*
	 * Updates the UI when there has been a change in the record type being searched. The
	 * new record type is specified, along with an object that contains a list of
	 * record types that are vocabularies.
	 */
	cspace.searchResultsRelationManager.updateRecordType = function(that, recordType, recordTypes) {
		var isVocab = $.inArray(recordType, recordTypes.vocabularies) >= 0;
		
		if (isVocab) {
			that.showAddButton(false);
		}
		else {
			that.showAddButton(true);
		}
	};
	
	/*
	 * Shows or hides the add to record button.
	 */
	cspace.searchResultsRelationManager.showAddButton = function(that, show) {
		that.locate("addButton").toggleClass("hidden", !show);
	}
})(jQuery, fluid);