/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

var repeatableTester = function () {
    var testUISpec = {};
    var testModel = {};
    var repeatable;
    jQuery.ajax({
        async: false,
        url: "../../main/webapp/html/uispecs/objects/uispec.json",
        dataType: "json",
        success: function (data) {
            testUISpec = data["recordEditor"][".csc-object-identification-brief-description-repeated-container"].decorators[0];
        },
        error: function (xhr, textStatus, error) {
            fluid.log("Unable to load object uispec for testing");
        }
    });
    jQuery.ajax({
        async: false,
        url: "../../main/webapp/html/data/objects/1984.068.0335b.json",
        dataType: "json",
        success: function (data) {
            testModel = data;
        },
        error: function (xhr, textStatus, error) {
            fluid.log("Unable to load object data for testing");
        }
    });
    
    var repeatableTest = new jqUnit.TestCase("Repeatable Tests", function () {
        repeatableTest.fetchTemplate("../../main/webapp/html/ObjectEntryTemplate.html", ".csc-object-entry-template");
    });
    
    var setupRepeatable = function (options) {
        var model = {};
        fluid.model.copyModel(model, testModel);
        var applier = fluid.makeChangeApplier(model);
        var opts = testUISpec.options;
        opts.model = model;
        opts.applier = applier;
        opts.renderOptions = {
            cutpoints: cspace.renderUtils.cutpointsFromUISpec(testUISpec.options.protoTree)
        };
        opts.expander = "cspace.renderUtils.expander";
        jQuery.extend(true, opts, options); 
        return cspace.repeatable(".csc-object-identification-brief-description-repeated-container", opts);
    };
    
    repeatableTest.test("Initialization", function () {        
        repeatable = setupRepeatable();
        jqUnit.assertValue("Component was initialized", repeatable);
    });
    repeatableTest.test("Add Functionality", function () {        
        repeatable = setupRepeatable();
        jqUnit.assertEquals("Model is of length 1 initially", 1, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
        repeatable.locate("addButton").click();
        jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
    });
    
    repeatableTest.test("Add Functionality + applier/model consistency", function () {        
        repeatable = setupRepeatable();        
        jqUnit.assertEquals("Model is of lenth 1 initially", 1, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
        jqUnit.assertEquals("Initially, value matched model", "This is brief description.", jQuery(".csc-object-identification-brief-description").val());
        jQuery(".csc-object-identification-brief-description").val("test").change();
        jqUnit.assertEquals("Before adding a row, first value is changed to 'test'", "test", jQuery(".csc-object-identification-brief-description").val());
        jqUnit.assertDeepEq("After changing field to 'test', model should be 'test", {briefDescription: "test"}, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath)[0]);
        repeatable.applier.modelChanged.addListener("*", function () {
            jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
            jqUnit.assertEquals("After adding a row, first value is still 'test'", "test", jQuery(".csc-object-identification-brief-description").eq(0).val());
            jqUnit.assertDeepEq("After adding a row, model for first field should be 'test", {briefDescription: "test"}, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath)[0]);
        });
        repeatable.locate("addButton").click();        
    });

    repeatableTest.test("Add functionality when model initially empty", function () {
        var oldTestModel = {};
        fluid.model.copyModel(oldTestModel, testModel);
        fluid.clear(testModel);        

        repeatable = setupRepeatable();
        jqUnit.assertEquals("When initialized with an empty  model, model length should be 1", 1, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
        repeatable.applier.modelChanged.addListener("*", function () {
            jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
        });
        repeatable.locate("addButton").click();
        fluid.clear(testModel);
        fluid.model.copyModel(testModel, oldTestModel);
    });
    
    repeatableTest.test("Delete Functionality", function () {
        // TODO: Delete is not yet implemented, so only the 'after clicking add' assert will run currently
        //       An expect() would catch this
        repeatable = setupRepeatable();
        repeatable.events.afterDelete.addListener(function () {
            jqUnit.assertEquals("After delete of only item, model is still of length 1", 1, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
        }, "deletePrimary");
        jQuery(".csc-repeatable-delete").eq(0).click();
        repeatable.events.afterDelete.removeListener("deletePrimary");
        repeatable.applier.modelChanged.addListener("*", function () {
            jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
        });
        repeatable.locate("addButton").click();
        repeatable.events.afterDelete.addListener(function () {
            jqUnit.assertEquals("After deleting non-primary item, model is of length 1", 1, fluid.model.getBeanValue(repeatable.model, repeatable.options.elPath).length);
        }, "deleteNonPrimary");
        jQuery(".csc-repeatable-delete").eq(1).click();
        repeatable.events.afterDelete.removeListener("deleteNonPrimary");
    });
};

(function () {
    repeatableTester();
}());