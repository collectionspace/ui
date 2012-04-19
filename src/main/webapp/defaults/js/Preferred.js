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
    
    fluid.defaults("cspace.preferred", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        mergePolicy: {
            protoTree: "noexpand"
        },
        readOnly: false,
        selectors: {},
        strings: {},
        resourceSpec: {
            template: {
                href: cspace.componentUrlBuilder("%webapp/html/components/PreferredTemplate-%recordType.html"),
                options: {
                    dataType: "html",
                    forceCache: true
                }
            }
        },
        components: {
            renderer: {
                type: "cspace.preferred.renderer",
                createOnEvent: "afterFetch",
                container: "{cspace.preferred}.container",
                options: {
                    resources: "{cspace.preferred}.options.resourceSpec",
                    applier: "{cspace.preferred}.applier",
                    model: "{cspace.preferred}.model"
                }
            }
        },
        preInitFunction: "cspace.preferred.preInit",
        finalInitFunction: "cspace.preferred.finalInit",
        events: {
            afterFetch: null
        },
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        }
    });
    
    cspace.preferred.preInit = function (that) {
        that.options.resourceSpec.template.href = fluid.stringTemplate(that.options.resourceSpec.template.href, {recordType: that.options.recordType});
        that.options.components.renderer.options.protoTree = that.options.protoTree;
    };
    
    cspace.preferred.finalInit = function (that) {
        fluid.fetchResources(that.options.resourceSpec, function () {
            that.events.afterFetch.fire();
        });
    };
    
    
/*     Rendered part */

    fluid.defaults("cspace.preferred.renderer", {
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
            cutpointGenerator: "cspace.preferred.renderer.cutpointGenerator"
        },
        finalInitFunction: "cspace.preferred.renderer.finalInit",
        renderOnInit: true
    });
    
    cspace.preferred.renderer.finalInit = function (that) {
        cspace.util.processReadOnly(that.container, that.options.readOnly);
        if (that.options.readOnly) {
            $("a", that.container).hide();
        }
    };

    cspace.preferred.renderer.cutpointGenerator = function (selectors, options) {
        return cspace.renderUtils.cutpointsFromUISpec(options.protoTree);
    };
    
})(jQuery, fluid);