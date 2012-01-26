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
    
    fluid.defaults("cspace.recordTraverser", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        model: { },
        selectors: {
            link_next: ".csc-recordTraverser-next",
            link_previous: ".csc-recordTraverser-previous",
            link_current: ".csc-recordTraverser-current"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RecordTraverserTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        styles: {
            link_active: "cs-recordTraverser-linkActive",
            link_deactive: "cs-recordTraverser-linkDeactive"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        renderOnInit: true,
        protoTree: {
            link_next: {decorators: {"addClass": "{styles}.link_active"}},
            link_previous: {decorators: {"addClass": "{styles}.link_active"}},
            link_current: {decorators: {"addClass": "{styles}.link_active"}}
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.recordTraverser");
    
})(jQuery, fluid);
