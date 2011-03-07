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
    
    var bindEvents = function (that) {
        that.locate("upload").click(function () {
            that.locate("form").submit();
        });
    };
    
    cspace.mediaUploader = function (container, options) {
        var that = fluid.initRendererComponent("cspace.mediaUploader", container, options);
        that.renderer.refreshView();
        bindEvents(that);
        return that;
    };
    
    cspace.mediaUploader.produceTree = function (that) {
        return {
            form: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        action: that.options.urls.upload
                    }
                }]
            },
            upload: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.upload
                    } 
                }, {
                    type: "addClass",
                    classes: that.options.styles.upload
                }]
            }
        };
    };
    
    fluid.defaults("cspace.mediaUploader", {
        selectors: {
            upload: ".csc-mediaUploader-upload",
            file: ".csc-mediaUploader-file",
            form: ".csc-mediaUploader-form"
        },
        selectorsToIgnore: ["file"],
        strings: {
            upload: "+ Upload"
        },
        styles: {
            upload: "cs-mediaUploader-upload"
        },
        produceTree: cspace.mediaUploader.produceTree,
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
    fluid.demands("uploader", "cspace.recordEditor", ["{recordEditor}.dom.uploader", fluid.COMPONENT_OPTIONS]);
    
    fluid.fetchResources.primeCacheFromResources("cspace.mediaUploader");
    
})(jQuery, fluid);