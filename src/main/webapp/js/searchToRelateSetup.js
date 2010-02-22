/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace*/

cspace = cspace || {};

(function ($) {

    cspace.searchToRelateSetup = function () {
        console.log("searchToRelateSetup()");
        var searchOpts = {};
        if (cspace.util.isLocal()) {
            searchOpts.searchUrlBuilder = function (recordType, query) {
                var recordTypeParts = (recordType === "collection-object"? [recordType]: recordType.split('-'));        
                return "./data/" + recordTypeParts.join('/') + "/search/list.json";
            };
        }
        var dependencies = {
            search: {
                funcName: "cspace.search",
                args: [".main-search-page", searchOpts]
            }
        };
        var pageBuilderOpts = {
        };
        cspace.pageBuilder(dependencies);
    };
    
})(jQuery);

