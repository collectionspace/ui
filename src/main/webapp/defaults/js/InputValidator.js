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
        type: ""
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
            if(isNumber) {
                if (that.options.type === "integer") {
                    if(number.indexOf('.') < 0) {
                        return true;
                    } 
                    return false;
                }
                return true;
            } else {
                return false;
            }
        };
    };

    cspace.inputValidator.postInit = function (that) {
        that.container.change(function () {
            var value = that.container.val();
            var valid = that.validateNumber(value);
            if (!valid) {
                that.container.val("");
                that.options.messageBar.show(that.lookupMessage("invalidNumber"), null, true);
            }
        });
    };
})(jQuery, fluid);    