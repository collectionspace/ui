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

    cspace.loanOutSetup = function (options) {
        fluid.log("loanOutSetup.js loaded");

        options = options || {};
        var tbOpts = {
            uispec: "{pageBuilder}.uispec.titleBar"
        };
        $.extend(true, tbOpts, options.titleBarOpts);

        var tabsOpts = {
            tabList: [
                {name: "Loan Out", target: "#primaryTab"},
                {name: "Acquisition", target: null},
                {name: "Cataloging", target: cspace.util.fullUrl(options.templateUrlPrefix, "objectTabPlaceholder.html")},
                {name: "Intake", target: null},
                {name: "Loan In", target: null},
                {name: "Loan Out - related", target: null},
                {name: "Location &amp; Movement", target: cspace.util.fullUrl(options.templateUrlPrefix, "movementTab.html")},
                {name: "Media", target: null}
            ],
            tabSetups: [
                null, {
                    func: "cspace.tabSetup",
                    options: {
                        primaryRecordType: "{pageBuilder}.options.pageType",
                        configURL: "./config/object-tab.json"
                    }
                },
                {
                    func: "cspace.tabSetup",
                    options: {
                        primaryRecordType: "{pageBuilder}.options.pageType",
                        configURL: "./config/movement-tab.json"
                    } 
                }
            ]
        };
        $.extend(true, tabsOpts, options.tabsOpts);

        var reOpts = {
            selectors: {identificationNumber: ".csc-loanOut-loanOutNumber"},
            strings: {identificationNumberRequired: "Please specify a Loan Out Number"}
        };
        $.extend(true, reOpts, options.recordEditorOpts);

        var sbOpts = {
            uispec: "{pageBuilder}.uispec.sidebar",
            primaryRecordType: "{pageBuilder}.options.pageType"
        };
        $.extend(true, sbOpts, options.sideBarOpts);
        
        var dependencies = {
            titleBar: {
                funcName: "cspace.titleBar",
                args: [".csc-loanOut-titleBar-template", "{pageBuilder}.applier", tbOpts]
            },
            tabs: {
                funcName: "cspace.tabs",
                args: [".csc-tabs-template", "{pageBuilder}.applier", tabsOpts]
            },
            recordEditor: {
                funcName: "cspace.recordEditor",
                args: [".csc-loanOut-template", "{pageBuilder}.dataContext", 
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
                    recordType: "loanout"
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
                href: cspace.util.fullUrl(options.templateUrlPrefix, "loanOutTitleBar.html"),
                templateSelector: ".csc-loanOut-titleBar-template",
                targetSelector: ".csc-loanOut-titleBar-container"
            },
            tabs: {
                href: cspace.util.fullUrl(options.templateUrlPrefix, "tabsTemplate.html"),
                templateSelector: ".csc-tabs-template",
                targetSelector: ".csc-tabs-container"
            },
            dateEntry: {
                href: cspace.util.fullUrl(options.templateUrlPrefix, "loanOutTemplate.html"),
                templateSelector: ".csc-loanOut-template",
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
        pageBuilderOpts.pageType = "loanout"
        $.extend(true, pageBuilderOpts, options.pageBuilderOpts);

        var csid = cspace.util.getUrlParameter("csid");
        if (csid) {
            pageBuilderOpts.csid = csid;
        }

        return cspace.pageBuilder(dependencies, pageBuilderOpts);
    };
    
})(jQuery);

