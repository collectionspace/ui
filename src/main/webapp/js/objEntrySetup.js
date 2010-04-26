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

        var tbOpts = {
            uispec: "{pageBuilder}.uispec.titleBar"
        };
        var tabsOpts = {
            setupFuncs: [null, "cspace.objectTabSetup"]
        };
        var reOpts = {
            dataContext: "{pageBuilder}.dataContext",
            uispec: "{pageBuilder}.uispec.recordEditor",
            selectors: {identificationNumber: ".csc-object-identification-object-number"},
            strings: {identificationNumberRequired: "Please specify an Identification Number"}
        };
        var sbOpts = {
            uispec: "{pageBuilder}.uispec.sidebar",
            currentRecordType: "objects"
        };

        var dependencies = {
            titleBar: {
                funcName: "cspace.titleBar",
                args: [".csc-object-entry-template", "{pageBuilder}.applier", tbOpts]
            },
            tabs: {
                funcName: "cspace.tabs",
                args: [".csc-tabs-template", "{pageBuilder}.applier", tabsOpts]
            },
            recordEditor: {
                funcName: "cspace.recordEditor",
                args: [".csc-object-entry-template", "{pageBuilder}.applier", reOpts]
            },
            sidebar: {
                funcName: "cspace.sidebar",
                args: [".csc-sidebar", "{pageBuilder}.applier", sbOpts]
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
            },
            pageType: (cspace.util.isLocal()? "collection-object":"objects")
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

})(jQuery);

