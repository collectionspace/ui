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
		return computeTitle(article, title);
	}
	
	cinefiles.computeDocDisplayName = function(article, title) {
		return computeTitle(article, title);
	}
	
	var computeTitle = function(article, title) {
		if (typeof(article) == "undefined") {
			article = "";
		}
		
		if (typeof(title) == "undefined") {
			title = "";
		}
		
		return article + title;
	}
})(jQuery, fluid);