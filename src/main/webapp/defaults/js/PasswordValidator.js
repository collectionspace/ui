/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
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
        fluid.initDependents(that);
        
        that.validateLength = function (password) {
            var passwordLength = password.length;
            if (passwordLength < that.options.minLength || passwordLength > that.options.maxLength) {
                var msg = fluid.stringTemplate(that.lookupMessage("passwordLengthError"), {min: that.options.minLength, max: that.options.maxLength});
                that.options.messageBar.show(msg, null, true);
                return false;
            }
            that.options.messageBar.hide();
            return true;
        };

        // TODO: In general, we shouldn't make a component's event binding public.
        // Password validation should probably be more of a decorator-type function.
        // This is captured in CSPACE-1829
        that.bindEvents = function () {
            bindEvents(that);
        };
        that.options.messageBar.hide();
        return that;
    };

    fluid.defaults("cspace.passwordValidator", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            passwordField: ".csc-passwordValidator-password"
        },
        parentBundle: "{globalBundle}",
        invokers: {
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{passwordValidator}.options.parentBundle.messageBase", "{arguments}.0"]
            }
        },
        strings: {},
        minLength: 8,
        maxLength: 24,
        messageBar: "{messageBar}"
    });
})(jQuery, fluid);
