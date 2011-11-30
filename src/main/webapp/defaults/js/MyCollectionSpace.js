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
            return "../../../../test/data/" + recordType + "/records.json";
        } else {
            var expander = fluid.invoke("cspace.urlExpander");
            return expander("%tenant/%tenantname/" + recordType);
        }
    };
    
    var makeArrayExpander = function (recordType, options) {
        return fluid.expander.makeFetchExpander({
            url: buildUrl(recordType),
//          TODO: Can't specify the data tupe because makeDefaultFetchOptions expander expects
//          data of type text that it then tries to parse.
//            options: {
//                dataType: "json"
//            },
            fetchKey: recordType, 
            disposer: function (model) {
                model.selectonIndex = -1;
                model.messagekeys = { 
                    nothingYet: "myCollectionSpace-nothingYet" 
                };
                return model;
            }
        });
    };
    
    var makeOpts = function (recordType, options) {
        return {
            model: makeArrayExpander(recordType, options),
            globalNavigator: "{myCollectionSpace}.options.globalNavigator",
            parentBundle: "{myCollectionSpace}.options.parentBundle",
            elPaths: {
                items: "items"
            },
            columns: ["number", "summary", "summarylist.updatedAt"],
            names: [recordType + "-number", "summary", "updatedAt"],
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
        
        that.displayErrorMessage = function (message) {
            cspace.util.displayErrorMessage(that.options.messageBar, message);
        };
        
        that.lookupMessage = function (message) {
            return cspace.util.lookupMessage(that.options.parentBundle.messageBase, message);
        };
        
        that.events.onFetch.fire();
        cspace.util.modelBuilder.fixupModel(that.model);
        var options = that.options;
        fluid.remove_if(options.components, function (component, key) {
            return component.type === "cspace.recordList" && $.inArray(key, options.records) < 0;
        });
        options.applier = that.applier;
        makeComponentsOpts(options);
        that.renderer.refreshView();
    };
    
    var initDependent = function (that, key) {
        return function () {
            fluid.initDependent(that, key, that.options.instantiator);
        };
    };
    
    cspace.myCollectionSpace = function (container, options) {
        var that = fluid.initRendererComponent("cspace.myCollectionSpace", container, options);
        setupMyCollectionSpace(that);
        fluid.withEnvironment({resourceSpecCollector: that.options.collector}, function () {
            that.options.components = fluid.expander.expandLight(that.options.components, {
                fetcher: fluid.makeEnvironmentFetcher()
            });
        });
        fluid.each(that.options.collector, function (spec, key) {
            spec.options.success = cspace.util.composeCallbacks(spec.options.success, initDependent(that, key));
            spec.options.error = cspace.util.composeCallbacks(spec.options.error, cspace.util.provideErrorCallback(that, spec.href, "errorFetching"));
        });
        fluid.initDependent(that, "togglable", that.options.instantiator);
        fluid.fetchResources(that.options.collector, function () {
            that.events.afterFetch.fire();
        });
        return that;
    };
    
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
        gradeNames: "fluid.rendererComponent",
        instantiator: "{instantiator}",
        mergePolicy: {
            instantiator: "nomerge"
        },
        events: {
            onFetch: null,
            afterFetch: null
        },
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
            group: ".csc-myCollectionSpace-group-group",
            togglable: ".csc-toggle-selector"
        },
        selectorsToIgnore: "togglable",
        strings: {},
        collector: {},
        parentBundle: "{globalBundle}",
        globalNavigator: "{globalNavigator}",
        messageBar: "{messageBar}",
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
            group: {
                type: "cspace.recordList"
            },
            togglable: {
                type: "cspace.util.togglable"
            }
        },
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
    
    fluid.fetchResources.primeCacheFromResources("cspace.myCollectionSpace");
    
})(jQuery, fluid);
