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
		 * the record selected in the dialog, and the target is the search result.
		 */
		var results = searchModel.results;

		if (dialogRelations.items.length > 0 && results.length > 0) {
			var transformedItems = [];
			var start = searchModel.offset;
			var end = Math.min(start + parseInt(searchModel.pagination.pageSize), parseInt(searchModel.pagination.totalItems));
		
			for (var i=0; i<dialogRelations.items.length; i++) {
				var dialogRelation = dialogRelations.items[i];
			
				for (var j=start; j<end; j++) {
					transformedItems.push({
						source: dialogRelation.target,
						target: results[j],
						"one-way": dialogRelation["one-way"],
						type: dialogRelation.type
					});
				}
			}

			that.dataContext.addRelations({
				items: transformedItems
			});
		}
	};
	
	var afterAddRelations = function(that, relations) {
		var items = relations.items;
		var sources = {};
		var counts = {};
		
		for (var i=0; i<items.length; i++) {
			var item = items[i];
			var source= item.source;
			var sourceCsid = source.csid;
			
			if (!sources[sourceCsid]) {
				sources[sourceCsid] = source;
			}
						
			var count = (sourceCsid in counts) ? counts[sourceCsid] : 0;
			counts[sourceCsid] = count + 1;
		}
		
		var sourceNumbers = [];
		var count = 0;
		
		for (var csid in sources) {
			sourceNumbers.push(sources[csid].number);
			count = counts[csid];
		}
		
		sourceNumbers = sourceNumbers.sort();
		
		that.showMessage("Added " + count + " " + (count == 1 ? "record" : "records") + " to " + sourceNumbers.join(", ")); // FIXME: Move to message bundle
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
