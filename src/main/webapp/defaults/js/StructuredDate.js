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
        root: "",
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
                    elPaths: "{structuredDate}.options.elPaths",
                    root: "{structuredDate}.options.root"
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
            var fullElPath = fluid.model.composeSegments.apply(null, that.options.root ? [that.options.root, that.options.elPath] : [that.options.elPath]);
            that.applier.modelChanged.addListener(fullElPath, function (model) {
                that.container.val(fluid.get(model, fullElPath));
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
            "rendererOptions.applier": "applier"
        },
        protoTree: {},
        getProtoTree: "cspace.structuredDate.popup.getProtoTree",
        parentBundle: "{globalBundle}",
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
        strings: {},
        stringPaths: {
            close: "structuredDate-close",
            dateDisplayDateLabel: "structuredDate-dateDisplayDateLabel",
            datePeriodLabel: "structuredDate-datePeriodLabel",
            dateAssociationLabel: "structuredDate-dateAssociationLabel",
            dateNoteLabel: "structuredDate-dateNoteLabel",
            dateHeaderLabel: "structuredDate-dateHeaderLabel",
            dateYearLabel: "structuredDate-dateYearLabel",
            dateMonthLabel: "structuredDate-dateMonthLabel",
            dateDayLabel: "structuredDate-dateDayLabel",
            dateEraLabel: "structuredDate-dateEraLabel",
            dateCertaintyHeaderLabel: "structuredDate-dateCertaintyHeaderLabel",
            dateCertaintyLabel: "structuredDate-dateCertaintyLabel",
            dateQualifierLabel: "structuredDate-dateQualifierLabel",
            dateQualifierValueLabel: "structuredDate-dateQualifierValueLabel",
            dateQualifierUnitLabel: "structuredDate-dateQualifierUnitLabel",
            dateEarliestSingleRowLabel: "structuredDate-dateEarliestSingleRowLabel",
            dateLatestRowLabel: "structuredDate-dateLatestRowLabel"
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
        },
        root: "",
        elPaths: [],
        invokers: {
            resolveFullElPath: {
                funcName: "cspace.structuredDate.popup.resolveFullElPath",
                args: ["{popup}.composeElPath", "{arguments}.0"]
            },
            composeElPath: {
                funcName: "cspace.structuredDate.popup.composeElPath",
                args: ["{popup}.options.elPaths", "{popup}.options.root", "{arguments}.0"]
            }
        }
    });
    
    cspace.structuredDate.popup.resolveFullElPath = function (composeElPath, key) {
        return "${" + composeElPath(key) + "}";
    };
    
    cspace.structuredDate.popup.composeElPath = function (elPaths, root, key) {
        var elPath = elPaths[key];
        return fluid.model.composeSegments.apply(null, root ? [root, elPath] : [elPath]);
    };
    
    cspace.structuredDate.popup.getProtoTree = function (that) {
        return {
            dateEarliestSingleQualifier: {
                decorators: [{
                    func: "cspace.termList",
                    type: "fluid",
                    options: {
                        elPath: that.composeElPath("dateEarliestSingleQualifier"),
                        termListType: "dateEarliestSingleQualifier"
                    }
                }]
            },
            dateLatestDay: that.resolveFullElPath("dateLatestDay"),
            dateLatestYear: that.resolveFullElPath("dateLatestYear"),
            dateAssociation: that.resolveFullElPath("dateAssociation"),
            dateEarliestSingleEra: {
                decorators: [{
                    func: "cspace.termList",
                    type: "fluid",
                    options: {
                        elPath: that.composeElPath("dateEarliestSingleEra"),
                        termListType: "dateEarliestSingleEra"
                    }
                }]
            },
            dateDisplayDate: that.resolveFullElPath("dateDisplayDate"),
            dateEarliestSingleCertainty: {
                decorators: [{
                    func: "cspace.termList",
                    type: "fluid",
                    options: {
                        elPath: that.composeElPath("dateEarliestSingleCertainty"),
                        termListType: "dateEarliestSingleCertainty"
                    }
                }]
            },
            dateLatestEra: {
                decorators: [{
                    func: "cspace.termList",
                    type: "fluid",
                    options: {
                        elPath: that.composeElPath("dateLatestEra"),
                        termListType: "dateLatestEra"
                    }
                }]
            },
            dateEarliestSingleQualifierValue: that.resolveFullElPath("dateEarliestSingleQualifierValue"),
            dateLatestCertainty: {
                decorators: [{
                    func: "cspace.termList",
                    type: "fluid",
                    options: {
                        elPath: that.composeElPath("dateLatestCertainty"),
                        termListType: "dateLatestCertainty"
                    }
                }]
            },
            dateEarliestSingleYear: that.resolveFullElPath("dateEarliestSingleYear"),
            dateLatestQualifier: {
                decorators: [{
                    func: "cspace.termList",
                    type: "fluid",
                    options: {
                        elPath: that.composeElPath("dateLatestQualifier"),
                        termListType: "dateLatestQualifier"
                    }
                }]
            },
            dateLatestQualifierValue: that.resolveFullElPath("dateLatestQualifierValue"),
            dateEarliestSingleQualifierUnit: {
                decorators: [{
                    func: "cspace.termList",
                    type: "fluid",
                    options: {
                        elPath: that.composeElPath("dateEarliestSingleQualifierUnit"),
                        termListType: "dateEarliestSingleQualifierUnit"
                    }
                }]
            },
            datePeriod: that.resolveFullElPath("datePeriod"),
            dateLatestMonth: that.resolveFullElPath("dateLatestMonth"),
            dateNote: that.resolveFullElPath("dateNote"),
            dateLatestQualifierUnit: {
                decorators: [{
                    func: "cspace.termList",
                    type: "fluid",
                    options: {
                        elPath: that.composeElPath("dateLatestQualifierUnit"),
                        termListType: "dateLatestQualifierUnit"
                    }
                }]
            },
            dateEarliestSingleDay: that.resolveFullElPath("dateEarliestSingleDay"),
            dateEarliestSingleMonth: that.resolveFullElPath("dateEarliestSingleMonth"),
            dateDisplayDateLabel: {
                messagekey: that.options.stringPaths.dateDisplayDateLabel
            },
            datePeriodLabel: {
                messagekey: that.options.stringPaths.datePeriodLabel
            },
            dateAssociationLabel: {
                messagekey: that.options.stringPaths.dateAssociationLabel
            },
            dateNoteLabel: {
                messagekey: that.options.stringPaths.dateNoteLabel
            },
            dateHeaderLabel: {
                messagekey: that.options.stringPaths.dateHeaderLabel
            },
            dateYearLabel: {
                messagekey: that.options.stringPaths.dateYearLabel
            },
            dateMonthLabel: {
                messagekey: that.options.stringPaths.dateMonthLabel
            },
            dateDayLabel: {
                messagekey: that.options.stringPaths.dateDayLabel
            },
            dateEraLabel: {
                messagekey: that.options.stringPaths.dateEraLabel
            },
            dateCertaintyHeaderLabel: {
                messagekey: that.options.stringPaths.dateCertaintyHeaderLabel
            },
            dateCertaintyLabel: {
                messagekey: that.options.stringPaths.dateCertaintyLabel
            },
            dateQualifierLabel: {
                messagekey: that.options.stringPaths.dateQualifierLabel
            },
            dateQualifierValueLabel: {
                messagekey: that.options.stringPaths.dateQualifierValueLabel
            },
            dateQualifierUnitLabel: {
                messagekey: that.options.stringPaths.dateQualifierUnitLabel
            },
            dateEarliestSingleRowLabel: {
                messagekey: that.options.stringPaths.dateEarliestSingleRowLabel
            },
            dateLatestRowLabel: {
                messagekey: that.options.stringPaths.dateLatestRowLabel
            }
        };
    };
    
    cspace.structuredDate.popup.finalInitFunction = function (that) {
        that.options.protoTree = fluid.invokeGlobalFunction(that.options.getProtoTree, [that]);
        that.refreshView();
    };

    // Fetching / Caching
    // ----------------------------------------------------
    
    // Call to primeCacheFromResources will start fetching/caching
    // of the template on this file load before the actual component's
    // creator function is called.
    fluid.fetchResources.primeCacheFromResources("cspace.structuredDate.popup");
    
}(jQuery, fluid));
