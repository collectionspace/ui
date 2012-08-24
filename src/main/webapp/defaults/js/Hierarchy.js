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

    cspace.hierarchy.treeUispecMerge = function (tree, uispec) {
        return fluid.merge(null, tree, uispec);
    };

    cspace.hierarchy.produceTreeCataloging = function (that) {
        return cspace.hierarchy.treeUispecMerge({
            header: {
                messagekey: "hierarchy-headerCataloging"
            },
            narrowerContextsLabel: {
                messagekey: "hierarchy-narrowerContextsCatalogingLabel"
            },
            broaderContextLabel: {
                messagekey: "hierarchy-broaderContextCatalogingLabel"
            },
            narrowerContextsTypeLabel: {
                messagekey: "hierarchy-narrowerContextsTypeLabel"
            },
            broaderContextTypeLabel: {
                messagekey: "hierarchy-broaderContextTypeLabel"
            },
            expander: {
                type: "fluid.renderer.condition",
                condition: {
                    funcName: "cspace.hierarchy.assertEquivalentContexts",
                    args: {
                        equivalentContexts: "${fields.equivalentContexts}"
                    }
                },
                trueTree: {
                    equivalentContextsLabel: {
                        messagekey: "hierarchy-equivalentContextsCatalogingLabel"
                    },
                    expander: {
                        repeatID: "equivalentContext",
                        tree: {
                            decorators: {addClass: "{styles}.equivalentContext"},
                            value: "${{row}.equivalentContext}"
                        },
                        type: "fluid.renderer.repeat",
                        pathAs: "row",
                        controlledBy: "fields.equivalentContexts"
                    }
                },
                falseTree: {
                    equivalentContextsLabel: {
                        decorators: {addClass: "{styles}.hidden"}
                    }
                }
            }
        }, that.options.uispec);
    };
    
    cspace.hierarchy.produceTree = function (that) {
        return cspace.hierarchy.treeUispecMerge({
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
            narrowerContextsTypeLabel: ".csc-hierarchy-narrowerContextsType-label",
            broaderContextLabel: ".csc-hierarchy-broaderContext-label",
            broaderContextTypeLabel: ".csc-hierarchy-broaderContextType-label",
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
        events: {
            afterFetchTemplate: null
        },
        listeners: {
            afterFetchTemplate: "{that}.refreshView"
        },
        components: {
            hierarchyTogglable: {
                type: "cspace.util.togglable",
                createOnEvent: "afterRender"
            },
            templateFetcher: {
                type: "cspace.templateFetcher",
                priority: "first",
                options: {
                    events: {
                        afterFetch: {
                            event: "{cspace.hierarchy}.events.afterFetchTemplate"
                        }
                    },
                    template: "",
                    resources: {
                        template: cspace.resourceSpecExpander({
                            url: "%webapp/html/components/HierarchyTemplate.html",
                            options: {
                                dataType: "html"
                            }
                        })
                    }
                }
            }
        },
        preInitFunction: "cspace.hierarchy.preInit"
    });

    cspace.hierarchy.preInit = function (that) {
        that.options.rendererFnOptions.templateSource = function () {
            return that.templateFetcher.options.resources.template.resourceText;
        };
        that.refreshView = function () {
            that.refreshView();
        };
    };
    
    cspace.hierarchy.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };
    
    cspace.hierarchy.assertEquivalentContexts = function (options) {
        return options.equivalentContexts && options.equivalentContexts.length > 0;
    };
    
})(jQuery, fluid);