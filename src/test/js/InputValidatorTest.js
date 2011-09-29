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

var inputValidatorTester = function ($) {
    
    var container = ".input";
    
    var bareInputValidatorTest = new jqUnit.TestCase("Input Validator Tests");
    
    var inputValidatorTest = cspace.tests.testEnvironment({
        testCase: bareInputValidatorTest
    });
    
    var setupInputValidator = function (options) {
        options = fluid.merge(null, options || {}, {
            listeners: {}
        });
        var iv = cspace.inputValidator(container, options);
        return iv;
    };
    
    inputValidatorTest.test("Init", function () {
        var type = "integer";
        var iv = setupInputValidator({
            type: type
        });
        jqUnit.assertValue("Input validator should be created", iv);
        jqUnit.assertEquals("Type option is properly set", type, iv.options.type);
    });
    
    var testValues = function (iv, values, valid) {
        fluid.each(values, function (value) {
            jqUnit.assertEquals(value + " is a valid " + iv.options.type, valid, iv.validate(value, ""));
        });
    };
    
    inputValidatorTest.test("Validate integer", function () {
        var iv = setupInputValidator({
            type: "integer"
        });
        var invalid = [".12", "12.1", "12.", "a0", "22a", "aa", "21.12.22", null];
        var valid = ["0", "12", "2212", "-2", "", undefined]
        testValues(iv, invalid, false);
        testValues(iv, valid, true);
    });
    
    inputValidatorTest.test("Validate float", function () {
        var iv = setupInputValidator({
            type: "float"
        });
        var invalid = ["0.0.1", "a.1", "12.a", "a0", "22a", "aa", "21.12.22", null];
        var valid = ["0", "12", "2212", "-2", "", undefined, ".12", "22.22", "12.", "12.00", "122.22"]
        testValues(iv, invalid, false);
        testValues(iv, valid, true);
    });
    
    inputValidatorTest.asyncTest("Message display", function () {
        expect(1);
        var iv = setupInputValidator({
            type: "float",
            components: {
                messageBar: "{messageBar}"
            },
            label: "TEST"
        });
        setTimeout(function () {
            jqUnit.assertEquals("Invalid message should be present", "[String for key: TEST is missing. Please, add it to messageBundle.]: The number you have entered is invalid. Please try again.", iv.messageBar.locate("message").text());
            iv.messageBar.hide();
            start();
        }, 600);
        iv.container.val("0.0.1");
        iv.container.keyup();
    });
    
    inputValidatorTest.asyncTest("Message should not display", function () {
        expect(1);
        var iv = setupInputValidator({
            type: "float",
            components: {
                messageBar: "{messageBar}"
            },
            label: "TEST"
        });
        setTimeout(function () {
            jqUnit.notVisible("There should be no message bar", iv.messageBar.container);
            start();
        }, 600);
        iv.container.val("0.1");
        iv.container.keyup();
    });
    
    inputValidatorTest.asyncTest("Message display then hidden", function () {
        expect(2);
        var iv = setupInputValidator({
            type: "float",
            components: {
                messageBar: "{messageBar}"
            },
            label: "TEST"
        });
        setTimeout(function () {
            jqUnit.assertEquals("Invalid message should be present", "[String for key: TEST is missing. Please, add it to messageBundle.]: The number you have entered is invalid. Please try again.", iv.messageBar.locate("message").text());
            setTimeout(function () {
                jqUnit.notVisible("There should be no message bar", iv.messageBar.container);
                start();
            }, 600);
            iv.container.val("0.1");
            iv.container.keyup();
        }, 600);
        iv.container.val("0.0.1");
        iv.container.keyup();
    });
};

(function () {
    inputValidatorTester(jQuery);
}());