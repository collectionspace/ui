/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.templateEditor", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        mergePolicy: {
            "rendererOptions.applier": "applier"
        },
        protoTree: {
            nameLabel: {
                messagekey: "templateEditor-nameLabel"
            },
            "name": "${fields.templateName}"
        },
        renderOnInit: true,
        selectors: {
            "name": ".csc-templateEditor-templateName",
            nameLabel: ".csc-templateEditor-templateName-label"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/TemplateEditorTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        strings: {},
        parentBundle: "{globalBundle}"
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.templateEditor");
    
})(jQuery, fluid);