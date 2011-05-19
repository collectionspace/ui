/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.hierarchy");
    
    cspace.hierarchy.produceTree = function (that) {
        return fluid.merge(null, {
            header: {
                messagekey: "header"
            }
        }, that.options.uispec);
    };
    
    fluid.defaults("cspace.hierarchy", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        mergePolicy: {
            "rendererFnOptions.uispec": "uispec",
            "rendererOptions.applier": "applier",
            "uispec": "noexpand"
        },
        selectors: {
            header: ".csc-hierarchy-header",
            togglable: ".csc-hierarchy-togglable"
        },
        selectorsToIgnore: ["togglable"],
        strings: {
            header: "Hierarchy"
        },
        parentBundle: "{globalBundle}",
        produceTree: cspace.hierarchy.produceTree,
        rendererFnOptions: {
            cutpointGenerator: "cspace.hierarchy.cutpointGenerator"
        },
        components: {
            hierarchyTogglable: {
                type: "cspace.util.togglable"
            }
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/HierarchyTemplate.html"
            })
        },
        postInitFunction: "cspace.hierarchy.postInitFunction"
    });
    
    cspace.hierarchy.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };
    
    cspace.hierarchy.postInitFunction = function (that) {
        that.renderer.refreshView();
    };
    
    cspace.hierarchy.assertEquivalentContexts = function (options) {
        return options.equivalentContexts && options.equivalentContexts.length > 0;
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.hierarchy");
    
})(jQuery, fluid);