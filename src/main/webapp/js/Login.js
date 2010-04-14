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
        domBinder.locate("userID").focus();
        domBinder.locate("enterEmail").hide();
        domBinder.locate("resetRequest").hide();
        domBinder.locate("passwordReset").hide();
    };

    var showResetRequestForm = function (domBinder) {
        domBinder.locate("signIn").hide();
        domBinder.locate("enterEmail").show();
        domBinder.locate("email").focus();
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
        domBinder.locate("newPassword").focus();
        domBinder.locate("passwordReset").hide();
    };

    var showPasswordReset = function (domBinder) {
        domBinder.locate("signIn").hide();
        domBinder.locate("enterEmail").hide();
        domBinder.locate("resetRequest").hide();
        domBinder.locate("passwordReset").show();
    };

    var showEmailSubmittedPage = function (domBinder) {
        domBinder.locate("enterEmailForm").hide();
        domBinder.locate("enterEmailMessage").text("An email has been sent you. Please follow the link in the email to reset the password.");
    };

    var makeRequiredFieldsValidator = function (domBinder, formType, message) {
        return function (e) {
            var requiredFields = domBinder.locate(formType+"Required");
            var missing = false;
            var firstMissing = -1;
            for (var i = 0; i < requiredFields.length; i++) {
                if ($(requiredFields[i]).val() === "") {
                    missing = true;
                    firstMissing = i;
                    break;
                }
            }
            if (!missing) {
                cspace.util.hideMessage(domBinder);
                return true;
            } else {
                cspace.util.displayTimestampedMessage(domBinder, message);
                requiredFields[firstMissing].focus();
                return false;
            }
        };
    };

    var emailFormValid = function (domBinder, message) {
        return makeRequiredFieldsValidator(domBinder, "email", message)();      
    };

    var passwordFormValid = function (domBinder, allRequiredMessage, mustMatchMessage) {
        if (!makeRequiredFieldsValidator(domBinder, "password", allRequiredMessage)()) {
            return false;
        }
        if (domBinder.locate("newPassword").val() !== domBinder.locate("confirmPassword").val()) {
            cspace.util.displayTimestampedMessage(domBinder, mustMatchMessage);
            domBinder.locate("newPassword").focus();
            return false;
        }
        return true;
    };

    var submitEmail = function (email, url, that) {
        if (cspace.util.isLocal()) {
            showEmailSubmittedPage(that.dom);
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
    
    var submitNewPassword = function (password, url, that) {
        if (cspace.util.isLocal()) {
            showPasswordReset(that.dom);
            that.events.passwordSubmitted.fire();
        } else {
            jQuery.ajax({
                url: cspace.util.addTrailingSlash(url) + "resetpassword",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({"password": password, "token": that.token}),
                success: that.events.passwordSubmitted.fire,
                error: that.events.onError.fire
            });
        }
    };

    var makeEmailSubmitter = function (that) {
        return function (e) {
            that.submitEmail();
        };
    };

    var makePasswordSubmitter = function (that) {
        return function (e) {
            that.submitNewPassword();
        };
    };

    var makeErrorHandler = function (domBinder, text) {
        return function(XMLHttpRequest, textStatus, errorThrown){
            cspace.util.displayTimestampedMessage(domBinder, text);
        };
    };
    
    var bindEventHandlers = function (that) {
        that.locate("requestReset").click(function(e){
            cspace.util.hideMessage(that.dom);
            showResetRequestForm(that.dom);
        });
        that.locate("submitEmail").click(makeEmailSubmitter(that));
        that.locate("submitNewPassword").click(makePasswordSubmitter(that));

        that.events.emailSubmitted.addListener(function () {
            showEmailSubmittedPage(that.dom);
        });
        that.events.passwordSubmitted.addListener(function () {
            showPasswordReset(that.dom);
        });
        
        that.events.onError.addListener(function () {
            cspace.util.displayTimestampedMessage(that.dom, that.options.strings.generalError);            
        });

        that.locate("loginForm").submit(makeRequiredFieldsValidator(that.dom, "login", that.options.strings.allFieldsRequired));
        that.locate("resetForm").submit(makeRequiredFieldsValidator(that.dom, "password", that.options.strings.allFieldsRequired));

        cspace.passwordValidator(that.container);
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
            cspace.util.displayTimestampedMessage(that.dom, that.options.strings.invalid);
        } else {
            cspace.util.hideMessage(that.dom);
        }
        var resetToken = cspace.util.getUrlParameter("token");
        if (resetToken) {
            that.token = resetToken;
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

        that.submitEmail = function () {
            if (emailFormValid(that.dom, that.options.strings.emailRequired)) {
                submitEmail(that.locate("email").val(), that.options.baseUrl, that);
            }
        };
        
        that.submitNewPassword = function () {
            if (passwordFormValid(that.dom, that.options.strings.allFieldsRequired, that.options.strings.passwordsMustMatch)) {
                submitNewPassword(that.locate("newPassword").val(), that.options.baseUrl, that);
            }
        };

        setupLogin(that);
        return that;
    };

    fluid.defaults("cspace.login", {
        
        events: {
            emailSubmitted: null,
            passwordSubmitted: null,
            onError: null
        },
    
        selectors: {
            loginForm: ".csc-login-loginForm",
            signIn: ".csc-login-signIn",
            userID: ".csc-login-userId",
            password: ".csc-login-password",
            loginButton: ".csc-login-button",
            requestReset: ".csc-login-requestReset",
            loginRequired: ".csc-login-loginRequired",

            enterEmail: ".csc-login-enterEmail",
            enterEmailMessage: ".csc-login-enterEmailMessage",
            enterEmailForm: ".csc-login-enterEmailForm",
            email: ".csc-login-email",
            submitEmail: ".csc-login-submitEmail",
            emailRequired: ".csc-login-emailRequired",
                        
            resetForm: ".csc-login-resetForm",
            resetRequest: ".csc-login-resetRequest",
            newPassword: ".csc-login-newPassword",
            confirmPassword: ".csc-login-confirmPassword",
            submitNewPassword: ".csc-login-submitNewPassword",
            passwordRequired: ".csc-login-passwordRequired",

            passwordReset: ".csc-login-passwordReset",

            warning: ".csc-warning",
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp"
        },

        strings: {
            allFieldsRequired: "All fields must be filled in",
            emailRequired: "You must enter a valid email address",
            passwordsMustMatch: "Passwords must match",
            invalid: "Invalid email/password combination",
            generalError: "I'm sorry, an error has occurred. Please try again, or contact your system administrator."
        }, 
       
        baseUrl: "../../chain/"
    });
    
})(jQuery, fluid_1_2);
