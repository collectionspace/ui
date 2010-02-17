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

    cspace.intakeSetup = function () {

        var setUpPage = function () {
            var tbOpts = {
                applier: "{pageBuilder}.applier",
                uispec: "{pageBuilder}.uispec.titleBar"
            };
            var deOpts = {
                dataContext: "{pageBuilder}.dataContext",
                applier: "{pageBuilder}.applier",
                uispec: "{pageBuilder}.uispec.dataEntry"
            };
            var sbOpts = {
                relations: "{pageBuilder}.model.relations",
                termsUsed: "{pageBuilder}.model.termsUsed",
                uispec: "{pageBuilder}.uispec.sidebar"
            }
    
            var dependencies = {
                titleBar: {
                    funcName: "cspace.titleBar",
                    args: [".csc-object-intake-titleBar-template", tbOpts]
                },
                dataEntry: {
                    funcName: "cspace.dataEntry",
                    args: [".csc-object-intake-template", deOpts]
                },
                sidebar: {
                    funcName: "cspace.sidebar",
                    args: [".csc-sidebar", sbOpts]
                }
            };
            var options = {
                dataContext: {
                    options: {
                        recordType: "intake"
                    }
                },
                pageSpec: {
                    titleBar: {
                        href: "IntakeTitleBar.html",
                        templateSelector: ".csc-object-intake-titleBar-template",
                        targetSelector: ".csc-object-intake-titleBar-container"
                    },
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
                    cspace.pageBuilder.uispec = data;
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

