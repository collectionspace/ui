/*
Copyright Museum of Moving Image 2012

Licensed under the Educational Community License (ECL), Version 2.0.
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, goog, cspace:true*/

cspace = cspace || {};

(function ($, fluid) {
    
    "use strict";
    
    fluid.log("ExternalURL.js loaded"); 

    fluid.defaults("cspace.externalURL", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "cspace.externalURL.preInit",
        postInitFunction: "cspace.externalURL.postInit",
        finalInitFunction: "cspace.externalURL.finalInit",
        strings: {},
        parentBundle: "{globalBundle}",
        components: {
            messageBar: "{messageBar}"
        },
        selectors: {
            externalURL: ".csc-externalURL",
            externalURLButton: ".csc-externalURL-button"
        },
        styles: {
            parent: "fl-table clearfix",
            externalURL: "fl-force-left cs-externalURL",
            externalURLButton: "fl-table-cell fl-force-left cs-externalURL-button cs-externalURL-image",
            error: "cs-externalURL-error"
        },
        markup: {
            externalURLButton: "<a href=\"#\" />"
        },
        buildMarkup: "cspace.externalURL.buildMarkup",
        readOnly: false
    });
    
    cspace.externalURL.buildMarkup = function (that, control) {
        // Create Navigate Away button
        that[control] = $(that.options.markup[control])
            .addClass([that.options.selectors[control].slice(1), that.options.styles[control]].join(" "));
        // Add it to the DOM
        that.container.after(that[control]);
    };
    
    cspace.externalURL.preInit = function (that) {
        that.styleControls = function (error, errorStyle, controls) {
            fluid.each(controls, function(control) {
                control[error ? "addClass" : "removeClass"](errorStyle);
            });
        };
        
        that.validateURL = function (url) {
            var regex = new RegExp(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-\/]))?/),
                error = !url.match(regex) && url.length > 0;
            // Style control depending on if there was an error in its content
            that.styleControls(error, that.options.styles.error, [that.locate(that.options.selectors.externalURL), that.externalURLButton]);
            return !error;
        };  
    };
    
    cspace.externalURL.finalInit = function (that) {
        if (that.options.readOnly) {
            that.container.prop("disabled", true);
            return;
        }
        
        var messageBar = that.messageBar,
            externalURLButton = that.externalURLButton;
        
        that.container.change(function () {
            // If there is an error message clear it.
            if (messageBar) {
                messageBar.hide();
            }
            // Get a string value for a field.
            var urlValue = that.container.val(),
                error = !that.validateURL(urlValue);
            // Get a validated string value for the same field.
            if(error && messageBar) {
                messageBar.show(that.options.parentBundle.resolve("externalUrl-invalidURLMessage"), null, true);
            }
            // Set a proper link href for the button
            externalURLButton.attr("href", (urlValue.length === 0 || error) ? "#" : urlValue);
            externalURLButton.attr("label", that.options.parentBundle.resolve("externalUrl-label"));
        });
    };
    
    cspace.externalURL.postInit = function (that) {
        // Style input plus add all neccessary classes
        that.container.addClass([that.options.styles.externalURL, that.options.selectors.externalURL.slice(1)].join(" "));
        // Render a button beside the input
        fluid.invokeGlobalFunction(that.options.buildMarkup, [that, "externalURLButton"]);
    };
    
})(jQuery, fluid);