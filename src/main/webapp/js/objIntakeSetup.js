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
        var oiOpts = {
            uiSpecUrl: "./intake/schema/schema.json",
            templates: {
                body: {
                    url: "../html/IntakeTemplate.html",
                    id: "csc-object-intake-template"
                }
            }
        };
        if (objectId) {
            oiOpts.objectId = objectId;
        }

/*
This code configures the demo to work with the chain app running at localhost:8080
To configure the demo to work with the app layer at a different URL, modify the various URLS and
URL bits below appropriately.
To configure the demo to run off your local hard drive (i.e. without a server, comment out the
code between this comment and the ==== below.
        var localhostDao = {
            type: "cspace.collectionObjectDAO",
            options: {
                baseUrl: "http://localhost:8080/chain/"
            }
        };
        oiOpts.dao = localhostDao;
        oiOpts.dataContext = {
            type: "cspace.resourceMapperDataContext",
            options: {
                protocol: "http://",
                baseUrl: "localhost:8080/chain/",
                includeResourceExtension: false
            }
        };
*/
// ======================

        var intake = cspace.dataEntry(".csc-object-intake-container", oiOpts);
/*
The 'Recent Activity' functionality does not work on the local file system, so if you're testing
locally, comment out the following code (i.e. to the end of this setup function)
        var recentActivitySetup = function (oe, dao) {
            return function () {
                var raOpts = {};
                raOpts.dao = dao;
                var recentAct = cspace.recentActivity(".recently-created-container", raOpts);
                
                // connect up the two components to listen to each other's events
                recentAct.events.modelChanged.addListener(function (model) {
                    document.location = "./intake.html?objectId=" + model.selected;
                });
                oe.events.afterCreateObjectDataSuccess.addListener(function (data, textStatus) {
                    recentAct.updateModel();
                });
            };
        };
        
        intake.events.pageRendered.addListener(recentActivitySetup(intake, localhostDao));
*/
    };
    
})(jQuery);

