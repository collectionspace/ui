/*
Copyright 2009-2010 University of Toronto

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
        strings: {
            invalidURLMessage: "Provided URL has invalid format."
        },
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
        hasError: false,
        readOnly: false,
        externalURLButton: null
    });
    
    cspace.externalURL.buildMarkup = function (that, control) {
        // Create Navigate Away button
        that.options.externalURLButton = $(that.options.markup[control])
            .addClass([that.options.selectors[control].slice(1), that.options.styles[control]].join(" "));
        // Add it to the DOM
        that.container.after(that.options.externalURLButton);
    };
    
    cspace.externalURL.preInit = function (that) {
        that.styleControl = function (error, errorStyle, controls) {
            if (error) {
                fluid.each(controls, function(control) {
                    control.addClass(errorStyle);
                });
            } else {
                fluid.each(controls, function(control) {
                    control.removeClass(errorStyle);
                });
            }
        };
        
        that.validateURL = function (url) {
            var selectors = that.options.selectors,
                regex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
            
            that.options.hasError = !url.match(regex) && url.length > 0;
            
            var error = that.options.hasError;
            // Style control depending on if there was an error in its content
            that.styleControl(error, that.options.styles.error, [that.locate(selectors.externalURL), that.options.externalURLButton]);
            
            return !error;
        };  
    };
    
    cspace.externalURL.finalInit = function (that) {
        if (that.options.readOnly) {
            return;
        }
        
        var messageBar = that.messageBar;
        
        that.container.change(function () {
            // If there is an error message clear it.
            if (messageBar) {
                messageBar.hide();
            }
            // Get a string value for a field.
            var URLValue = that.container.val();
            // Get a validated string value for the same field.
            if(!that.validateURL(URLValue)) {
                if (messageBar) {
                    messageBar.show(that.options.strings.invalidURLMessage, null, true);
                }
                return;
            }
            // Set a proper link href for the button
            if (URLValue.length > 0) {
                that.options.externalURLButton.prop("href", URLValue);
            }
        });
    };
    
    cspace.externalURL.postInit = function (that) {
        that.parent = that.container.parent();
        that.parent.addClass(that.options.styles.parent);
        that.container.addClass([that.options.styles.externalURL, that.options.selectors.externalURL.slice(1)].join(" "));
        fluid.invokeGlobalFunction(that.options.buildMarkup, [that, "externalURLButton"]);
    };
    
})(jQuery, fluid);