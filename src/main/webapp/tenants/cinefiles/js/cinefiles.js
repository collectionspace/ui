/*
Copyright 2013 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

var cinefiles = {};

(function ($, fluid) {
	
	cinefiles.computeWorkDisplayName = function(article, title) {
		return computeFullTitle(article, title);
	}
	
	cinefiles.computeDocDisplayName = function(article, title) {
		return computeFullTitle(article, title);
	}
		
	var computeFullTitle = function(article, title) {
		if (typeof(title) == "undefined") {
			title = "";
		}
		
		if (isBlank(article)) {
			return title;
		}
		else if (requiresFollowingSpace(article)) {
			return article + " " + title;
		}
		else {
			return article + title;
		}
	}
	
	var nonWhitespacePattern = /\S/;
	
	/*
	 * Returns true if a string is undefined, empty, or contains only whitespace.
	 * Otherwise, returns false.
	 */
	var isBlank = function(string) {
		return (typeof(string) == "undefined" || !nonWhitespacePattern.test(string));
	}
	
	/*
	 * An article requires a following space unless it ends with an apostrophe or dash.
	 */
	var requiresFollowingSpace = function(article) {
		var lastChar = article.substring(article.length - 1);
		
		return (lastChar != "'" && lastChar != "-");
	}
})(jQuery, fluid);