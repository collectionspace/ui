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
        that.locate("numOfTerms").text(fluid.stringTemplate(that.lookupMessage("sidebar-numOfTerms"), {
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
        };
    };
    
    fluid.defaults("cspace.sidebar.media", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "cspace.sidebar.media.preInit",
        finalInitFunction: "cspace.sidebar.media.finalInit",
        produceTree: "cspace.sidebar.media.produceTree",
        invokers: {
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{sidebar}.options.parentBundle.messageBase", "{arguments}.0"]
            }
        },
        components: {
            togglable: {
                type: "cspace.util.togglable",
                createOnEvent: "afterRender",
                options: {
                    selectors: {
                        header: "{media}.options.selectors.header",
                        togglable: "{media}.options.selectors.togglable"
                    }
                }
            }
        },
        selectors: {
            mediaHeader: ".csc-sidebar-mediaHeader",
            mediaSnapshot: ".csc-media-snapshot",
            mediumImage: ".csc-sidebar-mediumImage",
            header: ".csc-media-header",
            togglable: ".csc-media-togglable"
        },
        parentBundle: "{globalBundle}",
        selectorsToIgnore: ["header", "togglable"],
        styles: {
            mediumImage: "cs-sidebar-mediumImage",
            mediaSnapshot: "cs-media-snapshot-image"
        },
        strings: { }
    });
        
    cspace.sidebar.media.finalInit = function (that) {
        that.refreshView();
    };
    
    cspace.sidebar.media.preInit = function (that) {
        that.formatMedia = function (url, format) {
            var bool = !!url;
            if (format === "bool") {
                return bool;
            }
            if (!url) {
                return url;
            }
            return url.replace(/Thumbnail/, format === "Medium" ? "Medium": "OriginalJpeg");
        };
        
        that.getMedia = function (format) {
            if (!that.model.fields) {
                return that.formatMedia("", format);
            }
            var imgThumb;
            if (fluid.get(that.model, "fields.blobCsid")) {
                imgThumb = fluid.get(that.model, "fields.blobs.0.imgThumb");
            }
            if (imgThumb) {
                return that.formatMedia(imgThumb, format);
            }
            imgThumb = fluid.get(that.model, "relations.media.0.summarylist.imgThumb");
            if (imgThumb) {
                return that.formatMedia(imgThumb, format);
            }
            return that.formatMedia("", format);
        };

		that.getOriginalImage = function () {
            var src = that.getMedia("Original");
				
			window.open(src, "_blank", fluid.stringTemplate(that.lookupMessage("media-originalMediaOptions"), {
				height: "600",
				width: "800",
				scrollbars: "yes"
			}));
		};
				
		that.applier.modelChanged.addListener("fields.blobCsid", function () {
            that.refreshView();
        });
        
        that.applier.modelChanged.addListener("relations.media", function () {
            that.refreshView();
        });
        
    };
    
    cspace.sidebar.media.produceTree = function (that) {
        return {
            mediaHeader: {
                messagekey: "sidebar-mediaHeader"
            },
            expander: {
                type: "fluid.renderer.condition",
                condition: that.getMedia("bool"),
                trueTree: {
                    mediumImage: {
                        decorators: [{
                            addClass: "{styles}.mediumImage"
                        }, {
                            type: "attrs",
                            attributes: {
                                alt: that.lookupMessage("sidebar-mediumImage"),
                                src: that.getMedia("Medium")
                            }
                        }, {
                            type: "jQuery",
                            func: "click", 
                            args: that.getOriginalImage
                        }]
                    },
                    mediaSnapshot: {
                        decorators: {
                            addClass: "{styles}.mediaSnapshot"
                        }
                    }
                },
                falseTree: {
                    mediaSnapshot: {}
                }
            }
        };
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
                        items: "{sidebar}.options.recordModel.termsUsed",
                        messagekeys: {
                            nothingYet: "sidebar-nothingYet"
                        }
                    },
                    elPaths: {
                        items: "items"
                    },
                    columns: ["number", "recordtype", "sourceFieldName"],
                    strings: {
                        number: "{globalBundle}.messageBase.rl-rrl-termsUsed-number",
                        sourceFieldName: "{globalBundle}.messageBase.rl-rrl-termsUsed-sourceFieldName",
                        recordtype: "{globalBundle}.messageBase.rl-rrl-termsUsed-recordtype"
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
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{sidebar}.options.parentBundle.messageBase", "{arguments}.0"]
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
            recordApplier: "nomerge",
            recordTypeManager: "nomerge",
            resolver: "nomerge"
        },
        recordTypeManager: "{recordTypeManager}",
        resolver: "{permissionsResolver}",
        selectors: {
            media: ".csc-sidebar-media",
            numOfTerms: ".csc-num-items-terms",
            termsUsed: ".csc-integrated-authorities",
            "categoryContainer:": ".csc-related-record", //to be repeated
            relatedCataloging: ".csc-related-cataloging",
            relatedProcedures: ".csc-related-procedures",
            termsHeader: ".csc-sidebar-termsHeader",
            header: ".csc-sidebar-header",
            togglable: ".csc-sidebar-togglable",
            report: ".csc-sidebar-report"
        },
        parentBundle: "{globalBundle}",
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
        strings: { }
    });
        
    fluid.fetchResources.primeCacheFromResources("cspace.sidebar");
        
})(jQuery, fluid);
