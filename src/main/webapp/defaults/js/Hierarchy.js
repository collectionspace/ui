/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";
    
    fluid.registerNamespace("cspace.hierarchy");
    
    cspace.hierarchy.produceTree = function (that) {
        return fluid.merge(null, {
            header: {
                messagekey: "hierarchy-header"
            },
            narrowerContextsLabel: {
                messagekey: "hierarchy-narrowerContextsLabel"
            },
            broaderContextLabel: {
                messagekey: "hierarchy-broaderContextLabel"
            },
            expander: [{
                type: "fluid.renderer.condition",
                condition: {
                    funcName: "cspace.hierarchy.assertEquivalentContexts",
                    args: {
                        equivalentContexts: "${fields.equivalentContexts}"
                    }
                },
                trueTree: {
                    equivalentContextsLabel: {
                        messagekey: "hierarchy-equivalentContextsLabel"
                    }
                },
                falseTree: {
                    equivalentContextsLabel: {
                        decorators: {addClass: "{styles}.hidden"}
                    }
                }
            }, {
                repeatID: "equivalentContext",
                tree: {
                    decorators: {addClass: "{styles}.equivalentContext"},
                    value: "${{row}.equivalentContext}"
                },
                type: "fluid.renderer.repeat",
                pathAs: "row",
                controlledBy: "fields.equivalentContexts"
            }]
        }, that.options.uispec);
    };
    
    fluid.defaults("cspace.hierarchy", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        mergePolicy: {
            "rendererFnOptions.uispec": "uispec",
            "rendererOptions.applier": "applier",
            "uispec": "nomerge"
        },
        selectors: {
            header: ".csc-hierarchy-header",
            togglable: ".csc-hierarchy-togglable",
            narrowerContextsLabel: ".csc-hierarchy-narrowerContexts-label",
            broaderContextLabel: ".csc-hierarchy-broaderContext-label",
            equivalentContextsLabel: ".csc-hierarchy-equivalentContexts-label",
            equivalentContext: ".csc-hierarchy-equivalentContext"
        },
        styles: {
            equivalentContext: "cs-hierarchy-equivalentContext",
            hidden: "hidden"
        },
        selectorsToIgnore: "togglable",
        repeatingSelectors: ["equivalentContext"],
        strings: {},
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
                url: "%webapp/html/components/HierarchyTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        renderOnInit: true
    });
    
    cspace.hierarchy.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };
    
    cspace.hierarchy.assertEquivalentContexts = function (options) {
        return options.equivalentContexts && options.equivalentContexts.length > 0;
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.hierarchy");
    
})(jQuery, fluid);