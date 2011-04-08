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
        that.renderer.refreshView();
        cspace.tabsList.stylefy(that);
    };
    
    cspace.tabsList = function (container, options) {
        var that = fluid.initRendererComponent("cspace.tabsList", container, options);
        fluid.initDependents(that);
        setupTabList(that);
        return that;
    };
    
    cspace.tabsList.stylefy = function (that) {
        var styles = that.options.styles;
        var tabLinks = that.locate("tabLink");
        that.locate("tabList").addClass(styles.tabList);
        tabLinks.filter(":not([href])").addClass(styles.inactive);
        var primary = fluid.find(that.model.tabs, function (tab) {
            if (tab["name"] === "primary") {
                return tab;
            }
        });
        var primaryHrefFilter = "[href='" + primary.href + "']";
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
    
    cspace.tabsList.buildModel = function (options, records) {
        var urlExpander = fluid.invoke("cspace.urlExpander");
        var model = {
            tabs: [{
                "name": "primary",
                href: "#primaryTab"
            }]
        };
        fluid.each(records, function (record) {
            model.tabs.push({
                "name": record,
                href: urlExpander(options.href)
            });
        });
        return model;
    };
    
    fluid.defaults("cspace.tabsList", {
        gradeNames: ["fluid.IoCRendererComponent"],
        mergePolicy: {
            model: "replace"
        },
        strings: {
            primary: "Current record"
        },
        parentBundle: "{globalBundle}",
        model: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.modelBuilder",
                args: {
                    related: "nonVocabularies",
                    resolver: "{permissionsResolver}",
                    recordTypeManager: "{recordTypeManager}",
                    permission: "list",
                    href: "%webapp/html/pages/RelatedRecordsTabTemplate.html",
                    callback: "cspace.tabsList.buildModel"
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
        // Place model and applier somewhere accessible by the tab's
        // pageBuilder which is in it's grand parent globalSetup.
        that.options.globalSetup.model = options.model;
        that.options.globalSetup.applier = options.applier;
        that.options.globalSetup.init("cspace.tab", {
            pageBuilder: {
                options: {
                    model: "{globalSetup}.model",
                    applier: "{globalSetup}.applier",
                    related: tabName,
                    primary: options.primaryRecordType
                }
            },
            configURL: fluid.stringTemplate(urlExpander(options.configURLTemplate), {record: tabName})
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

    fluid.defaults("cspace.tabs", {
        gradeNames: ["fluid.viewComponent"],
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
            applier: "nomerge",
            globalSetup: "nomerge"
        },
        globalNavigator: "{globalNavigator}",
        globalSetup: "{globalSetup}"
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.tabsList");
    
})(jQuery, fluid);
