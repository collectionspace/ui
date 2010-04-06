/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/

var passwordValidatorTester = function(){
    // jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;

    var passwordValidatorTest = new jqUnit.TestCase("PasswordValidator Tests");

    passwordValidatorTest.test("Show hide appropriately", function () {
        var pw = jQuery("#password-field");
        var msg = jQuery("#message");
        var pv = cspace.passwordValidator("#main");
        jqUnit.notVisible("To begin, message should not be visible", msg);
        pw.val("12").change();
        jqUnit.isVisible("On short password, message should be visible", msg);
        pw.val("1234567890123").change();
        jqUnit.notVisible("On long-enough password, message should not be visible", msg);
        pw.val("1234567890123456789012345678901234567890").change();
        jqUnit.isVisible("On too-long password, message should be visible", msg);
    });

    passwordValidatorTest.test("Default lengths", function () {
        var pw = jQuery("#password-field");
        var msg = jQuery("#message");
        var pv = cspace.passwordValidator("#main");
        jqUnit.notVisible("To begin, message should not be visible", msg);
        pw.val("1234567").change();
        jqUnit.isVisible("On short password, message should be visible", msg);
        pw.val("12345678").change();
        jqUnit.notVisible("On exact min length password, message should not be visible", msg);
        pw.val("12345678901234567890123").change();
        jqUnit.notVisible("On exact max length password, message should not be visible", msg);
        pw.val("123456789012345678901234").change();
        jqUnit.isVisible("On too-long password, message should be visible", msg);
    });

    passwordValidatorTest.test("Custom lengths", function () {
        var pw = jQuery("#password-field");
        var msg = jQuery("#message");
        var pv = cspace.passwordValidator("#main", {minLength: 4, maxLength: 7});
        jqUnit.notVisible("To begin, message should not be visible", msg);
        pw.val("123").change();
        jqUnit.isVisible("On short password, message should be visible", msg);
        pw.val("1234").change();
        jqUnit.notVisible("On exact min length password, message should not be visible", msg);
        pw.val("1234567").change();
        jqUnit.notVisible("On exact max length password, message should not be visible", msg);
        pw.val("12345678").change();
        jqUnit.isVisible("On too-long password, message should be visible", msg);
    });

    passwordValidatorTest.test("Message text: default lengths", function () {
        var pw = jQuery("#password-field");
        var msg = jQuery("#message");
        var pv = cspace.passwordValidator("#main");
        jqUnit.notVisible("To begin, message should not be visible", msg);
        pw.val("123").change();
        jqUnit.isVisible("On short password, message should be visible", msg);
        jqUnit.assertEquals("Message should include default lengths", "Passwords must be between 8 and 23 characters in length.", $.trim(msg.text()));
    });

    passwordValidatorTest.test("Message text: custom lengths", function () {
        var pw = jQuery("#password-field");
        var msg = jQuery("#message");
        var pv = cspace.passwordValidator("#main", {minLength: 3, maxLength: 33});
        jqUnit.notVisible("To begin, message should not be visible", msg);
        pw.val("1").change();
        jqUnit.isVisible("On short password, message should be visible", msg);
        jqUnit.assertEquals("Message should include default lengths", "Passwords must be between 3 and 33 characters in length.", $.trim(msg.text()));
    });
};

(function () {
    passwordValidatorTester();
}());


/*
*/