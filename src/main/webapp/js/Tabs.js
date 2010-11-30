/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid*/

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("Tabs.js loaded");

    var setupTabList = function (that) {
        cspace.tabsList.fixupModel(that.model, that.options);
        that.refreshView();
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
    
    cspace.tabsList.refreshView = function (that) {
        var tree = that.treeBuilder();
        that.render(tree);
    };
    
    cspace.tabsList.modelToTree = function (model, options) {
        var tree = {
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
        return tree;
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
            media: "Media"
        },
        model: {
            tabs: {
                primary: {
                    href: "#primaryTab"
                },
                acquisition: {},
                cataloging: {
                    href: "%webapp/html/objectTabPlaceholder.html"
                },
                intake: {},
                loanin: {},
                loanout: {},
                movement: {
                    href: "%webapp/html/movementTab.html"
                },
                media: {}
            }
        },
        selectors: {
            tabList: ".csc-tabs-tabList",
            "tab:": ".csc-tabs-tab",
            tabLink: ".csc-tabs-tab-link"
        },
        selectorsToIgnore: ["tabList"],
        styles: {
            tabList: "menu-record", // TODO: This needs to be moved to "cs-tabs-tabList" style,
            tab: "cs-tabs-tab",
            tabLink: "cs-tabs-tab-link",
            primary: "primary", // TODO: This needs to be moved to "cs-tabs-primary" style,
            current: "current", // TODO: This needs to be moved to "cs-tabs-current" style,
            inactive: "inactive" // TODO: This needs to be moved to "cs-tabs-inactive" style
        },
        invokers: {
            treeBuilder: {
                funcName: "cspace.tabsList.modelToTree",
                args: ["{tabsList}.model", "{tabsList}.options"]
            },
            refreshView: {
                funcName: "cspace.tabsList.refreshView",
                args: ["{tabsList}"]
            }
        },
        resolverGetConfig: null,
        resources: {
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "fastTemplate", 
                        url: "%webapp/html/TabsTemplate.html"
                    }
                }
            }
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
    
    cspace.tabs.setupTab = function (tabName, options) {
        var urlExpander = fluid.invoke("cspace.urlExpander");
        cspace.setup("cspace.tabs", {
            model: options.model,
            applier: options.applier,
            related: tabName,
            primary: options.primaryRecordType,
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
                tabsList.locate("tabLink").removeClass(styles.current);
                $(ui.tab).addClass(styles.current);
            }
        });
    };
    
    cspace.tabs.provideAuthorityTabsList = function (container, options) {
        fluid.merge(null, options, {
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
        return cspace.tabs.provideTabsList(container, options);
    };
    
    cspace.tabs.provideTabsList = function (container, options) {
        var that = fluid.initLittleComponent("cspace.tabs.provideTabsList", options);
        that.options.resolverGetConfig = that.options.resolverGetConfig || [cspace.util.censorWithSchemaStrategy({
            permissions: that.options.permissions,
            operations: that.options.operations,
            method: that.options.method
        })];
        return cspace.tabsList(container, that.options);
    };
    
    fluid.defaults("cspace.tabs.provideTabsList", {
        operations: ["create", "read", "update", "delete", "list"],
        method: "OR"
    });
    
    fluid.demands("tabsList", ["cspace.tabs", "cspace.person"], {
        funcName: "cspace.tabs.provideAuthorityTabsList",
        args: ["{tabs}.dom.tabsList", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("tabsList", ["cspace.tabs", "cspace.organization"], {
        funcName: "cspace.tabs.provideAuthorityTabsList",
        args: ["{tabs}.dom.tabsList", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("tabsList", ["cspace.tabs"], {
        funcName: "cspace.tabs.provideTabsList",
        args: ["{tabs}.dom.tabsList", fluid.COMPONENT_OPTIONS]
    });

    fluid.defaults("cspace.tabs", {
        components: {
            tabsList: {
                type: "cspace.tabsList",
                options: {
                    permissions: "{tabs}.options.permissions"
                }
            }
        },
        invokers: {
            setupTab: {
                funcName: "cspace.tabs.setupTab",
                args: ["@0", "{tabs}.options"]
            }
        },
        configURLTemplate: "%webapp/html/config/%record-tab.json",
        selectors: {
            tabs: ".csc-tabs-container",
            tabsList: ".csc-tabs-tabsList-container"
        },
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        }
    });
    
    fluid.demands("tabs", "cspace.pageBuilder", {
        args: ["{pageBuilder}.options.selectors.tabs", {
            permissions: "{pageBuilder}.permissions",
            primaryRecordType: "{pageBuilder}.options.pageType",
            applier: "{pageBuilder}.applier",
            model: "{pageBuilder}.model"
        }]
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.tabsList");
    
})(jQuery, fluid);
