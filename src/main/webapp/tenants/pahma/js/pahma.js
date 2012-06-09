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
  		//            1    2                   3        4         5    6         7    8          9     10         11   
  		var objRe = /^([cC](ons|ONS)?[\-\. ]?)?([A-Z]+)?([\-\. ])?(\d+)([\-\. ])?(\d+)?([\.\- ]+)?(\d+)?([\.\- ]+)?(.*)$/;
  		var objTokens = objRe.exec(objnum);
  		if (objTokens == null) {
			return objnum;
		  }
		  else {
			for ( i = 0 ; i < objTokens.length ; i = i+1 ) {
				if (!objTokens[i]) {
					objTokens[i] = '';
				}
      				else {
        				if (isNumber(objTokens[i])) {
					objTokens[i] = pad(objTokens[i],6);
        			}
			}
			objTokens[i] = objTokens[i] + ' ';
		}
		if (objTokens[3] == ' ') objTokens[3] == ''; // zap empty alphabetic prefix
		return objTokens[3]+objTokens[5]+objTokens[7]+objTokens[9]+objTokens[11];
		}
	}
}(jQuery, fluid));