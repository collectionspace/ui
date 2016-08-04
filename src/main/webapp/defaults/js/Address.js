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

    // Basic component used to display address specific
    // block within the record rendering/editing section.
    fluid.defaults("cspace.address", {
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
            cutpointGenerator: "cspace.address.cutpointGenerator"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/AddressTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        finalInitFunction: "cspace.address.finalInit",
        renderOnInit: true
    });
    
    cspace.address.finalInit = function (that) {
        // If record is read only, make sure everything is disabled.
        cspace.util.processReadOnly(that.container, that.options.readOnly);
        if (that.options.readOnly) {
            $("a", that.container).hide();
        }
    };

    cspace.address.cutpointGenerator = function (selectors, options) {
        return cspace.renderUtils.cutpointsFromUISpec(options.protoTree);
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.address");
    
})(jQuery, fluid);