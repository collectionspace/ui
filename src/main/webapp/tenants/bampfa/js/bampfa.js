/*
Copyright 2014 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

var bampfa = {};

(function ($, fluid) {

	bampfa.computeAccessionNumber = function() {
		var parts = [];
		
		for(var i=0; i<arguments.length; i++) {
			var arg = arguments[i];
			var part = normalizeAccessionNumberPart(arg);
			
			if (part != "") {
				parts.push(normalizeAccessionNumberPart(part));
			}
		}
		
		return parts.join(".");
	};
	
	var normalizeAccessionNumberPart = function(part) {
		var normalizedPart = "";
		
		if (typeof(part) != "undefined" && part != null) {
			normalizedPart = $.trim(part);
		}
		
		return normalizedPart;
	}
	
	bampfa.computeDimensionSummary = function(measuredPart, dimensionSubGroup, measuredPartNote) {
		var valueMap = {};
		
		for (var i=0; i<dimensionSubGroup.length; i++) {
			var measurement = dimensionSubGroup[i];
			var dimension = measurement.dimension;
			var value = measurement.value;
			var unit = measurement.measurementUnit;
			
			if (unit == "inches" && value != null && value != "" && !(dimension in valueMap)) {
				valueMap[dimension] = value;
			}
		}
		
		var orderedDimensions = ["height", "width", "depth", "diameter"];
		var orderedValues = [];
		
		for (var i=0; i<orderedDimensions.length; i++) {
			var dimension = orderedDimensions[i];
			
			if (dimension in valueMap) {
				orderedValues.push(valueMap[dimension]);
			}
		}
		
		var dimensionSummary = orderedValues.join(" x ");
		var summaryParts = [];
		
		if (measuredPart != null && measuredPart != "") {
			summaryParts.push(measuredPart + ":");
		}

		if (dimensionSummary != "") {
			summaryParts.push(dimensionSummary);
		}
		
		if (measuredPartNote != null && measuredPartNote != "") {
			summaryParts.push("(" + measuredPartNote + ")");
		}
		
		return summaryParts.join(" ");
	}
	
	/* 
	 * Convert html from the richTextEditor component into plain text.
	 */
	bampfa.convertHtmlToPlainText = function(html) {
		var lines = html.split("<br />");
		var plainTextLines = [];
		
		for (var i=0; i<lines.length; i++) {
			var line = lines[i].replace(/&nbsp;/g, " ");
			var element = $("<div>" + line + "</div>");
			
			plainTextLines.push(element.text());
		}
		
		return plainTextLines.join("\n");
	}
	
})(jQuery, fluid);