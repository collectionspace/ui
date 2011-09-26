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
        parentBundle: "{globalBundle}",
        messageBar: "{messageBar}",
        preInitFunction: "cspace.inputValidator.preInit",
        postInitFunction: "cspace.inputValidator.postInit",
        invokers: {
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{inputValidator}.options.parentBundle.messageBase", "{arguments}.0"]
            }
        },
        type: "",
        delay: 500
    });
    
    /**
     * Checks if a given string is valid number or not
     */
    cspace.inputValidator.preInit = function (that) {
        that.validateNumber = function (number) {
            if(!number || (typeof number != "string" || number.constructor != String)) {
                return false;
            }
            var isNumber = !isNaN(new Number(number));
            if (!isNumber) {
                return false;
            }
            if (that.options.type === "integer") {
                return number.indexOf(".") < 0;
            }
            if (that.options.type === "float") {
                return number.split(".").length <= 2;
            }
            return true;
        };
    };

    cspace.inputValidator.postInit = function (that) {
        that.container.keyup(function () {
            clearTimeout(that.outFirer);
            that.outFirer = setTimeout(function () {
                var value = that.container.val();
                if (!value) {
                    return;
                }
                var valid = that.validateNumber(value);
                if (!valid) {
                    that.container.val("").change();
                    that.options.messageBar.show(that.lookupMessage("invalidNumber"), null, true);
                }
            }, that.options.delay);
        });
    };
})(jQuery, fluid);    