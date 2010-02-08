/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

var cspace = cspace || {};

(function ($, fluid) {

    cspace.util = {};

    cspace.util.addTrailingSlash = function (url) {
        return url + ((url.charAt(url.length - 1) !== "/") ? "/" : "");
    };

    cspace.util.getUrlParameter = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results === null) {
            return "";
        } else {
            return results[1];
        }
    };

	cspace.util.isLocal = function () {
		return document.location.protocol === "file:";
	};
    
    /**
     * 
     * @param {Object} recordType
     * @param {Object} pageSpec
            href: "test-data/template1.html",
            templateSelector: "#template1mainNode",
            targetSelector: "#insertTemplate1here"
     */
    cspace.dataEntrySetup = function (recordType, pageSpec) {
        var csid = cspace.util.getUrlParameter("csid");
        var isLocal = cspace.util.isLocal();
        var opts = {
            dataContext: {
                options: {
                    recordType: recordType
                }
            },
            uiSpecUrl: "../../chain/" + recordType + "/uispec",
            templates: {
                body: {
                    url: pageSpec.href,
                    id: pageSpec.templateID
                }
            }
        };
        if (isLocal) {
            opts.uiSpecUrl = "./uispecs/" + recordType+ "/uispec.json";
            opts.dataContext.options.baseUrl = "data";
            opts.dataContext.options.fileExtension = ".json";
        }
        if (csid) {
            opts.csid = csid;
        }

// CSPACE-701
        if (isLocal && recordType === "objects") {
            opts.uiSpecUrl = "./uispecs/collection-object/uispec.json";
            opts.dataContext.options.recordType = "collection-object";
        }
        return cspace.dataEntry(pageSpec.targetSelector, opts);
    };
})(jQuery, fluid_1_2);
