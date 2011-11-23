/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/

cspace = cspace || {};

(function ($, fluid) {
    "use strict";

    cspace.mediaUploader = function (container, options) {
        var that = fluid.initRendererComponent("cspace.mediaUploader", container, options);
        fluid.initDependents(that);
        that.refreshView();
        that.bindEvents();
        return that;
    };
    
    // TODO: This is a hack to imitate focus on the file input and simulate a single file uploader. 
    cspace.mediaUploader.bindEvents = function (that) {
        if (!that.fileUploader.strategy) {
            return;
        }
        var buttonView = that.fileUploader.strategy.local.browseButtonView;
        if (!buttonView) {
            return;
        }
        buttonView.container.delegate(buttonView.options.selectors.fileInputs, "focus", function () {
            buttonView.locate("browseButton").addClass(that.options.styles.fileInputFocused);
            var existing = that.fileUploader.queue.files[0];
            if (existing) {
                that.fileUploader.removeFile(existing);
            }
        });
        buttonView.container.delegate(buttonView.options.selectors.fileInputs, "blur", function () {
            buttonView.locate("browseButton").removeClass(that.options.styles.fileInputFocused);
        });
    };
    
    cspace.mediaUploader.refreshView = function (that) {
        that.renderer.refreshView();
    };
    
    cspace.mediaUploader.afterFileQueuedListener = function (input) {
        return function (file) {
            input.text(file.name);
        };
    };
    
    cspace.mediaUploader.onFileSuccess = function (that, input) {
        return function (file, responseText, xhr) {
            var response = JSON.parse(responseText);
            that.applier.requestChange(that.options.elPaths.srcUri, response.file);
            delete response.file;
            that.applier.requestChange(that.options.elPaths.blobs, [response]);
            that.applier.requestChange(that.options.elPaths.blobCsid, response.csid);
            // TODO: When the onLink event listener triggers rerender and reinstantiation of media uploader this uploader dies :(.
            setTimeout(function () {
                that.events.onLink.fire();
            }, 1);
        };
    };
    
    cspace.mediaUploader.onFileError = function (that) {
        return function (file, error, responseText, xhr) {
            cspace.util.provideErrorCallback(that, that.options.urls.upload, "errorWriting")(error, responseText, xhr);
            return false;
        };
    };
    
    cspace.mediaUploader.produceTree = function (that) {
        return {
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${" + that.options.elPaths.blobCsid + "}",
                trueTree: {
                    removeButton: {
                        messagekey: "mediaUploader-removeButton",
                        decorators: [{
                            type: "addClass",
                            classes: that.options.styles.removeButton
                        }, {
                            type: "jQuery",
                            func: "click",
                            args: that.removeMedia
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
                messagekey: "mediaUploader-uploadMediaLabel"
            },
            linkMediaLabel: {
                messagekey: "mediaUploader-linkMediaLabel"
            },
            uploadButton: {
                messagekey: "mediaUploader-uploadButton",
                decorators: [{
                    type: "addClass",
                    classes: that.options.styles.button
                }]
            },
            linkInput: {
                decorators: [{
                    type: "jQuery",
                    func: "keyup",
                    args: that.processLink
                }]
            },
            linkButton: {
                messagekey: "mediaUploader-linkButton",
                decorators: [{
                    type: "addClass",
                    classes: that.options.styles.button
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.linkMedia
                }]
            }
        };
    };
    
    cspace.mediaUploader.linkMedia = function (that) {
        var srcUri = that.locate("linkInput").val();
        that.options.applier.requestChange(that.options.elPaths.srcUri, srcUri);
        that.events.onLink.fire();
    };
    
    cspace.mediaUploader.processLink = function (that) {
        that.locate("linkButton").prop("disabled", that.locate("linkInput").val() ? false : true);
    };
    
    cspace.mediaUploader.assertBlob = function (blobCsid) {
        return !!blobCsid;
    };
    
    cspace.mediaUploader.removeMedia = function (that) {
        that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
            model: {
                messages: ["mediaUploader-dialog-removePrimaryMessage", "mediaUploader-dialog-removeSecondaryMessage"],
                messagekeys: {
                    actText: "mediaUploader-dialog-removeActText",
                    actAlt: "mediaUploader-dialog-removeActAlt"
                }
            },
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "act") {
                        that.options.applier.requestChange(that.options.elPaths.blobCsid, "");
                        that.events.onRemove.fire();
                    }
                }
            },
            parentBundle: that.options.parentBundle
        });
    };
    
    fluid.defaults("cspace.mediaUploader", {
        gradeNames: "fluid.rendererComponent",
        parentBundle: "{globalBundle}",
        invokers: {
            bindEvents: {
                funcName: "cspace.mediaUploader.bindEvents",
                args: "{mediaUploader}"
            },
            refreshView: {
                funcName: "cspace.mediaUploader.refreshView",
                args: "{mediaUploader}"
            },
            linkMedia: {
                funcName: "cspace.mediaUploader.linkMedia",
                args: "{mediaUploader}"
            },
            processLink: {
                funcName: "cspace.mediaUploader.processLink",
                args: "{mediaUploader}"
            },
            removeMedia: {
                funcName: "cspace.mediaUploader.removeMedia",
                args: "{mediaUploader}"
            },
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        },
        elPaths: {
            blobCsid: "fields.blobCsid",
            srcUri: "fields.srcUri",
            blobs: "fields.blobs"
        },
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
        strings: {},
        styles: {
            button: "cs-mediaUploader-button",
            hidden: "hidden",
            removeButton: "cs-mediaUploader-removeMedia",
            fileInputFocused: "cs-mediaUploader-fileInputFocused"
        },
        events: {
            onLink: null,
            onRemove: null
        },
        produceTree: cspace.mediaUploader.produceTree,
        components: {
            uploaderContext: {
                type: "fluid.progressiveChecker",
                priority: "first",
                options: {
                    checks: [{
                        feature: "{fluid.browser.supportsBinaryXHR}",
                        contextName: "fluid.uploader.html5"
                    }, {
                        feature: "{fluid.browser.supportsFlash}",
                        contextName: "fluid.uploader.swfUpload"
                    }],
                    defaultContextName: "fluid.uploader.singleFile"
                }
            },
            confirmation: "{confirmation}",
            fileUploader: {
                type: "fluid.uploader",
                createOnEvent: "afterRender",
                container: "{mediaUploader}.dom.fileUploader",
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
                        url: "%webapp/html/components/MediaUploaderTemplate.html",
                        options: {
                            dataType: "html"
                        }
                    }
                }
            }
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.mediaUploader");
    
})(jQuery, fluid);