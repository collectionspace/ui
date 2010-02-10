/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, console*/

cspace = cspace || {};

(function ($) {

    cspace.setupFindEdit = function () {
        var setUpPage = function () {
            var objOpts = {
                dataContext: { options: { recordType: "objects" } },
                uispec: "{pageBuilder}.uispec.objects"
            };
            var intOpts = {
                dataContext: { options: { recordType: "intake" } },
                uispec: "{pageBuilder}.uispec.proceduresIntake"
            };
            var acqOpts = {
                dataContext: { options: { recordType: "acquisition" } },
                uispec: "{pageBuilder}.uispec.proceduresAcquisition"
            };
            var authOpts = {
                dataContext: { options: { recordType: "authority" } },
                uispec: "{pageBuilder}.uispec.authorityTerms"
            };
            if (cspace.util.isLocal()) {
                objOpts.dataContext.options = {
                    baseUrl: "data",
                    recordType: "collection-object",
                    fileExtension: ".json"
                };
                intOpts.dataContext.options.baseUrl = 
                    acqOpts.dataContext.options.baseUrl = 
                        authOpts.dataContext.options.baseUrl = "data";
                intOpts.dataContext.options.fileExtension = 
                    acqOpts.dataContext.options.fileExtension = 
                        authOpts.dataContext.options.fileExtension = ".json";
            }
            var dependencies = {
                objects: {
                    funcName: "cspace.recordList",
                    args: [".object-records-group", objOpts]
                },
                proceduresIntake: {
                    funcName: "cspace.recordList",
                    args: [".intake-records-group", intOpts]
                },
                proceduresAcquisition: {
                    funcName: "cspace.recordList",
                    args: [".acquisition-records-group", acqOpts]
                },
                authorityTerms: {
                    funcName: "cspace.recordList",
                    args: [".authority-records-group", authOpts]
                }
            };
            
            var options = {
/*                pageSpec: {
                    objects: {},
                    proceduresIntake: {},
                    proceduresAcquisiton: {},
                    authorityTerms: {}
                }
*/            };
            cspace.pageBuilder(dependencies, options);
        };

        if (!cspace.pageBuilder || !cspace.pageBuilder.uispec) {
            jQuery.ajax({
                url: "./uispecs/find-edit/uispec.json",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    cspace.pageBuilder.uispec = data;
                    setUpPage();
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log("ERROR!");
                }
            });
        } else {
            setUpPage();
        }
    };
})(jQuery);
