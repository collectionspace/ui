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
        
        that.options.recordApplier.modelChanged.addListener("termsUsed", function (model, oldModel, changeRequest) {
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

    /**
     * produce tree based on model. Create as many repeats of the
     * categoryContainer field as dictated by the categories object in the model.
     * For each repeat add a class as defined in the {categoryName}.categoryClass
     */
    cspace.sidebar.produceTree = function (that) {
        return {
            reportHeader: {
                messagekey: "reportHeader"
            },
            mediaHeader: {
                messagekey: "mediaHeader"
            },
            termsHeader: {
                messagekey: "termsHeader"
            },
            termsHeaderTerm: {
                messagekey: "termsHeaderTerm"
            },
            termsHeaderVocabulary: {
                messagekey: "termsHeaderVocabulary"
            },
            termsHeaderField: {
                messagekey: "termsHeaderField"
            },
            reportButton: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.reportButton                        
                    }
                }
            },
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
    
    fluid.defaults("cspace.sidebar", {
        gradeNames: ["fluid.rendererComponent"],
        components: {
            termsUsed: {
                type: "cspace.recordList",
                options: {
                    listeners: {
                        afterSelect: "{sidebar}.options.recordListAfterSelectHandler"
                    },
                    model: {
                        items: "{sidebar}.options.recordModel.termsUsed",
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
                    applier: "{sidebar}.options.recordApplier",
                    uispec : "{sidebar}.options.uispec.relatedCataloging",
                    model: "{sidebar}.options.recordModel",
                    recordListAfterSelectHandler: "{sidebar}.options.recordListAfterSelectHandler"
                }
            },
            procedures: {
                type: "cspace.relatedRecordsList",
                options: {
                    primary: "{sidebar}.options.primaryRecordType",
                    related: "procedures",
                    applier: "{sidebar}.options.recordApplier",
                    uispec : "{sidebar}.options.uispec.relatedProcedures",
                    model: "{sidebar}.options.recordModel",
                    recordListAfterSelectHandler: "{sidebar}.options.recordListAfterSelectHandler"
                }
            },
            togglable: {
                type: "cspace.util.togglable",
                options: {
                    selectors: {
                        header: "{sidebar}.options.selectors.header",
                        togglable: "{sidebar}.options.selectors.togglable"
                    }
                }
            }
        },
        model: {
            categories: [{
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
        produceTree: cspace.sidebar.produceTree,
        mergePolicy: {
            recordModel: "preserve",
            recordApplier: "nomerge"
        },
        recordListAfterSelectHandler: cspace.recordList.afterSelectHandlerDefault,        
        resolver: "{permissionsResolver}",
        recordTypeManager: "{recordTypeManager}", //used to decide whether to show RelatedRecordsLists
        selectors: {
            mediaSnapshot: ".csc-media-snapshot",
            termsUsed: ".csc-integrated-authorities",
            "categoryContainer:": ".csc-related-record", //to be repeated
            relatedCataloging: ".csc-related-cataloging",
            relatedProcedures: ".csc-related-procedures",
            reportHeader: ".csc-sidebar-reportHeader",
            reportButton: ".csc-sidebar-reportButton",
            mediaHeader: ".csc-sidebar-mediaHeader",
            termsHeader: ".csc-sidebar-termsHeader",
            termsHeaderTerm: ".csc-sidebar-termsHeaderTerm",
            termsHeaderVocabulary: ".csc-sidebar-termsHeaderVocabulary",
            termsHeaderField: ".csc-sidebar-termsHeaderField",
            header: ".csc-sidebar-header",
            togglable: ".csc-sidebar-togglable"
        },
        selectorsToIgnore: ["mediaSnapshot", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable"],
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SidebarTemplate.html"
            })
        },
        strings: {
            reportHeader: "Create Report",
            mediaHeader: "Media Snapshot",
            termsHeader: "Terms Used",
            termsHeaderTerm: "Term",
            termsHeaderVocabulary: "Vocabulary",
            termsHeaderField: "Field",
            reportButton: "Create"
        }
    });
        
    fluid.fetchResources.primeCacheFromResources("cspace.sidebar");
        
})(jQuery, fluid);
