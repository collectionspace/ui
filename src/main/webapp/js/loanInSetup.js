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
    fluid.log("loanInSetup.js loaded");

    /**
     * options: {
     *     pageBuilderOpts: {
     *                    ....
     *     },
     *     sideBarOpts: {
     *                    ....
     *     },
     *     templateUrlPrefix: ""
     * }
     */
    cspace.loanInSetup = function (options) {
        options = options || {};
        
        var tbOpts = {
            uispec: "{pageBuilder}.uispec.titleBar"
        };
        var tabsOpts = {
            tabList: [
                {name: "Loan In", target: "#primaryTab"},
                {name: "Acquisition", target: null},
                {name: "Cataloging", target: "objectTabPlaceholder.html"},
                {name: "Intake", target: null},
                {name: "Loan In - related", target: null},
                {name: "Loan Out", target: null},
                {name: "Location &amp; Movement", target: null},
                {name: "Media", target: null}
            ],
            tabSetups: [
                null, {
                    func: "cspace.objectTabSetup",
                    options: {
                        primaryRecordType: "loanin"
                    }
                }
            ]
        };
        var reOpts = options.recordEditorOpts || {};
        reOpts.selectors = {identificationNumber: ".csc-loanIn-loanInNumber"};
        reOpts.strings = {identificationNumberRequired: "Please specify a Loan In Number"};

        var sbOpts = options.sideBarOpts || {};
        sbOpts.uispec = "{pageBuilder}.uispec.sidebar";
        sbOpts.primaryRecordType = "loanin";
        
        var dependencies = {
            titleBar: {
                funcName: "cspace.titleBar",
                args: [".csc-loanIn-titleBar-template", "{pageBuilder}.applier", tbOpts]
            },
            tabs: {
                funcName: "cspace.tabs",
                args: [".csc-tabs-template", "{pageBuilder}.applier", tabsOpts]
            },
            recordEditor: {
                funcName: "cspace.recordEditor",
                args: [".csc-loanIn-template", "{pageBuilder}.dataContext", 
                	"{pageBuilder}.applier", "{pageBuilder}.uispec.recordEditor", reOpts]
            },
            sidebar: {
                funcName: "cspace.sidebar",
                args: [".csc-sidebar", "{pageBuilder}.applier", sbOpts]
            }
        };
        
        var fullUrl = function (templateName) {
            return options.templateUrlPrefix ? options.templateUrlPrefix + templateName : templateName;
        };
            
        var pageBuilderOpts = options.pageBuilderOpts || {};
        pageBuilderOpts.dataContext = {
            options: {
                recordType: "loanin"
            }
        };
        
        pageBuilderOpts.pageSpec = {
            header: {
                href: fullUrl("header.html"),
                templateSelector: ".csc-header-template",
                targetSelector: ".csc-header-container"
            },
            titleBar: {
                href: fullUrl("loanInTitleBar.html"),
                templateSelector: ".csc-loanIn-titleBar-template",
                targetSelector: ".csc-loanIn-titleBar-container"
            },
            tabs: {
                href: fullUrl("tabsTemplate.html"),
                templateSelector: ".csc-tabs-template",
                targetSelector: ".csc-tabs-container"
            },
            dateEntry: {
                href: fullUrl("loanInTemplate.html"),
                templateSelector: ".csc-loanIn-template",
                targetSelector: ".csc-record-edit-container"
            },
            sidebar: {
                href: fullUrl("right-sidebar.html"),
                templateSelector: ".csc-right-sidebar",
                targetSelector: ".csc-sidebar-container"
            },
            footer: {
                href: fullUrl("footer.html"),
                templateSelector: ".csc-footer",
                targetSelector: ".csc-footer-container"
            }
        };
        
        pageBuilderOpts.pageType = "loanin";

        var csid = cspace.util.getUrlParameter("csid");
        if (csid) {
            pageBuilderOpts.csid = csid;
        }
        if (cspace.util.useLocalData()) {
            pageBuilderOpts.dataContext.options.baseUrl = "data";
            pageBuilderOpts.dataContext.options.fileExtension = ".json";
        }
        
        return cspace.pageBuilder(dependencies, pageBuilderOpts);
    };
    
})(jQuery);

