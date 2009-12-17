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
                                    "*": "test-data/find-edit/" + recordType + "-records"
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    cspace.setupFindEdit = function () {
		var isLocal = cspace.util.isLocal();
        var orOpts = {uiSpecUrl: isLocal ? 
		    "./schemas/collection-object/find-edit.json" : "../../chain/objects/uispec/find-edit"};
        if (isLocal) {
            orOpts.dataContext = setupTestDataContext("object");
        }
        var objRecordList = cspace.recordList(".object-records-group", orOpts);

        var prInOpts = {uiSpecUrl: isLocal ? 
		    "./schemas/intake/find-edit.json" : "../../chain/intake/uispec/find-edit"};
        if (isLocal) {
            prInOpts.dataContext = setupTestDataContext("intake");
        }
        var procIntakeRecordList = cspace.recordList(".intake-records-group", prInOpts);

        var prAcqOpts = {uiSpecUrl: isLocal ?
		    "./schemas/acquisition/find-edit.json" : "../../chain/acquisition/uispec/find-edit"};
        if (isLocal) {
            prAcqOpts.dataContext = setupTestDataContext("acquisition");
        }
        var procAcquisitionRecordList = cspace.recordList(".acquisition-records-group", prAcqOpts);
    };

}) (jQuery);
