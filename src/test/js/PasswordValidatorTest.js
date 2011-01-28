/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, expect*/

var passwordValidatorTester = function(){

    var barePasswordValidatorTest = new jqUnit.TestCase("PasswordValidator Tests", function () {
        cspace.util.isTest = true;
    });
    
    var passwordValidatorTest = cspace.tests.testEnvironment({testCase: barePasswordValidatorTest});
    
    var samplePasswords = {
            invalidTooSmall : "1234567",
            invalidTooLong : "1234567890123456789012345",
            validMinLength : "12345678",
            validMaxLength : "123456789012345678901234",
            validInBetween : "1234567890"
    };
    
    passwordValidatorTest.test("Check sample password lengths used in these tests", function () {
        var pv = cspace.passwordValidator("#main");
        jqUnit.assertTrue("invalid too small password is less than minLength", samplePasswords.invalidTooSmall.length < pv.options.minLength);
        jqUnit.assertTrue("invalid too long password is greater than maxLength", samplePasswords.invalidTooLong.length > pv.options.maxLength);
        jqUnit.assertTrue("valid min length password is minLength", samplePasswords.validMinLength.length === pv.options.minLength);
        jqUnit.assertTrue("valid max length password is maxLength", samplePasswords.validMaxLength.length === pv.options.maxLength);
        jqUnit.assertTrue("valid in between password is more than minLength and less than maxLength", samplePasswords.validInBetween.length > pv.options.minLength && samplePasswords.validInBetween.length < pv.options.maxLength);
    });

    passwordValidatorTest.test("Show hide appropriately", function () {
        var pw = jQuery("#password-field");
        var pv = cspace.passwordValidator("#main");
        var msg = pv.options.messageBar;
        pv.bindEvents();
        jqUnit.notVisible("To begin, message should not be visible", msg.container);
        pw.val(samplePasswords.invalidTooSmall).change();
        jqUnit.isVisible("On short password, message should be visible", msg.container);
        pw.val(samplePasswords.validInBetween).change();
        jqUnit.notVisible("On long-enough password, message should not be visible", msg.container);
        pw.val(samplePasswords.invalidTooLong).change();
        jqUnit.isVisible("On too-long password, message should be visible", msg.container);
    });

    passwordValidatorTest.test("Default lengths", function () {
        var pw = jQuery("#password-field");
        var pv = cspace.passwordValidator("#main");
        var msg = pv.options.messageBar;
        pv.bindEvents();
        jqUnit.notVisible("To begin, message should not be visible", msg.container);
        pw.val(samplePasswords.invalidTooSmall).change();
        jqUnit.isVisible("On short password, message should be visible", msg.container);
        pw.val(samplePasswords.validMinLength).change();
        jqUnit.notVisible("On exact min length password, message should not be visible", msg.container);
        pw.val(samplePasswords.validMaxLength).change();
        jqUnit.notVisible("On exact max length password, message should not be visible", msg.container);
        pw.val(samplePasswords.invalidTooLong).change();
        jqUnit.isVisible("On too-long password, message should be visible", msg.container);
    });

    passwordValidatorTest.test("Custom lengths", function () {
        var pw = jQuery("#password-field");
        var pv = cspace.passwordValidator("#main", {minLength: 4, maxLength: 7});
        var msg = pv.options.messageBar;
        pv.bindEvents();
        jqUnit.notVisible("To begin, message should not be visible", msg.container);
        pw.val("123").change();
        jqUnit.isVisible("On short password, message should be visible", msg.container);
        pw.val("1234").change();
        jqUnit.notVisible("On exact min length password, message should not be visible", msg.container);
        pw.val("1234567").change();
        jqUnit.notVisible("On exact max length password, message should not be visible", msg.container);
        pw.val("12345678").change();
        jqUnit.isVisible("On too-long password, message should be visible", msg.container);
    });

    passwordValidatorTest.test("Message text: default lengths", function () {
        var pw = jQuery("#password-field");
        var pv = cspace.passwordValidator("#main");
        var msg = pv.options.messageBar;
        pv.bindEvents();
        jqUnit.notVisible("To begin, message should not be visible", msg.container);
        pw.val(samplePasswords.invalidTooSmall).change();
        jqUnit.isVisible("On short password, message should be visible", msg.container);
        jqUnit.assertEquals("Message should include default lengths", "Passwords must be between 8 and 24 characters in length.", msg.locate("message").text());
    });

    passwordValidatorTest.test("Message text: custom lengths", function () {
        var pw = jQuery("#password-field");
        var pv = cspace.passwordValidator("#main", {minLength: 3, maxLength: 33});
        var msg = pv.options.messageBar;
        pv.bindEvents();
        jqUnit.notVisible("To begin, message should not be visible", msg.container);
        pw.val("1").change();
        jqUnit.isVisible("On short password, message should be visible", msg.container);
        jqUnit.assertEquals("Message should include default lengths", "Passwords must be between 3 and 33 characters in length.", msg.locate("message").text());
    });
};

(function () {
    passwordValidatorTester();
}());
