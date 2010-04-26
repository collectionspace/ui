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
                    fluid.invokeGlobalFunction(that.options.setupFuncs[tabIndex], [that.applier]);
                }
            },
            select: function (event, ui) {
                var links = $("a", tabs);
                links.removeClass(that.options.styles.current);
                $(ui.tab).addClass(that.options.styles.current);
            }
        });
    };

    cspace.tabs = function (container, applier, options) {
        var that = fluid.initView("cspace.tabs", container, options);
        that.applier = applier;

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
			{name: "Acquisition", target: null},
			{name: "Cataloging - related", target: "objectTabPlaceholder.html"},
            {name: "Intake", target: null},
            {name: "Loan In", target: null},
            {name: "Loan Out", target: null},
            {name: "Location &amp; Movement", target: null},
            {name: "Media", target: null}
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
})(jQuery, fluid);
