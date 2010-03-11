/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {

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
            if (i === 0) {
                link.addClass(that.options.styles.current);
            }
        }
		
		$("a:first", tabs).addClass(that.options.styles.primary);
		
        that.locate("tabsContainer").prepend(tabs);
        that.locate("tabsContainer").tabs({
            cache: true,
            ajaxOptions: {
                success: function (data, textStatus, XMLHttpRequest) {
                    var tabIndex = that.locate("tabsContainer").tabs('option', 'selected');
                    fluid.invokeGlobalFunction(that.options.setupFuncs[tabIndex], [that.options.applier]);
                }
            },
            select: function (event, ui) {
                var links = $("a", tabs);
                links.removeClass(that.options.styles.current);
                $(ui.tab).addClass(that.options.styles.current);
            }
        });
    };

    cspace.tabs = function (container, options) {
        var that = fluid.initView("cspace.tabs", container, options);
        // workaround for FLUID-3505:
        that.options.applier = options.applier;

        buildTabs(that);

        return that;
    };

    fluid.defaults("cspace.tabs", {
        selectors: {
            tabsContainer: ".csc-tabs-container",
            list: "menu-record"
        },
        tabList: [
            {name: "Cataloging", target: "#primaryTab"},
            {name: "Objects", target: "objectTabPlaceholder.html"},
            {name: "Conservation", target: null},
            {name: "Location &amp; Movement", target: null},
            {name: "Transport", target: null},
            {name: "Valuation", target: null},
            {name: "Insurance", target: null},
            {name: "Media", target: null},
            {name: "Rights", target: null}
        ],
        styles: {
            listContainer: "secondary-nav-menu",
            list: "menu-record",
            current: "current",
            inactive: "inactive",
			primary: "primary"
        },
        mergePolicy: {
            tabList: "replace"
        }
    });
})(jQuery, fluid_1_2);
