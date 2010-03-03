/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/

var loginTester = function(){

    var loginTest = new jqUnit.TestCase("Login Tests");

    loginTest.test("Basic login", function () {
        var login = cspace.login(".login-container", {baseUrl: "http://foo.com/bar"});
        jqUnit.isVisible("Basic login should be visible", login.options.selectors.signIn);
        jqUnit.notVisible("Email entry should not be visible", login.options.selectors.enterEmail);
        jqUnit.notVisible("New password entry should not be visible", login.options.selectors.resetRequest);
        jqUnit.notVisible("Reset confirmation should not be visible", login.options.selectors.passwordReset);
        jqUnit.notVisible("Warning should not be visible", login.options.selectors.warning);
        jqUnit.assertEquals("In local mode, login form action should be set to local option", "createnew.html", jQuery(login.options.selectors.loginForm).attr("action"));
        jqUnit.assertEquals("In local mode, reset form action should be set to local option", "createnew.html", jQuery(login.options.selectors.resetForm).attr("action"));

        var tempIsLocal = cspace.util.isLocal;
        cspace.util.isLocal = function () {return false;};
        login = cspace.login(".login-container", {baseUrl: "http://foo.com/bar"});
        jqUnit.assertEquals("Login form action should be set based on the supplied baseUrl", "http://foo.com/bar/login", jQuery(login.options.selectors.loginForm).attr("action"));
        jqUnit.assertEquals("Reset form action should be set based on the supplied baseUrl", "http://foo.com/bar/resetpassword", jQuery(login.options.selectors.resetForm).attr("action"));
        cspace.util.isLocal = tempIsLocal;
    });
};

(function () {
    loginTester();
}());
