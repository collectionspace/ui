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
            numOfTerms: ".csc-num-items-terms",
            termsUsed: ".csc-integrated-authorities",
            categoryContainer: ".csc-related-record",
            relatedCataloging: ".csc-related-cataloging",
            relatedProcedures: ".csc-related-procedures",
            termsHeader: ".csc-sidebar-termsHeader",
            header: ".csc-sidebar-header",
            togglable: ".csc-sidebar-togglable",
            report: ".csc-sidebar-report"
        },
        renderOnInit: true,
        repeatingSelectors: ["categoryContainer"],
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
            recordModel: "preserve",
            recordApplier: "nomerge",
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
            globalModel: "{globalModel}",
            report: {
                type: "cspace.reportProducer",
                container: "{sidebar}.dom.report"
            },
            /*
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
*/
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

    /*
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
*/

    fluid.defaults("cspace.sidebar.media", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "cspace.sidebar.media.preInit",
        finalInitFunction: "cspace.sidebar.media.finalInit",
        produceTree: "cspace.sidebar.media.produceTree",
        components: {
            globalModel: "{globalModel}",
            globalEvents: "{globalEvents}",
            relatedMedia: {
                type: "cspace.sidebar.media.dataSource"
            },
            togglable: {
                type: "cspace.util.togglable",
                createOnEvent: "afterRender",
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
        strings: {},
        events: {
            onRender: null
        },
        listeners: {
            onRender: "{cspace.sidebar.media}.onRender"
        },
        relatedMediaUrl: cspace.componentUrlBuilder("%tenant/%tname/%primary/media/%csid?pageNum=0&pageSize=0")
    });

    fluid.demands("cspace.sidebar.media.dataSource",  ["cspace.localData", "cspace.sidebar.media"], {
        funcName: "cspace.sidebar.media.testDataSource",
        args: {
            targetTypeName: "cspace.sidebar.media.testDataSource",
            termMap: {
                recordType: "%recordType"
            }
        }
    });
    fluid.demands("cspace.sidebar.media.dataSource", "cspace.sidebar.media", {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.sidebar.media}.options.relatedMediaUrl",
            termMap: {
                primary: "{cspace.sidebar}.options.primary",
                csid: "{globalModel}.model.primaryModel.csid"
            },
            targetTypeName: "cspace.sidebar.media.dataSource"
        }
    });

    fluid.defaults("cspace.sidebar.media.testDataSource", {
        url: "%test/data/relationships.json"
    });
    cspace.sidebar.media.testDataSource = cspace.URLDataSource;
        
    cspace.sidebar.media.finalInit = function (that) {
        that.getRelatedMedia();
        that.globalEvents.events.relationsUpdated.addListener(function (related) {
            if (related !== "media") {
                return;
            }
            that.getRelatedMedia();
        });
    };
    
    cspace.sidebar.media.preInit = function (that) {
        that.onRender = function () {
            that.refreshView();
        };

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

        that.getRelatedMedia = function () {
            that.relatedMedia.get(null, function (data) {
                that.applier.requestChange("relatedMedia", fluid.get(data, "relations.media"));
                that.events.onRender.fire();
            });
        };
        
        that.getMedia = function (format) {
            var model = that.globalModel.model.primaryModel;
            if (!model.fields) {
                return that.formatMedia("", format);
            }
            var imgThumb;
            if (fluid.get(model, "fields.blobCsid")) {
                imgThumb = fluid.get(model, "fields.blobs.0.imgThumb");
            }
            if (imgThumb) {
                return that.formatMedia(imgThumb, format);
            }
            imgThumb = fluid.find(that.model.relatedMedia, function (thisMedia) {
                thisMedia = fluid.get(thisMedia, "summarylist.imgThumb");
                if (thisMedia) {return thisMedia;}
            });
            if (imgThumb) {
                return that.formatMedia(imgThumb, format);
            }
            return that.formatMedia("", format);
        };

		that.getOriginalImage = function () {
            var src = that.getMedia("Original");
			window.open(src, "_blank", that.options.parentBundle.resolve("media-originalMediaOptions", ["600", "800", "yes"]));
		};
				
		that.applier.modelChanged.addListener("fields.blobCsid", function () {
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
                                alt: that.options.parentBundle.resolve("sidebar-mediumImage"),
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

})(jQuery, fluid);