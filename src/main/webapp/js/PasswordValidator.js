/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

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
                that.locate("messageEl").text(msg).show();
                return false;
            }
            that.locate("messageEl").hide();
            return true;
        };

        bindEvents(that);
        that.locate("messageEl").hide();
        return that;
    };

    fluid.defaults ("cspace.passwordValidator", {
        selectors: {
            passwordField: ".csc-passwordValidator-password",
            messageEl: ".csc-passwordValidator-message"
        },
        messages: {
            length: "Passwords must be between %min and %max characters in length."
        },
        minLength: 8,
        maxLength: 23
    });
}) (jQuery, fluid);
