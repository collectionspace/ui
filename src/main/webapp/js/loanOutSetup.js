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

    cspace.loadOutSetup = function () {

        var tbOpts = {
            uispec: "{pageBuilder}.uispec.titleBar"
        };
        var tabsOpts = {
            tabList: [
                {name: "Loan Out", target: "#primaryTab"},
				{name: "Acquisition", target: null},
				{name: "Cataloging", target: "objectTabPlaceholder.html"},
				{name: "Intake", target: null},
				{name: "Loan In", target: null},
				{name: "Location &amp; Movement", target: null},
				{name: "Media", target: null}
            ],
            setupFuncs: [null, "cspace.objectTabSetup"]
        };
        var reOpts = {
            dataContext: "{pageBuilder}.dataContext",
            uispec: "{pageBuilder}.uispec.recordEditor",
            selectors: {identificationNumber: ".csc-loanOut-loanOutNumber-numberPatternChooser"},
            strings: {identificationNumberRequired: "Please specify a Loan Out Number"}
        };
        var sbOpts = {
            uispec: "{pageBuilder}.uispec.sidebar",
            currentRecordType: "loanout"
        };
        
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
                args: [".csc-loanOut-template", "{pageBuilder}.applier", reOpts]
            },
            sidebar: {
                funcName: "cspace.sidebar",
                args: [".csc-sidebar", "{pageBuilder}.applier", sbOpts]
            }
        };
        var options = {
            dataContext: {
                options: {
                    recordType: "loanout"
                }
            },
            pageSpec: {
                header: {
                    href: "header.html",
                    templateSelector: ".csc-header-template",
                    targetSelector: ".csc-header-container"
                },
                titleBar: {
                    href: "loanoutTitleBar.html",
                    templateSelector: ".csc-loanOut-titleBar-template",
                    targetSelector: ".csc-loanOut-titleBar-container"
                },
                tabs: {
                    href: "tabsTemplate.html",
                    templateSelector: ".csc-tabs-template",
                    targetSelector: ".csc-tabs-container"
                },
                dateEntry: {
                    href: "loanoutTemplate.html",
                    templateSelector: ".csc-loanOut-template",
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
            pageType: "loanOut"
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

