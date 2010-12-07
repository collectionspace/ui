/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.searchBox");
    
    var bindEvents = function (that) {
        // Bind a click event on search button to trigger searchBox's navigateToSearch
        that.locate("searchButton").click(that.navigateToSearch);
    };
    
    cspace.searchBox = function (container, options) {
        var that = fluid.initRendererComponent("cspace.searchBox", container, options);
        fluid.initDependents(that);
        that.refreshView = function() {
            that.renderer.refreshView();
            bindEvents(that);    
        };
        if (that.options.selfRender) {
            that.refreshView();
        }
        return that;
    };
    
    // A public function that is called as searchBox's navigateToSearch method and redirects to
    // the search results page.
    cspace.searchBox.navigateToSearch = function (that) {
        var url = fluid.stringTemplate(that.options.searchUrl, {
            recordtype: that.locate("recordTypeSelect").val(),
            keywords: that.locate("searchQuery").val() || ""
        });
        window.location = url;
    };
    
    // A public function that is called as searchBox's treeBuilder method and builds a component tree.
    cspace.searchBox.produceTree = function(that) {
        var tree = {
            searchButton: {
                messagekey: "searchButtonText"
            },
            searchQuery: {},
            recordTypeSelectLabel: {
                messagekey: "recordTypeSelectLabel"
            }
        };
        tree = $.extend(tree, that.recordTypeSelector.produceComponent());
        // Adding all custom components styles.
        fluid.each(tree, function (child, key) {
            child.decorators = [{
                type: "addClass",
                classes: that.options.styles[key]
            }];
        });
        return tree;
    };
    
    fluid.defaults("cspace.searchBox", {
        mergePolicy: {
            model: "preserve"   
        },
        selectors: {                // Set of selectors that the component is interested in rendering.
            recordTypeSelect: ".csc-searchBox-selectRecordType",
            recordTypeSelectLabel: ".csc-searchBox-selectRecordTypeLabel",
            searchQuery: ".csc-searchBox-query",
            searchButton: ".csc-searchBox-button"
        },
        styles: {                   // Set of styles that the component will be adding onto selectors.
            searchBox: "cs-searchBox",
            recordTypeSelect: "cs-searchBox-selectRecordType",
            recordTypeSelectLabel: "cs-searchBox-selectRecordTypeLabel",
            searchQuery: "cs-searchBox-query",
            searchButton: "cs-searchBox-button"
        },
        strings: {                  // List of strings that the component will render (for l10n and i18n).
            searchButtonText: "Search",
            recordTypeSelectLabel: "",
        },
        parentBundle: "{globalBundle}",
        model: {},                  // A default data model object.
        produceTree: cspace.searchBox.produceTree, // direct method expected by interim impl of initRendererComponent
        components: {
            recordTypeSelector: {
                type: "cspace.util.recordTypeSelector",
                options: {
                    related: "{searchBox}.options.related",
                    dom: "{searchBox}.dom",
                    componentID: "recordTypeSelect",
                    selector: "recordTypeSelect"
                }
            }          
        },
        invokers: {                 // Component's public functions with arguments that are resolved at the time of invokation.
            navigateToSearch: {     // A public method that builds search page's url and navigates to that page.
                funcName: "cspace.searchBox.navigateToSearch",
                args: ["{searchBox}"]
            }
        },
        selfRender: false,          // An options that indicates whether the component needs to render on initialization.
        searchUrl: "findedit.html?recordtype=%recordtype&keywords=%keywords",   // Search page's url template.
        resources: {                // A set of resources that will get resolved and fetched at some point during initialization.
            template: cspace.prolepticResourceSpec({
                fetchClass: "fastTemplate",
                url: "%webapp/html/SearchBoxTemplate.html"
            })
        }
    });
    
    fluid.demands("pivotSearch", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.pivotSearch", fluid.COMPONENT_OPTIONS]);
    
    // This function executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.searchBox");
    
})(jQuery, fluid);