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

var mbTester = function ($) {
    
    var bareMBTest = new jqUnit.TestCase("Message Box Tests", function () {
        $(".csc-messageBar-container").detach();
    });
    
    var mbTest = cspace.tests.testEnvironment({testCase: bareMBTest});
    
    var setupMessageBar = function (options) {
        return cspace.messageBar("#main", options);
    };
    
    mbTest.test("Init and render", function () {
        var mb = setupMessageBar();
        mb.show("TEST");
        jqUnit.assertEquals("Message should say", "TEST", mb.locate("message").text());
        jqUnit.assertEquals("Button should say", "OK", mb.locate("cancel").val());
        mb.show("TEST2", "2001:10:10");
        jqUnit.assertEquals("Message should say", "TEST2", mb.locate("message").text());
        jqUnit.assertEquals("Time should say", "2001:10:10", mb.locate("time").text());
        mb.hide();
        jqUnit.notVisible("Message box should be invisible", mb.container);
        mb.show("TEST2", null, true);
        jqUnit.assertTrue("Message should have error style", $.inArray(mb.options.styles.error, mb.locate("messageBlock")[0].classList) > 0);
        mb.locate("cancel").click();
        jqUnit.notVisible("Message box should be invisible", mb.container);
        mb.disable();
        mb.show("TEST");
        jqUnit.notVisible("Message box should be invisible since mb was disabled", mb.container);
    });
    
    mbTest.test("MessageBar with an error object passed into it", function () {
        var mb = setupMessageBar(),
            error = {
                isError: true,
                message: "You are looking at the message in the error object"  
            };
        mb.show(error);
        jqUnit.assertEquals("Message should say", error.message, mb.locate("message").text());
        jqUnit.assertEquals("Button should say", "OK", mb.locate("cancel").val());
        mb.locate("cancel").click();
        jqUnit.notVisible("Message box should be invisible", mb.container);
    });
};

jQuery(document).ready(function () {
    mbTester(jQuery);
});