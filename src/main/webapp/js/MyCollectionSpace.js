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
            component.options = makeOpts(key, options);
        });
    };
    
    var bindEvents = function (that) {
        that.locate("header").click(function () {
            var source = $(this);
            source.next(that.options.selectors.togglable).toggle();
            source.toggleClass(that.options.styles.expanded);
            source.toggleClass(that.options.styles.collapsed);
            return false;
        });
    };
    
    var setupMyCollectionSpace = function (that) {
        var options = that.options;
        fluid.remove_if(options.components, function (component, key) {
            return $.inArray(key, options.records) < 0;
        });
        makeComponentsOpts(options);
        that.renderer.refreshView();
        bindEvents(that);
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
    
    cspace.myCollectionSpace.censorModel = function (model, records) {
        fluid.remove_if(model.categories, function (category, key) {
            fluid.remove_if(category.list, function (recordType, key) {
                return $.inArray(key, records) < 0;
            });
            return $.isEmptyObject(category.list);
        });
        return model;
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
            procedures: "Procedural Records",
            intake: "Intake Records",
            acquisition: "Acquisition Records",
            loanin: "Loanin Records",
            loanout: "Loanout Records",
            movement: "Movement Records",
            objectexit: "Object Exit Records",
            summary: "Summary",
            identificationNumber: "Identification Number",
            entryNumber: "Entry Number",
            loaninNumber: "Loan In Number",
            loanoutNumber: "Loan Out Number",
            currentLocation: "Current Location",
            exitNumber: "Exit Number"
        },
        styles: {
            expanded: "cs-myCollectionSpace-expanded",
            collapsed: "cs-myCollectionSpace-collapsed"
        },
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
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.modelBuilder",
                args: {
                    related: "all",
                    resolver: "{permissionsResolver}",
                    recordTypeManager: "{recordTypeManager}",
                    permission: "list",
                    model: {
                        categories: {
                            cataloging: {
                                "name": "cataloging",
                                list: {
                                    cataloging: {
                                        groupName: "cataloging",
                                        groupClass: "csc-myCollectionSpace-cataloging-group",
                                        numberName: "identificationNumber"
                                    }
                                }
                            },
                            procedures: {
                                "name": "procedures",
                                list: {
                                    intake: {
                                        groupName: "intake",
                                        groupClass: "csc-myCollectionSpace-intake-group",
                                        numberName: "entryNumber"
                                    }, 
                                    acquisition: {
                                        groupName: "acquisition",
                                        groupClass: "csc-myCollectionSpace-acquisition-group",
                                        numberName: "entryNumber"
                                    },
                                    loanin: {
                                        groupName: "loanin",
                                        groupClass: "csc-myCollectionSpace-loanin-group",
                                        numberName: "loaninNumber"
                                    },
                                    loanout: {
                                        groupName: "loanout",
                                        groupClass: "csc-myCollectionSpace-loanout-group",
                                        numberName: "loanoutNumber"
                                    },
                                    movement: {
                                        groupName: "movement",
                                        groupClass: "csc-myCollectionSpace-movement-group",
                                        numberName: "currentLocation"
                                    },
                                    objectexit: {
                                        groupName: "objectexit",
                                        groupClass: "csc-myCollectionSpace-objectexit-group",
                                        numberName: "exitNumber"
                                    }
                                }
                            }
                        }
                    },
                    callback: "cspace.myCollectionSpace.censorModel"
                }
            }
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