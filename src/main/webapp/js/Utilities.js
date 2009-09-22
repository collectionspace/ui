/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_1*/

var cspace = cspace || {};

(function ($, fluid) {

    cspace.util = {};

    cspace.util.getUrlParameter = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results === null) {
            return "";
        } else {
            return results[1];
        }
    };

    cspace.util.setupTestDataContext = function (recordType) {
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
                                    "*": "data/"+recordType+"/%recordId",
                                    "spec": "schemas/"+recordType+"/schema"
                                },
                                replacements: {
                                    "recordId": "csid"
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    // This is a temporary function, in place only until the ID service is accessible
    // through the APP layer.
    cspace.util.newID = function (model, idField, alternateFields) {
        var id = model[idField];
        
        if (!id || (id === "")) {
            for (var i = 0; i < alternateFields.length; i++) {
                if (model[alternateFields[i]]) {
                    id = model[alternateFields[i]].split(" ")[0];
                    break;
                }
            }
            if (!id || (id === "")) {
                id = new Date().getTime().toString();
            }
        }
//        if ((!id || (id === "")) && model.accessionNumber) {
//            id = model.accessionNumber.split(" ")[0];
//        }
//        if ((!id || (id === "")) && model.objectTitle) {
//            id = model.objectTitle.split(" ")[0];
//        }
//        if (!id || (id === "")) {
//            id = new Date().getTime().toString();
//        }
        return id;
    };
    
})(jQuery, fluid_1_1);
