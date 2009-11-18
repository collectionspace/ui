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
        var csid = cspace.util.getUrlParameter("csid");
        var oiOpts = {
            alternateFields: ["entryNumber"],
            uiSpecUrl: "./schemas/intake/schema.json",
            templates: {
                body: {
                    url: "../html/IntakeTemplate.html",
                    id: "csc-object-intake-template"
                }
            }
        };
        if (csid) {
            oiOpts.csid = csid;
        }
        if (document.location.protocol === "file:") {
            oiOpts.dataContext = cspace.util.setupTestDataContext("intake");
        }
        var intake = cspace.dataEntry(".csc-object-intake-container", oiOpts);
    };
    
})(jQuery);

