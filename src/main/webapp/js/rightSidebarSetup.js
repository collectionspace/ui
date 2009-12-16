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

    setupTestDataContext = function (csid, recordType) {
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
                                    "*": "right-sidebar/"+csid+"/" + recordType + "-records"
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    cspace.setupRightSidebar = function (csid) {
        var orOpts = {uiSpecUrl: "./right-sidebar/spec/spec-objects.json"};
        if (document.location.protocol === "file:") {
            orOpts.dataContext = setupTestDataContext(csid, "object");
        }
        var objRecordList = cspace.recordList(".related-objects", orOpts);

        var prOpts = {uiSpecUrl: "./right-sidebar/spec/spec-procedures.json"};
        if (document.location.protocol === "file:") {
            prOpts.dataContext = setupTestDataContext(csid, "procedure");
        }
        var procRecordList = cspace.recordList(".related-procedures", prOpts);
    };

}) (jQuery);
