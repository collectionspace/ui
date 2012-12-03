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
    
    fluid.defaults("cspace.mediaUploader", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        parentBundle: "{globalBundle}",
        preInitFunction: "cspace.mediaUploader.preInit",
        finalInitFunction: "cspace.mediaUploader.finalInit",
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage"
        },
        elPaths: {
            blobCsid: "fields.blobCsid",
            sourceUrl: "fields.sourceUrl",
            blobs: "fields.blobs",
            externalUrl: "fields.externalUrl",
            required: "fields.identificationNumber"
        },
        mergePolicy: {
            model: "preserve",
            applier: "nomerge"
        },
        selectors: {
            uploader: ".csc-mediaUploader",
            uploadButton: ".csc-mediaUploader-uploadButton",
            uploadButtonLabel: ".csc-mediaUploader-uploadButtonLabel",
            uploadButtonInput: ".csc-mediaUploader-uploadButtonInput",
            uploadMediaLabel: ".csc-mediaUploader-uploadMedia-label",
            linkInput: ".csc-mediaUploader-linkInput",
            linkButton: ".csc-mediaUploader-linkButton",
            linkMediaLabel: ".csc-mediaUploader-linkMedia-label",
            removeButton: ".csc-mediaUploader-removeMedia",
            note: ".csc-mediaUploader-note"
        },
        strings: {},
        styles: {
            uploadButton: "cs-mediaUploader-uploadButton",
            uploadButtonLabel: "cs-mediaUploader-uploadButtonLabel",
            uploadButtonInput: "cs-mediaUploader-uploadButtonInput",
            fileInputFocused: "cs-mediaUploader-fileInputFocused",
            button: "cs-mediaUploader-button",
            hidden: "hidden",
            removeButton: "cs-mediaUploader-removeMedia",
            disabled: "cs-disabled",
            note: "cs-mediaUploader-note"
        },
        events: {
            onLink: null,
            onRemove: null,
            onFileSelected: null,
            onSuccess: null,
            onError: null
        },
        listeners: {
            onSuccess: "{that}.onSuccess",
            onError: "{that}.onError",
            onFileSelected: "{loadingIndicator}.events.showOn.fire"
        },
        produceTree: "cspace.mediaUploader.produceTree",
        renderOnInit: true,
        components: {
            confirmation: "{confirmation}"
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
                        decorators: {addClass: "{styles}.hidden"}
                    }
                },
                falseTree: {
                    uploader: {},
                    removeButton: {
                        decorators: {addClass: "{styles}.hidden"}
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
                decorators: [{
                    addClass: "{styles}.button"
                }, {
                    addClass: "{styles}.uploadButton"
                }]
            },
            uploadButtonLabel: {
                messagekey: "mediaUploader-uploadButton",
                decorators: [{addClass: "{styles}.uploadButtonLabel"}]
            },
            uploadButtonInput: {
                decorators: [{
                    addClass: "{styles}.uploadButtonInput"
                }, {
                    type: "jQuery",
                    func: "focus",
                    args: that.uploadFocus
                }, {
                    type: "jQuery",
                    func: "blur",
                    args: that.uploadBlur
                }, {
                    type: "jQuery",
                    func: "change",
                    args: that.upload
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
            },
            note: {
                messagekey: "mediaUploader-note",
                decorators: {addClass: "{styles}.note"}
            }
        };
    };

    cspace.mediaUploader.preInit = function (that) {
        that.uploadFocus = function () {
            that.locate("uploadButton").addClass(that.options.styles.fileInputFocused);
            if (that.file) {
                delete that.file;
            }
        };
        that.uploadBlur = function () {
            that.locate("uploadButton").removeClass(that.options.styles.fileInputFocused);
        };
        that.processLink = function () {
            var linkButton = that.locate("linkButton"),
                allow = fluid.get(that.model, that.options.elPaths.required);
            linkButton.prop("disabled", that.locate("linkInput").val() && allow ? false : true);
        };
        that.linkMedia = function () {
            var sourceUrl = that.locate("linkInput").val();
            that.applier.requestChange(that.options.elPaths.sourceUrl, sourceUrl);
            that.applier.requestChange(that.options.elPaths.externalUrl, sourceUrl);
            that.applier.modelChanged.removeListener("allowButtons");
            that.events.onLink.fire();
        };
        that.onSuccess = function (response, xhr) {
            that.applier.requestChange(that.options.elPaths.sourceUrl, response.file);
            delete response.file;
            that.applier.requestChange(that.options.elPaths.blobs, [response]);
            that.applier.requestChange(that.options.elPaths.blobCsid, response.csid);
            that.applier.modelChanged.removeListener("allowButtons");
            // TODO: When the onLink event listener triggers rerender and reinstantiation of media uploader this uploader dies :(.
            setTimeout(function () {
                that.events.onLink.fire();
            }, 1);
        };
        that.onError = function (error, responseText, xhr) {
            cspace.util.provideErrorCallback(that, that.options.urls.upload, "errorWriting")(error, responseText, xhr);
        };
        that.removeMedia = function () {
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
                            that.applier.requestChange(that.options.elPaths.blobCsid, "");
                            that.events.onRemove.fire();
                        }
                    }
                },
                parentBundle: that.options.parentBundle
            });
        };
        that.upload = function () {
            that.file = this.files[0];
            var data = new FormData();
            data.append("file", that.file);
            that.events.onFileSelected.fire();
            $.ajax({
                url: that.options.urls.upload,
                type: "POST",
                cache: false,
                contentType: false,
                processData: false,
                data: data,
                dataType: "json",
                success: that.events.onSuccess.fire,
                error: that.events.onError.fire
            });
        };
    };

    cspace.mediaUploader.finalInit = function (that) {
        var allowButtons = function () {
            var allow = fluid.get(that.model, that.options.elPaths.required),
                buttons = that.locate("uploadButton")
                    .add(that.locate("uploadButtonInput"));
            buttons[allow ? "removeAttr" : "attr"]("disabled", "disabled");
            that.processLink();
        };

        that.applier.modelChanged.addListener(
            that.options.elPaths.required, allowButtons, "allowButtons"
        );
        allowButtons();
    };
    
    cspace.mediaUploader.assertBlob = function (blobCsid) {
        return !!blobCsid;
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.mediaUploader");
    
})(jQuery, fluid);