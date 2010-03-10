/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {

    cspace.util = {};

    cspace.util.addTrailingSlash = function (url) {
        return url + ((url.charAt(url.length - 1) !== "/") ? "/" : "");
    };

    cspace.util.getUrlParameter = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results === null) {
            return "";
        } else {
            return results[1];
        }
    };

	cspace.util.isLocal = function () {
		return document.location.protocol === "file:";
	};
    
    cspace.util.buildRelationsList = function (data, recordTypeList) {
        var relationList = [];
        if (data) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < recordTypeList.length; j++) {
                    if (data[i].recordtype === recordTypeList[j]) {
                        relationList.push(data[i]);
                    }
                }
            }
        }
        return relationList;     
    };

    cspace.util.displayTimestampedMessage = function (locater, msg, time) {
        var messageContainer = locater.locate("messageContainer", "body");
        locater.locate("feedbackMessage", messageContainer).text(msg);
        locater.locate("timestamp", messageContainer).text(time ? time : "");
        messageContainer.show();
    };

})(jQuery, fluid_1_2);
