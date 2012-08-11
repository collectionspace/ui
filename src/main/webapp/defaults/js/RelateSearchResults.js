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
		components: {
			searchToRelateDialog: {
				type: "cspace.searchToRelateDialog",
				options: {
					
				}
			}
		},
		invokers: {
			showDialog: {
				funcName: "cspace.relateSearchResults.showDialog",
				args: ["{relateSearchResults}"]
			}
		},
		parentBundle: "{globalBundle}",
		finalInitFunction: "cspace.relateSearchResults.finalInit"
	});
	
	cspace.relateSearchResults.finalInit = function(that) {
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
					args: that.showDialog
				}, {
					addClass: "{styles}.relateButton"
				}]
			}
		};
	};
	
	cspace.relateSearchResults.showDialog = function(that) {
		that.searchToRelateDialog.open();
	};
})(jQuery, fluid);
