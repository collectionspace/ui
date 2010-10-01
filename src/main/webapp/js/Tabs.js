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

    var buildTabs = function (that) {
        var tabs = $("<ul></ul>", that.container[0].ownerDocument);
        tabs.addClass(that.options.styles.list);
        for (var i = 0; i < that.options.tabList.length; i++) {
            var tabspec = that.options.tabList[i];
            var tab = $("<li></li>");
            tabs.append(tab);
            var link = $("<a>" + tabspec.name + "</a>");
            tab.prepend(link);
            if (tabspec.target) {
                link.attr("href", tabspec.target);
            } else {
                link.addClass(that.options.styles.inactive);
            }
               if (tabspec.target === "#primaryTab") {
                link.addClass(that.options.styles.primary).addClass(that.options.styles.current);
            }
        }
        
        that.locate("tabsContainer").prepend(tabs);
        that.locate("tabsContainer").tabs({
            cache: true,
            ajaxOptions: {
                success: function (data, textStatus, XMLHttpRequest) {
                    var tabIndex = that.locate("tabsContainer").tabs('option', 'selected');
                    var setupObj = that.options.tabSetups[tabIndex];
                    if (setupObj && setupObj.func) {
                        fluid.invokeGlobalFunction(setupObj.func, [setupObj.options]);
                    }
                }
            },
            select: function (event, ui) {
                var links = $("a", tabs);
                links.removeClass(that.options.styles.current);
                $(ui.tab).addClass(that.options.styles.current);
            }
        });
    };

    /**
     * The "tabSetups" option to cspace.tabs is an array of objects (one per tab) of the form
     *   { func: <function>,  // the setup function to call to initialize the tab
     *     options: {}        // options to pass to the setup function
     *   }
     * The function will be called the first time the tab is activated, to populate its contents.
     * 
     * @param {Object} container
     * @param {Object} applier
     * @param {Object} options
     */
    cspace.tabs = function (container, options) {
        var that = fluid.initView("cspace.tabs", container, options);
        buildTabs(that);
        return that;
    };

    fluid.defaults("cspace.tabs", {
        selectors: {
            tabsContainer: ".csc-tabs-container",
            list: "menu-record"
        },
        tabList: [],
        styles: {
            listContainer: "secondary-nav-menu",
            list: "menu-record",
            current: "current",
            inactive: "inactive",
            primary: "primary"
        },
        mergePolicy: {
            tabList: "replace",
            tabSetups: "preserve"
        }
    });
})(jQuery, fluid);
