/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var demo = demo || {};

(function ($) {

    demo.setup = function () {
        var objectId = cspace.util.getUrlParameter("objectId");
        var oeOpts = {};
        if (objectId) {
            oeOpts.objectId = objectId;
        }
        if (document.location.protocol === "file:") {
            oeOpts.dataContext = cspace.util.setupTestDataContext("collection-object");
        }
        var objEntry = cspace.dataEntry(".csc-object-entry-container", oeOpts);

        var initRecentActivity = function (oe) {
            return function () {
                var raOpts = {
                    dataContext: {
                        type: "cspace.resourceMapperDataContext",
                        options: {
                            modelToResourceMap: {
                                "*": "/objects"
                            }
                        }
                    }
                };
                var recentAct = cspace.recentActivity(".recently-created-container", raOpts);
                
                // connect up the two components to listen to each other's events
                recentAct.events.modelChanged.addListener(function (model) {
                    document.location = "./objectentry.html?objectId=" + model.selected;
                });
                oe.events.afterCreateObjectDataSuccess.addListener(function (data, textStatus) {
                    recentAct.updateModel();
                });
            };
        };
        
        objEntry.events.pageRendered.addListener(initRecentActivity(objEntry));
    };
    
})(jQuery);

