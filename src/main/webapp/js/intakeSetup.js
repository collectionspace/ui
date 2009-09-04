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
    
    setupTestDataContext = function () {
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
                                    "*": "data/intake/%recordId",
                                    "spec": "schemas/intake/schema"
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

    demo.setup = function () {
        var objectId = getUrlParameter("objectId");
        var oiOpts = {
            uiSpecUrl: "./schemas/intake/schema.json",
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
        if (document.location.protocol === "file:") {
            oiOpts.dataContext = setupTestDataContext();
        }
        var intake = cspace.dataEntry(".csc-object-intake-container", oiOpts);

        var initRecentActivity = function (oe) {
            return function () {
                var raOpts = {
                    dataContext: {
                        type: "cspace.resourceMapperDataContext",
                        options: {
                            modelToResourceMap: {
                                "*": "/intake"
                            }
                        }
                    }
                };
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
        
        intake.events.pageRendered.addListener(initRecentActivity(intake));
    };
    
})(jQuery);

