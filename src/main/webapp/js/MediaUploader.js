/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    cspace.mediaUploader = function (container, options) {
        var that = fluid.initRendererComponent("cspace.mediaUploader", container, options);
        that.renderer.refreshView();
        fluid.initDependents(that);
        return that;
    };
    
    cspace.mediaUploader.afterFileQueuedListener = function (input) {
        return function (file) {
            input.text(file.name);
        };
    };
    
    cspace.mediaUploader.afterUploadCompleteListener = function (input) {
        return function () {
            input.text("");
        };
    };
    
    cspace.mediaUploader.produceTree = function (that) {
        return {
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${" + that.options.elPaths.blobsId + "}",
                trueTree: {
                    removeButton: {
                        messagekey: "removeButton",
                        decorators: [{
                            type: "addClass",
                            classes: that.options.styles.removeButton
                        }, {
                            type: "jQuery",
                            func: "click",
                            args: fluid.invokeGlobalFunction(that.options.removeMedia, [that])
                        }]
                    },
                    uploader: {
                        decorators: {
                            type: "addClass",
                            classes: that.options.styles.hidden
                        }
                    }
                },
                falseTree: {
                    uploader: {},
                    removeButton: {
                        decorators: {
                            type: "addClass",
                            classes: that.options.styles.hidden
                        }
                    }
                }
            }],
            uploadMediaLabel: {
                messagekey: "uploadMediaLabel"
            },
            linkMediaLabel: {
                messagekey: "linkMediaLabel"
            },
            uploadButton: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.uploadButton
                    } 
                }, {
                    type: "addClass",
                    classes: that.options.styles.button
                }]
            },
            linkInput: {
                decorators: [{
                    type: "jQuery",
                    func: "keyup",
                    args: fluid.invokeGlobalFunction(that.options.processLink, [that])
                }]
            },
            linkButton: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.linkButton
                    } 
                }, {
                    type: "addClass",
                    classes: that.options.styles.button
                }, {
                    type: "jQuery",
                    func: "click",
                    args: fluid.invokeGlobalFunction(that.options.linkMedia, [that])
                }]
            }
        };
    };
    
    cspace.mediaUploader.linkMedia = function (that) {
        return function () {
            var srcUri = that.locate("linkInput").val();
            that.options.applier.requestChange(that.options.elPaths.linkUri, srcUri);
            that.events.onLink.fire();
        };
    };
    
    cspace.mediaUploader.processLink = function (that) {
        return function () {
            that.locate("linkButton").attr("disabled", that.locate("linkInput").val() ? false : true);
        };
    };
    
    cspace.mediaUploader.removeMedia = function (that) {
        return function () {
            that.options.applier.requestChange(that.options.elPaths.linkUri, "");
            that.events.onRemove.fire();
        };
    };
    
    fluid.defaults("cspace.mediaUploader", {
        gradeNames: ["fluid.rendererComponent"],
        elPaths: {
            blobsId: "fields.id",
            linkUri: "fields.srcUri"
        },
        linkMedia: "cspace.mediaUploader.linkMedia",
        processLink: "cspace.mediaUploader.processLink",
        removeMedia: "cspace.mediaUploader.removeMedia",
        mergePolicy: {
            model: "preserve",
            applier: "nomerge"
        },
        selectors: {
            uploadInput: ".csc-mediaUploader-uploadInput",
            linkInput: ".csc-mediaUploader-linkInput",
            uploadButton: ".csc-mediaUploader-uploadButton",
            linkButton: ".csc-mediaUploader-linkButton",
            removeButton: ".csc-mediaUploader-removeMedia",
            fileUploader: ".csc-mediaUploader-fileUploaderContainer",
            uploadMediaLabel: ".csc-mediaUploader-uploadMedia-label",
            linkMediaLabel: ".csc-mediaUploader-linkMedia-label",
            uploader: ".csc-mediaUploader"
        },
        selectorsToIgnore: ["fileUploader", "uploadInput"],
        strings: {
            uploadButton: "+ Upload",
            linkButton: "Link",
            removeButton: "Remove this media",
            uploadMediaLabel: "Upload Media",
            linkMediaLabel: "Link To External Media"
        },
        styles: {
            button: "cs-mediaUploader-button",
            hidden: "hidden",
            removeButton: "cs-mediaUploader-removeMedia"
        },
        events: {
            onLink: null,
            onRemove: null
        },
        produceTree: cspace.mediaUploader.produceTree,
        components: {
            fileUploader: {
                type: "fluid.uploader",
                options: {
                    components: {
                        fileQueueView: {
                            type: "fluid.emptySubcomponent"
                        },
                        totalProgressBar: {
                            type: "fluid.emptySubcomponent"
                        }
                    },
                    queueSettings: {
                        uploadURL: "{mediaUploader}.options.urls.upload",
                        fileUploadLimit: 1,
                        fileQueueLimit : 1
                    },
                    selectors: {
                        uploadButton: "{mediaUploader}.options.selectors.uploadButton"
                    },
                    listeners: {
                        afterFileQueued: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.mediaUploader.afterFileQueuedListener",
                                args: "{mediaUploader}.dom.uploadInput"
                            }
                        },
                        afterUploadComplete: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.mediaUploader.afterUploadCompleteListener",
                                args: "{mediaUploader}.dom.uploadInput"
                            }
                        }
                    }
                }
            }
        },
        resources: {
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "fastTemplate",
                        url: "%webapp/html/components/MediaUploaderTemplate.html"
                    }
                }
            }
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.mediaUploader");
    
})(jQuery, fluid);