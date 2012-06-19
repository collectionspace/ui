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
            termsUsedBanner: ".csc-sidebar-termsUsed",
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
        selectorsToIgnore: ["report", "numOfTerms", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable", "termsUsedBanner"],
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
        events: {
            primaryRecordCreated: {
                event: "{globalEvents}.events.primaryRecordCreated"
            },
            primaryRecordSaved: {
                event: "{globalEvents}.events.primaryRecordSaved"
            }
        },
        listeners: {
            primaryRecordSaved: "{cspace.sidebar}.primaryRecordSavedHandler"
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
            instantiator: "{instantiator}",
            globalModel: "{globalModel}",
            report: {
                type: "cspace.reportProducer",
                container: "{sidebar}.dom.report"
            },
            numberOfTerms: {
                type: "cspace.sidebar.numberOfTerms",
                container: "{sidebar}.dom.numOfTerms"
            },
            termsUsed: {
                type: "cspace.listView",
                createOnEvent: "primaryRecordCreated",
                container: "{sidebar}.dom.termsUsed",
                options: {
                    recordType: "authorities",
                    urls: cspace.componentUrlBuilder({
                        listUrl: "%tenant/%tname/%primary/authorities/%csid?pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey"
                    }),
                    produceTree: "cspace.listView.produceTreeSidebar",
                    elPath: "results",
                    model: {
                        pageSizeList: ["5", "10", "20", "50"],
                        columns: [{
                            sortable: true,
                            id: "number",
                            name: "%recordType-number"
                        }, {
                            sortable: true,
                            id: "recordtype",
                            name: "recordType"
                        }, {
                            sortable: true,
                            id: "sourceFieldName",
                            name: "sourceFieldName"
                        }]
                    },
                    components: {
                        pager: {
                            options: {
                                summary: {
                                    options: {
                                        message: {
                                            expander: {
                                                type: "fluid.deferredInvokeCall",
                                                func: "cspace.util.resolveMessage",
                                                args: ["{globalBundle}", "listView-total-short"]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            termsUsedBanner: {
                type: "cspace.sidebar.banner",
                container: "{sidebar}.dom.termsUsedBanner",
                options: {
                    selectors: {
                        list: "{sidebar}.dom.termsUsed"
                    }
                }
            },
            /*
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

        that.updateNumOfTerms = function () {
            var name = "numberOfTerms";
            if (that[name]) {
                that.instantiator.clearComponent(that, name);
            }
            fluid.initDependent(that, name, that.instantiator);
        };

        that.primaryRecordSavedHandler = function () {
            that.termsUsed.updateModel();
        };
    };

    fluid.defaults("cspace.sidebar.numberOfTerms", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        finalInitFunction: "cspace.sidebar.numberOfTerms.finalInit",
        invokers: {
            calculateSize: "cspace.sidebar.numberOfTerms.calculateSize"
        },
        components: {
            globalBundle: "{globalBundle}"
        }
    });

    fluid.demands("cspace.sidebar.numberOfTerms.calculateSize", "cspace.sidebar.numberOfTerms", {
        funcName: "cspace.sidebar.numberOfTerms.calculateSize",
        args: "{cspace.sidebar}"
    });

    cspace.sidebar.numberOfTerms.calculateSize = function (sidebar) {
        return fluid.get(sidebar, "termsUsed.pager.model.totalRange") || 0;
    };

    cspace.sidebar.numberOfTerms.finalInit = function (that) {
         that.container.text(that.globalBundle.resolve("sidebar-numOfTerms", [that.calculateSize()]));
    };

    fluid.defaults("cspace.sidebar.banner", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        events: {
            primaryRecordCreated: {
                event: "{cspace.sidebar}.events.primaryRecordCreated"
            }
        },
        listeners: {
            primaryRecordCreated: "{cspace.sidebar.banner}.primaryRecordCreatedHandler"
        },
        selectors: {
            banner: ".csc-sidebar-banner",
            bannerMessage: ".csc-sidebar-banner-message"
        },
        selectorsToIgnore: ["list"],
        styles: {
            banner: "cs-sidebar-banner",
            bannerMessage: "cs-sidebar-banner-message"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            banner: {
                decorators: {
                    addClass: "{styles}.banner"
                }
            },
            bannerMessage: {
                messagekey: "sidebar-banner-message",
                args: [],
                decorators: {
                    addClass: "{styles}.bannerMessage"
                }
            }
        },
        renderOnInit: true,
        preInitFunction: "cspace.sidebar.banner.preInit",
        postInitFunction: "cspace.sidebar.banner.postInit"
    });

    cspace.sidebar.banner.preInit = function (that) {
        that.primaryRecordCreatedHandler = function () {
            that.locate("list").show();
            that.locate("banner").hide();
        };
    };

    cspace.sidebar.banner.postInit = function (that) {
        that.locate("banner").show();
        that.locate("list").hide();
    };

    fluid.demands("cspace.listView.dataSource", ["cspace.localData", "cspace.listView", "cspace.sidebar"], {
        funcName: "cspace.sidebar.termsUsedDataSourceTest",
        args: {
            targetTypeName: "cspace.sidebar.termsUsedDataSourceTest",
            termMap: {
                primary: "{cspace.sidebar}.options.primary",
                csid: "{globalModel}.model.primaryModel.csid"
            },
            responseParser: "cspace.sidebar.responseParserTermsUsed"
        }
    });
    fluid.demands("cspace.sidebar.termsUsedDataSource", ["cspace.listView", "cspace.sidebar"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.listView}.options.urls.listUrl",
            termMap: {
                primary: "{cspace.sidebar}.options.primary",
                csid: "{globalModel}.model.primaryModel.csid",
                pageNum: "%pageNum",
                pageSize: "%pageSize",
                sortDir: "%sortDir",
                sortKey: "%sortKey"
            },
            targetTypeName: "cspace.sidebar.termsUsedDataSource",
            responseParser: "cspace.sidebar.responseParserTermsUsed"
        }
    });

    fluid.defaults("cspace.sidebar.termsUsedDataSourceTest", {
        url: "%test/data/%primary/authorities/%csid.json"
    });
    cspace.sidebar.termsUsedDataSourceTest = cspace.URLDataSource;
    cspace.sidebar.responseParserTermsUsed = function (data) {
        data = data.termsUsed;
        data.pagination = fluid.makeArray(data.pagination)[0];
        return data;
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