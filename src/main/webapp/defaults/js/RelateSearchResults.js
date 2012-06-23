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
	fluid.defaults("cspace.relateSearchResults", {
		gradeNames: ["fluid.rendererComponent", "autoInit"],
		produceTree: "cspace.relateSearchResults.produceTree",
		selectors: {
			relateButton: ".csc-relateSearchResults-relateButton"
		},
		styles: {
			relateButton: "cs-relateSearchResults-relateButton"
		},
		events: {
			onRelateButtonClick: null,
			recordTypeChanged: null
		},
		invokers: {
			recordTypeChanged: {
				funcName: "cspace.relateSearchResults.recordTypeChanged",
				args: ["{relateSearchResults}", "{arguments}.0", "{advancedSearch}.vocabSelector.model"]
			}
		},
		parentBundle: "{globalBundle}",
		preInitFunction: "cspace.relateSearchResults.preInit",		
		finalInitFunction: "cspace.relateSearchResults.finalInit"
	});
	
	cspace.relateSearchResults.preInit = function (that) {
		that.handleRecordTypeChanged = function(recordType) {
			that.recordTypeChanged(recordType);
		}
	}
	
	cspace.relateSearchResults.finalInit = function(that) {
		that.events.recordTypeChanged.addListener(that.handleRecordTypeChanged);
		
		that.refreshView();
	}

	cspace.relateSearchResults.produceTree = function(that) {
		return {
			relateButton: {
				decorators: [{
					type: "attrs",
					attributes: {
						value: that.options.parentBundle.messageBase["relateSearchResults-relateButton"]
					}
				}, {
					type: "jQuery",
					func: "click",
					args: that.events.onRelateButtonClick.fire
				}, {
					addClass: "{styles}.relateButton"
				}]
			}
		};
	};
	
	cspace.relateSearchResults.recordTypeChanged = function(that, recordType, vocabSelectorModel) {
		var foo = "";
	}
})(jQuery, fluid);
