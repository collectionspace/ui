/*
Copyright Museum of Moving Image 2012

Licensed under the Educational Community License (ECL), Version 2.0.
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/

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
            parent: "cs-externalURL-parent",
            externalURL: "fl-force-left cs-externalURL",
            externalURLButton: "fl-table-cell fl-force-left cs-externalURL-button cs-externalURL-image",
            error: "cs-externalURL-error"
        },
        markup: {
            externalURLButton: "<a href=\"#\" />"
        },
        buildMarkup: "cspace.externalURL.buildMarkup",
        readOnly: false,
        validation: true
    });

    fluid.demands("cspace.externalURL", "cspace.recordEditor", {
        options: fluid.COMPONENT_OPTIONS
    });

    fluid.demands("cspace.externalURL", ["cspace.hierarchyAutocomplete", "cspace.recordEditor", "cspace.authority"], {
        options: {
            validation: false,
            url: cspace.componentUrlBuilder("%webapp/html/%recordType.html?csid=%csid&vocab=%vocab"),
            recordType: "{cspace.recordEditor}.options.recordType",
            invokers: {
                processUrl: {
                    funcName: "cspace.externalURL.processUrlAuth",
                    args: ["{cspace.externalURL}.options.url", "{cspace.externalURL}.options.recordType", "{vocab}", "{arguments}.0"]
                }
            }
        }
    });

    fluid.demands("cspace.externalURL", ["cspace.hierarchyAutocomplete", "cspace.recordEditor", "cspace.nonAuthority"], {
        options: {
            validation: false,
            url: cspace.componentUrlBuilder("%webapp/html/%recordType.html?csid=%csid"),
            recordType: "{cspace.recordEditor}.options.recordType",
            invokers: {
                processUrl: {
                    funcName: "cspace.externalURL.processUrl",
                    args: ["{cspace.externalURL}.options.url", "{cspace.externalURL}.options.recordType", "{arguments}.0"]
                }
            }
        }
    });

    cspace.externalURL.processUrlAuth = function (url, recordType, vocab, original) {
        if (!original) {
            return "";
        }
        return fluid.stringTemplate(url, {
            recordType: recordType,
            csid: cspace.util.shortIdentifierToCSID(original),
            vocab: cspace.vocab.resolve({
                model: {},
                recordType: recordType,
                vocab: vocab
            })
        });
    };

    cspace.externalURL.processUrl = function (url, recordType, original) {
        if (!original) {
            return "";
        }
        return fluid.stringTemplate(url, {
            recordType: recordType,
            csid: cspace.util.urnToCSID(original)
        });
    };
    
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
            // Using a regex created by Diego Perini: https://gist.github.com/729294
            var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
            return url.match(regex) || url.length < 1;
        };

        that.validateAndRender = function () {
            var messageBar = that.messageBar,
                externalURLButton = that.externalURLButton,
                // Get a string value for a field.
                urlValue = $.trim(that.container.val()),
                error;

            if (that.processUrl) {
                urlValue = that.processUrl(urlValue);
            }

            // If there is an error message clear it.
            if (messageBar) {
                messageBar.hide();
            }
            if (that.options.validation) {
                error = !that.validateURL(urlValue);
            }
            // Style control depending on if there was an error in its content
            that.styleControls(error, that.options.styles.error, [that.locate(that.options.selectors.externalURL), that.externalURLButton]);
            // Get a validated string value for the same field.
            if (error && messageBar) {
                messageBar.show(that.options.parentBundle.resolve("externalUrl-invalidURLMessage"), null, true);
            }
            // Set a proper link href for the button
            externalURLButton.attr("href", (urlValue.length === 0 || error) ? "#" : urlValue);
            externalURLButton.attr("label", that.options.parentBundle.resolve("externalUrl-label"));
        };
    };

    cspace.externalURL.finalInit = function (that) {
        if (that.options.readOnly) {
            that.container.prop("disabled", true);
            return;
        }

        that.container.change(that.validateAndRender);

        that.validateAndRender();
    };
    
    cspace.externalURL.postInit = function (that) {
        // Style input plus add all neccessary classes
        that.container.addClass([that.options.styles.externalURL, that.options.selectors.externalURL.slice(1)].join(" "));
        // Render a button beside the input
        fluid.invokeGlobalFunction(that.options.buildMarkup, [that, "externalURLButton"]);
        that.container.parent().addClass(that.options.styles.parent);
    };
    
})(jQuery, fluid);