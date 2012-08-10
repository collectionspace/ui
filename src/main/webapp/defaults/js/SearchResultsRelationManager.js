/**
 *  This document is a part of the source code and related artifacts
 *  for CollectionSpace, an open source collections management system
 *  for museums and related institutions:

 *  http://www.collectionspace.org
 *  http://wiki.collectionspace.org

 *  Copyright 2009 University of California at Berkeley

 *  Licensed under the Educational Community License (ECL), Version 2.0.
 *  You may not use this file except in compliance with this License.

 *  You may obtain a copy of the ECL 2.0 License at

 *  https://source.collectionspace.org/collection-space/LICENSE.txt

 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 *  $LastChangedRevision$
 */

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {
	fluid.defaults("cspace.searchResultsRelationManager", {
		gradeNames: "fluid.rendererComponent",
		selectors: {
			searchDialog: ".csc-search-related-dialog",
		},
		selectorsToIgnore: "searchDialog",
		components: {
			dataContext: {
				type: "cspace.dataContext",
				options: {
					recordType: "relationships",
					listeners: {
						onSave: "{loadingIndicator}.events.showOn.fire",
						onError: "{loadingIndicator}.events.hideOn.fire",
						afterSave: "{loadingIndicator}.events.hideOn.fire"
					}
				}
			},
			searchToRelateDialog: {
				type: "cspace.searchToRelateDialog",
				createOnEvent: "afterInitDependents",
				container: "{searchResultsRelationManager}.dom.searchDialog",
				options: {
					related: "nonVocabularies",
					model: "{pageBuilder}.model",
					applier: "{pageBuilder}.applier",
					relationsElPath: "relations",
					listeners: {
						addRelations: "{searchResultsRelationManager}.addRelations"
					},
					strings: {
						title: "searchResultsRelationManager-dialogTitle",
						addButton: "searchResultsRelationManager-addButton"
					}
				}
			}
		},
		events: {
			afterInitDependents: null,
			onRelateButtonClick: null
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
			showMessage: {
				funcName: "cspace.searchResultsRelationManager.showMessage",
				args: ["{messageBar}", "{arguments}.0"]
			},
			showError: {
				funcName: "cspace.searchResultsRelationManager.showError",
				args: ["{messageBar}", "{arguments}.0"]
			},
			clearMessage: {
				funcName: "cspace.searchResultsRelationManager.clearMessage",
				args: "{messageBar}"
			}
		},
		parentBundle: "{globalBundle}",
		finalInitFunction: "cspace.searchResultsRelationManager.finalInit"
	});
	
	var bindEventHandlers = function(that) {
		that.events.onRelateButtonClick.addListener(function() {
			that.add();
		});
		
		that.dataContext.events.afterAddRelations.addListener(function(relations) {
			afterAddRelations(that, relations);
		});
		
		that.dataContext.events.onError.addListener(function(operation, message, data) {
			onError(that, operation, message, data);
		});
    };
	
	cspace.searchResultsRelationManager = function(container, options) {
		var that = fluid.initRendererComponent("cspace.searchResultsRelationManager", container, options);
		that.renderer.refreshView();
		
		that.dialogNode = that.locate("searchDialog"); // since blasted jQuery UI dialog will move it out of our container
		fluid.initDependents(that);
		that.events.afterInitDependents.fire();
		
		bindEventHandlers(that);
		return that;
	};
	
	cspace.searchResultsRelationManager.finalInit = function(that) {
		that.refreshView();
	};
	
	cspace.searchResultsRelationManager.add = function(that) {
		that.searchToRelateDialog.open();
	};

	cspace.searchResultsRelationManager.addRelations = function(that, dialogRelations, searchModel) {
		/*
		 * The searchToRelateDialog returns a list of relations in which the targets are the records
		 * that were checked in the dialog. For each record checked in the dialog, we want to create
		 * a relation with each record in the current page of search results, in which the source is 
		 * the record selected in the dialog, and the target is the search result. We also need to
		 * filter out existing relations.
		 */
		var results = searchModel.results;

		if (dialogRelations.items.length > 0 && results.length > 0) {
			var relationResolvers = {};

			fluid.each(dialogRelations.items, function(dialogRelation) {
				/*
				 * Create a relationResolver for each record selected in the dialog, so we
				 * can filter out records that are already related. Load the data via
				 * dataContext components, and proceed when all of the dataContexts have
				 * completed loading the necessary data.
				 */
				
				var target = dialogRelation.target;
				
				relationResolvers[target.csid] = null;

				var dataContext = cspace.dataContext({
					model: {},
					recordType: target.recordtype,
					listeners: {
						afterFetch: function(data) {
							relationResolvers[target.csid] = cspace.util.relationResolver({
								model: data
							});
							
							var allRelationsLoaded = true;

							for (var csid in relationResolvers) {
								if (relationResolvers[csid] == null) {
									allRelationsLoaded = false;
									break;
								}
							}
							
							if (allRelationsLoaded) {
								filterAndAddRelations(that, dialogRelations, searchModel, relationResolvers);
							}
						},
						onError: function() {
							
						}
					}
				});
				
				dataContext.fetch(target.csid);
			});
		}
	};
	
	var filterAndAddRelations = function(that, dialogRelations, searchModel, relationResolvers) {
		var results = searchModel.results;
		var transformedItems = [];
		var selectedRecords = [];
		var alreadyRelatedRecords = {};
		var start = searchModel.offset;
		var end = Math.min(start + parseInt(searchModel.pagination.pageSize), parseInt(searchModel.pagination.totalItems));
		
		fluid.each(dialogRelations.items, function(dialogRelation) {
			var source = dialogRelation.target;
			var relationResolver = relationResolvers[source.csid];

			selectedRecords.push(source);
			alreadyRelatedRecords[source.csid] = [];
			
			fluid.each(results, function(target) {
				if (relationResolver.isRelated(target.recordtype, target.csid)) {
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
		
		that.selectedRecords = selectedRecords;
		that.alreadyRelatedRecords = alreadyRelatedRecords;
		
		that.dataContext.addRelations({
			items: transformedItems
		});
	};
	
	var afterAddRelations = function(that, relations) {
		var alreadyRelatedRecords = that.alreadyRelatedRecords;
		var counts = {};
				
		fluid.each(relations.items, function(item) {
			var source= item.source;
			var csid = source.csid;

			counts[csid] = ((csid in counts) ? counts[csid] : 0) + 1;
		});

		var sources = that.selectedRecords.sort(function(a, b) {
			return a.number.localeCompare(b.number);
		});
		
		var messages = [];
		
		// FIXME: Move message text to the message bundle.

		fluid.each(sources, function(source) {
			var csid = source.csid;
			var count = (csid in counts) ? counts[csid] : 0;
			var alreadyRelatedCount = alreadyRelatedRecords[csid].length;
			
			var message = "Added " + count + " " + (count == 1 ? "record" : "records") + " to " + source.number;
			
			if (alreadyRelatedCount > 0) {
				message = message + " (" + alreadyRelatedCount + " " + (alreadyRelatedCount == 1 ? "was" : "were") + " already related)";
			}
			
			messages.push(message + ".");
		});
		
		that.showMessage(messages.join(" "));
	};
	
	var onError = function(that, operation, message, data) {
		that.showError("Error: " + message + ((typeof(data) != "undefined") ? (": " + data) : ""));
	};
	
	cspace.searchResultsRelationManager.showMessage = function (messageBar, message) {
		messageBar.show(message, null, false);
	};
	
	cspace.searchResultsRelationManager.showError = function (messageBar, message) {
		messageBar.show(message, null, true);
	};

	cspace.searchResultsRelationManager.clearMessage = function (messageBar) {
		messageBar.hide();
	};
})(jQuery, fluid);
