/*
Copyright 2010 University of Toronto
Copyright 2010 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global window, history, fluid, jQuery*/
"use strict";

var fluid = fluid || {};
fluid.engage = fluid.engage || {};
fluid.engage.url = fluid.engage.url || {};

(function ($) {
    var getScreenNavigatorSingleton = function () {
        if (fluid.engage.screenNavigator) {
            return fluid.engage.screenNavigator.get();
        }
        
        return null;
    };
    
    var getLocation = function () {
        var nav = getScreenNavigatorSingleton();
        return nav ? "/" + nav.currentURL : window.location.href;
    };
    
    var setLocation = function (url) {
        var nav = getScreenNavigatorSingleton();
        if (nav) {
            if (url.charAt(0) === "/") {
                nav.setLocation(url.substring(1));
            }
            else {
                nav.setRelativeLocation(url);
            }
        } else {
            window.location = url;
        }
        
        return url;
    };
    
    var busy = false;
    
    var queue = [];
    
    function execQueue() {
        for (var i = 0; i < queue.length; ++ i) {
            queue[i]();
        }
        queue = [];
    }
    
    fluid.engage.url.deferUntilQuiet = function(func) {
        if (!busy) {
            func();
        }
        else {
            queue.push(func);
        }
    };
    
    fluid.engage.url.setBusy = function(newBusy) {
        busy = newBusy;
        if (!newBusy && queue.length) {
            execQueue();
        }
    }
    
    fluid.engage.url.location = function (url) {
        return (typeof(url) === "undefined") ? getLocation() : setLocation(url);
    };
    
    // This shim is here for future expansion of our backtracking support. For now,
    // We just rely on the browser's back functionality along with the jQuery hashchange plugin.
    fluid.engage.url.history = {
        go: function (num) {
            history.go(num);
        },
        back: function () {
            fluid.engage.url.history.go(-1);
        },
        forward: function () {
            fluid.engage.url.history.go(1);
        }
    };
    
    fluid.engage.url.parseSearch = function (url) {
        var qIdx = url.indexOf("?");
        var hashIdx = url.indexOf("#");
        
        if (qIdx === -1) {
            return null;
        }
        
        return url.substring(qIdx, (hashIdx > -1) ? hashIdx : url.length);    
    };
    
    fluid.engage.url.search = function () {
        var nav = getScreenNavigatorSingleton();
        return nav ? fluid.engage.url.parseSearch(nav.currentURL) : window.location.search;
    };
    
    fluid.engage.url.params = function () {
        var search = fluid.engage.url.search();
        return fluid.kettle.paramsToMap(search);
    };
    
    fluid.engage.url.addParamToURL = function (url, param, value) {
        var urlBase = url;
        var trimURL = function (idx) {
            var trimmed;
            if (idx !== -1) {
                trimmed = url.substring(idx);
                urlBase = urlBase.substring(0, idx);            
            }
            
            return trimmed;
        };
        
        var hash = trimURL(url.indexOf("#")) || "";
        var q = trimURL(url.indexOf("?")) || "";
        var params = q ? fluid.kettle.paramsToMap(q) : {};
        params[param] = value;
        return urlBase + "?" + $.param(params) + hash;
    };
           
})(jQuery);
