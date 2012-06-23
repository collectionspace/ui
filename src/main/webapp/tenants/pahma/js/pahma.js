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

        var trim = function(s) {
	    var l=0; var r=s.length -1;
	    while(l < s.length && s[l] == ' ')
	      { l++; }
	    while(r > l && s[r] == ' ')
	      { r-=1; }
	    return s.substring(l, r+1);
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
		return trim(objTokens[3]+objTokens[5]+objTokens[7]+objTokens[9]+objTokens[11]);
		}
	}
	
	var removeTimestamp = function(datetime) {
		var date = datetime;
		var index = datetime.indexOf("T");
	
		if (index > -1) {
			date = datetime.substring(0, index);
		}
		
		return date;
	}
	
	pahma.computeMovementSummary = function(date, reason) {
		var summary = "";
		
		if (typeof(date) == "undefined") {
			date = "";
		}

		if (typeof(reason) == "undefined") {
			reason = "";
		}
		
		date = removeTimestamp(date);
		
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
	
	pahma.concatenateFields = function(a, b) {
	    var result = "";
	    
	    if (a && b) {
	        result = a + " (" + b + ")";
	    } else if (a) {
	        result = a;
	    } else if (b) {
	        result = b;
	    } else if (c) {
	        result = c;
	    }
	    
	    return result;
	}

    // pahma.computeReferenceNumber = function(c) {
    //     var url = "../../../tenant/pahma/id/movement"
    //     pahma.movementRefNum = "";
    //     
    //     var populateRefNum = function (that) {
    //         return function(data, status) {
    //             alert("success");
    //             console.log(that);
    //             console.log(data.next);
    //         }
    //     }
    //     
    //         jQuery.ajax({
    //             url: url,
    //             type: "GET",
    //             dataType: "json",
    //             success: populateRefNum,
    //             error: function(xhr, textStatus, errorThrown) {
    //                 alert("error");
    //                 console.log(errorThrown);
    //                 pahma.movementRefNum = "errors";
    //                 return "errors";
    //             }
    //         });
    // }
	
})(jQuery, fluid);
