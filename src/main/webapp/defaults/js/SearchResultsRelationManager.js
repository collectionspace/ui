/*
Copyright 2010 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {
	fluid.defaults("cspace.searchResultsRelationManager", {
		gradeNames: "fluid.rendererComponent",
		produceTree: "cspace.searchResultsRelationManager.produceTree",
		selectors: {
			searchDialog: ".csc-search-related-dialog",
		},
		selectorsToIgnore: "searchDialog",
		components: {
			dataContext: {
				type: "cspace.dataContext",
				options: {
					recordType: "relationships"
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
				args: ["{searchResultsRelationManager}", "{arguments}.0", "{search}.model"] // FIXME: This should be in demands, since we don't know if we're in the context of search.
			}
		},
		parentBundle: "{globalBundle}",
		finalInitFunction: "cspace.searchResultsRelationManager.finalInit"
	});
	
	var bindEventHandlers = function(that) {
		that.events.onRelateButtonClick.addListener(function() {
			that.add();
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
	}

	cspace.searchResultsRelationManager.produceTree = function(that) {
		return {
		};
	};
	
	cspace.searchResultsRelationManager.add = function(that) {
		that.searchToRelateDialog.open();
	};

	cspace.searchResultsRelationManager.addRelations = function(that, dialogRelations, searchModel) {
		/*
		 * The searchToRelateDialog returns relations with the source/target swapped from what we want.
		 * We also need to create a relation for each record in the result set.
		 */
		var transformedItems = [];
		var results = searchModel.results;
		
		for (var i=0; i<dialogRelations.items.length; i++) {
			var dialogRelation = dialogRelations.items[i];
			
			for (var j in results) {
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
	};
})(jQuery, fluid);
