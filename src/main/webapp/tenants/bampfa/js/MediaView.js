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
            empty: ".csc-mediaView-empty",
            oneOf: ".csc-mediaView-oneOf",
            mediaSnapshot: ".csc-mediaView-snapshot",
            mediumImage: ".csc-mediaView-mediumImage",
            previousLink: ".csc-mediaView-previous-link",
            nextLink: ".csc-mediaView-next-link",
            mediumImageLink: ".csc-mediaView-mediumImage-link",
        },
        produceTree: "cspace.mediaView.produceTree",
        styles: {
            empty: "cs-mediaView",
            oneOf: "cs-mediaView-oneOf",
            mediumImage: "cs-mediaView-mediumImage",
            previousLink: "cs-mediaView-previous-link",
            nextLink: "cs-mediaView-next-link",
            mediumImageLink: "cs-mediaView-mediumImage-link",
            mediaSnapshot: "cs-mediaView-snapshot"
        },
        components: {
            // Global CSpace model
            globalModel: "{globalModel}",
            // Global CSpace Events
            globalEvents: "{globalEvents}",
            // Possible record types
            recordTypes: "{recordTypes}",
            // DataSource to get the media image
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
        // Template for mediaView
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/MediaViewTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        relatedMediaUrl: cspace.componentUrlBuilder("%tenant/%tname/%primary/media/%csid?pageNum=0&pageSize=40")
    });

    // Render tree for the MediaView
    cspace.mediaView.produceTree = function (that) {
        var model = that.model;
        return {
            expander: {
                type: "fluid.renderer.condition",
                condition: that.getMedia(model.currentMedia, "bool"),
                falseTree: {
                    empty: {
                        decorators: {
                            addClass: "{styles}.empty"
                        }
                    }
                },
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
                    },
                    oneOf: {
                        messagekey: "sidebar-oneOf",
                        args: ["${humanIndex}", "${total}"],
                        decorators: {
                            addClass: "{styles}.oneOf"
                        }
                    },
                    expander: [{
                        type: "fluid.renderer.condition",
                        condition: that.getMedia(model.nextMedia, "bool"),
                        trueTree: {
                            nextLink: {
                                target: "#",
                                linktext: {
                                    messagekey: "sidebar-next"
                                },
                                decorators: [{
                                    type: "jQuery",
                                    func: "click",
                                    args: that.getNext
                                }, {
                                    addClass: "{styles}.nextLink"
                                }]
                            }
                        }
                    }, {
                        type: "fluid.renderer.condition",
                        condition: that.getMedia(model.previousMedia, "bool"),
                        trueTree: {
                            previousLink: {
                                target: "#",
                                linktext: {
                                    messagekey: "sidebar-previous"
                                },
                                decorators: [{
                                    type: "jQuery",
                                    func: "click",
                                    args: that.getPrevious
                                }, {
                                    addClass: "{styles}.previousLink"
                                }]
                            }
                        }
                    }]
                }
            }
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
                current = fluid.get(media, that.model.index);
            }
            that.applier.requestChange("total", media.length);
            that.applier.requestChange("humanIndex", that.model.index + 1);
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

        // Get URL for getting a media thumbnail
        that.formatMedia = function (url, format) {
            var bool = !!url;
            if (format === "bool") {
                return bool;
            }
            if (!url) {
                return url;
            }
            return url.replace(/Thumbnail/, format || "Original");
        };

        // Function to return if record has the primary media
        that.hasPrimaryMedia = function () {
            return !!fluid.get(that.globalModel.model, "primaryModel.fields.blobCsid");
        };

        // Function to return primary media for the record
        that.getPrimaryMedia = function (callback) {
            that.applier.requestChange("primaryMedia", that.hasPrimaryMedia() ? fluid.get(that.globalModel.model, "primaryModel.fields.blobs.0") : undefined);
            callback();
        };

        // Function to return related media for the record
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
                that.refreshView();
                return;
            }
            that.getPrimaryMedia(function () {
                that.events.primaryUpdated.fire();
            });
            that.getRelatedMedia(function () {
                that.events.relatedUpdated.fire();
            });
        };

        // Get the image address in the given record's model
        that.getMedia = function (model, format) {
            var imgThumb = fluid.get(model, "imgThumb");
            if (imgThumb) {
                return that.formatMedia(imgThumb, format);
            }
            return that.formatMedia("", format);
        };

        // Function to open an associated image with the record in the separate window
		that.getOriginalImage = function () {
            var src = that.getMedia(that.model.currentMedia);
			window.open(src, "_blank", that.options.parentBundle.resolve("media-originalMediaOptions", ["600", "800", "yes"]));
		};
    };

    cspace.mediaView.finalInit = function (that) {

        // function to return if there is any media in the mediaView
        function hasMedia (related) {
            var category = that.recordTypes[related] || [];
            return $.inArray("media", category) > -1;
        }

        // Event which fires when relations are updated for the current record
        that.globalEvents.events.relationsUpdated.addListener(function (related) {
            if (related === "media" || hasMedia(related)) {
                that.getRelatedMedia(that.render);
            }
        });
        // Event which fires when the main record image is updated
        that.globalEvents.events.primaryMediaUpdated.addListener(function () {
            that.getPrimaryMedia(that.render);
        });
        that.getAllMedia();
    };

    // Demands to overwrite dataSource for local testing.
    fluid.demands("cspace.mediaView.dataSource",  ["cspace.localData", "cspace.mediaView"], {
        funcName: "cspace.mediaView.testDataSource",
        args: {
            targetTypeName: "cspace.mediaView.testDataSource",
            termMap: {
                recordType: "%recordType"
            }
        }
    });

    // Datasource to get related images to the record
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

    // Datasource for tests
    fluid.defaults("cspace.mediaView.testDataSource", {
        url: "%test/data/relationships.json"
    });

    cspace.mediaView.testDataSource = cspace.URLDataSource;

    fluid.fetchResources.primeCacheFromResources("cspace.mediaView");

})(jQuery, fluid);