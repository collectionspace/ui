/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid */
"use strict";

cspace = cspace || {};

(function ($, fluid) {

    cspace.objectTabSetup = function (applier) {
        
        var local = cspace.util.isLocal();
        
        var tabOpts = {
            listEditor: {
                options: {
                    initList: cspace.listEditor.receiveData,
                    data: applier.model.relations,
                    dataContext: {
                        options: {
                            recordType: "objects"
                        }
                    }
                }
            }
        };
        
        if (local) {
            tabOpts.listEditor.options.dataContext.options.baseUrl = "data/";
            tabOpts.listEditor.options.dataContext.options.fileExtension = ".json";
            tabOpts.relationManager = {
                options: {
                    dataContext: {
                        options: {
                            baseUrl: "data/",
                            fileExtension: ".json"
                        }
                    }
                }
            };
        }
        
        var dependencies = {
            users: {
                funcName: "cspace.relatedRecordsTab",
                args: [".csc-object-tab", "objects", "{pageBuilder}.uispec", applier, tabOpts]
            }
        };

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
        cspace.pageBuilder(dependencies, options);        
    };
})(jQuery, fluid);
