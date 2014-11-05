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
		var measurements = {};
		
		// Collect the necessary measurements for the summary.
		
		// Measurements with units other than inches and centimeters are excluded.
		
		// Measurements with empty values are excluded.
		
		// A dimension could be measured more than once. If this happens, the first (top-most) measurement
		// of that dimension is used. All others are excluded.
		
		for (var i=0; i<dimensionSubGroup.length; i++) {
			var measurement = dimensionSubGroup[i];
			var dimension = measurement.dimension;
			var value = measurement.value;
			var unit = measurement.measurementUnit;
			
			if ((unit == "inches" || unit == "centimeters") && value != null && value != "" && !(dimension in measurements)) {
				measurements[dimension] = {
					value: value,
					unit: unit
				}
			}
		}
		
		// Order the collected measurements by dimension, and drop measurements of
		// dimensions that are not used in the summary.
		
		var orderedDimensions = ["height", "width", "depth", "diameter"];
		var orderedMeasurements = [];
		var usedUnits = {};
		
		for (var i=0; i<orderedDimensions.length; i++) {
			var dimension = orderedDimensions[i];
			
			if (dimension in measurements) {
				var measurement = measurements[dimension];
				
				orderedMeasurements.push(measurement);
				usedUnits[measurement.unit] = true;
			}
		}
		
		// Create descriptions of each measurement. If all measurements share
		// a common unit, this is just the value of the measurement. Otherwise,
		// it's the value and the unit.
		
		var orderedMeasurementDescriptions = [];
		var hasCommonUnit = (Object.keys(usedUnits).length == 1);

		for (var i=0; i<orderedMeasurements.length; i++) {
			var measurement = orderedMeasurements[i];
			var measurementDescription = measurement.value;
			
			if (!hasCommonUnit) {
				// FIXME: Remove call to getUnitLabel when the unit values are changed to "in." and "cm."
				measurementDescription += " " + getUnitLabel(measurement.unit);
			}
			
			orderedMeasurementDescriptions.push(measurementDescription);
		}
		
		// Join all measurement descriptions with x.
		
		var measurementSummary = orderedMeasurementDescriptions.join(" x ");

		// If there is a common unit, append it.
		
		if (hasCommonUnit) {
			var commonUnit = (Object.keys(usedUnits))[0];
			
			// FIXME: Remove call to getUnitLabel when the unit values are changed to "in." and "cm."
			measurementSummary += " " + getUnitLabel(commonUnit);
		}
		
		// Compose this with the measured part and the measured part note.
		
		var summaryParts = [];
		
		if (measuredPart != null && measuredPart != "") {
			summaryParts.push(measuredPart + ":");
		}

		if (measurementSummary != "") {
			summaryParts.push(measurementSummary);
		}
		
		if (measuredPartNote != null && measuredPartNote != "") {
			summaryParts.push("(" + measuredPartNote + ")");
		}
		
		return summaryParts.join(" ");
	}
	
	var getUnitLabel = function(unit) {
		return (unit == "inches") ? "in." : "cm.";
	}

	bampfa.computeFullNameLFM = function(foreName, middleName, surName, nameAdditions, nationalities) {
		var nameParts = [];

		foreName = jQuery.trim(foreName);
		middleName = jQuery.trim(middleName);
		surName = jQuery.trim(surName);
		nameAdditions = jQuery.trim(nameAdditions);

		var nationality = "";
		
		if (nationalities.length > 0) {
			for (var i=0; i<nationalities.length; i++) {
				var candidateNationality = nationalities[i];
				
				if (candidateNationality["_primary"]) {
					nationality = jQuery.trim(candidateNationality.nationality);
					break;
				}
			}
		}
	
		if (surName.toLowerCase() == "unknown") {
			nameParts.push(surName);
			
			if (nationality) {
				nameParts.push("(" + nationality + ")");
			}
		}
		else if (!foreName && !surName) {
			// The calculation function from FileMaker outputs "??" if both first name and last name are empty.
			// As a simplification, I'm making the output empty in this case. See BAMPFA-205 and BAMPFA-238
			// for details.
			
			// nameParts.push("??");
		}
		else if (!surName) {
			nameParts.push(foreName);
		}
		else if (!foreName) {
			nameParts.push(surName);
		}
		else if (!middleName) {
			if (nationality.toLowerCase().indexOf("china") < 0) {
				surName = surName + ",";
			}
			
			nameParts.push(surName);
			
			if (nameAdditions) {
				foreName = foreName + ",";
			}
			
			nameParts.push(foreName);
			
			if (nameAdditions) {
				nameParts.push(nameAdditions);
			}
		}
		else {
			if (nationality.toLowerCase().indexOf("china") < 0) {
				surName = surName + ",";
			}
			
			nameParts.push(surName);
			nameParts.push(foreName);
			
			if (nameAdditions) {
				middleName = middleName + ",";
			}
			
			nameParts.push(middleName);
			
			if (nameAdditions) {
				nameParts.push(nameAdditions);
			}
		}
		
		return nameParts.join(" ");
	}
	
	bampfa.computeFullNameFML = function(title, foreName, middleName, surName, nameAdditions, nationalities) {
		var nameParts = [];
		
		title = jQuery.trim(title);
		foreName = jQuery.trim(foreName);
		middleName = jQuery.trim(middleName);
		surName = jQuery.trim(surName);
		nameAdditions = jQuery.trim(nameAdditions);

		var nationality = "";
		
		if (nationalities.length > 0) {
			for (var i=0; i<nationalities.length; i++) {
				var candidateNationality = nationalities[i];
				
				if (candidateNationality["_primary"]) {
					nationality = jQuery.trim(candidateNationality.nationality);
					break;
				}
			}
		}
		
		if (surName.toLowerCase() == "unknown") {
			nameParts.push(surName);

			if (nationality) {
				nameParts.push("(" + nationality + ")");
			}
		}
		else {
			if (title) {
				nameParts.push(title);
			}
			
			if (foreName) {
				nameParts.push(foreName);
			}
			
			if (middleName) {
				nameParts.push(middleName);
			}
			
			if (surName) {
				nameParts.push(surName);
			}
			
			if (nameAdditions) {
				nameParts.push(nameAdditions);
			}			
		}
		
		return nameParts.join(" ");
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
	
	
	var zeroPad = function(str, len){
		if (str.length >= len) {
			return (str);
		}
		
		return (new Array(len + 1).join('0') + str).slice(-len);
	};
	
	var isNumericRegExp = /^\d+$/;
	
	bampfa.computeSortableObjectNumber = function(objectNumber) {
		var parts = objectNumber.split('.');
		var sortableParts = [];
		
		for (var i=0; i<parts.length; i++) {
			var part = parts[i];
			
			if (isNumericRegExp.test(part)) {
				part = zeroPad(part, 5);
			}
			else {
				part = part.toLowerCase();
			}
			
			sortableParts.push(part);
		}
		
		return sortableParts.join(' ');
	}
	
	var removeTimestamp = function(datetime) {
		var date = datetime;
		var index = datetime.indexOf("T");
	
		if (index > -1) {
			date = datetime.substring(0, index);
		}
		
		return date;
	}
	
	bampfa.computeMovementSummary = function(date, reason) {
		var summary = "";
		
		if (typeof(date) == "undefined") {
			date = "";
		}

		if (typeof(reason) == "undefined") {
			reason = "";
		}
		
		date = removeTimestamp(date);
		
		if (reason) {
			reason = cspace.util.urnToString(reason);
		}
		
		if (date && reason) {
			summary = date + " (" + reason + ")";
		}
		else if (date) {
			summary = date;
		}
		else if (reason) {
			summary = reason;
		}
		
		return summary;
	}
	
	bampfa.computeEffectiveObjectNumber = function(objectNumber, otherNumber) {
		// The effective object number is the objectNumber, if it exists. Otherwise,
		// fall back to the primary otherNumber.
		
		var effectiveObjectNumber = objectNumber;
		
		if (!effectiveObjectNumber) {
			var fallbackNumber = null;
			
			if (otherNumber.length > 0) {
				for (var i=0; i<otherNumber.length; i++) {
					var candidateNumber = otherNumber[i];
			
					if (candidateNumber["_primary"]) {
						fallbackNumber = candidateNumber.numberValue;
						break;
					}
				}
			}
			
			effectiveObjectNumber = fallbackNumber;
		}
		
		return effectiveObjectNumber;
	}
	
	bampfa.computeMediaTitle = function(blobs) {
		var filename = "";
		
		if (blobs.length > 0) {
			var blob = blobs[0];
			
			filename = blob.name;
		}
		
		return filename;
	}
})(jQuery, fluid);