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
			searchToRelateDialog: {
				type: "cspace.searchToRelateDialog",
				createOnEvent: "afterInitDependents",
				container: "{searchResultsRelationManager}.dom.searchDialog",
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
})(jQuery, fluid);
