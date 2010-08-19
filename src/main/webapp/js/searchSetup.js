/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace, fluid*/
"use strict";

cspace = cspace || {};

(function ($) {
    fluid.log("searchSetup.js loaded");

    cspace.searchSetup = function () {
        
        var searchOpts = {};
        if (cspace.util.useLocalData()) {
            searchOpts.searchUrlBuilder = cspace.search.localSearchUrlBuilder;
        }
        var dependencies = {
            search: {
                funcName: "cspace.search.searchView",
                args: [".main-search-page", searchOpts]
            }
        };
        var pageBuilderOpts = {
            pageSpec: {
                header: {
                    href: "header.html",
                    templateSelector: ".csc-header-template",
                    targetSelector: ".csc-header-container"
                },
                footer: {
                    href: "footer.html",
                    templateSelector: ".csc-footer",
                    targetSelector: ".csc-footer-container"
                }
            }
        };
        cspace.pageBuilder(dependencies, pageBuilderOpts);
    };
    
})(jQuery);

