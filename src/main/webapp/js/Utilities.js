/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace, window*/
"use strict";

fluid.registerNamespace("cspace.util");

(function ($, fluid) {
    fluid.log("Utilities.js loaded");

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

    cspace.util.useLocalData = function () {
        return cspace.util.isTest || document.location.protocol === "file:";
    };
    
    /** Convert the global state of using local data into an IoC "type tag" so that
     * decisions based on it can be performed out of line with application code.
     * By use of this "indirect dispatch" all test configuration code may now be
     * bundled in files that are not part of the production image */
    
    if (cspace.util.useLocalData()) {
        fluid.staticEnvironment.cspaceEnvironment = fluid.typeTag("cspace.localData");
    }
  
    var eUC = "encodeURIComponent:";
  
    /** A "Data Source" attached to a URL. Reduces HTTP transport to the simple 
     * "Data Source" API. This should become the only form of AJAX throughout CollectionSpace,
     * with the exception of calls routed through fluid.fetchResources (the two methods may
     * be combined by use of makeAjaxOpts and conversion into a resourceSpec) */   
    // TODO: integrate with Engage conception and knock the rough corners off
    cspace.URLDataSource = function(options) {
        var that = fluid.initLittleComponent(options.typeName, options);
        
        function resolveUrl(directModel) {
            var map = fluid.copy(that.options.termMap) || {};
            map = fluid.transform(map, function(entry) {
                var encode = false;
                if (entry.indexOf(eUC) === 0) {
                    encode = true;
                    entry = entry.substring(eUC.length);
                }
                if (entry.charAt(0) === "%") {
                    entry = fluid.model.getBeanValue(directModel, entry.substring(1));
                }
                if (encode) {
                    entry = encodeURIComponent(entry);
                }
                return entry;
            } );
            return fluid.stringTemplate(that.options.url, map);
        }
        
        that.makeAjaxOpts = function(model, directModel, callback, type) {
            var togo = {
                type: type,
                url: resolveUrl(directModel),
                contentType: "application/json; charset=UTF-8",
                dataType: "json",
                success: function(data) {
                    if (that.options.responseParser) {
                        data = that.options.responseParser(data, directModel);
                    }
                    callback(data);
                },
                error: function(xhr, textStatus, errorThrown) {
                    fluid.log("Data fetch error for url " + togo.url + " - textStatus: " + textStatus);
                    fluid.log("ErrorThrown: " + errorThrown);
                }                
            };
            if (model) {
                togo.data = JSON.stringify(model);
            }
            return togo;
        };

        that.get = function(directModel, callback) {
            var ajaxOpts = that.makeAjaxOpts(null, directModel, callback, "GET");
            $.ajax(ajaxOpts);
        };
        if (options.writeable) {
            that.put = function(model, directModel, callback) {
                var ajaxOpts = that.makeAjaxOpts(model, directModel, callback, "POST");
                $.ajax(ajaxOpts);
            }; 
        }
        return that;
    };
    
    /** "Global Dismissal Handler" for the entire page. Attaches a click handler to the
     *  document root that will cause dismissal of any elements (typically dialogs) which
     *  have registered themselves. Dismissal through this route will automatically clean up
     *  the record - however, the dismisser themselves must take care to deregister in the case
     *  dismissal is triggered through the dialog interface itself. */
    
    var dismissList = {};
    
    $(document).click(function(event) {
        var target = event.target;
        while(target) {
            if (dismissList[target.id]) {
                return;
            }
            target = target.parentNode;
        }
        fluid.each(dismissList, function(dismissFunc, key) {
            dismissFunc();
            delete dismissList[key];
        });
    });
    
    cspace.util.globalDismissal = function(nodes, dismissFunc) {
        nodes = $(nodes);
        fluid.each(nodes, function(node) {
        var id = fluid.allocateSimpleId(node);
            if (dismissFunc) {
                dismissList[id] = dismissFunc;
            }
            else {
                delete dismissList[id];
            }
        });
    };
    
    cspace.util.displayTimestampedMessage = function (locater, msg, time) {
        var messageContainer = locater.locate("messageContainer", "body");
        locater.locate("feedbackMessage", messageContainer).text(msg);
        locater.locate("timestamp", messageContainer).text(time ? time : "");
        messageContainer.show();
    };

    cspace.util.hideMessage = function (locater) {
        locater.locate("messageContainer", "body").hide();
    };

    cspace.util.setZIndex = function () {
        if ($.browser.msie) {
            var zIndexNumber = 999;
            $("div").each(function () {
                $(this).css('zIndex', zIndexNumber);
                zIndexNumber -= 1;
            });
        }
    };

    cspace.util.corner = function () {
    };
    
    cspace.util.getDefaultURL = function (resource) {
        var url = window.location.pathname;
        return ".\/" + resource + url.substring(url.lastIndexOf("/"), url.indexOf(".html")) + ".json";
    };
    
    var buildModelStructure = function (model, elPath) {
        var keys = elPath.split(".");        
        for (var index = 0; index < keys.length - 1; index++) {
            var key = keys[index];            
            var isArray = keys[index + 1] === "0";
            if (typeof(model) === "object" && typeof(model.length) === "number") {
                if (model.length === 0) {
                    model.push({});
                }                
                model = model[0];
            }
            model[key] = model[key] || (isArray ? [] : {});            
            model = model[key];
            index += isArray ? 1 : 0;
        }
    };
    
    cspace.util.createEmptyModel = function (model, uispec) {
        for (var key in uispec) {
            if (!uispec.hasOwnProperty(key)) {
                continue;                
            }
            var value = uispec[key];
            if (!value) {
                continue;
            }
            var type = typeof(value);
            switch (type) {
                case "object":
                    cspace.util.createEmptyModel(model, value);
                    break;
                case "string":
                    var i1 = value.indexOf("${");
                    var i2 = value.indexOf("}");
                    if (i1 === 0 && i2 !== -1 && value.search(/.0./gi) > -1) {
                        buildModelStructure(model, value.substring(2, i2));
                    }
                    break;
                default:
                    break;
            }
        }
    };

    cspace.util.createBaseModel = function () {
        return {
            csid: null,
            fields: {},
            termsUsed: [],
            relations: {}
        };
    };

    cspace.util.fullUrl = function (prefix, templateName) {
        return prefix ? prefix + templateName : templateName;
    };
    
    cspace.util.getBeanValue = function (root, EL, schema) {
        if (EL === "" || EL === null || EL === undefined) {
            return root;
        }
        var segs = fluid.model.parseEL(EL);
        for (var i = 0; i < segs.length; ++i) {
            var seg = segs[i];
            if (!root[seg] && !schema) {
                return root;
            }
            if (root[seg]) {
                root = root[seg];
                continue;
            }
            var subSchema = schema[seg];
            if (!subSchema) {
                return root;
            }
            var type = subSchema.type;
            if (!type) {
                // Schema doesn't have a type.
                fluid.fail("Schema for " + seg + "is incorrect: type is missting");
            }
            var defaultValue = subSchema["default"];
            if (typeof defaultValue !== "undefined") {
                root = defaultValue;
                continue;
            }
            if (type === "array") {
                var items = subSchema.items;
                subSchema = items ? [items] : [];
                root[seg] = [];
            }
            else {
                subSchema = subSchema.properties;
                root[seg] = {};
            }
            root = root[seg];
            // TODO: This will show you the whole WORLD, whether you want it or not.
            for (var subSegment in subSchema) {
                root[subSegment] = cspace.util.getBeanValue(root, subSegment, subSchema);
            }
        }
        return root;
    };

})(jQuery, fluid);
