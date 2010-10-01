/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

var titleBarTester = function ($) {
    
    var titleBarTest = new jqUnit.TestCase("Title Bar Tests", function () {
        cspace.util.isTest = true;
    });
    
    var setupTitleBarWithAutobinding = function (container, model, options) {
        var applier = fluid.makeChangeApplier(model);
        options.applier = applier;
        options.model = model;
        
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}", model: model});
        
        fluid.selfRender($("#main"), expander({
            ".csc-titleBar-testDisplayField": "${testField}"
        }), {
            cutpoints: [{
                id: ".csc-titleBar-testDisplayField",
                selector: ".csc-titleBar-testDisplayField"
            }],
            model: model,
            autoBind: true,
            applier: applier
        });
        return cspace.titleBar(container, options);
    };
    
    titleBarTest.test("Test titleBar is in sync with the field that is put in title bar", function () {
        titleBar = setupTitleBarWithAutobinding(".csc-titleBar-template", {
            testField: "test"
        }, {
            uispec: {
                ".csc-titleBar-value": "${testField}"
            }
        });
        
        jqUnit.assertEquals("Value in the input field is updated", 
            "test", $(".csc-titleBar-testDisplayField").val());
        jqUnit.assertEquals("Value in the title bar is updated", 
            "test", $(".csc-titleBar-value").text());
    });
    
    titleBarTest.test("Test titleBar is in sync with the field that is put in title bar after it's updated", function () {
        titleBar = setupTitleBarWithAutobinding(".csc-titleBar-template", {
            testField: "test"
        }, {
            uispec: {
                ".csc-titleBar-value": "${testField}"
            }
        });

        var inputField = $(".csc-titleBar-testDisplayField");
        inputField.val("New Value");
        inputField.change();
        
        // Doing this instead of comparing it to each other beacuse we want to make sure that the values are actually updated for both.
        jqUnit.assertEquals("Value in the input field is updated", 
            "New Value", $(".csc-titleBar-testDisplayField").val());
        jqUnit.assertEquals("Value in the title bar is updated", 
            "New Value", $(".csc-titleBar-value").text());
    });
};

(function () {
    titleBarTester(jQuery);
}());