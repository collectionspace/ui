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

    var setupTestDataContext = function (csid, recordType) {
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
                                    "*": "related-records/"+csid+"/" + recordType + "-records"
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    var buildRelationsList = function (data, recordTypeList) {
        var relationList = [];
        if (data) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < recordTypeList.length; j++) {
                    if (data[i].recordtype === recordTypeList[j]) {
                        relationList.push(data[i]);
                    }
                }
            }
        }
        return relationList;     
    };

    cspace.setupRightSidebar = function (csid, data) {
        var orOpts = {uiSpecUrl: "./related-records/spec/spec-objects.json"};
        if (document.location.protocol === "file:") {
            orOpts.dataContext = setupTestDataContext(csid, "object");
        }
// CSPACE-701: the record type should be "object" or whatever is selected.
// Once this issue is fixed, this code should be updated
        orOpts.data =  buildRelationsList(data, ["objects"]);
        var objRecordList = cspace.recordList(".related-objects", orOpts);

        var prOpts = {uiSpecUrl: "./related-records/spec/spec-procedures.json"};
        if (document.location.protocol === "file:") {
            prOpts.dataContext = setupTestDataContext(csid, "procedure");
        }
        prOpts.data = buildRelationsList(data, ["intake", "acquisition"]);
        var procRecordList = cspace.recordList(".related-procedures", prOpts);
    };

}) (jQuery);
