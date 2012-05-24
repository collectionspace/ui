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
            expander: {
                repeatID: "instructions",
                type: "fluid.renderer.repeat",
                pathAs: "row",
                controlledBy: "messagekeys",
                tree: {
                    messagekey: "${{row}}"
                }
            }
	    },
	    model: {
	        messagekeys: [
	            "searchTips-instructionsFirst", 
	            "searchTips-instructionsSecond",
	            "searchTips-instructionsThird",
	            "searchTips-instructionsFourth",
	            "searchTips-instructionsFifth",
	            "searchTips-instructionsSixth"
	        ]
	    },
        selectors: {
            searchTips: ".csc-searchTips-template",
            title: ".csc-searchTips-title",
            instructions: ".csc-searchTips-instructions"
	    },
	    repeatingSelectors: ["instructions"],
        styles: {
            searchTips: "cs-searchTips-template",
            title: "cs-searchTips-title"
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
