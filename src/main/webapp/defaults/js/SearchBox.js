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
            namespace: "preInitPrepareModel",
            listener: "cspace.searchBox.preInitPrepareModel"
        }, {
            namespace: "preInit",
            listener: "cspace.searchBox.preInit"
        }],
        finalInitFunction: "cspace.searchBox.finalInit",
        mergePolicy: {
            model: "preserve",
            recordTypeManager: "nomerge",
            permissionsResolver: "nomerge"
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
            divider: ""
        },
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
            globalNavigator: "{globalNavigator}"
        },
        recordTypeManager: "{recordTypeManager}",
        permissionsResolver: "{permissionsResolver}",
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

    cspace.searchBox.preInitPrepareModel = function (that) {
        that.options.related = fluid.makeArray(that.options.related);
        fluid.each(that.options.related, function (related) {
            var relatedCategory = cspace.util.modelBuilder({
                callback: "cspace.searchBox.buildModel",
                related: related,
                resolver: that.options.permissionsResolver,
                recordTypeManager: that.options.recordTypeManager,
                permission: "list"
            });
            if (!relatedCategory) {
                return;
            }
            that.applier.requestChange(related, relatedCategory);
        });
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
        that.produceRecordTypeSelect = function () {
            var optionlist = [],
                optionnames = [];
            fluid.each(that.options.related, function (related) {
                if (!that.model[related]) {
                    return;
                }
                if (optionlist.length !== 0) {
                    optionlist.push(that.options.strings.divider);
                }
                optionlist = optionlist.concat(that.model[related])
            });
            fluid.each(optionlist, function (option) {
                if (!option) {
                    optionnames.push(option);
                    return;
                }
                optionnames.push(that.options.parentBundle.resolve(option));
            });
            return {
                recordTypeSelect: {
                    selection: optionlist[0],
                    optionlist: optionlist,
                    optionnames: optionnames,
                    decorators: [{
                        type: "fluid",
                        func: "cspace.searchBox.selectDecorator"
                    }]
                }
            };
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
        
        fluid.merge(null, tree, that.produceRecordTypeSelect());
        
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

    fluid.demands("cspace.searchBox.selectDecorator", "cspace.searchBox", {
        container: "{arguments}.0"
    });
    
    fluid.defaults("cspace.searchBox.selectDecorator", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        finalInitFunction: "cspace.searchBox.selectDecorator.finalInit"
    });
    
    cspace.searchBox.selectDecorator.finalInit = function (that) {
        fluid.each($("option", that.container), function (option) {
            option = $(option);
            option.prop("disabled", !!!option.text());
        });
    };
    
    // This function executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.searchBox");
    
})(jQuery, fluid);