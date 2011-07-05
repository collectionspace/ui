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
    
    var setupSideBar = function (that) {
        that.locate("numOfTerms").text(fluid.stringTemplate(that.options.strings.numOfTerms, {
            numOfTerms: that.termsUsed.calculateRecordListSize()
        }));
    }; 

    cspace.sidebar = function (container, options) {
        var that = fluid.initRendererComponent("cspace.sidebar", container, options);
        restrictRelatedRecordLists(that);
        fluid.initDependents(that);
        that.renderer.refreshView();
        
        that.options.recordApplier.modelChanged.addListener("termsUsed", function (model, oldModel, changeRequest) {
            that.termsUsed.applier.requestChange("items", model.termsUsed);
            that.termsUsed.refreshView();
            setupSideBar(that);
        });
        
        setupSideBar(that);
        
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
            mediaHeader: {
                messagekey: "mediaHeader"
            },
            termsHeader: {
                messagekey: "termsHeader"
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
            }, {
                type: "fluid.renderer.condition",
                condition: that.showMediumImage(),
                trueTree: {
                    mediumImage: {
                        decorators: [{
                            type: "addClass",
                            classes: that.options.styles.mediumImage
                        }, {
                            type: "attrs",
                            attributes: {
                                alt: that.options.strings.mediumImage,
                                src: that.options.recordModel.fields && that.options.recordModel.fields.blobs && that.options.recordModel.fields.blobs.length > 0 ? 
                                    that.options.recordModel.fields.blobs[0].imgMedium : ""
                            }
                        }]
                    },
                    mediaSnapshot: {
                        decorators: [{
                            type: "addClass",
                            classes: that.options.styles.mediaSnapshot
                        }]
                    }
                },
                falseTree: {
                    mediaSnapshot: {}
                }
            }]
        };
    };
    
    cspace.sidebar.showMediumImage = function (recordModel) {
        if (!recordModel.fields) {
            return false;
        }
        return !!(recordModel.fields.blobs && recordModel.fields.blobs.length > 0);
    };
    
    fluid.defaults("cspace.sidebar", {
        gradeNames: "fluid.rendererComponent",
        components: {
            report: {
                type: "cspace.reportProducer",
                createOnEvent: "afterRender"
            },
            termsUsed: {
                type: "cspace.recordList",
                createOnEvent: "afterRender",
                options: {
                    model: {
                        items: "{sidebar}.options.recordModel.termsUsed"
                    },
                    elPaths: {
                        items: "items"
                    },
                    columns: ["number", "sourceFieldName", "recordtype"],
                    strings: {
                        number: "Term",
                        sourceFieldName: "Field",
                        recordtype: "Vocabulary",
                        nothingYet: "No Authority terms used yet"
                    },
                    showNumberOfItems: false
                }
            },
            cataloging: {
                type: "cspace.relatedRecordsList",
                createOnEvent: "afterRender",
                options: {
                    primary: "{sidebar}.options.primaryRecordType",
                    related: "cataloging",
                    applier: "{sidebar}.options.recordApplier",
                    model: "{sidebar}.options.recordModel",
                    relationsElPath: "{sidebar}.options.relationsElPath"
                }
            },
            procedures: {
                type: "cspace.relatedRecordsList",
                createOnEvent: "afterRender",
                options: {
                    primary: "{sidebar}.options.primaryRecordType",
                    related: "procedures",
                    applier: "{sidebar}.options.recordApplier",
                    model: "{sidebar}.options.recordModel",
                    relationsElPath: "{sidebar}.options.relationsElPath"
                }
            },
            togglable: {
                type: "cspace.util.togglable",
                createOnEvent: "afterRender",
                options: {
                    selectors: {
                        header: "{sidebar}.options.selectors.header",
                        togglable: "{sidebar}.options.selectors.togglable"
                    }
                }
            }
        },
        invokers: {
            showMediumImage: {
                funcName: "cspace.sidebar.showMediumImage",
                args: "{sidebar}.options.recordModel"
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
        resolver: "{permissionsResolver}",
        recordTypeManager: "{recordTypeManager}", //used to decide whether to show RelatedRecordsLists
        selectors: {
            numOfTerms: ".csc-num-items-terms",
            mediaSnapshot: ".csc-media-snapshot",
            mediumImage: ".csc-sidebar-mediumImage",
            termsUsed: ".csc-integrated-authorities",
            "categoryContainer:": ".csc-related-record", //to be repeated
            relatedCataloging: ".csc-related-cataloging",
            relatedProcedures: ".csc-related-procedures",
            mediaHeader: ".csc-sidebar-mediaHeader",
            termsHeader: ".csc-sidebar-termsHeader",
            header: ".csc-sidebar-header",
            togglable: ".csc-sidebar-togglable",
            report: ".csc-sidebar-report"
        },
        selectorsToIgnore: ["report", "numOfTerms", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable"],
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SidebarTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        strings: {
            numOfTerms: "(%numOfTerms)",
            mediaHeader: "Media Snapshot",
            termsHeader: "Terms Used",
            mediumImage: "This is medium media image."
        },
        styles: {
            mediumImage: "cs-sidebar-mediumImage",
            mediaSnapshot: "cs-media-snapshot-image"
        }
    });
        
    fluid.fetchResources.primeCacheFromResources("cspace.sidebar");
        
})(jQuery, fluid);
