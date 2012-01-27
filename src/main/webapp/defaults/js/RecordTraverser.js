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
            linkNext: ".csc-recordTraverser-next",
            linkPrevious: ".csc-recordTraverser-previous",
            linkCurrent: ".csc-recordTraverser-current"
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
            linkActive: "cs-recordTraverser-linkActive",
            linkDeactive: "cs-recordTraverser-linkDeactive"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            linkNext: {decorators: {"addClass": "{styles}.linkActive"}},
            linkPrevious: {decorators: {"addClass": "{styles}.linkActive"}},
            linkCurrent: {decorators: {"addClass": "{styles}.linkActive"}}
        },
        finalInitFunction: "cspace.recordTraverser.finalInitFunction",
        components: {
            localStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "recordsData"
                }
            }
        },
        elPath: "recordsData"
    });
    
    cspace.recordTraverser.finalInitFunction = function(that) {
        that.applier.requestChange(that.options.elPath, that.localStorage.get());
        
        that.localStorage.set();
        
        if (!that.model.recordsData) {
            return;
        }
        
        that.refreshView();
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.recordTraverser");
    
})(jQuery, fluid);
