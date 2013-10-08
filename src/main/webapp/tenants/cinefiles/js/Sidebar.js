/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.log("Sidebar.js loaded");
    
    // Default options of the component 
    fluid.defaults("cspace.sidebar", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        preInitFunction: "cspace.sidebar.preInit",
        finalInitFunction: "cspace.sidebar.finalInit",
        // Message Bundle
        parentBundle: "{globalBundle}",
        strings: {},
        // Selectors being used for rendering
        selectors: {
            media: ".csc-sidebar-media",
            termsUsed: ".csc-integrated-authorities",
            termsUsedBanner: ".csc-sidebar-termsUsed",
            categoryContainer: ".csc-related-record",
            relatedVocabularies: ".csc-related-vocabularies",
            relatedCataloging: ".csc-related-cataloging",
            relatedMedia: ".csc-related-media",
            relatedProcedures: ".csc-related-procedures",
            termsHeader: ".csc-sidebar-termsHeader",
            header: ".csc-sidebar-header",
            togglable: ".csc-sidebar-togglable",
            report: ".csc-sidebar-report",
            batch: ".csc-sidebar-batch"
        },
        // Render immediately
        renderOnInit: true,
        repeatingSelectors: ["categoryContainer"],
        // Elements which should be ignored in our render tree. These ones will be used for other functions.
        selectorsToIgnore: ["batch", "report", "termsUsed", "relatedVocabularies", "relatedCataloging", "relatedMedia", "relatedProcedures", "header", "togglable", "termsUsedBanner"],
        // HTML markup for the component
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SidebarTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        events: {
            ready: null
        },
        // Render tree for some of the selectors.
        protoTree: {
            media: {
                decorators: {
                    type: "fluid",
                    func: "cspace.sidebar.media"
                }
            },
            termsHeader: {
                messagekey: "sidebar-termsHeader"
            },
            expander: [{
                repeatID: "categoryContainer",
                type: "fluid.renderer.repeat",
                pathAs: "category",
                valueAs: "categoryName",
                controlledBy: "categories",
                tree: {
                        decorators: [{
                        type: "addClass",
                        classes: "{categoryName}.categoryClass"
                    }]
                }
            }]
        },
        mergePolicy: {
            recordTypeManager: "nomerge",
            resolver: "nomerge"
        },
        // Model part of our component
        model: {
            // pre-process 4 models for our 4 listviews in the side bar
            categories: [{
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.modelBuilder",
                    args: {
                        callback: "cspace.sidebar.buildModel",
                        related: "vocabularies",
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
                        callback: "cspace.sidebar.buildModel",
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
                        callback: "cspace.sidebar.buildModel",
                        related: "media",
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
                        callback: "cspace.sidebar.buildModel",
                        related: "procedures",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "list"
                    }
                }
            }]
        },
        // Possible recordTypes
        recordTypeManager: "{recordTypeManager}",
        resolver: "{permissionsResolver}",
        components: {
            instantiator: "{instantiator}",
            // Sub-component for report generation
            report: {
                type: "cspace.reportProducer",
                container: "{sidebar}.dom.report",
                options: {
                    recordType: "{sidebar}.options.primary"
                }
            },
            // Sub-component for batch invocation
            batch: {
                type: "cspace.batchRunner",
                container: "{sidebar}.dom.batch",
                options: {
                    recordType: "{sidebar}.options.primary"
                }
            },
            // Sub-component wrap for rendering a list of vocabs
            vocabularies: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primary",
                    model: {
                        related: "authorities"
                    },
                    related: "authorities",
                    components: {
                        rrlListView: {
                            options: {
                                elPath: "results",
                                model: {
                                    columns: [{
                                        sortable: true,
                                        id: "number",
                                        name: "%recordType-number"
                                    }, {
                                        sortable: true,
                                        id: "namespace",
                                        name: "namespace"
                                    }, {
                                        sortable: true,
                                        id: "sourceFieldName",
                                        name: "sourceFieldName"
                                    }]
                                }
                            }
                        }
                    }
                }
            },
            // Sub-component wrap for rendering a list of cataloging records
            cataloging: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primary",
                    model: {
                        related: "cataloging",
                        showShowButton: true
                    },
                    category: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.permissions.getPermissibleRelatedRecords",
                            args: ["cataloging", "{permissionsResolver}", "{recordTypeManager}", "list"]
                        }
                    },
                    related: "cataloging"
                }
            },
            // Sub-component wrap for rendering a list of media records
            media: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primary",
                    model: {
                        related: "media",
                        showShowButton: true
                    },
                    category: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.permissions.getPermissibleRelatedRecords",
                            args: ["media", "{permissionsResolver}", "{recordTypeManager}", "list"]
                        }
                    },
                    related: "media"
                }
            },
            // Sub-component wrap for rendering a list of procedure records
            procedures: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primary",
                    related: "procedures",
                    category: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.permissions.getPermissibleRelatedRecords",
                            args: ["procedures", "{permissionsResolver}", "{recordTypeManager}", "list"]
                        }
                    },
                    model: {
                        related: "procedures"
                    }
                }
            },
            // Togglable headers
            togglable: {
                type: "cspace.util.togglable",
                container: "{sidebar}.container",
                options: {
                    selectors: {
                        header: "{sidebar}.options.selectors.header",
                        togglable: "{sidebar}.options.selectors.togglable"
                    }
                }
            }
        }
    });

    cspace.sidebar.preInit = function (that) {
        /**
         * Checks whether user has "list" permissions to the record types listed by the
         * relatedRecordLists in this sidebar. If this is not the case, remove them from
         * options.components.
         * @param that the sidebar component
         * @return modified that.options.component based on permissions
         */
        cspace.util.modelBuilder.fixupModel(that.model);
        //TODO: alternatively have the relatedRecordListcomponents
        // call this function before rendering, so we can avoid
        // looking through each component:
        var components = that.options.components;
        fluid.remove_if(components, function (val, key) {
            //search compoents for relatedRecordList components
            if (val !== undefined && val.type === "cspace.relatedRecordsList") {
                //check if we have list perms to record category defined by key
                return cspace.permissions.getPermissibleRelatedRecords(key, that.options.resolver, that.options.recordTypeManager, "list").length === 0;
            }
        });
    };

    cspace.sidebar.finalInit = function (that) {
        // Fire an event so that other components know we are done here
        that.events.ready.fire();
    };

    cspace.sidebar.buildModel = function (options, records) {
        // Pre-process data for future use
        if (!records || records.length < 1) {
            return;
        }
        return {
            "name": options.related,
            categoryClass: "csc-related-" + options.related,
            list: records
        };
    };

    // Fetching / Caching
    // ----------------------------------------------------
    
    // Call to primeCacheFromResources will start fetching/caching
    // of the template on this file load before the actual component's
    // creator function is called
    fluid.fetchResources.primeCacheFromResources("cspace.sidebar");

    // Wrapper component for the image part in sidebar
    fluid.defaults("cspace.sidebar.media", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        // Render tree.
        protoTree: {
            mediaHeader: {
                messagekey: "sidebar-mediaHeader"
            }
        },
        // Render immediately
        renderOnInit: true,
        components: {
            // Sub-component which will handle the image and its interactions
            mediaView: {
                type: "cspace.mediaView",
                container: "{cspace.sidebar.media}.dom.mediaViewContainer"
            },
            // Togglable header
            togglable: {
                type: "cspace.util.togglable",
                container: "{media}.container",
                options: {
                    selectors: {
                        header: "{media}.options.selectors.header",
                        togglable: "{media}.options.selectors.togglable"
                    }
                }
            }
        },
        // Selectors will be used for rendering and sub-components
        selectors: {
            mediaViewContainer: ".csc-mediaView-container",
            mediaHeader: ".csc-sidebar-mediaHeader",
            header: ".csc-media-header",
            togglable: ".csc-media-togglable"
        },
        // Message Bundle
        parentBundle: "{globalBundle}",
        // Selectors we do not want to render in render tree. We need an access them for sub-components
        selectorsToIgnore: ["header", "togglable", "mediaViewContainer"],
        strings: {}
    });

})(jQuery, fluid);