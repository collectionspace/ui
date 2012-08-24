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
			recordTypeChanged: "{search}.mainSearch.events.recordTypeChanged"
		},
		invokers: {
			recordTypeChanged: {
				funcName: "cspace.relateSearchResults.recordTypeChanged",
				args: ["{relateSearchResults}", "{arguments}.0", "{search}.mainSearch.recordTypeSelector.model"]
			},
			showRelateButton: {
				funcName: "cspace.relateSearchResults.showRelateButton",
				args: ["{relateSearchResults}", "{arguments}.0"]
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
	};
	
	cspace.relateSearchResults.finalInit = function(that) {
		that.events.recordTypeChanged.addListener(that.handleRecordTypeChanged);
		
		that.refreshView();
	};

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
	
	cspace.relateSearchResults.recordTypeChanged = function(that, recordType, recordTypes) {
		var isVocab = $.inArray(recordType, recordTypes.vocabularies) >= 0;
		
		if (isVocab) {
			that.showRelateButton(false);
		}
		else {
			that.showRelateButton(true);
		}
	};
	
	cspace.relateSearchResults.showRelateButton = function(that, show) {
		that.locate("relateButton").toggleClass("hidden", !show);
	}
})(jQuery, fluid);
