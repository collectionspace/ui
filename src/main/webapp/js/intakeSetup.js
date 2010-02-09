/*
Copyright 2009-2010 University of Toronto
Copyright 2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var demo = demo || {};

(function ($) {

    demo.setup = function () {
        var pageSpec = {
            href: "../html/IntakeTemplate.html",
            templateID: "csc-object-intake-template",
            targetSelector: ".csc-object-intake-container"
        };
        var intake = cspace.dataEntrySetup("intake", pageSpec);
    };

    cspace.intakeSetup = function () {

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
                    args: [".csc-intake", deOpts]
                },
                sidebar: {
                    funcName: "cspace.setupRightSidebar",
                    args: [csid, sbOpts] // should be data as second param
                }
            };
            var options = {
                dataContext: {
                    options: {
                        recordType: "intake"
                    }
                },
                pageSpec: {
                    dateEntry: {
                        href: "IntakeTemplate.html",
                        templateSelector: ".csc-object-intake-template",
                        targetSelector: ".csc-object-intake-container"
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
            }
            cspace.pageBuilder(dependencies, options);
        };

        if (!cspace.pageBuilder || !cspace.pageBuilder.uispec) {
            jQuery.ajax({
                url: "./uispecs/intake/uispec.json",
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

})(jQuery);

