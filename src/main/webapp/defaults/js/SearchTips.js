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
    
    fluid.defaults("cspace.searchTips", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        protoTree: {
            searchTips: {decorators: {"addClass": "{styles}.searchTips"}},
            title: {
                decorators: {"addClass": "{styles}.title"}, 
                messagekey: "searchTips-title"
            },
            instructionsTop: {
                decorators: {"addClass": "{styles}.instructionsTop"}, 
                messagekey: "searchTips-instructionsTop"
            },
            instructionsDate: {
                decorators: {"addClass": "{styles}.instructionsDate"}, 
                messagekey: "searchTips-instructionsDate"
            },
            instructionsNumber: {
                decorators: {"addClass": "{styles}.instructionsNumber"}, 
                messagekey: "searchTips-instructionsNumber"
            },
            instructionsBottom: {
                decorators: {"addClass": "{styles}.instructionsBottom"}, 
                messagekey: "searchTips-instructionsBottom"
            }
        },
        selectors: {
            searchTips: ".csc-searchTips-template",
            title: ".csc-searchTips-title",
            instructionsTop: ".csc-searchTips-instructions-top",
            instructionsDate: ".csc-searchTips-instructions-date",
            instructionsNumber: ".csc-searchTips-instructions-number",
            instructionsBottom: ".csc-searchTips-instructions-bottom"
        },
        styles: {
            searchTips: "cs-searchTips-template",
            title: "cs-searchTips-title",
            instructionsTop: "cs-searchTips-instructions-top",
            instructionsDate: "cs-searchTips-instructions-date",
            instructionsNumber: "cs-searchTips-instructions-number",
            instructionsBottom: "cs-searchTips-instructions-bottom"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SearchTipsTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        strings: {},
        parentBundle: "{globalBundle}",
        renderOnInit: true
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.searchTips");
    
})(jQuery, fluid);