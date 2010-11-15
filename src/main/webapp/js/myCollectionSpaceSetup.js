/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, console, fluid*/
"use strict";

cspace = cspace || {};

(function ($) {
    fluid.log("myCollectionSpaceSetup.js loaded");

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
    
    var makeOpts = function (recordType, uispecPath) {
        return {
            listeners: {
                afterSelect: cspace.recordList.afterSelectHandlerDefault
            },
            strings: {
                nothingYet: "No records yet"
            },
            uispec: "{pageBuilder}.uispec." + (uispecPath || recordType),
            model: makeArrayExpander(recordType)
        };
    };

    cspace.setupMyCollectionSpace = function () {
        var dependencies = {
            cataloging: {
                funcName: "cspace.recordList",
                args: [".object-records-group", makeOpts("cataloging")]
            },
            proceduresIntake: {
                funcName: "cspace.recordList",
                args: [".intake-records-group", makeOpts("intake", "proceduresIntake")]
            },
            proceduresAcquisition: {
                funcName: "cspace.recordList",
                args: [".acquisition-records-group", makeOpts("acquisition", "proceduresAcquisition")]
            },
            proceduresLoanIn: {
                funcName: "cspace.recordList",
                args: [".loanIn-records-group", makeOpts("loanin", "proceduresLoanin")]
            },
            proceduresLoanOut: {
                funcName: "cspace.recordList",
                args: [".loanOut-records-group", makeOpts("loanout", "proceduresLoanout")]
            },
            proceduresMovement: {
                funcName: "cspace.recordList",
                args: [".movement-records-group", makeOpts("movement", "proceduresMovement")]
            }
        };
        
        var options = {
            pageSpec: {
                footer: {
                    href: "footer.html",
                    templateSelector: ".csc-footer",
                    targetSelector: ".csc-footer-container"
                }
            },
            components: {
                pivotSearch: {
                    type: "cspace.searchBox",
                    options: {
                        strings: {
                            recordTypeSelectLabel: "Record Type"
                        },
                        permissions: "{pageBuilder}.permissions",
                        schema: "{pageBuilder}.schema",
                        selfRender: true
                    }
                }
            },
            pageType: "myCollectionSpace"
        };
        cspace.pageBuilder(dependencies, options);
    };

})(jQuery);
