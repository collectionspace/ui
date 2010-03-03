/*
Copyright 2009-2010 University of Cambridge
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {
    var showSignIn = function (domBinder) {
        domBinder.locate("signIn").show();
        domBinder.locate("enterEmail").hide();
        domBinder.locate("resetRequest").hide();
        domBinder.locate("passwordReset").hide();
    };

    var showReset = function (domBinder) {
        domBinder.locate("signIn").hide();
        domBinder.locate("enterEmail").hide();
        domBinder.locate("resetRequest").show();
        domBinder.locate("passwordReset").hide();
    };

    var showPasswordReset = function (domBinder) {
        domBinder.locate("signIn").hide();
        domBinder.locate("enterEmail").hide();
        domBinder.locate("resetRequest").hide();
        domBinder.locate("passwordReset").show();
    };

	var sendLoginToServer = function (that) {
        return function(e){
            // TODO: Security - don't want to send login info as plain text
            jQuery.ajax({
                // TODO: Specify the URL in the options, so users can provide it
                url: that.options.loginUrl,
                type: "POST",
                dataType: "json",
                data: JSON.stringify(that.model),
                success: that.events.loginSuccess.fire,
                error: that.events.loginError.fire
            });
        };
    };
    
    var showResetRequestForm = function (domBinder) {
        return function (e) {
            domBinder.locate("signIn").hide();
            domBinder.locate("enterEmail").show();
            domBinder.locate("resetRequest").hide();
            domBinder.locate("passwordReset").hide();
        };
    };

    var showResetRequestSubmittedPage = function (domBinder) {
        domBinder.locate("enterEmailForm").hide();
        domBinder.locate("enterEmailMessage").text("Email sent.");
    };

    var submitResetRequest = function (that) {
        return function (e) {
            // TODO: validate that the two passwords match
            // TODO: request for password reset to that.options.requestPasswordResetUrl,
            // which will eventually send an email to the user
            showResetRequestSubmittedPage(that.dom);
        };
    };

    var submitNewPassword = function (that) {
        return function (e) {
            showPasswordReset(that.dom);
            // TODO: submit new password to that.options.resetPasswordUrl,
            // which should log the user in automatically
        };
    };

    var handleError = function (that, XMLHttpRequest, textStatus, errorThrown) {
        that.locate("warning").show();
    };
    
    var bindEventHandlers = function (that) {
        that.locate("loginButton").click(sendLoginToServer(that));
        that.locate("requestReset").click(showResetRequestForm(that.dom));
        that.locate("requestResetButton").click(submitResetRequest(that));
        that.locate("resetPassword").click(submitNewPassword(that));
    };

    var setupLogin = function (that) {  
        bindEventHandlers(that);      
        if (cspace.util.isLocal()) {
            that.locate("loginForm").attr("action", "createnew.html");
            that.locate("resetForm").attr("action", "createnew.html");
        } else {
            that.locate("loginForm").attr("action", cspace.util.addTrailingSlash(that.options.baseUrl)+"login");
            that.locate("resetForm").attr("action", cspace.util.addTrailingSlash(that.options.baseUrl)+"resetpassword");
        }
        
        var resetToken = cspace.util.getUrlParameter("token");
        if (resetToken) {
            showReset(that.dom);
        } else {
            showSignIn(that.dom);
        }
    };
    
    /**
     * Login Component
     * 
     * @param {Object} container
     * @param {Object} options
     */
    cspace.login = function (container, options) {
        var that = fluid.initView("cspace.login", container, options);
        that.model = {
            userid: "",
            password: "",
            newsInfo: ""
        };

        setupLogin(that);
        return that;
    };

    fluid.defaults("cspace.login", {
        
        events: {
            onLogin: null,
            loginSuccess: null,
            loginError: null
        },
    
        selectors: {
            loginForm: ".csc-login-loginForm",
            signIn: ".csc-login-signIn",
            userID: ".csc-login-userId",
            password: ".csc-login-password",
            loginButton: ".csc-login-button",
            requestReset: ".csc-login-requestReset",

            enterEmail: ".csc-login-enterEmail",
            enterEmailMessage: ".csc-login-enterEmailMessage",
            enterEmailForm: ".csc-login-enterEmailForm",
            email: ".csc-login-email",
            requestResetButton: ".csc-login-requestResetButton",
            
            resetForm: ".csc-login-resetForm",
            resetRequest: ".csc-login-resetRequest",
            newPassword: ".csc-login-newPassword",
            confirmPassword: ".csc-login-confirmPassword",
            resetPassword: ".csc-login-resetPasswordButton",

            passwordReset: ".csc-login-passwordReset",

            warning: ".csc-login-warning"
        },
        
        baseUrl: "../../chain/"
    });
    
})(jQuery, fluid_1_2);
