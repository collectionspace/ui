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

    cspace.tabSetup = function (applier, options) {
        
        options = options || {};
                
        options.fetchConfigCallback = options.fetchConfigCallback || function (config) {
            if (cspace.util.useLocalData()) {
                config.depOpts.relatedRecordsTab.options.listEditor.options.dataContext.options.baseUrl = "data";
                config.depOpts.relatedRecordsTab.options.listEditor.options.dataContext.options.fileExtension = ".json";
            }
        };        
        options.pageBuilder.options = {
        };
        return cspace.pageSetup(options);
        
    };
})(jQuery);

