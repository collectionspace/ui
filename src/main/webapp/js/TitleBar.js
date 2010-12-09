/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/
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
                that.options.applier.modelChanged.addListener(el, makeFieldUpdater(selector));
                updateField(selector, fluid.model.getBeanValue(that.model, el));
            }
        }
    };

    cspace.titleBar = function (container, options) {
        var that = fluid.initView("cspace.titleBar", container, options);
        that.model = that.options.model;
        setupTitleBar(that);
        return that;
    };
    
    fluid.defaults("cspace.titleBar", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        }
    });
    
    fluid.demands("titleBar", "cspace.pageBuilder", {
        args: ["{pageBuilder}.options.selectors.titleBar", {
            uispec: "{pageBuilder}.uispec.titleBar",
            applier: "{pageBuilder}.applier",
            model: "{pageBuilder}.model"
        }]
    });
    
})(jQuery, fluid);
