/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid_1_2 */

cspace = cspace || {};

(function ($) {

    cspace.objectTabSetup = function (applier) {
        var options = {
            pageSpec: {
                relatedRecords: {
                    href: "objectTabRecordListTemplate.html",
                    templateSelector: ".csc-object-tab-record-list",
                    targetSelector: ".div-for-list-of-records"
                }
              //  newRecord: {
              //      href: "objectTabSchemaTemplate.html",
              //      templateSelector: ".csc-object-tab-schema",
              //      targetSelector: ".div-for-schema"
              //  } 
            },
            pageType: "object-tab"
        };
        var reOpts = {
            dataContext: "{pageBuilder}.dataContext",
            uispec: "{pageBuilder}.uispec.newRecord"
        };
        var rrOpts = {
            recordType: "objects",
            currentRecordType: "objects",
            uispec: "{pageBuilder}.uispec.relatedRecords"
        };
        var dependencies = {
            relatedRecords: {
                funcName: "cspace.relatedRecordsList",
                args: [".div-for-list-of-records", applier, rrOpts]
            } //,
         //   newRecord: {
         //       funcName: "cspace.recordEditor",
         //       args: [".div-for-schema", applier, reOpts]
         //   }
        };
        cspace.pageBuilder(dependencies, options);            
    };

})(jQuery, fluid_1_2);
