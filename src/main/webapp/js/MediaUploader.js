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
        fluid.initDependents(that);
        that.refreshView();
        return that;
    };
    
    cspace.mediaUploader.refreshView = function (that) {
        that.renderer.refreshView();
        that.events.afterRender.fire();
    };
    
    cspace.mediaUploader.afterFileQueuedListener = function (input) {
        return function (file) {
            input.text(file.name);
        };
    };
    
    cspace.mediaUploader.onFileSuccess = function (that, input) {
        return function (file, responseText, xhr) {
            input.text("");
            var response = JSON.parse(responseText);
            that.options.applier.requestChange(that.options.elPaths.srcUri, response.file);
            that.events.onLink.fire();
        };
    };
    
    cspace.mediaUploader.produceTree = function (that) {
        return {
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${" + that.options.elPaths.blobCsid + "}",
                trueTree: {
                    removeButton: {
                        messagekey: "removeButton",
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
                    args: that.processLink
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
        that.locate("linkButton").attr("disabled", that.locate("linkInput").val() ? false : true);
    };
    
    cspace.mediaUploader.assertBlob = function (blobCsid) {
        return !!blobCsid;
    };
    
    cspace.mediaUploader.removeMedia = function (that) {
        that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "act") {
                        that.options.applier.requestChange(that.options.elPaths.blobCsid, "");
                        that.events.onRemove.fire();
                    }
                }
            },
            strings: {
                primaryMessage: that.options.strings.confirmationPrimaryMessage,
                actText: that.options.strings.confirmationActText,
                actAlt: that.options.strings.confirmationActAlt
            }
        });
    };
    
    fluid.defaults("cspace.mediaUploader", {
        gradeNames: ["fluid.IoCRendererComponent"],
        invokers: {
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
            }
        },
        elPaths: {
            blobCsid: "fields.blobCsid",
            srcUri: "fields.srcUri"
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
        strings: {
            uploadButton: "+ Upload",
            linkButton: "Link",
            removeButton: "Remove this media",
            uploadMediaLabel: "Upload Media",
            linkMediaLabel: "Link To External Media",
            confirmationPrimaryMessage: "Remove media from this record?",
            confirmationActText: "Remove",
            confirmationActAlt: "remove media"
        },
        styles: {
            button: "cs-mediaUploader-button",
            hidden: "hidden",
            removeButton: "cs-mediaUploader-removeMedia"
        },
        events: {
            onLink: null,
            onRemove: null,
            afterRender: null
        },
        produceTree: cspace.mediaUploader.produceTree,
        components: {
            uploaderContext: {
                type: "fluid.progressiveChecker",
                options: {
                    checks: [{
                        feature: "{fluid.browser.supportsBinaryXHR}",
                        contextName: "fluid.uploader.html5"
                    }, {
                        feature: "{fluid.browser.supportsFlash}",
                        contextName: "fluid.uploader.swfUpload"
                    }],
                    defaultTypeTag: fluid.typeTag("fluid.uploader.singleFile")
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
                    },
                    listeners: {
                        afterFileQueued: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.mediaUploader.afterFileQueuedListener",
                                args: "{mediaUploader}.dom.uploadInput"
                            }
                        },
                        onFileSuccess: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.mediaUploader.onFileSuccess",
                                args: ["{mediaUploader}", "{mediaUploader}.dom.uploadInput"]
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
    
    fluid.demands("fluid.uploader.html5Strategy.browseButtonView", ["fluid.uploader.html5Strategy.local", "cspace.mediaUploader"], {
        container: "{multiFileUploader}.container",
        options: {
            mergePaths: ["{options}", {
                events: {
                    onBrowse: "{local}.events.onFileDialog"
                }
            }, {
                multiFileInputMarkup: "<input type='file' name='file' multiple='' class='flc-uploader-html5-input fl-hidden' />"
            }]
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.mediaUploader");
    
})(jQuery, fluid);