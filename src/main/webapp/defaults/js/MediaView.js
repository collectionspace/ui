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

    fluid.defaults("cspace.mediaView", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            mediaSnapshot: ".csc-mediaView-snapshot",
            mediumImage: ".csc-mediaView-mediumImage"
        },
        produceTree: "cspace.mediaView.produceTree",
        styles: {
            mediumImage: "cs-mediaView-mediumImage",
            mediaSnapshot: "cs-mediaView-snapshot"
        },
        components: {
            globalModel: "{globalModel}",
            globalEvents: "{globalEvents}",
            relatedMedia: {
                type: "cspace.mediaView.dataSource"
            }
        },
        model: {
            primaryMedia: {},
            relatedMedia: []
        },
        preInitFunction: "cspace.mediaView.preInit",
        finalInitFunction: "cspace.mediaView.finalInit",
        events: {
            mediaUpdated: {
                events: {
                    primary: "{cspace.mediaView}.events.primaryUpdated",
                    related: "{cspace.mediaView}.events.relatedUpdated"
                }
            },
            primaryUpdated: null,
            relatedUpdated: null
        },
        listeners: {
            prepareModelForRender: "{cspace.mediaView}.prepareModelForRender",
            mediaUpdated: "{cspace.mediaView}.render"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/MediaViewTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        relatedMediaUrl: cspace.componentUrlBuilder("%tenant/%tname/%primary/media/%csid?pageNum=0&pageSize=0")
    });

    cspace.mediaView.produceTree = function (that) {
        return {
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

    cspace.mediaView.preInit = function (that) {
        that.prepareModelForRender = function () {
            that = that;
        };

        that.render = function () {
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

        that.getPrimaryMedia = function (callback) {
            that.applier.requestChange("primaryMedia", fluid.get(that.globalModel, "primaryModel.fields.blobs.0");
            callback();
        };

        that.getRelatedMedia = function (callback) {
            that.relatedMedia.get({
                csid: fluid.get(that.globalModel, "primaryCsid")
            }, function (data) {
                that.applier.requestChange("relatedMedia", fluid.transform(fluid.get(data, "items")), function (item) {
                    return item.summarylist;
                });
                callback();
            });
        };

        that.getAllMedia = function () {
            if (!fluid.get(that.globalModel, "primaryCsid")) {
                return;
            }
            that.getPrimaryMedia(function () {
                that.events.primaryUpdated.fire();
            });
            that.getRelatedMedia(function () {
                that.events.relatedUpdated.fire();
            });
        };

        that.getMedia = function (model, format) {
            var imgThumb = fluid.get(model, "imgThumb");
            if (imgThumb) {
                return that.formatMedia(imgThumb, format);
            }
            return that.formatMedia("", format);
        };

		that.getOriginalImage = function (model) {
            var src = that.getMedia(model, "Original");
			window.open(src, "_blank", that.options.parentBundle.resolve("media-originalMediaOptions", ["600", "800", "yes"]));
		};
    };

    cspace.mediaView.finalInit = function (that) {
        that.globalEvents.events.relationsUpdated.addListener(function (related) {
            if (related !== "media") {
                return;
            }
            that.getRelatedMedia(that.render);
        });
        that.globalEvents.events.primaryMediaUpdated.addListener(function () {
            that.getPrimaryMedia(that.render);
        });
        that.getAllMedia();
    };

    fluid.demands("cspace.mediaView.dataSource",  ["cspace.localData", "cspace.mediaView"], {
        funcName: "cspace.mediaView.testDataSource",
        args: {
            targetTypeName: "cspace.mediaView.testDataSource",
            termMap: {
                recordType: "%recordType"
            }
        }
    });

    fluid.demands("cspace.mediaView.dataSource", "cspace.mediaView", {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.mediaView}.options.relatedMediaUrl",
            termMap: {
                primary: "{cspace.sidebar}.options.primary",
                csid: "%csid"
            },
            targetTypeName: "cspace.mediaView.dataSource"
        }
    });

    fluid.defaults("cspace.mediaView.testDataSource", {
        url: "%test/data/relationships.json"
    });

    cspace.mediaView.testDataSource = cspace.URLDataSource;

    fluid.fetchResources.primeCacheFromResources("cspace.mediaView");

})(jQuery, fluid);