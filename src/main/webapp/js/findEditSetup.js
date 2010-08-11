/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, console, fluid*/
"use strict";

cspace = cspace || {};

(function ($) {
    fluid.log("findEditSetup.js loaded");

    var buildUrl = function (recordType) {
        if (cspace.util.useLocalData()) {
            return "./data/" + recordType + "/records/list.json";
        } else {
            return "../../chain/" + recordType;
        }
    };
    
    var makeArrayExpander = function (recordType) {
        return fluid.expander.makeFetchExpander({
            url: buildUrl(recordType),
            fetchKey: recordType, 
            disposer: function (model) {
                model.selectonIndex = -1;
                return model;
            }
        });
    };

    cspace.setupFindEdit = function () {
        var stringOptions = {
            strings: {
                nothingYet: "No records yet"
            }
        };
        var dependencies = {
            objects: {
                funcName: "cspace.recordList",
                args: [".object-records-group",
                        makeArrayExpander("objects"),
                        "{pageBuilder}.uispec.objects",
                        stringOptions]
            },
            proceduresIntake: {
                funcName: "cspace.recordList",
                args: [".intake-records-group",
                        makeArrayExpander("intake"),
                        "{pageBuilder}.uispec.proceduresIntake",
                        stringOptions]
            },
            proceduresAcquisition: {
                funcName: "cspace.recordList",
                args: [".acquisition-records-group",
                        makeArrayExpander("acquisition"),
                        "{pageBuilder}.uispec.proceduresAcquisition",
                        stringOptions]
            },
            proceduresLoanIn: {
                funcName: "cspace.recordList",
                args: [".loanIn-records-group",
                    makeArrayExpander("loanin"),
                    "{pageBuilder}.uispec.proceduresLoanin",
                    stringOptions]
            },
            proceduresLoanOut: {
                funcName: "cspace.recordList",
                args: [".loanOut-records-group",
                    makeArrayExpander("loanout"),
                    "{pageBuilder}.uispec.proceduresLoanout",
                    stringOptions]
            },
            proceduresMovement: {
                funcName: "cspace.recordList",
                args: [".movement-records-group",
                    makeArrayExpander("movement"),
                    "{pageBuilder}.uispec.proceduresMovement",
                    stringOptions]
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
            },
            pageType: "find-edit"
        };
        cspace.pageBuilder(dependencies, options);
    };

})(jQuery);
