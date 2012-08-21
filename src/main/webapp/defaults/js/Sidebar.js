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
    
    fluid.defaults("cspace.sidebar", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        preInitFunction: "cspace.sidebar.preInit",
        parentBundle: "{globalBundle}",
        strings: {},
        selectors: {
            media: ".csc-sidebar-media",
            termsUsed: ".csc-integrated-authorities",
            termsUsedBanner: ".csc-sidebar-termsUsed",
            categoryContainer: ".csc-related-record",
            relatedVocabularies: ".csc-related-vocabularies",
            relatedCataloging: ".csc-related-cataloging",
            relatedProcedures: ".csc-related-procedures",
            termsHeader: ".csc-sidebar-termsHeader",
            header: ".csc-sidebar-header",
            togglable: ".csc-sidebar-togglable",
            report: ".csc-sidebar-report"
        },
        renderOnInit: true,
        repeatingSelectors: ["categoryContainer"],
        selectorsToIgnore: ["report", "termsUsed", "relatedVocabularies", "relatedCataloging", "relatedProcedures", "header", "togglable", "termsUsedBanner"],
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SidebarTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
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
        model: {
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
                        related: "procedures",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "list"
                    }
                }
            }]
        },
        recordTypeManager: "{recordTypeManager}",
        resolver: "{permissionsResolver}",
        components: {
            instantiator: "{instantiator}",
            report: {
                type: "cspace.reportProducer",
                container: "{sidebar}.dom.report",
                options: {
                    recordType: "{sidebar}.options.primary"
                }
            },
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
                                        id: "recordtype",
                                        name: "recordType"
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
            cataloging: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primary",
                    model: {
                        related: "cataloging"
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

    cspace.sidebar.buildModel = function (options, records) {
        if (!records || records.length < 1) {
            return;
        }
        return {
            "name": options.related,
            categoryClass: "csc-related-" + options.related,
            list: records
        };
    };

    fluid.fetchResources.primeCacheFromResources("cspace.sidebar");

    fluid.defaults("cspace.sidebar.media", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        protoTree: {
            mediaHeader: {
                messagekey: "sidebar-mediaHeader"
            }
        },
        renderOnInit: true,
        components: {
            mediaView: {
                type: "cspace.mediaView",
                container: "{cspace.sidebar.media}.dom.mediaViewContainer"
            },
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
        selectors: {
            mediaViewContainer: ".csc-mediaView-container",
            mediaHeader: ".csc-sidebar-mediaHeader",
            header: ".csc-media-header",
            togglable: ".csc-media-togglable"
        },
        parentBundle: "{globalBundle}",
        selectorsToIgnore: ["header", "togglable", "mediaViewContainer"],
        strings: {}
    });

})(jQuery, fluid);