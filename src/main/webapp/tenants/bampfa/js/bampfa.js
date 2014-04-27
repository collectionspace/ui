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
		
		if (typeof(part) != "undefined" || part != null) {
			normalizedPart = $.trim(part);
		}
		
		return normalizedPart;
	} 
})(jQuery, fluid);