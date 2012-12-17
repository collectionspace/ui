/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("InputValidator.js loaded");

    // Input validator component used to trigger input
    // field validation (based on the uischema field type,
    // e.g. integer, float). If invalid - show error message
    // using messageBar.
    fluid.defaults("cspace.inputValidator", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "cspace.inputValidator.postInit",
        finalInitFunction: "cspace.inputValidator.finalInit",
        invokers: {
            lookupMessage: "cspace.util.lookupMessage",
            validate: {
                funcName: "cspace.util.validate",
                args: ["{arguments}.0", "{inputValidator}.options.type", "{messageBar}", "{arguments}.1"]
            },
            clear: {
                funcName: "cspace.inputValidator.clear",
                args: "{messageBar}"
            }
        },
        type: "",
        delay: 500
    });

    // Hide message bar when validation happens.
    cspace.inputValidator.clear = function (messageBar) {
        messageBar.hide();
    };
    
    cspace.inputValidator.finalInit = function (that) {
        var label;
        if (that.options.label) {
            label = that.lookupMessage(that.options.label) + ": ";
        };
        that.invalidNumberMessage = fluid.stringTemplate(that.lookupMessage("invalidNumber"), {
            label: label || ""
        });
    };

    cspace.inputValidator.postInit = function (that) {
        // Validate on keyup after specified timeout.
        that.container.keyup(function () {
            clearTimeout(that.outFirer);
            that.outFirer = setTimeout(function () {
                that.clear();
                var value = that.container.val();
                that.validate(value, that.invalidNumberMessage);
            }, that.options.delay);
        });
    };
})(jQuery, fluid);    