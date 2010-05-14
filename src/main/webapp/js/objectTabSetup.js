/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid */

cspace = cspace || {};

(function ($, fluid) {

    cspace.objectTabSetup = function (applier) {
        var options = {
            pageSpec: {
                list: {
                    href: "objectTabRecordListTemplate.html",
                    templateSelector: ".csc-object-tab-record-list",
                    targetSelector: ".div-for-list-of-records"
                },
                details: {
                    href: "ObjectEntryTemplate.html",
                    templateSelector: ".csc-object-entry-template",
                    targetSelector: ".div-for-recordEditor"
                } 
            },
            pageType: "object-tab"
        };
        var leOpts = {
            listPopulationStrategy: cspace.listEditor.receiveData,
            data: applier.model.relations,
            dataContext: {
                options: {
                    recordType: "objects"
                }
            }
        };
        if (cspace.util.isLocal()) {
            leOpts.dataContext.options.baseUrl = "data/";
            leOpts.dataContext.options.fileExtension = ".json";
        }
        var dependencies = {
            listEditor: {
                funcName: "cspace.listEditor",
                args: [".csc-object-tab",
                    "objects",
                    "{pageBuilder}.uispec",
                    leOpts]
            }
        };
        cspace.pageBuilder(dependencies, options);            
    };
})(jQuery, fluid);
