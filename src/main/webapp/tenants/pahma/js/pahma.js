/*
Copyright 2011 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

var pahma = {};

(function ($, fluid) {
	var pad = function(s, len){
		if (len-s.length+1 > 0) {
			return (new Array((len-s.length+1) ).join("0")) + s;
		}
		else {
			return s;
		}
	};
	
	var isNumber = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
	pahma.createSortableObjectNumber = function(objnum) {
		var objRe = /^([cC](ons|ONS)?[\-\. ]?)?([\d\w]+)[\-\. ](\d+)([\.\- ]+)?(.*)$/;
		var objTokens = objRe.exec(objnum);
		if (objTokens == null) {
			return objnum;
		}
		else {
			// pad first element only if it is numeric
			if (isNumber(objTokens[3])) objTokens[3] = pad(objTokens[3],4);
			return objTokens[3]+'-'+pad(objTokens[4],6)+' '+objTokens[6];
		}
	}
}(jQuery, fluid));