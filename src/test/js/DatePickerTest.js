/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, expect*/
"use strict";

var datePickerTester = function ($) {
    
    var datePickerTest = new jqUnit.TestCase("DatePicker Tests", function () {
        cspace.util.isTest = true;
    });
    
    var verifyGoogleDatePickerDate = function (year, month, day) {
        jqUnit.assertEquals("Google datePicker's selected year is the same as the value in the input field", year, $(".goog-date-picker-year").text());
        jqUnit.assertEquals("Google datePicker's selected month is the same as the value in the input field", month, $(".goog-date-picker-month").text());
        jqUnit.assertEquals("Google datePicker's selected day is the same as the value in the input field", day, $(".goog-date-picker-selected").text());
    };
    
    var buildDateStructure = function (datestring, format) {
        var date = datestring ? Date.parse(datestring) : Date.today();
        if (!date) {
            return {
                original: datestring
            };
        }
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return {
            date: date,
            formattedDate: date.toString(format),
            year: date.toString("yyyy"),
            month: months[date.toString("M") - 1],
            day: date.getDate().toString(),
            original: datestring
        };
    };
    
    // failedFieldValue is passed in case where we try to check the behavior by putting invalid dates in the input field.
    var inferAndValidateDates = function (inputField, dates, format, message, failedFieldValue) {
        for (var i in dates) {
            var date = buildDateStructure(dates[i], format);
            inputField.val(date.original);
            inputField.change();
            jqUnit.assertEquals(message, typeof failedFieldValue !== "undefined" ? failedFieldValue : date.formattedDate, inputField.val()); 
        }
    };
    
    datePickerTest.test("Initialization", function () {
        expect(1);
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        });
        jqUnit.assertNotUndefined("datePickers google date picker should not be undefined", datePicker.datePickerWidget);
    });
    
    datePickerTest.test("Use google DatePicker to select a date", function () {
        expect(5);
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        });
        datePicker.calendarButton.click();
        jqUnit.isVisible("Google datePicker widget is now visible", datePicker.datePicker);
        var date = buildDateStructure("1999-01-01", "yyyy-MM-dd");
        datePicker.datePickerWidget.setDate(date.date);
        // TODO: when datePicker is refactored, that should probably be a selector in the defaults.
        $(".goog-date-picker-selected").click();
        jqUnit.assertEquals("DatePicker's date input field should now have a value of", date.formattedDate, datePicker.container.val());
        verifyGoogleDatePickerDate(date.year, date.month, date.day);
    });
    
    datePickerTest.test("Use input field to select a date", function () {
        expect(4);
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        });
        var date = buildDateStructure("1999-01-01", "yyyy-MM-dd");
        var inputField = datePicker.container; 
        inputField.val(date.original);
        inputField.change();        
        jqUnit.assertEquals("Text in the input field should stay the same after validation", date.formattedDate, inputField.val());
        verifyGoogleDatePickerDate(date.year, date.month, date.day);
    });
    
    datePickerTest.test("Test when only year is typed in", function () {
        expect(4);
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        }),
            userInputDate = "2003",
            date = buildDateStructure(userInputDate + "-01-01", "yyyy-MM-dd"),
            inputField = datePicker.container;
        inputField.val(userInputDate);
        inputField.change();
        jqUnit.assertEquals("Date should use Jan 01 as default month and a default day", date.formattedDate, inputField.val());
        verifyGoogleDatePickerDate(date.year, date.month, date.day);
    });
    
    datePickerTest.test("Test eras typed in", function () {
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        });
        
        var tests = [
            {
                era: "AD",
                error: false
            },
            {
                era: "BC",
                error: false
            },
            {
                era: "A.d.",
                error: true
            },
            {
                era: "JUNK",
                error: true
            }
        ];
        
        expect(tests.length);
        
        var testEraFunction = function (era, error) {
            var dateWithoutEra = "2003-01-01",
                userInputDate = dateWithoutEra + " " + era,
                date = buildDateStructure(dateWithoutEra, "yyyy-MM-dd"),
                inputField = datePicker.container;
            inputField.val(userInputDate);
            inputField.change();
            if (!error) {
                jqUnit.assertEquals("Date should use Jan 01 as default month and a default day", date.formattedDate + " " + era, inputField.val());
            } else {
                jqUnit.assertEquals("Date should be empty since era format was incorrect", "", inputField.val());
            }
        };
        
        fluid.each(tests, function (test) {
            testEraFunction(test.era, test.error);
        });
    });
    
    datePickerTest.test("Attempt to validate invalid dates", function () {
        expect(5);
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        });
        inferAndValidateDates(datePicker.container, 
                              ["999", "fail", "monday", "-A", "{year: '2000'}"], 
                              "yyyy-MM-dd",
                              "Text in the input field should be empty since the validation failed", "");     
    });
    
    datePickerTest.test("Attempt to validate valid dates", function () {
        expect(7);
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        });
        inferAndValidateDates(datePicker.container, 
                              ["today", "tomorrow", "Dec 12, 2000", "-10", "tomorrow + 10", "1000-01-01", "1800-11"], 
                              "yyyy-MM-dd",
                              "Text in the input field should be formatted correctly and equal to");
    });
    datePickerTest.test("Use None button", function () {
        expect(4);
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        });
        var date = buildDateStructure("1999-01-01", "yyyy-MM-dd");
        var inputField = datePicker.container; 
        inputField.val(date.original).change();        
        jqUnit.assertEquals("Text in the input field should stay the same after validation", date.formattedDate, inputField.val());
        datePicker.calendarButton.click();
        jqUnit.isVisible("Date picker widget should be visible", datePicker.datePicker);
        datePicker.locate("btn", datePicker.datePicker).filter(function () {
            return $(this).text() === "None";
        }).click();
        jqUnit.notVisible("Date picker widget should be now invisible", datePicker.datePicker);
        jqUnit.assertEquals("Date value should be reset to an empty string", "", inputField.val());
    });
    datePickerTest.test("Use Today button", function () {
        expect(4);
        var datePicker = cspace.datePicker(".csc-datePicker-container", {
            messageBar: cspace.messageBar("body")
        });
        var date = buildDateStructure("1999-01-01", "yyyy-MM-dd");
        var inputField = datePicker.container; 
        inputField.val(date.original).change();        
        jqUnit.assertEquals("Text in the input field should stay the same after validation", date.formattedDate, inputField.val());
        datePicker.calendarButton.click();
        jqUnit.isVisible("Date picker widget should be visible", datePicker.datePicker);
        datePicker.locate("btn", datePicker.datePicker).filter(function () {
            return $(this).text() === "Today";
        }).click();
        jqUnit.notVisible("Date picker widget should be now invisible", datePicker.datePicker);
        var today = Date.today();
        today = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        today = Date.parse(today).toString("yyyy-MM-dd");
        jqUnit.assertEquals("Date value should be reset to an empty string", today, inputField.val());
    });
};

(function () {
    datePickerTester(jQuery);
}());