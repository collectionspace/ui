/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid, window*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.defaults("cspace.mediaView", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            previous: ".csc-mediaView-previous",
            next: ".csc-mediaView-next",
            mediaSnapshot: ".csc-mediaView-snapshot",
            mediumImage: ".csc-mediaView-mediumImage",
            previousLink: ".csc-mediaView-previous-link",
            nextLink: ".csc-mediaView-next-link",
            mediumImageLink: ".csc-mediaView-mediumImage-link",
        },
        produceTree: "cspace.mediaView.produceTree",
        styles: {
            previous: "cs-mediaView-previous",
            next: "cs-mediaView-next",
            mediumImage: "cs-mediaView-mediumImage",
            previousLink: "cs-mediaView-previous-link",
            nextLink: "cs-mediaView-next-link",
            mediumImageLink: "cs-mediaView-mediumImage-link",
            mediaSnapshot: "cs-mediaView-snapshot"
        },
        components: {
            globalModel: "{globalModel}",
            globalEvents: "{globalEvents}",
            recordTypes: "{recordTypes}",
            relatedMedia: {
                type: "cspace.mediaView.dataSource"
            }
        },
        model: {
            primaryMedia: undefined,
            relatedMedia: [],
            index: 0
        },
        strings: {},
        parentBundle: "{globalBundle}",
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
        var model = that.model;
        return {
            expander: [{
                type: "fluid.renderer.condition",
                condition: that.getMedia(model.currentMedia, "bool"),
                trueTree: {
                    mediumImageLink: {
                        decorators: [{
                            type: "jQuery",
                            func: "click",
                            args: that.getOriginalImage
                        }, {
                            type: "attrs",
                            attributes: {
                                label: that.options.parentBundle.resolve("sidebar-mediumImage"),
                            }
                        }]
                    },
                    mediumImage: {
                        decorators: [{
                            addClass: "{styles}.mediumImage"
                        }, {
                            type: "attrs",
                            attributes: {
                                src: that.getMedia(model.currentMedia, "Medium")
                            }
                        }]
                    },
                    mediaSnapshot: {
                        decorators: {
                            addClass: "{styles}.mediaSnapshot"
                        }
                    }
                }
            }, {
                type: "fluid.renderer.condition",
                condition: that.getMedia(model.nextMedia, "bool"),
                trueTree: {
                    nextLink: {
                        decorators: [{
                            type: "jQuery",
                            func: "click",
                            args: that.getNext
                        }, {
                            type: "attrs",
                            attributes: {
                                label: that.options.parentBundle.resolve("sidebar-nextImage")
                            }
                        }]
                    },
                    next: {
                        decorators: [{
                            addClass: "{styles}.next"
                        }, {
                            type: "attrs",
                            attributes: {
                                src: that.getMedia(model.nextMedia, "Thumbnail")
                            }
                        }]
                    }
                }
            }, {
                type: "fluid.renderer.condition",
                condition: that.getMedia(model.previousMedia, "bool"),
                trueTree: {
                    previousLink: {
                        decorators: [{
                            type: "jQuery",
                            func: "click",
                            args: that.getPrevious
                        }, {
                            type: "attrs",
                            attributes: {
                                label: that.options.parentBundle.resolve("sidebar-previousImage")
                            }
                        }]
                    },
                    previous: {
                        decorators: [{
                            addClass: "{styles}.previous"
                        }, {
                            type: "attrs",
                            attributes: {
                                src: that.getMedia(model.previousMedia, "Thumbnail")
                            }
                        }]
                    }
                }
            }]
        };
    };

    cspace.mediaView.preInit = function (that) {
        that.prepareModelForRender = function () {
            var media = [];
            if (that.model.primaryMedia) {
                media.push(that.model.primaryMedia);
            }
            fluid.each(that.model.relatedMedia, function (thisMedia) {
                media.push(thisMedia);
            });
            var current = fluid.get(media, that.model.index);
            if (!current) {
                that.applier.requestChange("index", 0);
            }
            that.applier.requestChange("currentMedia", current);
            that.applier.requestChange("nextMedia", fluid.get(media, (that.model.index + 1).toString()));
            that.applier.requestChange("previousMedia", fluid.get(media, (that.model.index - 1).toString()));
        };

        that.render = function () {
            that.refreshView();
        };

        function updateIndex (increment) {
            that.applier.requestChange("index", that.model.index + increment);
            that.refreshView();
        }

        that.getNext = function () {
            updateIndex(1);
        };

        that.getPrevious = function () {
            updateIndex(-1);
        };

        that.formatMedia = function (url, format) {
            var bool = !!url;
            if (format === "bool") {
                return bool;
            }
            if (!url) {
                return url;
            }
            return url.replace(/Thumbnail/, format || "OriginalJpeg");
        };

        that.hasPrimaryMedia = function () {
            return !!fluid.get(that.globalModel.model, "primaryModel.fields.blobCsid");
        };

        that.getPrimaryMedia = function (callback) {
            that.applier.requestChange("primaryMedia", that.hasPrimaryMedia() ? fluid.get(that.globalModel.model, "primaryModel.fields.blobs.0") : undefined);
            callback();
        };

        that.getRelatedMedia = function (callback) {
            that.relatedMedia.get({
                csid: fluid.get(that.globalModel.model, "baseModel.primaryCsid")
            }, function (data) {
                that.applier.requestChange("relatedMedia", fluid.transform(fluid.get(data, "items"), function (item) {
                    return item.summarylist;
                }));
                callback();
            });
        };

        that.getAllMedia = function () {
            if (!fluid.get(that.globalModel.model, "baseModel.primaryCsid")) {
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

		that.getOriginalImage = function () {
            var src = that.getMedia(that.model.currentMedia);
			window.open(src, "_blank", that.options.parentBundle.resolve("media-originalMediaOptions", ["600", "800", "yes"]));
		};
    };

    cspace.mediaView.finalInit = function (that) {

        function hasMedia (related) {
            var category = that.recordTypes[related] || [];
            return $.inArray("media", category) > -1;
        }

        that.globalEvents.events.relationsUpdated.addListener(function (related) {
            if (related === "media" || hasMedia(related)) {
                that.getRelatedMedia(that.render);
            }
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