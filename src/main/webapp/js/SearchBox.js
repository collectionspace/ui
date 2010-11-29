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
        operations: ["create", "read", "update", "delete", "list"], // A list of allowing permissions that will
                                                                    // instruct the searchBox to render accordingly 
                                                                    // (Used by cspace.permissions.manager).
        method: "OR",   // A method type that indicates how to resolve against the "operations" list: as an OR or
                        // as an AND (Used by cspace.permissions.manager). If it is "OR", permissions manager (PM) 
                        // will "allow" the resource if any of the operations matche to the user permissions. If 
                        // it is "AND", PM will "allow" the resource only if all operations match the set of user 
                        // permissions.  
        invokers: {
            provideResolverGetConfig: { // A public searchBox's provideResolverGetConfig method that returns an 
                                        // array of strategies to be used by fluid.model.getBeanValue to resolve
                                        // the values in the model against the schema and permissions. 
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
        // Bind a click event on search button to trigger searchBox's navigateToSearch
        that.locate("searchButton").click(that.navigateToSearch);
    };
    
    var buildOptionNames = function (list, strings) {
        return fluid.transform(list, function (elem, key) {
            return strings[elem];
        });
    };
    
    var setupSearchBox = function (that) {
        // Check whether the components needs to be rendered as part of its initialization.
        if (that.options.selfRender) {
            that.refreshView();
        }
    };
    
    // Actual implementation of the searchBox component's creator function.
    cspace.searchBoxImpl = function (container, options) {
        // Initialize searchBox component as a renderer component.
        var that = fluid.initRendererComponent("cspace.searchBoxImpl", container, options);
        that.model = that.options.model;
        // Initialize component's dependants if any and component's invokers.
        fluid.initDependents(that);
        setupSearchBox(that);
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
    
    // A public funtion that returns a defined array of strategies used by fluid.model.getBeanValue
    // to resolve values in the model based on permissions and schema. 
    cspace.searchBox.provideResolverGetConfig = function (options) {
        return [cspace.util.censorWithSchemaStrategy(options)];
    };
    
    // A public function that is called as searchBox's refreshView method, renders the component and
    // binds the event handlers.
    cspace.searchBox.refreshView = function (that) {
        // No need to pass arguments to treeBuilder since it is an invoker.
        var tree = that.treeBuilder();
        // Render the component.
        that.render(tree);
        // Bind event handlers.
        bindEvents(that);
    };
    
    // A public function that is called as searchBox's treeBuilder method and builds a component tree.
    cspace.searchBox.modelToTree = function (model, options) {
        var tree = {
            searchButton: {
                messagekey: "searchButtonText"  // Key into the strings structure in component's options 
                                                // that will instruct the renderer to use the particular
                                                // string for that rendered element.
            },
            searchQuery: {},
            recordTypeSelectLabel: {
                messagekey: "recordTypeSelectLabel"
            },
            recordTypeSelect: {
                optionlist: cspace.util.elStylefy(options.elPath),
                // NOTE: ONLY CALL fluid.model.getBeanValue WITH DEFINED resolverGetConfig STRATEGY FOR 
                // SCHEMA AND PERMISSIONS RESOLUTION.
                optionnames: buildOptionNames(fluid.model.getBeanValue(model, options.elPath, options.resolverGetConfig), options.strings),
                selection: ""
            }
        };
        // Adding all custom components styles.
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
            model: "preserve"       // If the model is passed to the component, preserve the original 
                                    // object on options merging.
        },
        elPath: "recordlist",       // Configurable path of interest into the model. 
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
            cataloging: "Cataloging",
            intake: "Intake",
            acquisition: "Acquisition",
            loanin: "Loan In",
            loanout: "Loan Out",
            movement: "Location and Movement",
            objectexit: "Object Exit",
            person: "Person",
            organization: "Organization",
            "location": "Storage Location",
            contact: "Contact",
            objectexit: "Object Exit"
        },
        model: {},                  // A default data model object.
        resolverGetConfig: null,    // An option used by initRendererComponent as a strategy when 
                                    // resolving values in the model (through fluid.model.getBeanValue)
        invokers: {                 // Component's public functions with arguments that are resolved at the time of invokation.
            treeBuilder: {          // A public method that builds component tree for rendering.
                funcName: "cspace.searchBox.modelToTree",
                args: ["{searchBoxImpl}.model", "{searchBoxImpl}.options"]
            },
            refreshView: {          // A public method that renders the component and binds event handlers anew.
                funcName: "cspace.searchBox.refreshView",
                args: ["{searchBoxImpl}"]
            },
            navigateToSearch: {     // A public method that builds search page's url and navigates to that page.
                funcName: "cspace.searchBox.navigateToSearch",
                args: ["{searchBoxImpl}"]
            }
        },
        selfRender: false,          // An options that indicates whether the component needs to render on initialization.
        searchUrl: "findedit.html?recordtype=%recordtype&keywords=%keywords",   // Search page's url template.
        resources: {                // A set of resources that will get resolved and fetched at some point during initialization.
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "fastTemplate", // Class name that indicates to pageBuilder that the 
                                                    // template is necessary on page's initialization. 
                        url: "%webapp/html/SearchBoxTemplate.html"
                    }
                }
            }
        }
    });
    
    // This funtction executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.searchBoxImpl");
    
})(jQuery, fluid);