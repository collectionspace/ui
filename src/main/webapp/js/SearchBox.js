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
    
    // A wrapper around the searchBox implementation to perpare resolverGetCofig as a renderer option.
    cspace.searchBox = function (container, options) {
        var that = fluid.initLittleComponent("cspace.searchBox", options);
        fluid.initDependents(that);
        fluid.merge(null, that.options, {
            resolverGetConfig: that.options.resolverGetConfig || that.provideResolverGetConfig()
        });
        return cspace.searchBoxImpl(container, that.options);
    };
    
    fluid.defaults("cspace.searchBox", {
        operations: ["create", "read", "update", "delete", "list"],
        method: "OR",
        invokers: {
            provideResolverGetConfig: {
                funcName: "cspace.searchBox.provideResolverGetConfig",
                args: {
                    permissions: "{searchBox}.options.permissions",
                    operations: "{searchBox}.options.operations",
                    method: "{searchBox}.options.method",
                    schema: "{searchBox}.options.schema"
                }
            }
        }
    });
    
    var bindEvents = function (that) {
        that.locate("searchButton").click(that.navigateToSearch);
    };
    
    var buildOptionNames = function (list, strings) {
        return fluid.transform(list, function (elem, key) {
            return strings[elem];
        });
    };
    
    var setupSearchBox = function (that) {
        if (that.options.selfRender) {
            that.refreshView();
        }
    };
    
    cspace.searchBoxImpl = function (container, options) {
        var that = fluid.initRendererComponent("cspace.searchBoxImpl", container, options);        
        that.model = that.options.model;
        fluid.initDependents(that);
        setupSearchBox(that);
        return that;
    };
    
    cspace.searchBox.navigateToSearch = function (that) {
        var url = fluid.stringTemplate(that.options.searchUrl, {
            recordtype: that.locate("recordTypeSelect").val(),
            keywords: that.locate("searchQuery").val() || ""
        });
        window.location = url;
    };
    
    cspace.searchBox.provideResolverGetConfig = function (options) {
        return [cspace.util.censorWithSchemaStrategy(options)];
    };
    
    cspace.searchBox.refreshView = function (that) {
        var tree = that.treeBuilder();
        that.render(tree);
        bindEvents(that);
    };
    
    cspace.searchBox.modelToTree = function (model, options) {
        var tree = {
            searchButton: {
                messagekey: "searchButtonText"
            },
            searchQuery: {},
            recordTypeSelectLabel: {
                messagekey: "recordTypeSelectLabel"
            },
            recordTypeSelect: {
                optionlist: cspace.util.elStylefy(options.elPath),
                optionnames: buildOptionNames(fluid.model.getBeanValue(model, options.elPath, options.resolverGetConfig), options.strings),
                selection: ""
            }
        };
        fluid.each(tree, function (child, key) {
            child.decorators = [{
                type: "addClass",
                classes: options.styles[key]
            }];
        });
        return tree;
    };
    
    fluid.defaults("cspace.searchBoxImpl", {
        mergePolicy: {
            model: "preserve"
        },
        elPath: "recordlist",
        selectors: {
            recordTypeSelect: ".csc-searchBox-selectRecordType",
            recordTypeSelectLabel: ".csc-searchBox-selectRecordTypeLabel",
            searchQuery: ".csc-seachBox-query",
            searchButton: ".csc-seachBox-button"
        },
        styles: {
            searchBox: "cs-searchBox",
            recordTypeSelect: "cs-searchBox-selectRecordType",
            recordTypeSelectLabel: "cs-searchBox-selectRecordTypeLabel",
            searchQuery: "cs-seachBox-query",
            searchButton: "cs-seachBox-button"
        },
        strings: {
            searchButtonText: "Search",
            recordTypeSelectLabel: "",
            cataloging: "Cataloging",
            intake: "Intake",
            acquisition: "Acquisition",
            loanin: "Loan In",
            loanout: "Loan Out",
            movement: "Location and Movement",
            person: "Person",
            organization: "Organization",
            "location": "Storage Location",
            contact: "Contact" 
        },
        model: {},
        resolverGetConfig: null,
        invokers: {
            treeBuilder: {
                funcName: "cspace.searchBox.modelToTree",
                args: ["{searchBoxImpl}.model", "{searchBoxImpl}.options"]
            },
            refreshView: {
                funcName: "cspace.searchBox.refreshView",
                args: ["{searchBoxImpl}"]
            },
            navigateToSearch: {
                funcName: "cspace.searchBox.navigateToSearch",
                args: ["{searchBoxImpl}"]
            }
        },
        selfRender: false,
        searchUrl: "findedit.html?recordtype=%recordtype&keywords=%keywords",
        resources: {
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "fastTemplate",
                        url: "%webapp/html/SearchBoxTemplate.html"
                    }
                }
            }
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.searchBoxImpl");
    
})(jQuery, fluid);