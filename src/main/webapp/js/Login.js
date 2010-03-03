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

    var showResetRequestForm = function (domBinder) {
        domBinder.locate("signIn").hide();
        domBinder.locate("enterEmail").show();
        domBinder.locate("resetRequest").hide();
        domBinder.locate("passwordReset").hide();
    };

    var showResetRequestSubmitted = function (domBinder) {
        domBinder.locate("signIn").hide();
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

    var showResetRequestSubmittedPage = function (domBinder) {
        domBinder.locate("enterEmailForm").hide();
        domBinder.locate("enterEmailMessage").text("Email sent.");
    };

    var submitEmail = function (email, url, that) {
        if (cspace.util.isLocal()) {
            showResetRequestSubmittedPage(that.dom);
            that.events.emailSubmitted.fire();
        } else {
            jQuery.ajax({
                url: cspace.util.addTrailingSlash(url) + "passwordreset",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({"email": email}),
                success: that.events.emailSubmitted.fire,
                error: that.events.onError.fire
            });
        }
    };
    
    var makeEmailSubmitter = function (that) {
        return function (e) {
            that.submitEmail(function (data, textStatus) {
                showResetRequestSubmittedPage(that.dom);
            }, makeErrorHandler(that.dom, "Unable to submit request"));
            showResetRequestSubmittedPage(that.dom);
        };
    };

    var makePasswordSubmitter = function (that) {
        return function (e) {
            showPasswordReset(that.dom);
            that.submitNewPassword();
        };
    };

    var makeErrorHandler = function (domBinder, text) {
        return function(XMLHttpRequest, textStatus, errorThrown){
            domBinder.locate("warning").text(text).show();
        };
    };
    
    var bindEventHandlers = function (that) {
        that.locate("requestReset").click(function(e){
            that.locate("warning").hide();
            showResetRequestForm(that.dom);
        });
        that.locate("submitEmail").click(makeEmailSubmitter(that));
        that.locate("submitNewPassword").click(makePasswordSubmitter(that));
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

        var result = cspace.util.getUrlParameter("result");
        if (result == "fail") {
            that.locate("warning").show();
        } else {
            that.locate("warning").hide();
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
            email: ""
        };

        that.submitEmail = function () {
            submitEmail(that.locate("email").val(), that.options.baseUrl, that);
        };
        
        that.submitNewPassword = function (successFunction, errorFunction) {
            // TODO: submit new password to that.options.baseUrl+"resetpassword",
            // which should log the user in automatically
        };

        setupLogin(that);
        return that;
    };

    fluid.defaults("cspace.login", {
        
        events: {
            emailSubmitted: null,
            onError: null
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
            submitEmail: ".csc-login-submitEmail",
                        
            resetForm: ".csc-login-resetForm",
            resetRequest: ".csc-login-resetRequest",
            newPassword: ".csc-login-newPassword",
            confirmPassword: ".csc-login-confirmPassword",
            submitNewPassword: ".csc-login-submitNewPassword",

            passwordReset: ".csc-login-passwordReset",

            warning: ".csc-warning"
        },
        
        baseUrl: "../../chain/"
    });
    
})(jQuery, fluid_1_2);
