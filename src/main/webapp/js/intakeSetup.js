/*
Copyright 2009-2010 University of Toronto
Copyright 2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global fluid, jQuery, window, cspace*/
"use strict";

cspace = cspace || {};

(function ($) {

    cspace.intakeSetup = function (options) {
        fluid.log("intakeSetup.js loaded");

        options = options || {};
        var tbOpts = {
            uispec: "{pageBuilder}.uispec.titleBar"
        };
        $.extend(true, tbOpts, options.titleBarOpts);

        var reOpts = {
            selectors: {identificationNumber: ".csc-intake-entry-number"},
            strings: {identificationNumberRequired: "Please specify an Intake Entry Number"}
        };
        $.extend(true, reOpts, options.recordEditorOpts);

        var tabsOpts = {
            tabList: [
                {name: "Intake", target: "#primaryTab"},
                {name: "Acquisition", target: null},
                {name: "Cataloging", target: cspace.util.fullUrl(options.templateUrlPrefix, "objectTabPlaceholder.html")},
                {name: "Intake - related", target: null},
                {name: "Loan In", target: null},
                {name: "Loan Out", target: null},
                {name: "Location &amp; Movement", target: null},
                {name: "Media", target: null}
            ],
            tabSetups: [
                null,   // primary tab
                {       // first active tab: cataloging
                    func: "cspace.tabSetup",
                    options: {
                        primaryRecordType: "intake",
                        configURL: "./config/object-tab.json"
                    }
                }
            ]
        };
        $.extend(true, tabsOpts, options.tabsOpts);

        var sbOpts = {
            uispec: "{pageBuilder}.uispec.sidebar",
            primaryRecordType: "intake"
        };
        $.extend(true, sbOpts, optinos.sideBarOpts);

        var dependencies = {
            titleBar: {
                funcName: "cspace.titleBar",
                args: [".csc-object-intake-titleBar-template", "{pageBuilder}.applier", tbOpts]
            },
            tabs: {
                funcName: "cspace.tabs",
                args: [".csc-tabs-template", "{pageBuilder}.applier", tabsOpts]
            },
            recordEditor: {
                funcName: "cspace.recordEditor",
                args: [".csc-object-intake-template", "{pageBuilder}.dataContext", 
                    "{pageBuilder}.applier", "{pageBuilder}.uispec.recordEditor", reOpts]
            },
            sidebar: {
                funcName: "cspace.sidebar",
                args: [".csc-sidebar", "{pageBuilder}.applier", sbOpts]
            }
        };

        var pageBuilderOpts = {
            dataContext:{
                options: {
                    recordType: "intake"
                }
            }
        };
        if (cspace.util.useLocalData()) {
            $.extend(true, pageBuilderOpts, {
                dataContext: {
                    options: {
                        baseUrl: "data",
                        fileExtension: ".json"
                    }
                }
            })
        }
        pageBuilderOpts.pageSpec = {
            header: {
                href: cspace.util.fullUrl(options.templateUrlPrefix, "header.html"),
                templateSelector: ".csc-header-template",
                targetSelector: ".csc-header-container"
            },
            titleBar: {
                href: cspace.util.fullUrl(options.templateUrlPrefix, "IntakeTitleBar.html"),
                templateSelector: ".csc-object-intake-titleBar-template",
                targetSelector: ".csc-object-intake-titleBar-container"
            },
            tabs: {
                href: cspace.util.fullUrl(options.templateUrlPrefix, "tabsTemplate.html"),
                templateSelector: ".csc-tabs-template",
                targetSelector: ".csc-tabs-container"
            },
            recordEditor: {
                href: cspace.util.fullUrl(options.templateUrlPrefix, "IntakeTemplate.html"),
                templateSelector: ".csc-object-intake-template",
                targetSelector: ".csc-record-edit-container"
            },
            sidebar: {
                href: cspace.util.fullUrl(options.templateUrlPrefix, "right-sidebar.html"),
                templateSelector: ".csc-right-sidebar",
                targetSelector: ".csc-sidebar-container"
            },
            footer: {
                href: cspace.util.fullUrl(options.templateUrlPrefix, "footer.html"),
                templateSelector: ".csc-footer",
                targetSelector: ".csc-footer-container"
            }
        };
        pageBuilderOpts.pageType = "intake";
        $.extend(true, pageBuilderOpts, options.pageBuilderOpts);
        
        var csid = cspace.util.getUrlParameter("csid");
        if (csid) {
            pageBuilderOpts.csid = csid;
        }
        
        return cspace.pageBuilder(dependencies, pageBuilderOpts);
    };

})(jQuery);

