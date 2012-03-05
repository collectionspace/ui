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
    
    var bindEvents = function (that) {
        // Bind a click event on search button to trigger searchBox's navigateToSearch
        that.locate("searchButton").click(that.navigateToSearch);
        that.locate("searchQuery").keypress(function (e) {
            if (cspace.util.keyCode(e) === $.ui.keyCode.ENTER) {
                that.navigateToSearch();
            }
        });
    };
    
    fluid.defaults("cspace.searchBox", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "cspace.searchBox.preInit",
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
        strings: {
            divider: "-",
            recordTypeSelector: "recordTypeSelect",
            allRecords: "all"
        },
        parentBundle: "{globalBundle}",
        model: {
            messagekeys: {
                recordTypeSelectLabel: "searchBox-recordTypeSelectLabel"
            },
            categories: [{
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.modelBuilder",
                    args: {
                        callback: "cspace.searchBox.buildModel",
                        related: "cataloging",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "list"
                    }
                }
            }, {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.modelBuilder",
                    args: {
                        callback: "cspace.searchBox.buildModel",
                        related: "procedures",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "list"
                    }
                }
            }, {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.modelBuilder",
                    args: {
                        callback: "cspace.searchBox.buildModel",
                        related: "vocabularies",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "list"
                    }
                }
            }]
        },                  // A default data model object.
        produceTree: "cspace.searchBox.produceTree", // direct method expected by interim impl of initRendererComponent
        rendererOptions: {
            autoBind: false
        },
        components: {
            globalNavigator: "{globalNavigator}",
            recordTypeManager: "{recordTypeManager}",
            permissionsResolver: "{permissionsResolver}"        
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
        urls: cspace.componentUrlBuilder({
            advancedSearchURL: "%webapp/html/advancedsearch.html"
        }),
        enableAdvancedSearch: true
    });
    
    cspace.searchBox.finalInit = function (that) {
        // Disable all the options which are divider
        var divider = that.options.strings.divider;
        
        // Not sure how I could get to the selector differently here
        fluid.each($(".csc-searchBox-selectRecordType option"), function (option, index) {
            $(option).prop("disabled", $(option).text() === divider);
        });
        
        if (that.options.selfRender) {
            that.refreshView();
        }
    };
    
    cspace.searchBox.preInit = function (that) {
        that.options.listeners = that.options.listeners || {};
        that.options.listeners.afterRender = function () {
            bindEvents(that);
        };
        
        that.produceComponent = function () {
            // Name of the selector we are going to modify with dynamic options
            var componentID = that.options.strings.recordTypeSelector;
            var model = that.model;
            
            // String divider which we are going to use between different categories
            var divider = that.options.strings.divider;
            // Additional option which we are going to add to the options
            var allRecords = that.options.strings.allRecords;
            // The array which will be a set of all categories with dividers between them
            var options = [];
            
            // Try to add our additional option. It might not exist though if options are not set properly
            options = options.concat([allRecords]);
            
            // First let's build an overall array which is a set of all categories
            fluid.each(model.categories, function (category) {
                if (options.length === 0) {
                    options = options.concat(category);
                    return;
                }
                // Add a divider in between only if options is not empty
                options = options.concat([divider], category);
            });
            
            // we need this variable to resolve componentID inside of JSON
            var result = {};
            result[componentID] = {
                selection: options[0],
                optionlist: options,
                optionnames: fluid.transform(options, function (recordType) {
                    // If the type is a divider then just show a divider and do not resolve it
                    if (recordType === divider) {
                        return divider;
                    }
                    return that.messageResolver.resolve(recordType);
                })
            };
            
            // Return part of the tree which is a selector we complete
            return result;
        };
    };

    cspace.searchBox.preInitSearch = function (that) {
        cspace.searchBox.preInit(that);
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
    
    // A public function which should return array of records of the defined type
    cspace.searchBox.buildModel = function (options, records) {
        if (!records || records.length < 1) {
            return;
        }
        return records;
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
        
        tree = $.extend(tree, that.produceComponent());
        
        fluid.each(tree, function (child, key) {
            child.decorators = [{
                type: "addClass",
                classes: that.options.styles[key]
            }];
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