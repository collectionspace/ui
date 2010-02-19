/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

cspace = cspace || {};

(function ($) {

    cspace.objectSetup = function () {

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
                    args: [".csc-object-entry-template", tbOpts]
                },
                tabs: {
                    funcName: "cspace.tabs",
                    args: [".csc-tabs-template"]
                },
                dataEntry: {
                    funcName: "cspace.dataEntry",
                    args: [".csc-object-entry-template", deOpts]
                },
                sidebar: {
                    funcName: "cspace.sidebar",
                    args: [".csc-sidebar", sbOpts]
                }
            };
            var options = {
                dataContext: {
                    options: {
                        recordType: "objects"
                    }
                },
                pageSpec: {
                    header: {
                        href: "header.html",
                        templateSelector: ".csc-header-template",
                        targetSelector: ".csc-header-container"
                    },
                    tabs: {
                        href: "tabsTemplate.html",
                        templateSelector: ".csc-tabs-template",
                        targetSelector: ".csc-tabs-container"
                    },
                    titleBar: {
                        href: "ObjectTitleBar.html",
                        templateSelector: ".csc-object-entry-titleBar-template",
                        targetSelector: ".csc-object-entry-titleBar-container"
                    },
                    dateEntry: {
                        href: "ObjectEntryTemplate.html",
                        templateSelector: ".csc-object-entry-template",
                        targetSelector: ".csc-record-edit-container"
                    },
                    sidebar: {
                        href: "right-sidebar.html",
                        templateSelector: ".csc-right-sidebar",
                        targetSelector: ".csc-sidebar-container"
                    },
                    footer: {
                        href: "footer.html",
                        templateSelector: ".csc-footer",
                        targetSelector: ".csc-footer-container"
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

