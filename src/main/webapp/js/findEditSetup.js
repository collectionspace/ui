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

    cspace.setupFindEdit = function () {
        var objRecordList = cspace.recordList(".object-records-group", {uiSpecUrl: "./find-edit/spec/spec-objects.json"});
        var procRecordList = cspace.recordList(".procedural-records-group", {uiSpecUrl: "./find-edit/spec/spec-procedures.json"});
    };

}) (jQuery);
