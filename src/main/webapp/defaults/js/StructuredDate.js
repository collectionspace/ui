/*
Copyright 2011 University of California, Berkeley; Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, window, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {    
    
    // Default options for the component.
    fluid.defaults("cspace.structuredDate", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        postInitFunction: "cspace.structuredDate.postInitFunction",
        finalInitFunction: "cspace.structuredDate.finalInitFunction",
        selectors: {
            popupContainer: ".csc-structuredDate-popup-container"
        },
        styles: {
            structuredDate: "cs-structuredDate-input"
        },
        elPath: "",
        invokers: {
            showPopup: {
                funcName: "cspace.structuredDate.showPopup",
                args: "{structuredDate}"
            },
            hidePopup: {
                funcName: "cspace.structuredDate.hidePopup",
                args: "{structuredDate}"
            }
        },
        // Sub-components of this component are declared here.
        //
        // Options that will be passed to the subcomponent(s) to override
        // their defaults also go here.
        components: {
            popup: {
                type: "cspace.structuredDate.popup",
                container: "{structuredDate}.popupContainer",
                options: {
                    model: "{structuredDate}.model",
                    applier: "{structuredDate}.applier",
                    protoTree: "{structuredDate}.options.protoTree",
                    elPath: "{structuredDate}.options.elPath"
                }
                
            }
        }
    });
    
    cspace.structuredDate.finalInitFunction = function (that) {
        // Dismiss the structured date popup by pressing the ESC key
        that.union.keyup(function (event) {
            if (cspace.util.keyCode(event) === $.ui.keyCode.ESCAPE) {
                that.container.focus();
                that.hidePopup();
            }
        });

        // Open the structured date popup by pressing the Return/Enter key
        // when focus is on the container field
        //
        // Makes it possible to re-open the popup after it has been
        // dismissed using the ESC key
        that.container.keyup(function (event) {
            if (cspace.util.keyCode(event) === $.ui.keyCode.ENTER) {
                that.showPopup();
            }
        });

       // Hide the popup when focus leaves the union of the
       // container field and the structured date popup container
       fluid.deadMansBlur(that.union, {
            exclusions: {union: that.union},
            handler: that.hidePopup
        });
        
        // If the value of the summary element in the model changes,
        // update the value of the container field to reflect that change.
        if (that.options.elPath) {
            that.applier.modelChanged.addListener(that.options.elPath, function (model) {
                that.container.val(fluid.get(model, that.options.elPath));
            });
        }
        
        // Show the structured date popup when focus is placed
        // in the popup container
        that.container.focus(that.showPopup);
    };
    
    cspace.structuredDate.hidePopup = function (that) {
        that.popupContainer.hide();
    };
    
    cspace.structuredDate.showPopup = function (that) {
        that.popup.refreshView();
        that.popupContainer.show();
    };
    
    cspace.structuredDate.postInitFunction = function (that) {
        that.container.addClass(that.options.styles.structuredDate);
        // Create a container element and attach it to the DOM.
        // The structured date popup will later be inserted within this container.
        that.popupContainer =
            $("<div/>").addClass((that.options.selectors.popupContainer).substring(1));
        that.popupContainer.hide();
        that.container.after(that.popupContainer);
        // Declare the combination of the input field that triggers
        // the popup behavior, and the popup itself, as a consolidated
        // entity on which we can define behaviors, such as loss of focus (blur).
        that.union = that.container.add(that.popupContainer);
    };
    
    // Default options for the popup sub-component.
    fluid.defaults("cspace.structuredDate.popup", {
        finalInitFunction: "cspace.structuredDate.popup.finalInitFunction",
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        // When merging models between component and sub-component,
        // the "preserve" policy will share the original model object,
        // rather than using an independent copy of that object for each.
        mergePolicy: {
            protoTree: "preserve",
            "rendererOptions.applier": "applier"
        },
        // You can have a protoTree: {} default instead of produceTree default.
        // Because the popup is a renderer decorator it will know that it would
        // need to use protoTree to generate the renderer tree.
        //
        // So in order to autobind this field to a field in the model,
        // you have to have this selector dateText in your prototree
        // pointing to the field in the model.
        // NOTE ADDED BY RICK: 05 May 2011: 
        // dateText field dropped in favor of dateDisplayDate; 
        // concommitant changes made in selectors and strings below.
        // dateText field replaced by dateDisplayDate in UISpec (value and elPath) 
        // and UISchema, too, for development purposes. 
        // Also changed in StructuredDateTest.js.
        protoTree: {
            dateDisplayDateLabel: {
                messagekey: "dateDisplayDateLabel"
            },
            datePeriodLabel: {
                messagekey: "datePeriodLabel"
            },
            dateAssociationLabel: {
                messagekey: "dateAssociationLabel"
            },
            dateNoteLabel: {
                messagekey: "dateNoteLabel"
            },
            dateHeaderLabel: {
                messagekey: "dateHeaderLabel"
            },
            dateYearLabel: {
                messagekey: "dateYearLabel"
            },
            dateMonthLabel: {
                messagekey: "dateMonthLabel"
            },
            dateDayLabel: {
                messagekey: "dateDayLabel"
            },
            dateEraLabel: {
                messagekey: "dateEraLabel"
            },
            dateCertaintyHeaderLabel: {
                messagekey: "dateCertaintyHeaderLabel"
            },
            dateCertaintyLabel: {
                messagekey: "dateCertaintyLabel"
            },
            dateQualifierLabel: {
                messagekey: "dateQualifierLabel"
            },
            dateQualifierValueLabel: {
                messagekey: "dateQualifierValueLabel"
            },
            dateQualifierUnitLabel: {
                messagekey: "dateQualifierUnitLabel"
            },
            dateEarliestSingleRowLabel: {
                messagekey: "dateEarliestSingleRowLabel"
            },
            dateLatestRowLabel: {
                messagekey: "dateLatestRowLabel"
            }
        },
        selectors: {
            // Also you will need a separate selector for the label "Date Text" as well
            // in order to be able to assign the label value from the message bundle and make
            // it ready for initialization.
            // NOTE: dateDateText replaced by dateDisplayDate (Rick, 05 May 2011).
            close: ".csc-structuredDate-close",
            dateDisplayDate: ".csc-structuredDate-dateDisplayDate",
            dateDisplayDateLabel: ".csc-structuredDate-dateDisplayDate-label",
            datePeriod: ".csc-structuredDate-datePeriod",
            datePeriodLabel: ".csc-structuredDate-datePeriod-label",
            dateAssociation: ".csc-structuredDate-dateAssociation",
            dateAssociationLabel: ".csc-structuredDate-dateAssociation-label",
            dateNote: ".csc-structuredDate-dateNote",
            dateNoteLabel: ".csc-structuredDate-dateNote-label",
            dateHeaderLabel: ".csc-structuredDate-dateHeader-label",
            dateYearLabel: ".csc-structuredDate-dateYear-label",
            dateMonthLabel: ".csc-structuredDate-dateMonth-label",
            dateDayLabel: ".csc-structuredDate-dateDay-label",
            dateEraLabel: ".csc-structuredDate-dateEra-label",
            dateCertaintyHeaderLabel: ".csc-structuredDate-dateCertaintyHeader-label",
            dateCertaintyLabel: ".csc-structuredDate-dateCertainty-label",
            dateQualifierLabel: ".csc-structuredDate-dateQualifier-label",
            dateQualifierValueLabel: ".csc-structuredDate-dateQualifierValue-label",
            dateQualifierUnitLabel: ".csc-structuredDate-dateQualifierUnit-label",
            dateEarliestSingleRowLabel: ".csc-structuredDate-dateEarliestSingleRow-label",
            dateLatestRowLabel: ".csc-structuredDate-dateLatestRow-label",
            dateEarliestSingleYear: ".csc-structuredDate-dateEarliestSingleYear",
            dateEarliestSingleMonth: ".csc-structuredDate-dateEarliestSingleMonth",
            dateEarliestSingleDay: ".csc-structuredDate-dateEarliestSingleDay",
            dateEarliestSingleEra: ".csc-structuredDate-dateEarliestSingleEra",
            dateEarliestSingleCertainty: ".csc-structuredDate-dateEarliestSingleCertainty",
            dateEarliestSingleQualifier: ".csc-structuredDate-dateEarliestSingleQualifier",
            dateEarliestSingleQualifierValue: ".csc-structuredDate-dateEarliestSingleQualifierValue",
            dateEarliestSingleQualifierUnit: ".csc-structuredDate-dateEarliestSingleQualifierUnit",
            dateLatestYear: ".csc-structuredDate-dateLatestYear",
            dateLatestMonth: ".csc-structuredDate-dateLatestMonth",
            dateLatestDay: ".csc-structuredDate-dateLatestDay",
            dateLatestEra: ".csc-structuredDate-dateLatestEra",
            dateLatestCertainty: ".csc-structuredDate-dateLatestCertainty",
            dateLatestQualifier: ".csc-structuredDate-dateLatestQualifier",
            dateLatestQualifierValue: ".csc-structuredDate-dateLatestQualifierValue",
            dateLatestQualifierUnit: ".csc-structuredDate-dateLatestQualifierUnit"
        },
        strings: {
            close: "Close",
            dateDisplayDateLabel: "Display Date",
            datePeriodLabel: "Date Period",
            dateAssociationLabel: "Association",
            dateNoteLabel: "Note",
            dateHeaderLabel: "Date",
            dateYearLabel: "Year",
            dateMonthLabel: "Month",
            dateDayLabel: "Day",
            dateEraLabel: "Era",
            dateCertaintyHeaderLabel: "Certainty Term OR Qualifier, Value and Unit",
            dateCertaintyLabel: "Certainty",
            dateQualifierLabel: "Qualifier",
            dateQualifierValueLabel: "Value",
            dateQualifierUnitLabel: "Unit",
            dateEarliestSingleRowLabel: "Earliest/Single Date",
            dateLatestRowLabel: "Latest Date"
        },
        // This is the place to specify the template for the popup
        // (e.g. StructuredDate.html). This template will be fetched
        // and appended inside the component's container automatically
        // at render time.
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "slowTemplate",
                url: "%webapp/html/components/StructuredDate.html",
                options: {
                    dataType: "html"
                }
            })
        }
    });
    
    cspace.structuredDate.popup.finalInitFunction = function (that) {
        that.refreshView();
    };

    // Fetching / Caching
    // ----------------------------------------------------
    
    // Call to primeCacheFromResources will start fetching/caching
    // of the template on this file load before the actual component's
    // creator function is called.
    fluid.fetchResources.primeCacheFromResources("cspace.structuredDate.popup");
    
}(jQuery, fluid));
