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
            // configuration options specific to the current context:
            config.dependencies.relatedRecordsTab.args[3] = applier;
            config.depOpts.relatedRecordsTab.options.relationManager.options.primaryRecordType = options.primaryRecordType;
            config.depOpts.relatedRecordsTab.options.listEditor.options.data =
                applier.model.relations[config.depOpts.relatedRecordsTab.options.listEditor.options.dataContext.options.recordType];

            // configuration options specific to local-file-system use:
            if (cspace.util.useLocalData()) {
                config.depOpts.relatedRecordsTab.options.listEditor.options.dataContext.options.baseUrl = "data";
                config.depOpts.relatedRecordsTab.options.listEditor.options.dataContext.options.fileExtension = ".json";
            }
            $.extend(true, config, options.config);
            
        };
        return cspace.pageSetup(options);
        
    };
})(jQuery);

