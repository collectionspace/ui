/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid*/

cspace = cspace || {};

(function ($, fluid) {

    var bindEvents = function (that) {
        var pwField = that.locate("passwordField");
        pwField.change(function(event) {
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

        bindEvents(that);
        cspace.util.hideMessage(that.dom);
        return that;
    };

    fluid.defaults ("cspace.passwordValidator", {
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
        maxLength: 23
    });
}) (jQuery, fluid);
