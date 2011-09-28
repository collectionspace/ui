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
    
    fluid.defaults("cspace.inputValidator", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "cspace.inputValidator.postInit",
        finalInitFunction: "cspace.inputValidator.finalInit",
        invokers: {
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{globalBundle}.messageBase", "{arguments}.0"]
            },
            validate: {
                funcName: "cspace.util.validate",
                args: ["{arguments}.0", "{inputValidator}.options.type", "{messageBar}", "{arguments}.1"]
            }
        },
        type: "",
        delay: 500
    });
    
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
        that.container.keyup(function () {
            clearTimeout(that.outFirer);
            that.outFirer = setTimeout(function () {
                var value = that.container.val();
                that.validate(value, that.invalidNumberMessage);
            }, that.options.delay);
        });
    };
})(jQuery, fluid);    