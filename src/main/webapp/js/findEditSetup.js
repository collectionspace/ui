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

    cspace.setupFindEditNew = function(){
        var setUpPage = function () {
            
        };

        if (!cspace.pageBuilder || !cspace.pageBuilder.uispec) {
            jQuery.ajax({
                url: "./uispecs/find-edit/uispec.json",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    cspace.pageBuilder.uispec = data.spec;
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

    cspace.setupFindEdit = function () {
		var isLocal = cspace.util.isLocal();
        var orOpts = {
            dataContext: {
                options: {
                    recordType: "objects"
                }
            },
            uiSpecUrl: isLocal ? 
// CSPACE-701
		    "./uispecs/collection-object/find-edit.json" : "../../chain/objects/uispec/find-edit"};
        if (isLocal) {
            orOpts.dataContext = {
                type: "cspace.dataContext",
                options: {
                    baseUrl: "data",
                    recordType: "collection-object",
                    fileExtension: ".json"
                }
            };
        }
        var objRecordList = cspace.recordList(".object-records-group", orOpts);

        var prInOpts = {
            dataContext: {
                options: {
                    recordType: "intake"
                }
            },
            uiSpecUrl: isLocal ? 
		    "./uispecs/intake/find-edit.json" : "../../chain/intake/uispec/find-edit"};
        if (isLocal) {
            prInOpts.dataContext = {
                type: "cspace.dataContext",
                options: {
                    baseUrl: "data",
                    recordType: "intake",
                    fileExtension: ".json"
                }
            };
        }
        var procIntakeRecordList = cspace.recordList(".intake-records-group", prInOpts);

        var prAcqOpts = {
            dataContext: {
                options: {
                    recordType: "acquisition"
                }
            },
            uiSpecUrl: isLocal ?
		    "./uispecs/acquisition/find-edit.json" : "../../chain/acquisition/uispec/find-edit"};
        if (isLocal) {
            prAcqOpts.dataContext = {
                type: "cspace.dataContext",
                options: {
                    baseUrl: "data",
                    recordType: "acquisition",
                    fileExtension: ".json"
                }
            };
        }
        var procAcquisitionRecordList = cspace.recordList(".acquisition-records-group", prAcqOpts);
    };

}) (jQuery);
