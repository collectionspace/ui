/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("Tabs.js loaded");

    var setupTabList = function (that) {
        cspace.tabsList.fixupModel(that.model, that.options);
        that.renderer.refreshView();
        cspace.tabsList.stylefy(that);
    };
    
    cspace.tabsList = function (container, options) {
        var that = fluid.initRendererComponent("cspace.tabsList", container, options);
        fluid.initDependents(that);
        setupTabList(that);
        return that;
    };
    
    cspace.tabsList.fixupModel = function (model, options) {
        var urlExpander = fluid.invoke("cspace.urlExpander");
        fluid.each(model.tabs, function (tab, tabName) {
            tab["name"] = tabName;
            if (tab.href) {
                tab.href = urlExpander(tab.href);
            }
        });
    };
    
    cspace.tabsList.stylefy = function (that) {
        var styles = that.options.styles;
        var tabLinks = that.locate("tabLink");
        that.locate("tabList").addClass(styles.tabList);
        tabLinks.filter(":not([href])").addClass(styles.inactive);
        var primaryHrefFilter = "[href='" + that.options.model.tabs.primary.href + "']";
        tabLinks.filter(primaryHrefFilter).addClass(styles.primary).addClass(styles.current);
    };
    
    cspace.tabsList.produceTree = function () {
        return {
            expander: {
                repeatID: "tab:",
                tree: {
                    tabLink: {
                        target: "${{tabInfo}.href}",
                        linktext: {
                            messagekey: "${{tabInfo}.name}"
                        }
                    }
                },
                type: "fluid.renderer.repeat",
                pathAs: "tabInfo",
                controlledBy: "tabs"
            }
        };
    };
    
    cspace.tabsList.censorModel = function (model, records) {
        fluid.remove_if(model.tabs, function (tab, key) {
            return key !== "primary" && $.inArray(key, records) < 0;
        });
        return model;
    };
    
    fluid.defaults("cspace.tabsList", {
        mergePolicy: {
            model: "replace"
        },
        strings: {
            primary: "Current record",
            acquisition: "Acquisition",
            cataloging: "Cataloging",
            intake: "Intake",
            loanin: "Loan In",
            loanout: "Loan Out",
            movement: "Location & Movement",
            media: "Media",
            objectexit: "Object Exit"
        },
        model: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.modelBuilder",
                args: {
                    related: "all",
                    resolver: "{permissionsResolver}",
                    recordTypeManager: "{recordTypeManager}",
                    permission: "list",
                    model: {
                        tabs: {
                            primary: {
                                href: "#primaryTab"
                            },
                            acquisition: {},
                            cataloging: {
                                href: "%webapp/html/pages/RelatedRecordsTabTemplate.html"
                            },
                            intake: {},
                            loanin: {},
                            loanout: {},
                            movement: {
                                href: "%webapp/html/pages/RelatedRecordsTabTemplate.html"
                            },
                            objectexit: {
                                href: "%webapp/html/pages/RelatedRecordsTabTemplate.html"
                            }
                        }
                    },
                    callback: "cspace.tabsList.censorModel"
                }
            }
        },
        selectors: {
            tabList: ".csc-tabs-tabList",
            "tab:": ".csc-tabs-tab",
            tabLink: ".csc-tabs-tab-link"
        },
        selectorsToIgnore: ["tabList"],
        produceTree: cspace.tabsList.produceTree,
        styles: {
            tabList: "menu-record", // TODO: This needs to be moved to "cs-tabs-tabList" style,
            tab: "cs-tabs-tab",
            tabLink: "cs-tabs-tab-link",
            primary: "primary", // TODO: This needs to be moved to "cs-tabs-primary" style,
            current: "current", // TODO: This needs to be moved to "cs-tabs-current" style,
            inactive: "inactive" // TODO: This needs to be moved to "cs-tabs-inactive" style
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/TabsTemplate.html"
            })
        }
    });
    
    var findStrategy = function (index) {
        var i = 0;
        return function (value, key) {
            if (value.href) {
                if (index === i) {
                    return value;
                }
                ++i;
            }
        };
    };
    
    cspace.tabs = function (container, options) {
        var that = fluid.initView("cspace.tabs", container, options);
        
        fluid.staticEnvironment.cspaceRecordType = fluid.typeTag("cspace." + that.options.primaryRecordType);
        
        fluid.initDependents(that);
        cspace.tabs.tabify(that);
        return that;
    };
    
    cspace.tabs.setupTab = function (tabName, that) {
        var options = that.options;
        var urlExpander = fluid.invoke("cspace.urlExpander");
        // Adding globalNavigator to cspace.setup's stack.
        fluid.withNewComponent(that.options.globalSetup, function () {
            cspace.setup("cspace.tabs", {
                model: options.model,
                applier: options.applier,
                related: tabName,
                primary: options.primaryRecordType,
                configURL: fluid.stringTemplate(urlExpander(options.configURLTemplate), {record: tabName})
            });
        });
    };
    
    cspace.tabs.tabify = function (that) {
        var tabsList = that.tabsList;
        var styles = tabsList.options.styles;
        var tabContainer = that.locate("tabs");
        tabContainer.tabs({
            cache: true,
            ajaxOptions: {
                success: function (data, textStatus, XMLHttpRequest) {
                    var tabModel = fluid.find(tabsList.model.tabs, findStrategy(tabContainer.tabs('option', 'selected')));
                    that.setupTab(tabModel["name"]);
                }
            },
            select: function (event, ui) {
                // noPrevent environment is set when user selects an option on the dialog
                // at the point we don't want the dialog to show again.
                if (!fluid.resolveEnvironment("{noPrevent}")) {
                    that.options.globalNavigator.events.onPerformNavigation.fire(function () {
                        tabsList.locate("tabLink").removeClass(styles.current);
                        $(ui.tab).addClass(styles.current);
                        // set the noPrevent environment and trigger the select on the tab.
                        fluid.withEnvironment({
                            noPrevent: true
                        }, function () {
                            var recordType = fluid.find(tabsList.model.tabs, findStrategy(ui.index))["name"]
                            $(ui.panel).addClass(that.options.selectors.tab.substr(1) + "-" + recordType);
                            tabContainer.tabs("select", ui.index);
                        });
                    });
                    return false;
                }
            }
        });
    };
    
    cspace.tabs.provideAuthorityTabsList = function (container, options) {
        var that = fluid.initLittleComponent("cspace.tabs.provideAuthorityTabsList", options);
        return cspace.tabsList(container, that.options);
    };
    
    fluid.defaults("cspace.tabs.provideAuthorityTabsList", {
        strings: {
            primary: "Current record"
        },
        model: {
            tabs: {
                primary: {
                    href: "#primaryTab"
                }
            }
        }
    });
    
    fluid.demands("tabsList", ["cspace.tabs", "cspace.person"], {
        funcName: "cspace.tabs.provideAuthorityTabsList",
        args: ["{tabs}.dom.tabsList", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("tabsList", ["cspace.tabs", "cspace.organization"], {
        funcName: "cspace.tabs.provideAuthorityTabsList",
        args: ["{tabs}.dom.tabsList", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("tabsList", ["cspace.tabs"], ["{tabs}.dom.tabsList", fluid.COMPONENT_OPTIONS]);

    fluid.defaults("cspace.tabs", {
        components: {
            tabsList: {
                type: "cspace.tabsList"
            }
        },
        invokers: {
            setupTab: {
                funcName: "cspace.tabs.setupTab",
                args: ["@0", "{tabs}"]
            }
        },
        configURLTemplate: "%webapp/config/%record-tab.json",
        selectors: {
            tabs: ".csc-tabs-container",
            tabsList: ".csc-tabs-tabsList-container",
            tab: ".csc-relatedRecordsTab"
        },
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        globalNavigator: "{globalNavigator}",
        globalSetup: "{globalSetup}"
    });
    
    fluid.demands("tabs", "cspace.pageBuilder", {
        args: ["{pageBuilder}.options.selectors.tabs", {
            primaryRecordType: "{pageBuilder}.options.pageType",
            applier: "{pageBuilder}.applier",
            model: "{pageBuilder}.model"
        }]
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.tabsList");
    
})(jQuery, fluid);
