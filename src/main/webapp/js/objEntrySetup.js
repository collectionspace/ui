/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery*/

var demo = demo || {};

(function ($) {

     var getUrlParameter = function (name) {
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
    
    demo.setup = function () {
        var objectId = getUrlParameter("objectId");
        var oeOpts = {};
        var raOpts = {};
/*
The CollectionObjectDAO default options are suitable for testing on a local machine.
To configure the demo to run on a particular server, set the baseUrl option to reference
the URL for the application layer, as shown in the following sample:
        var localhostDao = {
            type: "cspace.collectionObjectDAO",
            options: {
                baseUrl: "http://localhost:8080/chain/"
            }
        };
        oeOpts.dao = localhostDao;
        raOpts.dao = localhostDao;
*/

        if (objectId) {
            oeOpts.objectId = objectId;
        }
        var objEntry = cspace.objectEntry(".csc-object-entry-container", oeOpts);
        var recentAct = cspace.recentActivity(".recently-created-container", raOpts);
        
        // connect up the two components to listen to each other's events
        recentAct.events.modelChanged.addListener(function (model) {
            console.log("heard!!");
            document.location = "./objectentry.html?objectId="+model.selected;
        });
        objEntry.events.afterSaveObjectDataSuccess.addListener(function(data, textStatus){
            recentAct.updateModel();
        });
    };
    
})(jQuery);

