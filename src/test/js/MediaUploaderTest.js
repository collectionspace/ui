/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var mediaUploaderTester = function ($) {
    
    var container = "#main";
    
    var baseModel = {
        fields: {
            blobCsid: "123"
        }
    };
    
    var baseCSIDModel = {
        csid: "123"  
    };
    
    var bareMediaUploaderTest = new jqUnit.TestCase("Media Uploader Tests");
    
    var mediaUploaderTest = cspace.tests.testEnvironment({
        testCase: bareMediaUploaderTest,
        components: {
            confirmation: {
                type: "cspace.confirmation"
            }
        }
    });
    
    var setupMediaUploader = function (options) {
        return cspace.mediaUploader(container, options);
    };
    
    mediaUploaderTest.test("Init and render", function () {
        expect(4);
        var mediaUploader = setupMediaUploader();
        
        jqUnit.isVisible("Main uploader widget is visible", mediaUploader.locate("uploader"));
        jqUnit.notVisible("Remove media is invisible", mediaUploader.locate("removeButton"));
        jqUnit.assertTrue("+ Upload button is disabled", mediaUploader.locate("uploadButton").attr("disabled"));
        jqUnit.assertTrue("Link button is disabled", mediaUploader.locate("linkButton").attr("disabled"));
    });
    
//    mediaUploaderTest.test("Init and render. Check that upload field is disabled depending on CSID presence, no CSID", function () {
//        expect(2);
//        var mediaUploader = setupMediaUploader();
//        var mediaUploaderInput = mediaUploader.fileUploader.strategy.local.browseButtonView.locate("fileInputs");
//        jqUnit.assertTrue("HTML input is disabled", mediaUploaderInput.is(":disabled"));
//        jqUnit.assertTrue("Media uploader styled as disabled", mediaUploader.locate("uploadInputContainer").hasClass(mediaUploader.options.styles.disabled));
//    });
//
//    mediaUploaderTest.test("Init and render. Check that upload field is disabled depending on CSID presence, with CSID", function () {
//        expect(2);
//        var model = fluid.copy(baseCSIDModel);
//        var mediaUploader = setupMediaUploader({
//            model: model,
//            applier: fluid.makeChangeApplier(model)
//        });
//        var mediaUploaderInput = mediaUploader.fileUploader.strategy.local.browseButtonView.locate("fileInputs");
//        jqUnit.assertFalse("HTML input is not disabled since it has CSID", mediaUploaderInput.is(":disabled"));
//        jqUnit.assertFalse("Media uploader not styled as disabled since it has CSID", mediaUploader.locate("uploadInputContainer").hasClass(mediaUploader.options.styles.disabled));
//    });
    
    mediaUploaderTest.asyncTest("Linking", function () {
        expect(5);
        var url = "http://testlink.com/media";
        var model = fluid.copy({
            fields: {}
        });
        
        var mediaUploader = setupMediaUploader({
            model: model,
            applier: fluid.makeChangeApplier(model),
            listeners: {
                onLink: function () {
                    jqUnit.assertEquals("Model has a correct srcUri", url, fluid.get(model, mediaUploader.options.elPaths.sourceUrl));
                    jqUnit.assertTrue("Linking performed successfully", true);
                    start();
                }
            }
        });
        
        var linkButton = mediaUploader.locate("linkButton");
        var linkInput = mediaUploader.locate("linkInput");
        jqUnit.assertTrue("Link button is disabled", linkButton.attr("disabled"));
        linkInput.val(url);
        linkInput.keyup();
        jqUnit.assertFalse("Link button is enabled", linkButton.attr("disabled"));
        jqUnit.assertUndefined("Model has no sourceUrl", fluid.get(model, mediaUploader.options.elPaths.sourceUrl));
        linkButton.click();
    });
    
    mediaUploaderTest.test("Init and render with model", function () {
        expect(2);
        var model = fluid.copy(baseModel);
        
        var mediaUploader = setupMediaUploader({
            model: model,
            applier: fluid.makeChangeApplier(model)
        });
        
        jqUnit.notVisible("Main uploader widget is invisible", mediaUploader.locate("uploader"));
        jqUnit.isVisible("Remove media is visible", mediaUploader.locate("removeButton"));
    });
    
    mediaUploaderTest.asyncTest("Remove media", function () {
        expect(4);
        var model = fluid.copy(baseModel);
        
        var mediaUploader = setupMediaUploader({
            model: model,
            applier: fluid.makeChangeApplier(model),
            listeners: {
                onRemove: function () {
                    jqUnit.assertEquals("Model has a correct blobCsid", "", fluid.get(mediaUploader.model, mediaUploader.options.elPaths.blobCsid));
                    jqUnit.assertTrue("Removing performed successfully", true);
                    start();
                }
            }
        });
        
        var removeButton = mediaUploader.locate("removeButton");
        jqUnit.isVisible("Remove media is visible", removeButton);
        jqUnit.assertEquals("Model has a correct blobCsid", model.fields.blobCsid, fluid.get(mediaUploader.model, mediaUploader.options.elPaths.blobCsid));
        mediaUploader.confirmation.popup.bind("dialogopen", function () {
            mediaUploader.confirmation.confirmationDialog.locate("act").click();
        });
        removeButton.click();
    });
};

(function () {
    mediaUploaderTester(jQuery);
}());