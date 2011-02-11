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
            listeners: {
                afterSelect: cspace.recordList.afterSelectHandlerDefault
            },
            strings: {
                nothingYet: "No records yet"
            },
            uispec: "{myCollectionSpace}.options.uispec." + recordType,
            model: makeArrayExpander(recordType),
            globalNavigator: options.globalNavigator
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
        var resourceSpecs = {};
        setupMyCollectionSpace(that);
        fluid.withEnvironment({resourceSpecCollector: resourceSpecs}, function () {
            that.options.components = fluid.expander.expandLight(that.options.components, {noValue: true});
        });
        fluid.fetchResources(resourceSpecs, function () {
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
                    groupClass: "csc-myCollectionSpace-" + record + "-group",
                    numberName: record + "-number"
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
                            },
                            groupNumber: {
                                messagekey: "${{recordType}.numberName}"
                            },
                            groupSummary: {
                                messagekey: "summary"
                            }
                        }
                    }
                }
            }
        };
    };
    
    fluid.demands("cataloging", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.cataloging", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("intake", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.intake", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("acquisition", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.acquisition", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("loanin", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.loanin", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("loanout", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.loanout", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("movement", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.movement", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("objectexit", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.objectexit", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("togglable", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.container", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.myCollectionSpace", {
        selectors: {
            "category:": ".csc-myCollectionSpace-category", 
            "group:": ".csc-myCollectionSpace-group",
            groupContainer: ".csc-myCollectionSpace-group-container",
            groupType: ".csc-myCollectionSpace-groupType",
            groupSummary: ".csc-myCollectionSpace-group-summary",
            groupNumber: ".csc-myCollectionSpace-group-number",
            header: ".csc-myCollectionSpace-categoryHeader",
            cataloging: ".csc-myCollectionSpace-cataloging-group",
            intake: ".csc-myCollectionSpace-intake-group",
            acquisition: ".csc-myCollectionSpace-acquisition-group",
            loanin: ".csc-myCollectionSpace-loanin-group",
            loanout: ".csc-myCollectionSpace-loanout-group",
            movement: ".csc-myCollectionSpace-movement-group",
            objectexit: ".csc-myCollectionSpace-objectexit-group",
            togglable: ".csc-toggle-selector"
        },
        selectorsToIgnore: "togglable",
        strings: {
            cataloging: "Cataloging Records",
            procedures: "Procedural Records"
        },
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
    
    fluid.demands("myCollectionSpace", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.myCollectionSpace", fluid.COMPONENT_OPTIONS]);
    
    fluid.fetchResources.primeCacheFromResources("cspace.myCollectionSpace");
    
})(jQuery, fluid);