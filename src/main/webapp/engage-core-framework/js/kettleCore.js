/*
Copyright 2008-2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, java*/

var fluid = fluid || {};

(function ($, fluid) {
    fluid.kettle = fluid.kettle || {};
    
    /** Two utilities that might well go into the framework **/

    /** Version of jQuery.makeArray that handles the case where the argument is undefined **/
    
    fluid.makeArray = function (array) {
        return $.makeArray(array === undefined ? null: array);
    };
    
    fluid.generate = function (n, generator) {
        var togo = [];
        for (var i = 0; i < n; ++ i) {
            togo[i] = typeof(generator) === "function" ?
                generator.call(null, i) : generator;
        }
        return togo;       
    };
  
    // From URLUtil.java
    function push(hash, key, value) {
        var exist = hash[key];
        if (!exist) {
            hash[key] = value;
        }
        else if (typeof(exist) === "string") {
            hash[key] = [exist, value];
        }
        else if (typeof(exist).length === "number") {
            exist[exist.length] = value;
        }
    }
    
    fluid.kettle.decodeURIComponent = function(comp) {
         comp = comp.replace(/\+/g, " ");
         return decodeURIComponent(comp);
    };
    
    fluid.kettle.paramsToMap = function (queryString) {
        var togo = {};
        queryString = queryString || "";
        if (queryString.charAt(0) === "?") {
            queryString = queryString.substring(1);
        }
        var segs = queryString.split("&");
        for (var i = 0; i < segs.length; ++ i) {
            var seg = segs[i];
            var eqpos = seg.indexOf("=");
            var key = seg.substring(0, eqpos);
            var value = seg.substring(eqpos + 1);
            push(togo, fluid.kettle.decodeURIComponent(key), fluid.kettle.decodeURIComponent(value));
        }
        return togo;
    };
    
    fluid.kettle.parsePathInfo = function (pathInfo) {
        var togo = {};
        var segs = pathInfo.split("/");
        if (segs.length > 0) {
            var top = segs.length - 1;
            var dotpos = segs[top].indexOf(".");
            if (dotpos !== -1) {
                togo.extension = segs[top].substring(dotpos + 1);
                segs[top] = segs[top].substring(0, dotpos);
            }
        }
        togo.pathInfo = segs;
        return togo;
    };

    fluid.kettle.splitUrl = function(url) {
        var qpos = url.indexOf("?");
        if (qpos === -1) {
            return {path: url}
        }
        else return {
            path: url.substring(0, qpos),
            query: url.substring(qpos + 1)
        };
    };

    fluid.kettle.parseUrl = function(url) {
        var split = fluid.kettle.splitUrl(url);
        togo = fluid.kettle.parsePathInfo(split.path);
        if (split.query) {        
            togo.params = fluid.kettle.paramsToMap(split.query);
        }
        return togo;
    };
    
    fluid.kettle.renderUrl = function(parsed) {
        var togo = fluid.kettle.makeRelPath(parsed);
        if (parsed.params) {
            togo += "?" + $.param(parsed.params);
        }
        return togo;
    };
    
    fluid.kettle.addParamsToUrl = function(url, addParams) {
        var parsed = fluid.kettle.parseUrl(url);
        parsed.params = $.extend(parsed.params || {}, addParams);
        return fluid.kettle.renderUrl(parsed);
    };
    
    /** Collapse the array of segments into a URL path, starting at the specified
     * segment index - this will not terminate with a slash, unless the final segment
     * is the empty string
     */
    fluid.kettle.collapseSegs = function(segs, from, to) {
        var togo = "";
        if (from === undefined) { 
            from = 0;
        }
        if (to === undefined) {
            to = segs.length;
        }
        for (var i = from; i < to - 1; ++ i) {
            togo += segs[i] + "/";
        }
        togo += segs[to - 1];
        return togo;   
    };

    fluid.kettle.makeRelPath = function(parsed, index) {
        var togo = fluid.kettle.collapseSegs(parsed.pathInfo, index);
        if (parsed.extension) {
            togo += "." + parsed.extension;
        }
        return togo;
    };
    
    /** Canonicalise IN PLACE the supplied segment array derived from parsing a
     * pathInfo structure. Warning, this destructively modifies the argument.
     */
    fluid.kettle.cononocolosePath = function(pathInfo) {
        var consume = 0;
        for (var i = 0; i < pathInfo.length; ++ i) {
            if (pathInfo[i] === "..") {
                ++consume;
            }
            else if (consume !== 0) {
                pathInfo.splice(i - consume*2, consume*2);
                i -= consume * 2;
                consume = 0;
            }
        }
        return pathInfo;
    };
    
    fluid.kettle.makeCanon = function(compound) {
        var parsed = fluid.kettle.parsePathInfo(compound);
        fluid.kettle.cononocolosePath(parsed.pathInfo);
        return fluid.kettle.makeRelPath(parsed); 
    }
    
    
    fluid.kettle.operateUrl = function(url, responseParser, writeDispose, callback) {
        var togo = {};
        responseParser = responseParser || fluid.identity;
        function success(responseText, textStatus) {
            togo.data = responseParser(responseText); 
            togo.textStatus = textStatus;
            if (callback) {
                callback(togo);
            }
        }
        function error(xhr, textStatus, errorThrown) {
            fluid.log("Data fetch error - textStatus: " + textStatus);
            fluid.log("ErrorThrown: " + errorThrown);
            togo.textStatus = textStatus;
            togo.errorThrown = errorThrown;
            togo.isError = true;
            if (callback) {
                callback(togo);
            }
        }
        var ajaxOpts = {
            type: "GET",
            url: url,
            success: success,
            error: error
        };
        if (writeDispose) {
          $.extend(ajaxOpts, writeDispose);
        }
        fluid.log("Issuing request for " + ajaxOpts.type + " of URL " + ajaxOpts.url);
        $.ajax(ajaxOpts);
        fluid.log("Request returned");
        return togo;
    };
    
    fluid.kettle.resolveEnvironment = fluid.identity; // this will be overridden on the server
    
    fluid.kettle.URLDataSource = function(options) {
        fluid.log("Creating URLDataSource with writeable = " + options.writeable);
        function resolveUrl(resOptions, directModel) {
            var expanded = fluid.kettle.resolveEnvironment(resOptions, directModel);
            if (expanded.funcName) { // what other forms of delivery might there be?
                return fluid.invokeGlobalFunction(expanded.funcName, $.makeArray(expanded.args));
            }
        }
        var that = fluid.initLittleComponent("fluid.kettle.URLDataSource", options);
        that.get = function(directModel) {
            var url = resolveUrl(that.options.urlBuilder, directModel);
            if (url) {
                return fluid.kettle.operateUrl(url, fluid.kettle.JSONParser);
            }
        };
        if (that.options.writeable) {
            that.put = function(model, directModel, callback) {
                var url = resolveUrl(that.options.urlBuilder, directModel);
                var expanded = fluid.kettle.resolveEnvironment(that.options, directModel);
                var ajaxOpts = {data: JSON.stringify(model), contentType: "application/json; charset=UTF-8"};
                    if (model._id === undefined) {
                        ajaxOpts.type = "POST";
                    } else {
                        ajaxOpts.type = "PUT";
                        if (that.options.couchDBDocumentURL) {
                            url = url + encodeURIComponent(model._id);
                        }
                    }
                return fluid.kettle.operateUrl(url, fluid.kettle.JSONParser, ajaxOpts, callback);
                };
            }
        return that;
    };
    
    // TODO: defaults should be client/server specific
    fluid.defaults("fluid.kettle.URLDataSource", {
        couchDBDocumentURL: true
    });
    
    fluid.kettle.dummyDataSource = function(initModel) {
        return {
            get: function() {return initModel;},
            put: function() {}
        };
    };
    
    fluid.kettle.simpleURLDataSource = function (url) {
        return url? fluid.kettle.URLDataSource({
            writeable: true,
            couchDBDocumentURL: false,
            urlBuilder: { funcName: "fluid.identity", args: url}
        }) : fluid.kettle.dummyDataSource;  
    };
    
    fluid.kettle.makeSourceApplier = function(dataSource, directModel, model) {
        if (model === undefined) {
            model = dataSource.get(directModel);
        }
        var baseApplier = fluid.makeChangeApplier(model);
        var changed = fluid.event.getEventFirer();
        // TODO: One day transactional applier will appear from FLUID-2881 branch
        // TODO: modelChanged semantic is not standard
        var togo = {
            fireChangeRequest: function(dar) {
                 baseApplier.fireChangeRequest(dar);
                 dataSource.put(model, directModel, function(arg) {changed.fire(arg)});
            },
            modelChanged: changed
        };
        fluid.model.bindRequestChange(togo);
        return togo;
    };
    
    // Temporary definitions to quickly extract template segment from file
    // will be replaced by more mature system which will also deal with head matter
    // collection and rewriting
    var BEGIN_KEY = "<!--DISREPUTABLE TEMPLATE BOUNDARY-->";
    
    fluid.kettle.stripTemplateQuickly = function(text) {
        var bl = BEGIN_KEY.length;
        var i1 = text.indexOf(BEGIN_KEY);
        var i2 = text.indexOf(BEGIN_KEY, i1 + bl);
        if (i1 === -1 || i2 === -1) {
            fluid.fail("Template boundary not found within file");
        } 
        return text.substring(i1 + bl, i2);
    };
    
    fluid.kettle.fetchTemplateSection = function(url) {
        return fluid.kettle.operateUrl(url, fluid.kettle.stripTemplateQuickly, {async: false});
    };
  
})(jQuery, fluid);
    