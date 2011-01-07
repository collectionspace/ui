/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("Sidebar.js loaded");
    
    fluid.registerNamespace("cspace.sidebar");

    cspace.sidebar = function (container, options) {
        var that = fluid.initRendererComponent("cspace.sidebar", container, options);
        restrictRelatedRecordLists(that);

        that.renderer.refreshView();
        fluid.initDependents(that);
        
        that.options.applier.modelChanged.addListener("termsUsed", function (model, oldModel, changeRequest) {
            that.termsUsed.applier.requestChange("items", model.termsUsed);
            that.termsUsed.refreshView();
        });

        return that;
    };
    
    /**
     * Checks whether user has "list" permissions to the record types listed by the
     * relatedRecordLists in this sidebar. If this is not the case, remove them from
     * options.components.
     * @param that the sidebar component
     * @return modified that.options.component based on permissions
     */
    var restrictRelatedRecordLists = function (that) {
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

    /**
     * Censors the model to ensure that the markup is removed for any
     * related record lists that does any permissible content to be shown
     * (ie. user does not have permissions any content of the relatedRecordList)
     */
    cspace.sidebar.censorModel = function (model, records) {
        fluid.remove_if(model.categories, function (category, key) {
            fluid.remove_if(category.list, function (recordType, key) {
                return $.inArray(key, records) < 0;
            });
            return $.isEmptyObject(category.list);
        });
        return model;
    };

    /**
     * produce tree based on model. Create as many repeats of the
     * categoryContainer field as dictated by the categories object in the model.
     * For each repeat add a class as defined in the {categoryName}.categoryClass
     */
    cspace.sidebar.produceTree = function (that) {
        return {
            expander: {
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
            }
        };
    };

    cspace.sidebar.localRelatedRecordListOpts = function (container, options) {
        var that = fluid.initLittleComponent("cspace.sidebar.localRelatedRecordListOpts", options);
        return cspace.relatedRecordsList(container, that.options);
    };
    
    fluid.defaults("cspace.sidebar.localRelatedRecordListOpts", {
        components: {
            relationManager: {
                options: {
                    dataContext: {
                        baseUrl: "data/",
                        fileExtension: ".json"
                    }
                }
            }
        },
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        }
    });
    
    fluid.demands("cspace.recordList", "cspace.sidebar", 
        ["{sidebar}.options.selectors.termsUsed", fluid.COMPONENT_OPTIONS]);
    
    fluid.demands("procedures",  ["cspace.localData", "cspace.sidebar"], {
        funcName: "cspace.sidebar.localRelatedRecordListOpts",
        args: ["{sidebar}.options.selectors.relatedProcedures", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("procedures", "cspace.sidebar", 
        ["{sidebar}.options.selectors.relatedProcedures", fluid.COMPONENT_OPTIONS]);
    
    fluid.demands("cataloging",  ["cspace.localData", "cspace.sidebar"], {
        funcName: "cspace.sidebar.localRelatedRecordListOpts",
        args: ["{sidebar}.options.selectors.relatedCataloging", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("cataloging", "cspace.sidebar", 
        ["{sidebar}.options.selectors.relatedCataloging", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.sidebar", {
        components: {
            termsUsed: {
                type: "cspace.recordList",
                options: {
                    listeners: {
                        afterSelect: "{sidebar}.options.recordListAfterSelectHandler"
                    },
                    model: {
                        items: "{sidebar}.model.termsUsed",
                        selectionIndex: -1
                    },
                    uispec : "{sidebar}.options.uispec.termsUsed",
                    recordType: "authorities",
                    strings: {
                        nothingYet: "No Authority terms used yet"
                    }
                }
            },
            cataloging: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primaryRecordType",
                    related: "cataloging",
                    applier: "{sidebar}.options.applier",
                    uispec : "{sidebar}.options.uispec.relatedCataloging",
                    model: "{sidebar}.model",
                    recordListAfterSelectHandler: "{sidebar}.options.recordListAfterSelectHandler"
                }
            },
            procedures: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primaryRecordType",
                    related: "procedures",
                    applier: "{sidebar}.options.applier",
                    uispec : "{sidebar}.options.uispec.relatedProcedures",
                    model: "{sidebar}.model",
                    recordListAfterSelectHandler: "{sidebar}.options.recordListAfterSelectHandler"
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
                                categoryClass: "csc-related-cataloging",
                                list: {
                                    cataloging: "cataloging"
                                }
                            },
                            procedures: {
                                "name": "procedures",
                               categoryClass: "csc-related-procedures",
                               list: {
                                    intake: "intake",
                                    acquisition: "acquisition",
                                    loanin: "loanin",
                                    loanout: "loanout",
                                    movement: "movement",
                                    objectexit: "objectexit"
                                }
                            }
                        }
                    },
                    callback: "cspace.sidebar.censorModel"
                }
            }
        },
        produceTree: cspace.sidebar.produceTree,
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        recordListAfterSelectHandler: cspace.recordList.afterSelectHandlerDefault,        
        resolver: "{permissionsResolver}",
        recordTypeManager: "{recordTypeManager}", //used to decide whether to show RelatedRecordsLists
        selectors: {
            mediaSnapshot: ".csc-media-snapshot",
            termsUsed: ".csc-integrated-authorities",
            "categoryContainer:": ".csc-related-record", //to be repeated
            relatedCataloging: ".csc-related-cataloging",
            relatedProcedures: ".csc-related-procedures"
        },
        selectorsToIgnore: [ "mediaSnapshot", "termsUsed", "relatedCataloging", "relatedProcedures" ],
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/SidebarTemplate.html"
            })
        }
    });
    
    fluid.demands("sidebar", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.sidebar", fluid.COMPONENT_OPTIONS]);
        
    fluid.fetchResources.primeCacheFromResources("cspace.sidebar");
        
})(jQuery, fluid);
