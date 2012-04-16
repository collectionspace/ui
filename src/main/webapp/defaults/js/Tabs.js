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
    
    fluid.defaults("cspace.tabsList", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        finalInitFunction: "cspace.tabsList.finalInit",
        mergePolicy: {
            model: "replace"
        },
        strings: { },
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
        protoTree: {
            expander: {
                repeatID: "tab:",
                tree: {
                    tabLink: {
                        target: "${{tabInfo}.href}",
                        linktext: {
                            messagekey: "${{tabInfo}.title}"
                        }
                    }
                },
                type: "fluid.renderer.repeat",
                pathAs: "tabInfo",
                controlledBy: "tabs"
            }
        },
        renderOnInit: true,
        styles: {
            tabList: "menu-record", // TODO: This needs to be moved to "cs-tabs-tabList" style,
            tab: "cs-tabs-tab",
            tabLink: "cs-tabs-tab-link",
            "tablist-primary": "primary", // TODO: This needs to be moved to "cs-tabs-primary" style,
            current: "current", // TODO: This needs to be moved to "cs-tabs-current" style,
            inactive: "inactive" // TODO: This needs to be moved to "cs-tabs-inactive" style
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/TabsTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        }
    });
    
    cspace.tabsList.finalInit = function (that) {
        var styles = that.options.styles;
        var tabLinks = that.locate("tabLink");
        that.locate("tabList").addClass(styles.tabList);
        tabLinks.filter(":not([href])").addClass(styles.inactive);
        var primary = fluid.find(that.model.tabs, function (tab) {
            if (tab["name"] === "tablist-primary") {
                return tab;
            }
        });
        if (!primary) {
            primary = fluid.find(that.model.tabs, function (tab) {
                return tab;
            });
        }
        var primaryHrefFilter = "[href='" + primary.href + "']";
        tabLinks.filter(primaryHrefFilter).addClass(styles.primary).addClass(styles.current);
    };
    
    cspace.tabsList.buildModel = function (options, records) {
        var urlExpander = fluid.invoke("cspace.urlExpander");
        var model = {
            tabs: [{
                "name": "tablist-primary",
                href: "#primaryTab",
                title: "tablist-primary"
            }]
        };
        fluid.each(records, function (record) {
            model.tabs.push({
                "name": record,
                title: record + "-tab",
                href: urlExpander(options.href)
            });
        });
        return model;
    };
    
    cspace.tabsList.buildAdminModel = function (options, records) {
        var urlExpander = fluid.invoke("cspace.urlExpander");
        var model = {
            tabs: []
        };
        fluid.each(records, function (record) {
            model.tabs.push({
                "name": record + "-tab",
                title: record + "-tab",
                type: record,
                href: fluid.stringTemplate(urlExpander(options.href), {
                    recordType: record
                })
            });
        });
        return model;
    };

    fluid.defaults("cspace.tabs", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "cspace.tabs.postInit",
        finalInitFunction: "cspace.tabs.finalInit",
        components: {
            globalNavigator: "{globalNavigator}",
            tabsList: {
                type: "cspace.tabsList"
            }
        },
        invokers: {
            tabify: {
                funcName: "cspace.tabs.tabify",
                args: "{tabs}"
            },
            setupTab: "cspace.tabs.setupTab",
            tabsSuccess: "cspace.tabs.tabsSuccess",
            tabsSelect: "cspace.tabs.tabsSelect",
            tabsSelectWrapper: "cspace.tabs.tabsSelectWrapper",
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        },
        configURLTemplate: "%webapp/config/%record-tab.json",
        selectors: {
            tabs: ".csc-tabs-container",
            tabsList: ".csc-tabs-tabsList-container",
            tab: ".csc-relatedRecordsTab",
            prev: ".stPrev",
            next: ".stNext"
        },
        mergePolicy: {
            model: "preserve",
            applier: "nomerge",
            globalSetup: "nomerge"
        },
        globalSetup: "{globalSetup}"
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
    
    cspace.tabs.postInit = function (that) {
        if (that.options.primaryRecordType) {
            fluid.staticEnvironment.cspaceRecordType = fluid.typeTag("cspace." + that.options.primaryRecordType);
        }
    };
    
    cspace.tabs.finalInit = function (that) {
        that.tabify();
    };
    
    cspace.tabs.tabsSuccess = function (data, textStatus, XMLHttpRequest, tabsList, tabContainer, setupTab) {
        var tabModel = fluid.find(tabsList.model.tabs, findStrategy(tabContainer.tabs('option', 'selected')));
        setupTab(tabModel.type || tabModel["name"]);
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
    
    cspace.tabs.setupAdminTab = function (tabName, that) {
        var options = that.options;
        var urlExpander = fluid.invoke("cspace.urlExpander");
        options.globalSetup.init(fluid.model.composeSegments("cspace", tabName), {
            configURL: fluid.stringTemplate(urlExpander(options.configURLTemplate), {record: tabName})
        });
    };
    
    cspace.tabs.tabsSelect = function (ui, tabsList, selectors, tabContainer) {
        var recordType = fluid.find(tabsList.model.tabs, findStrategy(ui.index))["name"]
        $(ui.panel).addClass(selectors.tab.substr(1) + "-" + recordType);
        tabContainer.tabs("select", ui.index);
    };
    
    cspace.tabs.tabsSelectWrapper = function (event, ui, globalNavigator, tabsList, styles, tabsSelect) {
        // noPrevent environment is set when user selects an option on the dialog
        // at the point we don't want the dialog to show again.
        if (!fluid.resolveEnvironment("{noPrevent}", {fetcher: fluid.makeEnvironmentFetcher()})) {
            globalNavigator.events.onPerformNavigation.fire(function () {
                tabsList.locate("tabLink").removeClass(styles.current);
                $(ui.tab).addClass(styles.current);
                // set the noPrevent environment and trigger the select on the tab.
                fluid.withEnvironment({
                    noPrevent: true
                }, function () {
                    tabsSelect(ui);
                });
            });
            return false;
        }
    };
    
    cspace.tabs.tabify = function (that) {
        that.locate("tabs").tabs({
            tabTemplate: "<li><a href='#{href}'>#{label}</a></li>",
            spinner: null,
            cache: true,
            ajaxOptions: {
                // This is required as of jQuery UI v1.8.12
                dataType: "html",
                success: that.tabsSuccess,
                error: cspace.util.provideErrorCallback(that, "", "errorFetching")
            },
            select: that.tabsSelectWrapper
        }).scrollabletab();
        
        var nav = that.locate("next").add(that.locate("prev"));
        fluid.activatable(nav, function (event) {
            $(event.target).click();
        });
        nav.fluid("tabbable");
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.tabsList");
    
})(jQuery, fluid);
