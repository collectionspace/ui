/*
Copyright 2012 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.displayNameGenerator", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        fields: [
            "fields.foundingPlace",
            "fields.foundingDate"
        ],
        preInitFunction: "cspace.displayNameGenerator.preInit",
        finalInitFunction: "cspace.displayNameGenerator.finalInit"
    });
    
    cspace.displayNameGenerator.preInit = function (that) {

        that.generateName = function () {
            var displayName = [];
            fluid.each(that.options.fields, function (value) {
                var val = fluid.get(that.model, value);
                if (!val) {
                    return;
                }
                displayName.push(val);
            });
            that.container.val(displayName.join(" "));
        };

        fluid.each(that.options.fields, function (path) {
            that.applier.modelChanged.addListener(path, that.generateName);
        });
    };
    
    cspace.displayNameGenerator.finalInit = function (that) {
        that.container.prop("disabled", true);
        that.generateName();
    };
    
    fluid.demands("cspace.displayNameGenerator", "cspace.recordEditor", {
        container: "{arguments}.0",
        mergeAllOptions: [{
            model: "{recordEditor}.model",
            applier: "{recordEditor}.applier"
        }, "{arguments}.1"]
    });
    
})(jQuery, fluid);
