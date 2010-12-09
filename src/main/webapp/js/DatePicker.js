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

    var keyCode = function (evt) {
        return evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0);          
    };
    
    var closeCalendar = function (that) {
        var datePicker = that.locate("datePicker");
        datePicker.hide();
        that.locate("calendarButton").focus();
        cspace.util.globalDismissal(datePicker);
    };
    
    var formatDate = function (date, format) {
        // Pulling a full date from google datePicker into one of the formats that can be parsed by datejs. 
        var fullDate = date.getYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        return Date.parse(fullDate).toString(format);
    };
    
    var validateDate = function (domBinder, date, message, format) {
        // Parsing a date sting into a date object for datejs. If it is invalid null will be returned.
        date = Date.parse(date);
        if (!date) {
            // If there is no date, we will display an invalid date message and emptying the date field.
            cspace.util.displayTimestampedMessage(domBinder, message);
            return "";
        }
        // Format validated date into a string.
        return date.toString(format);
    };

    var bindEvents = function (that) {
        
        var datePicker = that.locate("datePicker");
        var calendarDate = that.locate("calendarDate");
        var calendarButton = that.locate("calendarButton");
        var table = $(that.datePicker.tableBody_);
        
        fluid.deadMansBlur(datePicker, table, function () {
            closeCalendar(that);
        });

        table.blur(function (e) {
            table.removeClass(that.options.styles.focus);
        });
        
        table.focus(function (e) {
            table.addClass(that.options.styles.focus);
        });
        
        calendarButton.click(function (event) {
            datePicker.toggle();
            cspace.util.globalDismissal($(datePicker).add(calendarButton), function () {
                closeCalendar(that);
            });
            table.focus();
        });
        
        calendarDate.change(function () {
            // If there is an error message clear it.
            that.locate("messageContainer", "body").hide();
            // Get a string value for a field.
            var dateFieldValue = calendarDate.val();
            // Get a validated string value for the same field.
            var date = validateDate(that.dom, dateFieldValue, that.options.strings.invalidDateMessage, that.options.defaultFormat);
            // If validated date is different from the original, put validated value into 
            // the date field and update the datePicker's selected date.
            if (dateFieldValue !== date) {
                calendarDate.val(date);
            }
            that.datePicker.setDate(Date.parse(date));
        });
    
        var setDate = function () {
            var date = that.datePicker.getDate();
            calendarDate.val(formatDate(date, that.options.defaultFormat));
            calendarDate.change();
            closeCalendar(that);
            if (that.freeText) {
                calendarDate.focus();
            }
        };
        
        that.locate("date").click(function (event) {            
            that.datePicker.handleGridClick_(event);
            setDate();    
            return false;
        });
        
        datePicker.keydown(function (event) {
            var key = keyCode(event);
            if (key === $.ui.keyCode.RIGHT || key === $.ui.keyCode.TOP ||
                key === $.ui.keyCode.LEFT || key === $.ui.keyCode.DOWN) {
                if (!table.hasClass(that.options.styles.focus)) {
                    return false;
                }
            }
        });
        
//        datePicker.keyup(function (event) {
//            var key = keyCode(event);
//            if (key === $.ui.keyCode.RIGHT || key === $.ui.keyCode.TOP ||
//                key === $.ui.keyCode.LEFT || key === $.ui.keyCode.DOWN) {
//                if (!table.hasClass(that.options.styles.focus)) {
//                    return false;
//                }
//            }
//        });
        
        datePicker.keypress(function (event) {
            switch (keyCode(event)) {
            case $.ui.keyCode.RIGHT:
            case $.ui.keyCode.TOP:
            case $.ui.keyCode.LEFT:
            case $.ui.keyCode.DOWN:
                if (!table.hasClass(that.options.styles.focus)) {
                    return false;
                }
                break;
            case $.ui.keyCode.ESCAPE:
                closeCalendar(that);
                break;
            case $.ui.keyCode.ENTER:
            case $.ui.keyCode.SPACE:
                if (table.hasClass(that.options.styles.focus)) {
                    setDate();
                }
                break;
            default:
                break; 
            }
        });

    };
    
    var setupDatePicker = function (that) {
        var datePicker = new goog.ui.DatePicker();        
        var datePickerObj = that.locate("datePicker");
        var datePickerClass = datePickerObj[0].className;
        datePicker.create(datePickerObj[0]);
        datePickerObj.addClass(datePickerClass);
        datePickerObj.hide();
        var calendarDate = that.locate(calendarDate);
        // TODO: this is going to go away as soon as all dates are a combination of datePicker and free text date.
        if (calendarDate.attr("disabled") !== "disabled") {
            that.freeText = true;
        }
        else {
            calendarDate.attr("readonly", "readonly");
            calendarDate.attr("disabled", true);
        }

        return datePicker;
    };
    
    cspace.datePicker = function (container, options) {
        var that = fluid.initView("cspace.datePicker", container, options);
        that.datePicker = setupDatePicker(that);
        
        bindEvents(that);
                
        return that;
    };
    
    fluid.defaults("cspace.datePicker", {
        selectors: {
            date: ".goog-date-picker-date",
            calendarDate: ".csc-calendar-date",
            datePicker: ".csc-date-picker",
            calendarButton: ".csc-calendar-button",
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp"
        },
        styles: {
            focus: "focused"
        },
        strings: {
            invalidDateMessage: "Provided date has invalid format."
        },
        // Default format for valid date.
        defaultFormat: "yyyy-MM-dd"
    });
    
})(jQuery, fluid);
