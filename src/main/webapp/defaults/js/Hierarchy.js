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

    // Sub-routine used to merge app layer's uispece with default proto
    // tree.
    cspace.hierarchy.treeUispecMerge = function (tree, uispec) {
        return fluid.merge(null, tree, uispec);
    };

    // Filter unnessesary things from the uispec.
    cspace.hierarchy.filterUISpec = function (uispec) {
        // NOTE: This is to fix an issue of not necessary things in uisoec
        // for hierarchy. As soon as uispec is cleaned up - this needs to
        // be removed.
        return fluid.filterKeys(uispec, [
            ".csc-hierarchy-broaderContext",
            ".csc-hierarchy-broaderContextType",
            ".csc-hierarchy-narrowerContexts"
        ], false);
    };

    // Produce tree function specific to cataloging records.
    cspace.hierarchy.produceTreeCataloging = function (that) {
        return cspace.hierarchy.treeUispecMerge({
            header: {
                messagekey: "hierarchy-headerCataloging"
            },
            narrowerContextLabel: {
                messagekey: "hierarchy-narrowerContextCatalogingLabel"
            },
            broaderContextLabel: {
                messagekey: "hierarchy-broaderContextCatalogingLabel"
            },
            narrowerContextTypeLabel: {
                messagekey: "hierarchy-narrowerContextTypeLabel"
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
                            value: "${{row}.equivalentContext}",
                            decorators: {
                                type: "fluid",
                                func: "cspace.util.urnCSIDConverter"
                            }
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

    // Generic hierarchy produce tree.
    cspace.hierarchy.produceTree = function (that) {
        return cspace.hierarchy.treeUispecMerge({
            header: {
                messagekey: "hierarchy-header"
            },
            narrowerContextLabel: {
                messagekey: "hierarchy-narrowerContextLabel"
            },
            broaderContextLabel: {
                messagekey: "hierarchy-broaderContextLabel"
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
                        messagekey: "hierarchy-equivalentContextsLabel"
                    },
                    expander: {
                        repeatID: "equivalentContext",
                        tree: {
                            value: "${{row}.equivalentContext}",
                            decorators: {
                                type: "fluid",
                                func: "cspace.util.urnCSIDConverter"
                            }
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
            narrowerContextLabel: ".csc-hierarchy-narrowerContext-label",
            narrowerContextTypeLabel: ".csc-hierarchy-narrowerContextType-label",
            broaderContextLabel: ".csc-hierarchy-broaderContext-label",
            broaderContextTypeLabel: ".csc-hierarchy-broaderContextType-label",
            equivalentContextsLabel: ".csc-hierarchy-equivalentContexts-label",
            equivalentContext: ".csc-hierarchy-equivalentContext"
        },
        styles: {
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
            // Additional context that hierarchy creates used by its
            // child autocomplete decorators.
            context: {
                type: "fluid.typeFount",
                options: {
                    targetTypeName: "cspace.hierarchyAutocomplete"
                }
            },
            hierarchyTogglable: {
                type: "cspace.util.togglable",
                createOnEvent: "afterRender"
            },
            // Fetch hierarchy template.
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
            return that.template;
        };
        // Render hierarchy once the template is fetched.
        that.refreshView = function (resourceText) {
            that.template = resourceText;
            that.refreshView();
        };
    };
    
    cspace.hierarchy.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };

    // Evaluate whether the current record contains equivalent context records.
    cspace.hierarchy.assertEquivalentContexts = function (options) {
        return options.equivalentContexts && options.equivalentContexts.length > 0;
    };
    
})(jQuery, fluid);