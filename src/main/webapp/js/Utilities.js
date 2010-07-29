/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("Utilities.js loaded");

    cspace.util = {};

    cspace.util.addTrailingSlash = function (url) {
        return url + ((url.charAt(url.length - 1) !== "/") ? "/" : "");
    };

    cspace.util.getUrlParameter = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results === null) {
            return "";
        } else {
            return results[1];
        }
    };

    cspace.util.useLocalData = function () {
        return cspace.util.isTest || document.location.protocol === "file:";
    };

    cspace.util.displayTimestampedMessage = function (locater, msg, time) {
        var messageContainer = locater.locate("messageContainer", "body");
        locater.locate("feedbackMessage", messageContainer).text(msg);
        locater.locate("timestamp", messageContainer).text(time ? time : "");
        messageContainer.show();
    };

    cspace.util.hideMessage = function (locater) {
        locater.locate("messageContainer", "body").hide();
    };

    cspace.util.setZIndex = function () {
        if ($.browser.msie) {
            var zIndexNumber = 999;
            $("div").each(function () {
                $(this).css('zIndex', zIndexNumber);
                zIndexNumber -= 1;
            });
        }
    };

    cspace.util.corner = function () {
    };

    cspace.util.getDefaultConfigURL = function () {
        var url = window.location.pathname;
        return ".\/config" + url.substring(url.lastIndexOf("/"), url.indexOf(".html")) + ".json";
    };
    
    var buildModelStructure = function (model, elPath) {
        var keys = elPath.split(".");        
        for (var index = 0; index < keys.length - 1; index++) {
            var key = keys[index];            
            var isArray = keys[index + 1] === "0";
            if (typeof(model) === "object" && typeof(model.length) === "number") {
                if (model.length === 0) {
                    model.push({});
                }                
                model = model[0];
            }
            model[key] = model[key] || (isArray ? [] : {});            
            model = model[key];
            index += isArray ? 1 : 0;
        }
    };
    
    cspace.util.createEmptyModel = function (model, uispec) {
        for (var key in uispec) {
            if (!uispec.hasOwnProperty(key)) {
                continue;                
            }
            var value = uispec[key];
            if (!value) {
                continue;
            }
            var type = typeof(value);
            switch (type) {
                case "object":
                    cspace.util.createEmptyModel(model, value);
                    break;
                case "string":
                    var i1 = value.indexOf("${");
                    var i2 = value.indexOf("}");
                    if (i1 === 0 && i2 !== -1 && value.search(/.0./gi) > -1) {
                        buildModelStructure(model, value.substring(2, i2));
                    }
                    break;
                default:
                    break;
            }
        }
    };
    
    cspace.util.createBaseModel = function () {
        return {
            csid: null,
            fields: {},
            termsUsed: [],
            relations: {}
        };
    };
})(jQuery, fluid);
