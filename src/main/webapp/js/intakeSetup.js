/*
Copyright 2009-2010 University of Toronto
Copyright 2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

cspace = cspace || {};

(function ($) {

    cspace.intakeSetup = function () {

        var tbOpts = {
            uispec: "{pageBuilder}.uispec.titleBar"
        };
        var reOpts = {
            selectors: {identificationNumber: ".csc-intake-entry-number"},
            strings: {identificationNumberRequired: "Please specify an Intake Entry Number"}
        };
        var tabsOpts = {
            tabList: [
				{name: "Intake", target: "#primaryTab"},
                {name: "Acquisition", target: null},
                {name: "Cataloging", target: "objectTabPlaceholder.html"},
                {name: "Intake - related", target: null},
                {name: "Loan In", target: null},
                {name: "Loan Out", target: null},
                {name: "Location &amp; Movement", target: null},
                {name: "Media", target: null}
            ],
            tabSetups: [
                null, {
                    func: "cspace.objectTabSetup",
                    options: {
                        primaryRecordType: "intake"
                    }
                }
            ]
        };
        var sbOpts = {
            uispec: "{pageBuilder}.uispec.sidebar",
            primaryRecordType: "intake"
        };

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
        var options = {
            dataContext: {
                options: {
                    recordType: "intake"
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
                    href: "IntakeTitleBar.html",
                    templateSelector: ".csc-object-intake-titleBar-template",
                    targetSelector: ".csc-object-intake-titleBar-container"
                },
                recordEditor: {
                    href: "IntakeTemplate.html",
                    templateSelector: ".csc-object-intake-template",
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
            pageType: "intake"
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

