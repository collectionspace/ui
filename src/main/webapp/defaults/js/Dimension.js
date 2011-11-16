/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.dimension", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        mergePolicy: {
            "rendererFnOptions.protoTree": "protoTree",
            "rendererOptions.applier": "applier",
            protoTree: "noexpand"
        },
        readOnly: false,
        selectors: {},
        strings: {},
        parentBundle: "{globalBundle}",
        rendererFnOptions: {
            cutpointGenerator: "cspace.dimension.cutpointGenerator"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/DimensionTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        finalInitFunction: "cspace.dimension.finalInit",
        renderOnInit: true
    });
    
    cspace.dimension.finalInit = function (that) {
        cspace.util.processReadOnly(that.container, that.options.readOnly);
        if (that.options.readOnly) {
            $("a", that.container).hide();
        }
    };

    cspace.dimension.cutpointGenerator = function (selectors, options) {
        return cspace.renderUtils.cutpointsFromUISpec(options.protoTree);
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.dimension");
    
})(jQuery, fluid);