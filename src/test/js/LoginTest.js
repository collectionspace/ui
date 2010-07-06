/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/

var loginTester = function(){
    // jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;

    var loginTest = new jqUnit.TestCase("Login Tests", function () {
        cspace.util.isTest = true;
        loginTest.fetchTemplate("../../main/webapp/html/index.html", ".csc-login");
    });

    loginTest.test("Basic login form visibility, actions", function () {
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jqUnit.isVisible("Basic login should be visible", login.options.selectors.signIn);
        jqUnit.notVisible("Email entry should not be visible", login.options.selectors.enterEmail);
        jqUnit.notVisible("New password entry should not be visible", login.options.selectors.resetRequest);
        jqUnit.notVisible("Message should not be visible", login.options.selectors.messageContainer);
        jqUnit.assertEquals("In local mode, login form action should be set to local option", "createnew.html", jQuery(login.options.selectors.loginForm).attr("action"));

        var tempIsLocal = cspace.util.useLocalData;
        cspace.util.useLocalData = function () {return false;};
        login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jqUnit.assertEquals("Login form action should be set based on the supplied baseUrl", "http://foo.com/bar/login", jQuery(login.options.selectors.loginForm).attr("action"));
        cspace.util.useLocalData = tempIsLocal;
    });

    loginTest.test("Basic login required fields", function () {
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jqUnit.notVisible("Before login, message should not be visible", login.options.selectors.messageContainer);

        jQuery(login.options.selectors.loginForm).submit();
        jqUnit.isVisible("Logging in with empty fields should show error message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe required fields", login.options.strings.allFieldsRequired, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));

        jQuery(login.options.selectors.messageContainer).hide();
        jQuery(login.options.selectors.userid).val("userid");
        jQuery(login.options.selectors.loginForm).submit();
        jqUnit.isVisible("Logging in with only user id should show error message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe required fields", login.options.strings.allFieldsRequired, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));

        jQuery(login.options.selectors.messageContainer).hide();
        jQuery(login.options.selectors.userid).val("");
        jQuery(login.options.selectors.password).val("password");
        jQuery(login.options.selectors.loginForm).submit();
        jqUnit.isVisible("Logging in with only password should show error message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe required fields", login.options.strings.allFieldsRequired, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));
    });

    loginTest.test("Email submit required field", function () {
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jqUnit.notVisible("Before login, message should not be visible", login.options.selectors.messageContainer);
        login.submitEmail();
        jqUnit.isVisible("Submitting email with empty fields should show error message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe required fields", login.options.strings.emailRequired, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));
    });

    loginTest.test("Email submit (local)", function () {
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jQuery(login.options.selectors.requestReset).click();
        jqUnit.notVisible("Clicking 'reset password' hides basic login", login.options.selectors.signIn);
        jqUnit.isVisible("Clicking 'reset password' shows email form", login.options.selectors.enterEmail);

        jQuery(login.options.selectors.email).val("test@collectionspace.org");
        login.submitEmail();
        jqUnit.notVisible("On success, after submit email form should be hidden", login.options.selectors.enterEmailForm);
        jqUnit.isVisible("On success, response message should be displayed", login.options.selectors.messageContainer);
    });

    loginTest.test("Email submit Ajax parameters", function () {
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        // Don't know how jqMock checks functions, so just check the other parameters for now
        var expectedAjaxParams = {
            url: "http://foo.com/bar/passwordreset",
            data: JSON.stringify({"email":"test@collectionspace.org"}),
            type: "POST",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams)).returnValue();

        var tempIsLocal = cspace.util.useLocalData;
        cspace.util.useLocalData = function () {return false;};
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jQuery(login.options.selectors.email).val("test@collectionspace.org");
        login.submitEmail();
        ajaxMock.verify();
        ajaxMock.restore();
        cspace.util.useLocalData = tempIsLocal;
    });

    loginTest.test("New password submission required fields", function () {
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jqUnit.notVisible("Before login, message should not be visible", login.options.selectors.messageContainer);
        login.submitNewPassword();
        jqUnit.isVisible("Submitting password with empty fields should show error message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe required fields", login.options.strings.allFieldsRequired, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));

        jQuery(login.options.selectors.messageContainer).hide();
        jQuery(login.options.selectors.newPassword).val("newPass");
        login.submitNewPassword();
        jqUnit.isVisible("Submitting password with only one field should show error message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe required fields", login.options.strings.allFieldsRequired, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));

        jQuery(login.options.selectors.messageContainer).hide();
        jQuery(login.options.selectors.newPassword).val("");
        jQuery(login.options.selectors.confirmPassword).val("newPass");
        login.submitNewPassword();
        jqUnit.isVisible("Submitting password with only other field should show error message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe required fields", login.options.strings.allFieldsRequired, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));


        jQuery(login.options.selectors.messageContainer).hide();
        jQuery(login.options.selectors.newPassword).val("newPassOne");
        jQuery(login.options.selectors.confirmPassword).val("newPassTwo");
        login.submitNewPassword();
        jqUnit.isVisible("Submitting password with non-matching password should show error message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe required fields", login.options.strings.passwordsMustMatch, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));
    });

    loginTest.test("New password submission (local)", function () {
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jQuery(login.options.selectors.newPassword).val("testPassOne");
        jQuery(login.options.selectors.confirmPassword).val("testPassOne");
        jQuery(login.options.selectors.resetForm).show();
        login.submitNewPassword();
        jqUnit.notVisible("After new password submission, password form should not be visible", login.options.selectors.resetRequest);
    });

    loginTest.test("New password submission Ajax parameters", function () {
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        // Don't know how jqMock checks functions, so just check the other parameters for now
        var expectedAjaxParams = {
            url: "http://foo.com/bar/resetpassword",
            data: JSON.stringify({"password":"testPassTwo", "token": "testToken"}),
            type: "POST",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams)).returnValue();

        var tempIsLocal = cspace.util.useLocalData;
        cspace.util.useLocalData = function () {return false;};
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        jQuery(login.options.selectors.newPassword).val("testPassTwo");
        jQuery(login.options.selectors.confirmPassword).val("testPassTwo");
        login.token = "testToken";
        login.submitNewPassword();
        ajaxMock.verify();
        ajaxMock.restore();
    });

    loginTest.test("Bad email on password reset (CSPACE-1616)", function () {
        expect(4);
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        $(login.options.selectors.requestReset).click();
        jqUnit.notVisible("Initally, error messages should not be visible", login.options.selectors.messageContainer);
        var dummyBadEmailServerResponse = {
            message: "Could not find a user with email foofer@doodle.com",
            ok: false
        };
        login.events.emailSubmitted.fire(dummyBadEmailServerResponse);
        jqUnit.isVisible("Firing 'email submitted' with 'invalid email' message should show error messages", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe bad email", dummyBadEmailServerResponse.message, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));
        jqUnit.isVisible("Field to enter email should still be visible", login.options.selectors.email);
    });

    loginTest.test("Good email on password reset (CSPACE-1616)", function () {
        expect(4);
        var login = cspace.login(".csc-login", {baseUrl: "http://foo.com/bar"});
        $(login.options.selectors.requestReset).click();
        jqUnit.notVisible("Initally, error messages should not be visible", login.options.selectors.messageContainer);
        var dummyBadEmailServerResponse = {
            message: "Email sent to foofer@doodle.com",
            ok: true
        };
        login.events.emailSubmitted.fire(dummyBadEmailServerResponse);
        jqUnit.isVisible("Firing 'email submitted' with 'email sent' message should show success message", login.options.selectors.messageContainer);
        jqUnit.assertEquals("Message should describe bad email", dummyBadEmailServerResponse.message, jQuery.trim(jQuery(login.options.selectors.messageContainer + ":visible").text()));
        jqUnit.notVisible("Field to enter email should no longer be visible", login.options.selectors.email);
    });
};

(function () {
    loginTester();
}());


/*
*/