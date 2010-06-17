/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/
"use strict";

cspace = cspace || {};

(function ($) {

    cspace.objectSetup = function (options) {
        
        options = options || {};
                
        options.fetchConfigCallback = options.fetchConfigCallback || function (config) {
            config.pageBuilder.options.csid = cspace.util.getUrlParameter("csid");                
            if (cspace.util.isLocal()) {
                config.pageBuilder.options.dataContext.options.baseUrl = "data";
                config.pageBuilder.options.dataContext.options.fileExtension = ".json";
            }
        };        
        return cspace.pageSetup(options);
        
    };
})(jQuery);

