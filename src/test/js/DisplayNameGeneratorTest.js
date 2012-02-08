/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var displayNameGeneratorTester = function ($) {
    
    var container = ".dng";
    
    var bareDisplayNameGeneratorTest = new jqUnit.TestCase("DisplayNameGenerator Tests");
    
    var displayNameGeneratorTest = cspace.tests.testEnvironment({
        testCase: bareDisplayNameGeneratorTest
    });
    
    displayNameGeneratorTest.test("Init and render", function () {
        var dng = cspace.displayNameGenerator(container);
        jqUnit.assertValue("Display Name Generator created", dng);
    });
    
    displayNameGeneratorTest.test("Display Name on Init", function () {
        var model = {
            fields: {
                foundingDate: "11-11-2011",
                foundingPlace: "Berkeley"
            }
        }, applier = fluid.makeChangeApplier(model);
        var dng = cspace.displayNameGenerator(container, {
            model: model,
            applier: applier
        });
        jqUnit.assertEquals("On init, display name is generated", "Berkeley 11-11-2011",
            dng.container.val());
    });
    
    displayNameGeneratorTest.test("Display Name on Init", function () {
        var dng = cspace.displayNameGenerator(container);
        jqUnit.assertEquals("On init, display name is empty", "",
            dng.container.val());
        dng.applier.requestChange("fields.foundingDate", "11-11-2011");
        jqUnit.assertEquals("On init, display name is generated", "11-11-2011",
            dng.container.val());
        dng.applier.requestChange("fields.foundingPlace", "Berkeley");
        jqUnit.assertEquals("On init, display name is generated", "Berkeley 11-11-2011",
            dng.container.val());
        dng.applier.requestChange("fields.foundingDate", "");
        jqUnit.assertEquals("On init, display name is generated", "Berkeley",
            dng.container.val());
    });
    
    displayNameGeneratorTest.test("Display Name should be disabled", function () {
        var dng = cspace.displayNameGenerator(container);
        jqUnit.assertTrue("Container should be disabled", dng.container.is(":disabled"));
    });
};

(function () {
    displayNameGeneratorTester(jQuery);
}());