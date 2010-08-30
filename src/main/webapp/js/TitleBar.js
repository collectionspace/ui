/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("TitleBar.js loaded");

    var updateField = function (selector, value) {
        $(selector).text(value);
    };

    var makeFieldUpdater = function (selector) {
        return function (model, oldModel, changeRequest) {
        	// We always select the first element in changeRequest array.
        	// We currently do not use multiple changes API.
            updateField(selector, fluid.model.getBeanValue(model, changeRequest[0].path));
        };
    };

    var setupTitleBar = function (that) {
        for (var selector in that.options.uispec) {
            if (that.options.uispec.hasOwnProperty(selector)) {
                var val = that.options.uispec[selector];
                var el = val.substring(val.indexOf("${") + 2, val.indexOf("}"));
                that.applier.modelChanged.addListener(el, makeFieldUpdater(selector));
                updateField(selector, fluid.model.getBeanValue(that.applier.model, el));
            }
        }
    };

    cspace.titleBar = function (container, applier, options) {
        var that = fluid.initView("cspace.titleBar", container, options);
        that.applier = applier;
        
        setupTitleBar(that);

        return that;
    };
})(jQuery, fluid);
