/*
Copyright 2009-2010 University of Toronto
Copyright 2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

cspace = cspace || {};

(function ($) {

    cspace.organizationSetup = function () {

        var tabOpts = {
            tabList: [
                {name: "Organization Name Authority", target: "#primaryTab"}/*,
                {name: "Contact Information", target: null}*/
            ]
        };
        var tbOpts = {
            uispec: "{pageBuilder}.uispec.titleBar"
        };
        var reOpts = {
            selectors: {identificationNumber: ".csc-organizationAuthority-displayName"},
            strings: {identificationNumberRequired: "Please specify a Display Name"}
        };
        var sbOpts = {
            uispec: "{pageBuilder}.uispec.sidebar"
        };

        var dependencies = {
            titleBar: {
                funcName: "cspace.titleBar",
                args: [".csc-organizationAuthority-titleBar-template", "{pageBuilder}.applier", tbOpts]
            },
            tabs: {
                funcName: "cspace.tabs",
                args: [".csc-tabs-template", "{pageBuilder}.applier", tabOpts]
            },
            recordEditor: {
                funcName: "cspace.recordEditor",
                args: [".csc-organizationAuthority-template", "{pageBuilder}.dataContext",
                	"{pageBuilder}.applier", "{pageBuilder}.uispec.recordEditor", reOpts]
            },
            sidebar: {
                funcName: "cspace.sidebar",
                args: [".csc-sidebar", "{pageBuilder}.applier", sbOpts]
            }
        };
        var options = {
            dataContext: {
                options: {
                    recordType: "organization",
                    baseUrl: "../../chain/vocabularies"
                }
            },
            pageSpec: {
                tabs: {
                    href: "tabsTemplate.html",
                    templateSelector: ".csc-tabs-template",
                    targetSelector: ".csc-tabs-container"
                },
                header: {
                    href: "header.html",
                    templateSelector: ".csc-header-template",
                    targetSelector: ".csc-header-container"
                },
                titleBar: {
                    href: "organizationTitleBar.html",
                    templateSelector: ".csc-organizationAuthority-titleBar-template",
                    targetSelector: ".csc-header-container"
                },
                recordEditor: {
                    href: "organizationTemplate.html",
                    templateSelector: ".csc-organizationAuthority-template",
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
            pageType: "organization"
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
    
})(jQuery);

