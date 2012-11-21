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
    fluid.log("DatePicker.js loaded");

    fluid.defaults("cspace.datePicker", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "cspace.datePicker.postInit",
        finalInitFunction: "cspace.datePicker.finalInit",
        invokers: {
            formatDate: {
                funcName: "cspace.datePicker.formatDate",
                args: ["{arguments}.0", "{datePicker}.options.defaultFormat"]
            },
            validateDate: {
                funcName: "cspace.datePicker.validateDate",
                args: ["{messageBar}", "{arguments}.0", "{datePicker}.options.strings.invalidDateMessage", "{datePicker}.options.defaultFormat", "{datePicker}.options.era"]
            },
            validateEra: {
                funcName: "cspace.datePicker.validateEra",
                args: ["{messageBar}", "{arguments}.0", "{datePicker}.options.validEras"]
            }
        },
        strings: {
            invalidDateMessage: "Provided date has invalid format."
        },
        i18n: "en_US",
        parentBundle: "{globalBundle}",
        selectors: {
            date: ".goog-date-picker-date",
            btn: ".goog-date-picker-btn",
            calendarDate: ".csc-calendar-date",
            datePicker: ".csc-date-picker",
            calendarButton: ".csc-calendar-button"
        },
        styles: {
            parent: "fl-table fl-date-group clearfix",
            calendarDate: "fl-force-left input-date",
            calendarButton: "fl-table-cell fl-force-left cs-calendar-button cs-calendar-image",
            datePicker: "cs-date-picker",
            focus: "focused"
        },
        markup: {
            calendarButton: "<a href=\"#_bottom\" />",
            datePicker: "<div></div>"
        },
        readOnly: false,
        buildMarkup: "cspace.datePicker.buildMarkup",
        defaultFormat: "yyyy-MM-dd",
        components: {
            messageBar: "{messageBar}"
        },
        mergePolicy: {
            validEras: "replace"
        },
        validEras: ["BCE", "B.C.", "B.C.E.", "C.E.", "BC", "CE", "AD", "A.D."],
        era: null
    });
    
    cspace.datePicker.validateEra = function (messageBar, dateInput, validEras) {
        var era, date = dateInput;
        
        if (dateInput === "") {
            return {
                date: date
            };
        }
        
        fluid.find(validEras, function (validEra) {
            if (dateInput.indexOf(validEra) !== -1) {
                era = validEra;
                date = date.replace(era, "");
                return true;
            }
        });
        
        // trim whitespaces
        return {
            date: date.replace(/^\s+|\s+$/g, ""),
            era: era  
        };
    }
    
    cspace.datePicker.formatDate = function (date, format) {
        // Pulling a full date from google datePicker into one of the formats that can be parsed by datejs. 
        var fullDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        return Date.parse(fullDate).toString(format);
    };
    
    cspace.datePicker.validateDate = function (messageBar, dateInput, message, format, era) {
        if (dateInput === "") {
            return dateInput;
        }
        // Parsing a date sting into a date object for datejs. If it is invalid null will be returned.
        date = Date.parse(dateInput);
        if (!date) {
            // If there is no date, we will display an invalid date message and emptying the date field.
            if (messageBar) {
                messageBar.show(message, null, true);
            }
            return "";
        }
        // Handle the case when user entered only year so that month will be defaulted to January
        if (dateInput === date.toString("yyyy")) {
            date.setMonth(0);
        }
        
        era = (era) ? " " + era : "";
        
        // Format validated date into a string.
        return date.toString(format) + era;
    };

    var bindEvents = function (that) {
        var table = $(that.datePickerWidget.tableBody_);
        
        fluid.deadMansBlur(that.datePicker, {
            exclusions: {picker: that.datePicker}, 
            handler: function () {
                that.datePicker.hide()
            }
        });
        
        that.calendarButton.click(function () {
            that.datePicker.toggle();
            that.calendarButton.blur();
            that.datePicker.focus();
        });
        
        that.container.change(function () {
            // If there is an error message clear it.
            if (that.messageBar) {
                that.messageBar.hide();
            }
            // Get a string value for a field.
            var dateFieldValue = that.container.val();
            // Validate Era of the value if present
            var result = that.validateEra(dateFieldValue);
            that.options.era = result.era;
            dateFieldValue = result.date;
            // Get a validated string value for the same field.
            var date = that.validateDate(dateFieldValue);
            // If validated date is different from the original, put validated value into 
            // the date field and update the datePicker's selected date.
            if (dateFieldValue !== date) {
                that.container.val(date);
            }
            that.datePickerWidget.setDate(Date.parse(date));
        });
    
        var setDate = function () {
            var date = that.datePickerWidget.getDate();
            that.datePicker.hide();
            that.container.val(that.formatDate(date)).change().focus();
        };
        
        that.locate("date", that.datePicker).click(function (event) {            
            that.datePickerWidget.handleGridClick_(event);
            setDate();    
            return false;
        });
        
        that.locate("btn", that.datePicker).filter(function () {
            return $(this).text() === "None";
        }).click(function (event) {
            that.datePicker.hide();
            that.container.val("").change().focus();
        });
        that.locate("btn", that.datePicker).filter(function () {
            return $(this).text() === "Today";
        }).click(function (event) {
            that.datePicker.hide();
            that.container.val(that.formatDate(Date.today())).change().focus();
        });
        
        that.datePicker.keydown(function (event) {
            var key = cspace.util.keyCode(event);
            if (key === $.ui.keyCode.RIGHT || key === $.ui.keyCode.TOP ||
                key === $.ui.keyCode.LEFT || key === $.ui.keyCode.DOWN) {
                if (!table.is(":focus")) {
                    return false;
                }
            }
        });
        
        that.datePicker.keypress(function (event) {
            switch (cspace.util.keyCode(event)) {
            case $.ui.keyCode.RIGHT:
            case $.ui.keyCode.TOP:
            case $.ui.keyCode.LEFT:
            case $.ui.keyCode.DOWN:
                if (!table.is(":focus")) {
                    return false;
                }
                break;
            case $.ui.keyCode.ESCAPE:
                that.datePicker.hide();
                break;
            case $.ui.keyCode.ENTER:
            case $.ui.keyCode.SPACE:
                if (table.is(":focus")) {
                    setDate();
                }
                break;
            default:
                break; 
            }
        });
    };
    
    cspace.datePicker.buildMarkup = function (that, control) {
        that[control] = $(that.options.markup[control])
            .addClass(that.options.selectors[control].slice(1))
            .addClass(that.options.styles[control]);
        that.container.after(that[control]);
    };
    
    var internationalize = function (that) {
        var messages = fluid.copy(that.options.strings);
        if (that.options.parentBundle) {
            fluid.merge(null, messages, that.options.parentBundle.messageBase);
        }
        that.locate("btn", that.datePicker).each(function () {
            var thisBtn = $(this);
            var message = messages[thisBtn.text()];
            if (message) {
                thisBtn.text(message);
            }
        });
    };
    
    var setupDatePickerWithI18n = function (that) {
        goog.i18n.DateTimeSymbols = goog.i18n["DateTimeSymbols_" + that.options.i18n];
        var datePickerWidget = new goog.ui.DatePicker();
        datePickerWidget.create(that.datePicker[0]);
        internationalize(that);
        return datePickerWidget;
    };
    
    var setupDatePicker = function (that) {
        var datePickerClass = that.datePicker[0].className;
        var datePickerWidget = setupDatePickerWithI18n(that);
        that.datePicker.addClass(datePickerClass);
        that.datePicker.hide();
        return datePickerWidget;
    };
    
    cspace.datePicker.finalInit = function (that) {
        var validEras = that.options.validEras;
        // pre-sort valid Eras by era length in desc order for cases e.g. BCE matches before BC or CE
        if (Array.isArray(validEras)) {
            that.options.validEras.sort(function (a,b) {
                if ( a.length > b.length )
                    return -1;
                if ( a.length < b.length )
                    return 1;
                return 0;
            });   
        }
        if (that.options.readOnly) {
            return;
        }
        that.datePickerWidget = setupDatePicker(that);
        bindEvents(that);
    };
    
    cspace.datePicker.postInit = function (that) {
        that.parent = that.container.parent();
        that.parent.addClass(that.options.styles.parent);
        that.container.addClass(that.options.styles.calendarDate).addClass(that.options.selectors.calendarDate.slice(1));
        var elements = that.options.readOnly ? ["datePicker"] : ["datePicker", "calendarButton"];
        fluid.each(elements, function (control) {
            fluid.invokeGlobalFunction(that.options.buildMarkup, [that, control]);
        });
    };
    
})(jQuery, fluid);