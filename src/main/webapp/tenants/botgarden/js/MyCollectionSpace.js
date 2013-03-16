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

    // Component responsible for the collection space page
    // rendering.
    fluid.defaults("cspace.myCollectionSpace", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
            "category:": ".csc-myCollectionSpace-category",
            "group:": ".csc-myCollectionSpace-group",
            groupContainer: ".csc-myCollectionSpace-group-container",
            groupType: ".csc-myCollectionSpace-groupType",
            header: ".csc-myCollectionSpace-categoryHeader",
            cataloging: ".csc-myCollectionSpace-cataloging-group",
            intake: ".csc-myCollectionSpace-intake-group",
            acquisition: ".csc-myCollectionSpace-acquisition-group",
            loanin: ".csc-myCollectionSpace-loanin-group",
            loanout: ".csc-myCollectionSpace-loanout-group",
            movement: ".csc-myCollectionSpace-movement-group",
            propagation: ".csc-myCollectionSpace-propagation-group",
            pottag: ".csc-myCollectionSpace-pottag-group",
            claim: ".csc-myCollectionSpace-claim-group",
            objectexit: ".csc-myCollectionSpace-objectexit-group",
            media: ".csc-myCollectionSpace-media-group",
            group: ".csc-myCollectionSpace-group-group",
            togglable: ".csc-toggle-selector"
        },
        selectorsToIgnore: "togglable",
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            expander: {
                repeatID: "category",
                type: "fluid.renderer.repeat",
                pathAs: "category",
                controlledBy: "categories",
                tree: {
                    header: {
                        messagekey: "${{category}.name}"
                    },
                    expander: {
                        repeatID: "group",
                        type: "fluid.renderer.repeat",
                        pathAs: "recordType",
                        valueAs: "recordTypeValue",
                        controlledBy: "{category}.list",
                        tree: {
                            groupType: {
                                messagekey: "${{recordType}.groupName}"
                            },
                            groupContainer: {
                                decorators: [{
                                    type: "addClass",
                                    classes: "{recordTypeValue}.groupClass"
                                }]
                            }
                        }
                    }
                }
            }
        },
        // TODO: Once component sibbling options are resolvable with each other, "records"
        // can be used to resolve and censor a model.
        records: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.myCollectionSpace.provideRecords",
                args: {
                    related: "nonVocabularies",
                    resolver: "{permissionsResolver}",
                    recordTypeManager: "{recordTypeManager}",
                    permission: "list"
                }
            }
        },
        model: {
            // Model is separated into categories:
            // * Cataloging
            // * Procedures
            // All of the record types are resolved with permission resolver.
            categories: [{
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.modelBuilder",
                    args: {
                        callback: "cspace.myCollectionSpace.buildModel",
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
                        callback: "cspace.myCollectionSpace.buildModel",
                        related: "procedures",
                        resolver: "{permissionsResolver}",
                        recordTypeManager: "{recordTypeManager}",
                        permission: "list"
                    }
                }
            }]
        },
        components: {
            messageBar: "{messageBar}",
            togglable: {
                type: "cspace.util.togglable",
                createOnEvent: "afterRender"
            }
        },
        preInitFunction: "cspace.myCollectionSpace.preInit",
        finalInitFunction: "cspace.myCollectionSpace.finalInit",
        // My Collection Space template.
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/pages/MyCollectionSpaceTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        }
    });

    // Build model based on permissible records.
    cspace.myCollectionSpace.buildModel = function (options, records) {
        if (!records || records.length < 1) {
            return;
        }
        return {
            "name": options.related + "Category",
            list: fluid.transform(records, function (record) {
                return {
                    groupName: record,
                    groupClass: "csc-myCollectionSpace-" + record + "-group"
                };
            })
        };
    };

    cspace.myCollectionSpace.provideRecords = function (options) {
        return cspace.permissions.getPermissibleRelatedRecords(options.related, options.resolver, options.recordTypeManager, options.permission);
    };

    cspace.myCollectionSpace.preInit = function (that) {
        // Pre-process the model.
        cspace.util.modelBuilder.fixupModel(that.model);
        // Specify all list view subcomponents depending on what
        // record types are permitted.
        var options = that.options;
        fluid.each(options.records, function (record) {
            options.components[record] = {
                container: "{myCollectionSpace}.dom." + record,
                type: "cspace.listView",
                createOnEvent: "afterRender",
                options: {
                    recordType: record,
                    model: {
                        columns: [{
                            sortable: true,
                            id: "number",
                            name: record + "-number"
                        }, {
                            sortable: true,
                            id: "summary",
                            name: "summary"
                        }, {
                            sortable: true,
                            id: "summarylist.updatedAt",
                            name: "updatedAt"
                        }]
                    }
                }
            };
        });
    };

    // Render the page at the end of initialization.
    cspace.myCollectionSpace.finalInit = function (that) {
        that.refreshView();
    };

    fluid.fetchResources.primeCacheFromResources("cspace.myCollectionSpace");

})(jQuery, fluid);
