/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var cspace = cspace || {};

(function ($) {

    setupTestDataContext = function (recordType) {
        return {
            type: "cspace.dataContext",
            options: {
                urlFactory: {
                    type: "cspace.dataContext.testUrlFactory",
                    options: {
                        resourceMapper: {
                            type: "cspace.dataContext.staticResourceMapper",
                            options: {
                            	modelToResourceMap: {
                                    "*": "find-edit/" + recordType + "-records"
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    cspace.setupFindEdit = function () {
        var orOpts = {uiSpecUrl: "./find-edit/spec/spec-objects.json"};
        if (document.location.protocol === "file:") {
            orOpts.dataContext = setupTestDataContext("object");
        }
        var objRecordList = cspace.recordList(".object-records-group", orOpts);

        var prOpts = {uiSpecUrl: "./find-edit/spec/spec-procedures.json"};
        if (document.location.protocol === "file:") {
            prOpts.dataContext = setupTestDataContext("procedure");
        }
        var procRecordList = cspace.recordList(".procedural-records-group", prOpts);
    };

}) (jQuery);
