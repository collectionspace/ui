/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid_1_2 */

cspace = cspace || {};

(function ($) {

    cspace.objectTabSetup = function (applier) {
        var setUpPage = function () {
            var options = {
                pageSpec: {
                    relatedRecords: {
                        href: "objectTabRecordListTemplate.html",
                        templateSelector: ".csc-object-tab-record-list",
                        targetSelector: ".div-for-list-of-records"
                    } //,
                  //  newRecord: {
                  //      href: "objectTabSchemaTemplate.html",
                  //      templateSelector: ".csc-object-tab-schema",
                  //      targetSelector: ".div-for-schema"
                  //  } 
                }
            };
            var reOpts = {
                dataContext: "{pageBuilder}.dataContext",
                applier: "{pageBuilder}.applier",
                uispec: "{pageBuilder}.uispec.newRecord"
            };
            var rrOpts = {
                applier: applier,
                recordType: "objects",
                currentRecordType: "objects",
                uispec: "{pageBuilder}.uispec.relatedRecords"
            };
            var dependencies = {
                relatedRecords: {
                    funcName: "cspace.relatedRecordsList",
                    args: [".div-for-list-of-records", rrOpts]
                } //,
             //   newRecord: {
             //       funcName: "cspace.recordEditor",
             //       args: [".div-for-schema", reOpts]
             //   }
            };
            cspace.pageBuilder(dependencies, options);            
        };

        if (!cspace.pageBuilder || !cspace.pageBuilder.uispec) {
            var uispecUrl = (cspace.util.isLocal() ? "./uispecs/object-tab/uispec.json" : "../../chain/object-tab/uispec");
            jQuery.ajax({
                url: uispecUrl,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    cspace.pageBuilder.uispec = data;
                    setUpPage();
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log("Error fetching objects tab uispec");
                }
            });
        } else {
            setUpPage();
        }
    };

})(jQuery, fluid_1_2);
