/*
Copyright 2009-2010 University of Cambridge
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("Login.js loaded");

    var showSignIn = function (domBinder) {
        domBinder.locate("signIn").show();
        domBinder.locate("userID").focus();
        domBinder.locate("enterEmail").hide();
        domBinder.locate("resetRequest").hide();
    };

    var showResetRequestForm = function (domBinder) {
        domBinder.locate("signIn").hide();
        domBinder.locate("enterEmail").show();
        domBinder.locate("email").focus();
        domBinder.locate("resetRequest").hide();
    };
    
    var displayMessage = function (messageBar, data) {
        if (data.messages) {
            // TODO: expand this branch as sophistication increases for CSPACE-3142
            fluid.each(data.messages, function(message) {
                messageBar.show(message.message, null, data.isError);
            });
        }
        else {
            messageBar.show(data.message, null, data.isError);
        }
    };

    var showEmailSubmittedPage = function (messageBar, domBinder, data) {
        if (data.isError !== true) {
            domBinder.locate("enterEmailForm").hide();
        }
        displayMessage(messageBar, data)
    };

    var showReset = function (domBinder) {
        domBinder.locate("signIn").hide();
        domBinder.locate("enterEmail").hide();
        domBinder.locate("resetRequest").show();
        domBinder.locate("newPassword").focus();
    };

    var showPasswordReset = function (messageBar, domBinder, data) {
        if (data.isError !== true) {
            domBinder.locate("signIn").show();
            domBinder.locate("enterEmail").hide();
            domBinder.locate("resetRequest").hide();
        }
        displayMessage(messageBar, data)
    };

    var makeRequiredFieldsValidator = function (messageBar, domBinder, formType, message) {
        return function (e) {
            var requiredFields = domBinder.locate(formType + "Required");
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
                messageBar.hide();
                return true;
            } else {
                messageBar.show(message, null, true);
                requiredFields[firstMissing].focus();
                return false;
            }
        };
    };

    var emailFormValid = function (messageBar, domBinder, message) {
        return makeRequiredFieldsValidator(messageBar, domBinder, "email", message)();      
    };

    var passwordFormValid = function (messageBar, domBinder, allRequiredMessage, mustMatchMessage) {
        if (!makeRequiredFieldsValidator(messageBar, domBinder, "password", allRequiredMessage)()) {
            return false;
        }
        if (domBinder.locate("newPassword").val() !== domBinder.locate("confirmPassword").val()) {
            messageBar.show(mustMatchMessage, null, true);
            domBinder.locate("newPassword").focus();
            return false;
        }
        return true;
    };

    var submitEmail = function (email, url, that) {
        if (cspace.util.useLocalData()) {
            var mockResponse = {message: "Success", ok: true};
            that.events.emailSubmitted.fire(mockResponse);
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
        if (cspace.util.useLocalData()) {
            var mockResponse = {message: "Success", isError: false};
            showPasswordReset(that.messageBar, that.dom, mockResponse);
            that.events.passwordSubmitted.fire(mockResponse);
        } else {
            jQuery.ajax({
                url: cspace.util.addTrailingSlash(url) + "resetpassword",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({"password": password, "token": that.token, "email": that.email}),
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
    
    var bindEventHandlers = function (that) {
        that.locate("requestReset").click(function (e) {
            that.messageBar.hide();
            showResetRequestForm(that.dom);
        });
        that.locate("submitEmail").click(makeEmailSubmitter(that));
        that.locate("submitNewPassword").click(makePasswordSubmitter(that));

        that.events.emailSubmitted.addListener(function (data, statusText) {
            showEmailSubmittedPage(that.messageBar, that.dom, data);
        });
        that.events.passwordSubmitted.addListener(function (data, statusText) {
            showPasswordReset(that.messageBar, that.dom, data);
        });
        
        that.events.onError.addListener(function () {
            that.messageBar.show(that.options.strings.generalError, null, true);            
        });

        that.locate("loginForm").submit(makeRequiredFieldsValidator(that.messageBar, that.dom, "login", that.options.strings.allFieldsRequired));
        that.locate("resetRequest").submit(makeRequiredFieldsValidator(that.messageBar, that.dom, "password", that.options.strings.allFieldsRequired));
    };

    var setupLogin = function (that) {  
        bindEventHandlers(that);      
        if (cspace.util.useLocalData()) {
            that.locate("loginForm").attr("action", "createnew.html");
        } else {
            that.locate("loginForm").attr("action", cspace.util.addTrailingSlash(that.options.baseUrl) + "login");
        }

        var result = cspace.util.getUrlParameter("result");
        if (result === "fail") {
            that.messageBar.show(that.options.strings.invalid, null, true);
        } else {
            that.messageBar.hide();
        }
        var resetToken = cspace.util.getUrlParameter("token");
        var email = cspace.util.getUrlParameter("email");
        if (resetToken) {
            that.token = resetToken;
            that.email = email;
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
        fluid.initDependents(that);

        that.submitEmail = function () {
            if (emailFormValid(that.messageBar, that.dom, that.options.strings.emailRequired)) {
                submitEmail(that.locate("email").val(), that.options.baseUrl, that);
            }
        };
        
        that.submitNewPassword = function () {
            if (passwordFormValid(that.messageBar, that.dom, that.options.strings.allFieldsRequired, that.options.strings.passwordsMustMatch)) {
                submitNewPassword(that.locate("newPassword").val(), that.options.baseUrl, that);
            }
        };

        setupLogin(that);
        return that;
    };

    fluid.defaults("cspace.login", {
        gradeNames: ["fluid.viewComponent"],
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

            resetRequest: ".csc-login-resetRequest",
            newPassword: ".csc-login-newPassword",
            confirmPassword: ".csc-login-confirmPassword",
            submitNewPassword: ".csc-login-submitNewPassword",
            passwordRequired: ".csc-login-passwordRequired"
        },
        
        components: {
            messageBar: {
                type: "cspace.messageBar"
            },
            passwordValidator: {
                type: "cspace.passwordValidator"
            }
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
})(jQuery, fluid);
