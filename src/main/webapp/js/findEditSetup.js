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
            var liOpts = {
                dataContext: { options: { recordType: "loanin" } },
                uispec: "{pageBuilder}.uispec.proceduresLoanIn"
            };
            var loOpts = {
                dataContext: { options: { recordType: "loanout" } },
                uispec: "{pageBuilder}.uispec.proceduresLoanOut"
            };
            if (cspace.util.isLocal()) {
                objOpts.dataContext.options = {
                    baseUrl: "data",
                    recordType: "collection-object",
                    fileExtension: ".json"
                };
                intOpts.dataContext.options.baseUrl = 
                    acqOpts.dataContext.options.baseUrl =  
                        liOpts.dataContext.options.baseUrl =  
                            loOpts.dataContext.options.baseUrl = "data";
                intOpts.dataContext.options.fileExtension = 
                    acqOpts.dataContext.options.fileExtension = 
                        liOpts.dataContext.options.fileExtension = 
                            loOpts.dataContext.options.fileExtension = ".json";
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
                proceduresLoanIn: {
                    funcName: "cspace.recordList",
                    args: [".loanIn-records-group", liOpts]
                },
                proceduresLoanOut: {
                    funcName: "cspace.recordList",
                    args: [".loanOut-records-group", loOpts]
                }
            };
            
            var options = {
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
            cspace.pageBuilder(dependencies, options);
        };

        if (!cspace.pageBuilder || !cspace.pageBuilder.uispec) {
            var uispecUrl = (cspace.util.isLocal() ? "./uispecs/find-edit/uispec.json" : "../../chain/find-edit/uispec");
            jQuery.ajax({
                url: uispecUrl,
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
