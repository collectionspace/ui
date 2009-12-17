/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var demo = demo || {};

(function ($) {

    cspace.searchSetup = function () {
        var opts = {};
        if (cspace.util.isLocal()) {
            opts.searchUrlBuilder = function(recordType, query){
                return "./search-test/"+recordType+".json";
            };
        }
        var acquisition = cspace.search(".main-search-page", opts);
    };
    
})(jQuery);

