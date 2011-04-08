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
    
    fluid.registerNamespace("cspace.myCollectionSpace");
    
    var buildUrl = function (recordType) {
        if (cspace.util.useLocalData()) {
            return "../../../test/data/" + recordType + "/records.json";
        } else {
            return "../../chain/" + recordType;
        }
    };
    
    var makeArrayExpander = function (recordType) {
        return fluid.expander.makeFetchExpander({
            url: buildUrl(recordType),
            fetchKey: recordType, 
            disposer: function (model) {
                model.selectonIndex = -1;
                return model;
            }
        });
    };
    
    var makeOpts = function (recordType, options) {
        return {
            strings: {
                nothingYet: "No records yet"
            },
            model: makeArrayExpander(recordType),
            globalNavigator: "{myCollectionSpace}.options.globalNavigator",
            parentBundle: "{myCollectionSpace}.options.parentBundle",
            elPaths: {
                items: "items"
            },
            columns: ["number", "summary"],
            names: [recordType + "-number", "summary"],
            showNumberOfItems: false
        };
    };
    
    var makeComponentsOpts = function (options) {
        fluid.each(options.components, function (component, key) {
            if (component.type !== "cspace.recordList") {
                return;
            }
            component.options = makeOpts(key, options);
        });
    };
    
    var setupMyCollectionSpace = function (that) {
        cspace.util.modelBuilder.fixupModel(that.model);
        var options = that.options;
        fluid.remove_if(options.components, function (component, key) {
            return component.type === "cspace.recordList" && $.inArray(key, options.records) < 0;
        });
        makeComponentsOpts(options);
        that.renderer.refreshView();
    };
    
    cspace.myCollectionSpace = function (container, options) {
        var that = fluid.initRendererComponent("cspace.myCollectionSpace", container, options);
        setupMyCollectionSpace(that);
        fluid.withEnvironment({resourceSpecCollector: that.options.collector}, function () {
            that.options.components = fluid.expander.expandLight(that.options.components, {noValue: true});
        });
        fluid.fetchResources(that.options.collector, function () {
            fluid.initDependents(that);
        });
        return that;
    };
    
    cspace.myCollectionSpace.buildModel = function (options, records) {
        if (!records || records.length < 1) {
            return;
        }
        return {
            "name": options.related,
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
    
    cspace.myCollectionSpace.produceTree = function (that) {
        return {
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
        };
    };
    
    fluid.defaults("cspace.myCollectionSpace", {
        gradeNames: ["fluid.IoCRendererComponent"],
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
            objectexit: ".csc-myCollectionSpace-objectexit-group",
            media: ".csc-myCollectionSpace-media-group",
            togglable: ".csc-toggle-selector"
        },
        selectorsToIgnore: "togglable",
        strings: {
            cataloging: "Cataloging Records",
            procedures: "Procedural Records"
        },
        collector: {},
        parentBundle: "{globalBundle}",
        globalNavigator: "{globalNavigator}",
        produceTree: cspace.myCollectionSpace.produceTree,
        // TODO: Once component sibbling options are resolvable with each other, "records"
        // can be used to resolve and censor a model.
        records: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.myCollectionSpace.provideRecords",
                args: {
                    related: "all",
                    resolver: "{permissionsResolver}",
                    recordTypeManager: "{recordTypeManager}",
                    permission: "list"
                }
            }
        },
        model: {
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
            cataloging: {
                type: "cspace.recordList"
            },
            intake: {
                type: "cspace.recordList"
            },
            acquisition: {
                type: "cspace.recordList"
            },
            loanin: {
                type: "cspace.recordList"
            },
            loanout: {
                type: "cspace.recordList"
            },
            movement: {
                type: "cspace.recordList"
            },
            objectexit: {
                type: "cspace.recordList"
            },
            media: {
                type: "cspace.recordList"
            },
            togglable: {
                type: "cspace.util.togglable",
                options: {
                    selectors: {
                        header: "{myCollectionSpace}.options.selectors.header",
                        togglable: "{myCollectionSpace}.options.selectors.togglable"
                    }
                }
            }
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/pages/MyCollectionSpaceTemplate.html"
            })
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.myCollectionSpace");
    
})(jQuery, fluid);