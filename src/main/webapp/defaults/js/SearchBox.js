/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.searchBox");
    
    fluid.defaults("cspace.searchBox", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: [{
            namespace: "preInit",
            listener: "cspace.searchBox.preInit"
        }],
        finalInitFunction: "cspace.searchBox.finalInit",
        mergePolicy: {
            model: "preserve"
        },
        selectors: {                // Set of selectors that the component is interested in rendering.
            recordTypeSelect: ".csc-searchBox-selectRecordType",
            recordTypeSelectLabel: ".csc-searchBox-selectRecordTypeLabel",
            searchQuery: ".csc-searchBox-query",
            searchButton: ".csc-searchBox-button",
            advancedSearch: ".csc-searchBox-advancedSearch"
        },
        styles: {                   // Set of styles that the component will be adding onto selectors.
            searchBox: "cs-searchBox",
            recordTypeSelect: "cs-searchBox-selectRecordType",
            recordTypeSelectLabel: "cs-searchBox-selectRecordTypeLabel",
            searchQuery: "cs-searchBox-query",
            searchButton: "cs-searchBox-button",
            advancedSearch: "cs-searchBox-advancedSearch"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        model: {
            messagekeys: {
                recordTypeSelectLabel: "searchBox-recordTypeSelectLabel"
            }
        },                  // A default data model object.
        produceTree: "cspace.searchBox.produceTree", // direct method expected by interim impl of initRendererComponent
        rendererOptions: {
            autoBind: false
        },
        components: {
            globalNavigator: "{globalNavigator}",
            recordTypeSelector: {
                type: "cspace.util.recordTypeSelector",
                options: {
                    related: "{searchBox}.options.related",
                    dom: "{searchBox}.dom",
                    componentID: "recordTypeSelect",
                    selector: "recordTypeSelect",
                    permission: "{searchBox}.options.permission"
                }
            }
        },
        invokers: {
            navigateToSearch: "cspace.searchBox.navigateToSearch"
        },
        selfRender: false,          // An options that indicates whether the component needs to render on initialization.
        searchUrl: "findedit.html?recordtype=%recordtype&keywords=%keywords",   // Search page's url template.
        resources: {                // A set of resources that will get resolved and fetched at some point during initialization.
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SearchBoxTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        listeners: {
            afterRender: "{cspace.searchBox}.afterRenderHandler"
        },
        urls: cspace.componentUrlBuilder({
            advancedSearchURL: "%webapp/html/advancedsearch.html"
        }),
        enableAdvancedSearch: true
    });
    
    cspace.searchBox.finalInit = function (that) {
        if (that.options.selfRender) {
            that.refreshView();
        }
    };

    cspace.searchBox.preInit = function (that) {
        that.afterRenderHandler = function () {
            // Bind a click event on search button to trigger searchBox's navigateToSearch
            that.locate("searchButton").click(that.navigateToSearch);
            that.locate("searchQuery").keypress(function (e) {
                if (cspace.util.keyCode(e) === $.ui.keyCode.ENTER) {
                    that.navigateToSearch();
                }
            });
        };
    };

    cspace.searchBox.preInitSearch = function (that) {
        cspace.util.preInitMergeListeners(that.options, {
            afterSearch: function (searchModel) {
                that.updateSearchHistory(searchModel);
            }
        });
    };
    
    // A public function that is called as searchBox's navigateToSearch method and redirects to
    // the search results page.    
    cspace.searchBox.navigateToSearch = function (that) {
        that.globalNavigator.events.onPerformNavigation.fire(function () {
            var url = fluid.stringTemplate(that.options.searchUrl, {
                recordtype: that.locate("recordTypeSelect").val(),
                keywords: that.locate("searchQuery").val() || ""
            });
            window.location = url;
        });
    };
    
    // A public function that is called as searchBox's treeBuilder method and builds a component tree.
    cspace.searchBox.produceTree = function (that) {
        var tree = {
            searchButton: {
                messagekey: "searchBox-searchButtonText"
            },
            searchQuery: {},
            recordTypeSelectLabel: {
                messagekey: "${messagekeys.recordTypeSelectLabel}"
            }
        };
        
        fluid.merge(null, tree, that.recordTypeSelector.produceComponent());
        
        fluid.each(tree, function (child, key) {
            var decorator = {
                type: "addClass",
                classes: that.options.styles[key]
            };
            child.decorators = child.decorators ? child.decorators.concat([decorator]) : [decorator];
        });

        if (!that.options.enableAdvancedSearch) {
            return tree;
        }
        tree.advancedSearch = {
            decorators: {"addClass": "{styles}.advancedSearch"},
            target: that.options.urls.advancedSearchURL,
            linktext: {
                messagekey: "searchBox-advancedSearchText"
            }
        };
        return tree;
    };
    
    // This function executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.searchBox");
    
})(jQuery, fluid);