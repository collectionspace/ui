/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/
"use strict";

var fluid = fluid || {};

(function ($) {
  
fluid.dateUtils = fluid.dateUtils || {};

// Taken from RSF distribution file "ISO8601-date.js"

/** Standard ISO 8601 format dates for Javascript - taken from 
 * http://delete.me.uk/2005/03/iso8601.html
 * Originally written by Paul Sowden
 * Acquired by Antranig Basman 03/11/2006
 * Corrected to ALWAYS supply one or more fractional second digits in format 6 as
 * per the actual standard http://www.w3.org/TR/NOTE-datetime
 * Adjusted further to ignore ALL timezone information as this may not reliably
 * be processed in a Javascript environment.
 */

/** Extract a "fixed date" from a Javascript date object. This is a simple static structure with 
 * the core fields broken out as data.
 */

fluid.dateUtils.fromDate = function(date) {
    var togo = {}
    togo.fullYear = Number(date.getFullYear());
    togo.month = Number(date.getMonth() + 1);
    togo.day = Number(date.getDate());
    togo.dayNumber = Number(date.getDay());
    togo.hours = Number(date.getHours());
    togo.minutes = Number(date.getMinutes());
    togo.seconds = Number(date.getSeconds());
    return togo;
    };

fluid.dateUtils.parseISO8601 = function (string) {
    
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Object();
    date.fullYear = Number(d[1]);
    date.month = Number(d[3]);
    date.day = Number(d[5]);
    date.hours = Number(d[7]);
    date.minutes = Number(d[8]);
    date.seconds = Number(d[10]);
    date.milliseconds = Number(d[12]);
    return date;
  };

fluid.dateUtils.renderISO8601 = function (fixeddate, format, offset) {
    /* accepted values for the format [1-6]:
     1 Year:
       YYYY (eg 1997)
     2 Year and month:
       YYYY-MM (eg 1997-07)
     3 Complete date:
       YYYY-MM-DD (eg 1997-07-16)
     4 Complete date plus hours and minutes:
       YYYY-MM-DDThh:mmTZD (eg 1997-07-16T19:20+01:00)
     5 Complete date plus hours, minutes and seconds:
       YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
     6 Complete date plus hours, minutes, seconds and a decimal
       fraction of a second
       YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)
    */
    if (!format) { var format = 6; }
    if (!offset) {
        var offset = 'Z';
    } else {
        var d = offset.match(/([-+])([0-9]{2}):([0-9]{2})/);
        var offsetnum = (Number(d[2]) * 60) + Number(d[3]);
        offsetnum *= ((d[1] == '-') ? -1 : 1);
    }

    var str = "";
    str += fixeddate.fullYear;
    if (format > 1) { str += "-" + zeropad(fixeddate.month); }
    if (format > 2) { str += "-" + zeropad(fixeddate.day); }
    if (format > 3) {
        str += "T" + zeropad(fixeddate.hours) +
               ":" + zeropad(fixeddate.minutes);
    }

    if (format > 4) { 
      str += ":" + zeropad(fixeddate.seconds); 
      if (format == 6) {
        str += "." + zeropad(fixeddate.milliseconds, 3);
        }
      }

    if (format > 3) { str += offset; }
    return str;
};

var zeropad = function (num, width) {
      if (!width) width = 2;
      var numstr = (num == undefined? "" : num.toString());
      return "00000".substring(5 - width + numstr.length) + numstr;
      }

fluid.dateUtils.getLocalisedDateElement = function(locale, element, index) {
    if (locale === "en") {
        locale = "en-GB";
    }
    return window.jQuery.datepicker.regional[locale][element][index];
};

// This method adapted from DateJS code hosted at http://code.google.com/p/datejs/
// (MIT Licence)

fluid.dateUtils.renderLocalisedDate = function(fixedDate, format, locale) {
    var l = fluid.dateUtils.getLocalisedDateElement;
    return format.replace(/dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?/g, 
    function (format) {
        switch (format) {
        case "hh":
            return zeropad(fixedDate.hours < 13 ? fixedDate.hours : (fixedDate.hours - 12));
        case "h":
            return fixedDate.hours < 13 ? fixedDate.hours : (fixedDate.hours - 12);
        case "HH":
            return zeropad(fixedDate.hours);
        case "H":
            return fixedDate.hours;
        case "mm":
            return zeropad(fixedDate.minutes);
        case "m":
            return fixedDate.minutes;
        case "ss":
            return zeropad(fixedDate.seconds);
        case "s":
            return fixedDate.seconds;
        case "yyyy":
            return fixedDate.fullYear;
        case "yy":
            return fixedDate.fullYear.toString().substring(2, 4);
        case "dddd":
            return l(locale, "dayNames", fixedDate.dayNumber);
        case "ddd":
            return l(locale, "dayNamesShort", fixedDate.dayNumber);
        case "dd":
            return zeropad(fixedDate.day);
        case "d":
            return fixedDate.day;
        case "MMMM":
            return l(locale, "monthNames", fixedDate.month - 1);
        case "MMM":
            return l(locale, "monthNamesShort", fixedDate.month - 1);
        case "MM":
            return zeropad(fixedDate.month);
        case "M":
            return fixedDate.month;
//        case "t":
//            return fixedDate.hours < 12 ? Date.CultureInfo.amDesignator.substring(0, 1) : Date.CultureInfo.pmDesignator.substring(0, 1);
//        case "tt":
//            return fixedDate.hours < 12 ? Date.CultureInfo.amDesignator : Date.CultureInfo.pmDesignator;
        case "zzz":
        case "zz":
        case "z":
            return "";
        }
    });
};
    
})(jQuery);