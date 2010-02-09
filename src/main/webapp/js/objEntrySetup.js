/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var demo = demo || {};

(function ($) {

    cspace.objectSetup = function () {

        var setUpPage = function () {
            var deOpts = {
                dataContext: "{pageBuilder}.dataContext",
                applier: "{pageBuilder}.applier",
                uispec: "{pageBuilder}.uispec"
            };
            var sbOpts = {
                applier: "{pageBuilder}.applier",
                model: "{pageBuilder}.model.relations"
            }
    
            var dependencies = {
                dataEntry: {
                    funcName: "cspace.dataEntry",
                    args: [".csc-object-entry", deOpts]
                },
                sidebar: {
                    funcName: "cspace.setupRightSidebar",
                    args: [csid, sbOpts] // should be data as second param
                }
            };
            var options = {
                dataContext: {
                    options: {
                        recordType: "objects"
                    }
                },
                pageSpec: {
                    dateEntry: {
                        href: "ObjectEntryTemplate.html",
                        templateSelector: ".csc-object-entry-template",
                        targetSelector: ".csc-object-entry-container"
                    },
                    sidebar: {
                        href: "right-sidebar.html",
                        templateSelector: ".csc-right-sidebar",
                        targetSelector: ".csc-sidebar-container"
                    }
                }
            };
            var csid = cspace.util.getUrlParameter("csid");
            if (csid) {
                options.csid = csid;
            }
            if (cspace.util.isLocal()) {
                options.dataContext.options.baseUrl = "data";
                options.dataContext.options.fileExtension = ".json";
                // CSPACE-701
                options.dataContext.options.recordType = "collection-object";
            }
            cspace.pageBuilder(dependencies, options);
        };

        if (!cspace.pageBuilder || !cspace.pageBuilder.uispec) {
            jQuery.ajax({
                url: "./uispecs/collection-object/uispec.json",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    cspace.pageBuilder.uispec = data;
                    setUpPage();
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log("EROR!");
                }
            });
        } else {
            setUpPage();
        }
    };
})(jQuery);

