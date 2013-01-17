/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";
    
    // Default options for the component
    fluid.defaults("cspace.preferred", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        mergePolicy: {
            protoTree: "noexpand"
        },
        readOnly: false,
        selectors: {},
        strings: {},
        // HTML markup for the component
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
            // Renderer subcomponent. Render part delegation while parent takes care of the model
            renderer: {
                type: "cspace.preferred.renderer",
                createOnEvent: "afterFetch",
                container: "{cspace.preferred}.container",
                options: {
                    resources: "{cspace.preferred}.options.resourceSpec",
                    applier: "{cspace.preferred}.applier",
                    model: "{cspace.preferred}.model",
                    readOnly: "{cspace.preferred}.options.readOnly"
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
        // Set the proper options prior requesting them based on the recrodType
        that.options.resourceSpec.template.href = fluid.stringTemplate(that.options.resourceSpec.template.href, {recordType: that.options.recordType});
        that.options.components.renderer.options.protoTree = that.options.protoTree;
    };
    
    cspace.preferred.finalInit = function (that) {
        // Requesting template
        fluid.fetchResources(that.options.resourceSpec, function () {
            that.events.afterFetch.fire();
        });
    };
    
    // Render part for the Preferred component
    fluid.defaults("cspace.preferred.renderer", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        mergePolicy: {
            "rendererFnOptions.protoTree": "protoTree",
            "rendererOptions.applier": "applier",
            protoTree: "noexpand"
        },
        readOnly: false,
        strings: {},
        parentBundle: "{globalBundle}",
        rendererFnOptions: {
            cutpointGenerator: "cspace.preferred.renderer.cutpointGenerator"
        },
        selectors: {
            preferredLabel: ".csc-preferred-label"
        },
        styles: {
            preferredLabel: "cs-preferred-label"
        },
        preInitFunction: "cspace.preferred.renderer.preInit",
        finalInitFunction: "cspace.preferred.renderer.finalInit",
        renderOnInit: true
    });

    cspace.preferred.renderer.preInit = function (that) {
        // setting a render tree for the label
        that.options.protoTree.preferredLabel = {
            messagekey: "preferred",
            decorators: {"addClass": "{styles}.preferredLabel"}
        };
    };
    
    cspace.preferred.renderer.finalInit = function (that) {
        // Read-only styling fixes
        cspace.util.processReadOnly(that.container, that.options.readOnly);
        if (that.options.readOnly) {
            $("a", that.container).hide();
        }
    };

    cspace.preferred.renderer.cutpointGenerator = function (selectors, options) {
        // Since we are getting back a big UIspec we are only interested in a specific part of it
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.protoTree));
    };
    
})(jQuery, fluid);