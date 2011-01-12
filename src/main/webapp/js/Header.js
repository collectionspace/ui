/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.header");
    
    cspace.header = function (container, options) {
        var that = fluid.initRendererComponent("cspace.header", container, options);
        
        that.treeBuilder = function (strings) {
            var tree = {};
            fluid.each(strings, function (str, selector) {
                tree[selector] = {messagekey: selector};
            });
            return tree;
        };
        
        that.refreshView = function () {
            var tree = that.treeBuilder(that.options.strings);
            that.render(tree);
            if (that.refreshComponents) {
                that.refreshComponents();
            }
        }(); // that.refreshView is called right away.
        
        fluid.initDependents(that);        
        that.refreshComponents();
        
        return that;
    };
    
    fluid.demands("searchBox", "cspace.header", ["{header}.options.selectors.searchBox", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.header", {
        mergePolicy: {
            model: "preserve"
        },
        components: {
            searchBox: {
                type: "cspace.searchBox",
                options: {
                    related: "all"
                }
            }
        },
        selectorsToIgnore: ["searchBox"],
        selectors: {
            searchBox: ".csc-header-searchBox",
            myCollectionSpace: ".csc-header-myCollectionSpace",
            createNew: ".csc-header-createNew",
            findEdit: ".csc-header-findEdit",
            report: ".csc-header-report",
            adminisrtation: ".csc-header-adminisrtation",
            logout: ".csc-header-logout"
        },
        invokers: {
            refreshComponents: {
                funcName: "cspace.util.refreshComponents",
                args: "{header}"
            }
        },
        resources: {
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "fastTemplate",
                        url: "%webapp/html/header.html"
                    }
                }
            }
        },
        schema: {},
        strings: {
            myCollectionSpace: "My CollectionSpace",
            createNew: "Create New",
            findEdit: "Find and Edit",
            report: "Report",
            adminisrtation: "Administration",
            logout: "Sign out"
        }
    });
    
    fluid.demands("header", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.header", fluid.COMPONENT_OPTIONS]);
    
    fluid.fetchResources.primeCacheFromResources("cspace.header");
    
})(jQuery, fluid);