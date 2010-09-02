/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("PasswordValidator.js loaded");

    var bindEvents = function (that) {
        var pwField = that.locate("passwordField");
        pwField.change(function (event) {
            that.validateLength(pwField.val());
        });
    };

    cspace.passwordValidator = function (container, options) {
        var that = fluid.initView("cspace.passwordValidator", container, options);

        that.validateLength = function (password) {
            var passwordLength = password.length;
            if (passwordLength < that.options.minLength || passwordLength > that.options.maxLength) {
                var msg = fluid.stringTemplate(that.options.messages.length, {min: that.options.minLength, max: that.options.maxLength});
                cspace.util.displayTimestampedMessage(that.dom, msg);
                return false;
            }
            cspace.util.hideMessage(that.dom);
            return true;
        };

        // TODO: In general, we shouldn't make a component's event binding public.
        // Password validation should probably be more of a decorator-type function.
        // This is captured in CSPACE-1829
        that.bindEvents = function () {
            bindEvents(that);
        };
        
        cspace.util.hideMessage(that.dom);
        return that;
    };

    fluid.defaults("cspace.passwordValidator", {
        selectors: {
            passwordField: ".csc-passwordValidator-password",
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp"
        },
        messages: {
            length: "Passwords must be between %min and %max characters in length."
        },
        minLength: 8,
        maxLength: 24
    });
})(jQuery, fluid);
