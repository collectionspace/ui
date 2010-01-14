/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_1, goog*/

var cspace = cspace || {};

(function ($, fluid) {
	
	var keyCode = function (evt) {
        return evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0);          
    };
	
    var closeCalendar =  function (that) {
	    that.locate("datePicker").hide();
		that.locate("calendarButton").focus();
    };

	var bindEvents = function (that) {
		
		var datePicker = that.locate("datePicker");
		var calendarDate = that.locate("calendarDate");
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
		
		that.locate("calendarButton").click(function (event) {
			datePicker.toggle();
            table.focus();
		});
		
		var setDate = function () {
			var date = that.datePicker.getDate();
            // TODO: Better factor out the formatting of the date
            calendarDate.val(that.options.months[date.getMonth()] + " " + date.getDate() + ", " + date.getYear());
            calendarDate.change();
            closeCalendar(that);
// CSPACE-707: Until we can better handle manually entered dates,
// the input field will be disabled
//            calendarDate.focus();
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
		
//		datePicker.keyup(function (event) {
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
// CSPACE-707: Until we can better handle manually entered dates,
// the input field will be disabled
        var dateField = that.locate("calendarDate");
        dateField.attr("readonly", "readonly");
        dateField.attr("disabled", true);
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
			calendarButton: ".csc-calendar-button"
		},
        styles: {
			focus: "focused"
        },
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	});
	
})(jQuery, fluid_1_1);
