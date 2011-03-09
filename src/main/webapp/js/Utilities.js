/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true, window*/
"use strict";

fluid.registerNamespace("cspace.util");

(function ($, fluid) {
    fluid.log("Utilities.js loaded");
    
    fluid.setLogging(true);
    
    // Calls to this should cease to appear in application code
    cspace.util.useLocalData = function () {
        return document.location.protocol === "file:";
    };
    
    if (cspace.util.useLocalData()) {
        fluid.staticEnvironment.cspaceEnvironment = fluid.typeTag("cspace.localData");
    }

    // Attach a 'live' handler to the keydown event on all selects
    // Prevents this upsetting and undesirable behaviour (CSPACE-2840)
    // Note: this is not a utility but rather gets run when this file loads 
    //       - we might consider moving it to a framework file if we create one.
    $("select").live("keydown", function (event) {
        if (event.keyCode === $.ui.keyCode.BACKSPACE) {
            return false;
        }
    });
    
    cspace.recordTypeManager = function (options) {
        var that = fluid.initLittleComponent("cspace.recordTypeManager", options);
        that.recordTypesForCategory = function (category) {
            var classEntry = that.options.recordTypes[category];
            return classEntry ? classEntry : [category];
        };
        return that;
    };
    
    fluid.defaults("cspace.recordTypeManager", {
        recordTypes: "{recordTypes}"
    });

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

    cspace.resourceSpecExpander = function (options) {
        return {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.specBuilder",
                args: {
                    forceCache: true,
                    fetchClass: options.fetchClass,
                    url: options.url
                }
            }
        };
    };
    
    fluid.defaults("cspace.specBuilderImpl", {
        urlRenderer: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }  
    });

    cspace.specBuilderImpl = function (options) {
        // build a false "component" just to get easy access to options merging
        var that = fluid.initLittleComponent("cspace.specBuilderImpl", options);
        if (that.options.urlPrefix) {
            that.options.spec.url = that.options.urlPrefix + that.options.spec.url;
        }
        else if (that.options.urlRenderer) {
            that.options.spec.url = that.options.urlRenderer(that.options.spec.url);
        }
        return that.options.spec;
    };

    cspace.specBuilder = function (options) {
        return fluid.invoke("cspace.specBuilderImpl", {spec: options});
    };
    
    // a convenience wrapper for specBuilderImpl that lets us pass the URL as a simple string
    cspace.simpleSpecBuilder = function (urlStub) {
        return fluid.invoke("cspace.specBuilderImpl", {url: urlStub});
    };
    
    fluid.demands("cspace.urlExpander", "cspace.localData", {
        args: {
            vars: {
                chain: ".."
            }
        }
    });
    
    cspace.urlExpander = function (options) {
        var that = fluid.initLittleComponent("cspace.urlExpander", options);
        return function (url) {
            return fluid.stringTemplate(url, that.options.vars);
        };
    };
    
    fluid.defaults("cspace.urlExpander", {
        vars: {
            chain: "../../chain",
            webapp: "..",
            test: "../../../test"
        }
    });
    
    cspace.util.urlBuilder = function (url, options) {
        var that = fluid.initLittleComponent("cspace.util.urlBuilder", options);
        if (typeof url === "strings") {
            return that.options.urlExpander(url);
        } 
        fluid.each(url, function (thisUrl, key) {
            url[key] = that.options.urlExpander(thisUrl);
        });
        return url;
    };
    
    fluid.defaults("cspace.util.urlBuilder", {
        urlExpander: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }
    });
    
    cspace.componentUrlBuilder = function (urls) {
        return {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.urlBuilder",
                args: urls
            }
        };
    };
    
    /** Resolution of the global message bundle(s) */
        
    cspace.globalBundle = function (options) {
        var that = fluid.initLittleComponent("cspace.globalBundle", options);
        // assuming correct environment, this I/O will resolve synchronously from the cache
        fluid.fetchResources(that.options.resources); 
        fluid.initDependents(that);
        return that.messageResolver;
    };
    
    fluid.defaults("cspace.globalBundle", {
        components: {
            messageResolver: {
                type: "fluid.messageResolver",
                options: {
                    parseFunc: fluid.parseJavaProperties,
                    resolveFunc: fluid.formatMessage,
                    messageBase: "{globalBundle}.options.resources.globalBundle.resourceText"
                }
            }
        },
        resources: {
            globalBundle: cspace.resourceSpecExpander({
                fetchClass: "fastResource",
                url: "%webapp/bundle/core-messages.properties"
            })
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.globalBundle");
    
    /** Convert the global state of using local data into an IoC "type tag" so that
     * decisions based on it can be performed out of line with application code.
     * By use of this "indirect dispatch" all test configuration code may now be
     * bundled in files that are not part of the production image */
  
    var eUC = "encodeURIComponent:";
  
    /** A "Data Source" attached to a URL. Reduces HTTP transport to the simple 
     * "Data Source" API. This should become the only form of AJAX throughout CollectionSpace,
     * with the exception of calls routed through fluid.fetchResources (the two methods may
     * be combined by use of makeAjaxOpts and conversion into a resourceSpec) */   
    // TODO: integrate with Engage conception and knock the rough corners off
    cspace.URLDataSource = function (options) {
        var that = fluid.initLittleComponent(options.targetTypeName, options);
        var wrapper = that.options.delay ? function (func) {
            setTimeout(func, that.options.delay);
        } : function (func) {
            func();
        };

        function resolveUrl(directModel) {
            var expander = fluid.invoke("cspace.urlExpander");
            var map = fluid.copy(that.options.termMap) || {};
            map = fluid.transform(map, function (entry) {
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
            });
            var replaced = fluid.stringTemplate(that.options.url, map);
            replaced = expander(replaced);
            return replaced;
        }
        
        that.makeAjaxOpts = function (model, directModel, callback, type) {
            var togo = {
                type: type,
                url: resolveUrl(directModel),
                contentType: "application/json; charset=UTF-8",
                dataType: "json",
                success: function (data) {
                    if (that.options.responseParser) {
                        data = that.options.responseParser(data, directModel);
                    }
                    callback(data);
                },
                error: function (xhr, textStatus, errorThrown) {
                    fluid.log("Data fetch error for url " + togo.url + " - textStatus: " + textStatus);
                    fluid.log("ErrorThrown: " + errorThrown);
                }                
            };
            if (model) {
                togo.data = JSON.stringify(model);
            }
            return togo;
        };

        that.get = function (directModel, callback) {
            var ajaxOpts = that.makeAjaxOpts(null, directModel, callback, "GET");
            wrapper(function () {
                $.ajax(ajaxOpts);
            });
        };
        if (options.writeable) {
            that.put = function (model, directModel, callback) {
                var ajaxOpts = that.makeAjaxOpts(model, directModel, callback, "POST");
                $.ajax(ajaxOpts);
            }; 
        }
        return that;
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
    
    fluid.demands("cspace.util.getDefaultConfigURL", ["cspace.record", "cspace.localData"], [{
        invokers: {
            getRecordType: {
                funcName: "cspace.util.getDefaultConfigURL.getRecordTypeLocal"
            }
        }
    }]);
    fluid.demands("cspace.util.getDefaultConfigURL", "cspace.localData", fluid.COMPONENT_OPTIONS);
    fluid.demands("cspace.util.getDefaultConfigURL", "cspace.record", fluid.COMPONENT_OPTIONS);
    
    cspace.util.getDefaultConfigURL = function (options) {
        var that = fluid.initLittleComponent("cspace.util.getDefaultConfigURL", options);
        fluid.initDependents(that);
        var url = fluid.stringTemplate(that.options.url, {
            recordType: that.getRecordType()
        });
        return that.options.urlRenderer(url);
    };
    
    cspace.util.getDefaultConfigURL.getRecordTypeLocal = function () {
        return cspace.util.getUrlParameter("recordtype");
    };
    
    cspace.util.getDefaultConfigURL.getRecordType = function () {
        var url = window.location.pathname;
        return url.substring(url.lastIndexOf("/") + 1, url.indexOf(".html"));
    };
    
    fluid.defaults("cspace.util.getDefaultConfigURL", {
        url: "%webapp/config/%recordType.json",
        invokers: {
            getRecordType: {
                funcName: "cspace.util.getDefaultConfigURL.getRecordType"
            }
        },
        urlRenderer: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }
    });
    
    fluid.demands("cspace.util.getLoginURL", "cspace.localData", {
        args: {
            url: "%test/data/login/status.json"
        }
    });
    
    cspace.util.getLoginURL = function (options) {
        var that = fluid.initLittleComponent("cspace.util.getLoginURL", options);
        return that.options.urlRenderer(that.options.url);
    };
    
    fluid.defaults("cspace.util.getLoginURL", {
        url: "%chain/loginstatus",
        urlRenderer: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }
    });
    
    fluid.demands("cspace.util.getDefaultSchemaURL", "cspace.localData", {
        args: ["@0", {
            url: "%test/uischema/%recordType.json"
        }]
    });
    
    cspace.util.getDefaultSchemaURL = function (recordType, options) {
        var that = fluid.initLittleComponent("cspace.util.getDefaultSchemaURL", options);
        var url = fluid.stringTemplate(that.options.url, {
            recordType: recordType
        });
        return that.options.urlRenderer(url);
    };
    
    fluid.defaults("cspace.util.getDefaultSchemaURL", {
        url: "%chain/%recordType/uischema",
        urlRenderer: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }
    });
    
    fluid.demands("cspace.util.getUISpecURL", "cspace.localData", {
        args: ["@0", {
            url: "%test/uispecs/%pageType.json"
        }]
    });
    
    cspace.util.getUISpecURL = function (pageType, options) {
        var that = fluid.initLittleComponent("cspace.util.getUISpecURL", options);
        var url = fluid.stringTemplate(that.options.url, {
            pageType: pageType
        });
        return that.options.urlRenderer(url);
    };
    
    fluid.defaults("cspace.util.getUISpecURL", {
        url: "%chain/%pageType/uispec",
        urlRenderer: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }
    });
    
    cspace.util.fullUrl = function (prefix, templateName) {
        return prefix ? prefix + templateName : templateName;
    };
    
    // TODO: This should be removed as soon as createNew stops using the
    // resolverGetCongig.
    cspace.util.resolvePermissions = function (source, permManager) {
        fluid.remove_if(source, function (sourceItem, key) {
            if (!permManager.resolve(key)) {
                return true;
            }
            if (sourceItem && typeof sourceItem === "object") {
                cspace.util.resolvePermissions(sourceItem, permManager);
            }
            else {
                return !permManager.resolve(sourceItem);
            }
        });
    };
    
    cspace.util.applyClassSelectorOrFail = function (node, selector) {
        if (!selector || !selector.charAt(0) === "." || fluid.SAXStrings.indexOfWhitespace(selector) !== -1) {
            fluid.fail("selector " + selector + " needs to be a pure class-based selector");
        }
        var clazz = selector.substring(1);
        $(node).addClass(clazz);
    };
    
    cspace.util.waitMultiple = function (options) {
        var that = fluid.initLittleComponent("cspace.util.waitMultiple", options);
        that.waitSet = {};
        
        function checkComplete() {
            if (that.options.once && that.fired) {
                return;
            }
            var complete = true;
            for (var key in that.waitSet) {
                if (!that.waitSet[key].complete) {
                    fluid.log("Wait for " + key + " still required");
                    complete = false;
                }
            }
            if (complete) {
                fluid.log("Firing external callback");
                that.fired = true;
                that.options.callback.apply(null, that.options.outerKey && that.waitSet[that.options.outerKey] ? 
                    that.waitSet[that.options.outerKey].args : null);

            }
        } 
        that.getListener = function (key) {
            var keyStruct = {};
            that.waitSet[key] = keyStruct;
            return function () {
                keyStruct.args = fluid.makeArray(arguments);
                keyStruct.complete = true;
                checkComplete();
            };
        };
        that.clear = function (newCallback) {
            for (var key in that.waitSet) {
                fluid.clear(that.waitSet[key]);
            }
            that.fired = false;
            that.options.callback = newCallback;
        };
        return that; 
    };
    
    cspace.util.recordTypeSelector = function (options) {
        var that = fluid.initLittleComponent("cspace.util.recordTypeSelector", options);
        var model = cspace.permissions.getPermissibleRelatedRecords(
                that.options.related, that.options.permissionsResolver, that.options.recordTypeManager, that.options.permission);
        that.model = model;
        
        that.produceComponent = function () {
            var togo = {};
            if (model.length > 0) {
                togo[that.options.componentID] = {
                    selection: model[0], 
                    optionlist: model,
                    optionnames: fluid.transform(model, function (recordType) {
                        return that.options.messageResolver.resolve(recordType);
                    })
                };
            }
            return togo;
        };
                 
        that.returnedOptions = {
            listeners: {
                afterRender: function () {  
                    if (that.model.length < 2) {
                        fluid.enabled(that.options.dom.locate(that.options.selector), false);
                    }
                }
            }
        };
        fluid.log("Record type selector constructed");
        return that;
    };
    
    fluid.defaults("cspace.util.recordTypeSelector", {
        // TODO: These should actually be possible to configure as directly injected
       // components by means of a suitable demands block, in Infusion 1.4
        recordTypeManager: "{recordTypeManager}",
        permissionsResolver: "{permissionsResolver}",
        messageResolver: "{globalBundle}",
        permission: "read"
    });
    
    // This will eventually go away once the getBeanValue strategy is used everywhere.
    cspace.util.getBeanValue = function (root, EL, schema, permManager) {
        if (EL === "" || EL === null || EL === undefined) {
            return root;
        }
        var segs = fluid.model.parseEL(EL);
        for (var i = 0; i < segs.length; ++i) {
            var seg = segs[i];
            if (permManager && !permManager.resolve(seg)) {
                return undefined;
            }
            if (!root[seg] && !schema) {
                return undefined;
            }
            if (root[seg]) {
                root = root[seg];
                continue;
            }
            var subSchema = schema[seg];
            if (!subSchema) {
                return undefined;
            }
            var type = subSchema.type;
            if (!type) {
                // Schema doesn't have a type.
                fluid.fail("Schema for " + seg + "is incorrect: type is missting");
            }
            var defaultValue = subSchema["default"];
            if (typeof defaultValue !== "undefined") {
                if (permManager) {
                    cspace.util.resolvePermissions(defaultValue, permManager);
                }
                root = defaultValue;
                continue;
            }
            if (type === "array") {
                var items = subSchema.items;
                subSchema = items ? [items] : [];
                root[seg] = [];
            }
            else if (type === "object") {
                subSchema = subSchema.properties;
                root[seg] = {};
            }
            else {
                root[seg] = undefined;
            }
            root = root[seg];
            if (!root) {
                return root;
            }
            // TODO: This will show you the whole WORLD, whether you want it or not.
            for (var subSegment in subSchema) {
                root[subSegment] = cspace.util.getBeanValue(root, subSegment, subSchema);
            }
        }
        return root;
    };
    
    cspace.util.schemaStrategy = function (options) {
        return {
            init: function () {
                var that = fluid.initLittleComponent("cspace.util.schemaStrategy", options);
                var schema = that.options.schema;
                return function (root, segment, index) {
                    if (!root[segment] && !schema) {
                        return;
                    }
                    if (root[segment]) {
                        return root[segment];
                    }
                    schema = schema[segment];
                    if (!schema) {
                        return;
                    }
                    var type = schema.type;
                    if (!type) {
                        // Schema doesn't have a type.
                        fluid.fail("Schema for " + segment + "is incorrect: type is missing");
                    }
                    var defaultValue = schema["default"];
                    if (typeof defaultValue !== "undefined") {
                        return defaultValue;
                    }
                    if (type === "array") {
                        var items = schema.items;
                        schema = items ? [items] : [];
                        return [];
                    }
                    else if (type === "object") {
                        schema = schema.properties;
                        return {};
                    }
                    else {
                        return;
                    }
                };
            }
        };
    };
    fluid.defaults("cspace.util.schemaStrategy", {
        mergePolicy: {
            schema: "preserve"
        }
    });
    
    cspace.util.buildUrl = function (operation, baseUrl, recordType, csid, fileExtension) {
        if (operation === "addRelations") {
            return cspace.util.addTrailingSlash(baseUrl) + "relationships/";
        } else {
            return cspace.util.addTrailingSlash(baseUrl) + recordType + "/" + (csid ? csid + fileExtension : "");
        }
    };
    
    cspace.util.invokeWithoutFail = function (toInvoke, args) {
        if (toInvoke) {
            try {
                toInvoke.apply(null, args);
            }
            catch (e) {
                fluid.log("Exception applying callback: " + e);
            }
        }
    };
    
    cspace.util.composeCallbacks = function (first, second) {
        return function () {
            cspace.util.invokeWithoutFail(first, arguments);
            return cspace.util.invokeWithoutFail(second, arguments);
        };
    };
    
    function createMarkup(that) {
        var markup = $(that.options.markup);
        markup.hide();
        markup.addClass(that.options.styles.rootClass);
        that.locate("image", markup).attr("src", that.options.imageUrl);
        that.locate("message", markup).text(that.options.strings.loadingMessage);
        $("body").append(markup);
        return markup;
    }
    
    function updateDimensions(that) {
        var target = that.container[0];
        that.indicator.css({
            left: target.offsetLeft + "px",
            top: (target.offsetTop - that.options.heightExpand) + "px",
            width: target.offsetWidth + "px",
            height: (target.offsetHeight + that.options.heightExpand * 2) + "px" 
        });
    }
    
    var isDecorator = function (source, type) {
        if (!source.decorators || !source.decorators[0]) {
            return false;
        }
        return  source.decorators[0].func && source.decorators[0].func === type;
    };

    cspace.util.urnToStringFieldConverter = function (container, options) {
        var that = fluid.initView("cspace.util.urnToStringFieldConverter", container, options);
        that.container.text(that.options.convert(that.container.text()));
        return that;   
    };
    
    fluid.demands("cspace.util.urnToStringFieldConverter", "cspace.recordEditor", ["@0", fluid.COMPONENT_OPTIONS]);
    
    /*
     * Takes a string in URN format and returns it in Human Readable format
     * @param urn a string in URN format
     * @return the text of the URN format (human readable)
     */
    cspace.util.urnToString = function (urn) {
        if (!urn) {
            return "";
        }
        return decodeURIComponent(urn.slice(urn.indexOf("'") + 1, urn.length - 1)).replace(/\+/g, " ");            
    };
    
    fluid.defaults("cspace.util.urnToStringFieldConverter", {
        convert: cspace.util.urnToString 
    });
    
    /**
     * Used for substituting the text of the continer based on the variables of the options
     * parameter. The options block is expected to hold to arrays: keys and values.
     * The text of the container is looked up in keys and substituted with the 
     * string from the index in options.
     * @param container the container in which to replace text
     * @param options expected to hold to arrays: keys and values. They should be of
     * same length.
     */
    cspace.util.nameForValueFinder = function (container, options) {
        var that = fluid.initView("cspace.util.nameForValueFinder", container, options);
        fluid.initDependents(that);
        that.assignValue();
        return that;
    };
    
    fluid.demands("cspace.util.nameForValueFinder", "cspace.recordEditor", ["@0", fluid.COMPONENT_OPTIONS]);
    
    cspace.util.nameForValueFinder.assignValue = function (selector, options) {
        if (!options.list || !options.names) {
            return;
        }
        var listValue = selector.text();
        if (!listValue) {
            return;
        }
        var index = $.inArray(listValue, options.list);
        if (index < 0) {
            return;
        } 
        selector.text(options.names[index]);
    };
    
    fluid.defaults("cspace.util.nameForValueFinder", {
        invokers: {
            assignValue: {
                funcName: "cspace.util.nameForValueFinder.assignValue",
                args: ["{nameForValueFinder}.container", "{nameForValueFinder}.options"]
            }
        }
    });
    
    /** Function to generate a readonly uispec based on a regular uispec. 
     * @param uispec the uispec to be converted to Read only.
     * @param search if this is defined, each time this string appear in any of the values
     *         of fields, this will be replaced by the value defined in the replace
     *         parameter. This is needed for pathAs in repeatable fields. 
     * @param replace if search is defined, this value will replace the occurences of 
     *        the string defined in search. This is needed for pathAs in repeatable fields. 
     * @return a new uispec modified to be in read only mode.
     */
    var resolveReadOnlyUISpecImpl = function (uispec) {
        var newspec = {};
        fluid.each(uispec, function (val, key) {
            if (!val) {
                return;
            }
            if (typeof val === "string") {
                newspec[key] = val;
            }
            else if (val.messagekey) {
                newspec[key] = val;
            }
            else if (val.selection) { 
                newspec[key] = {
                    value: val.selection,
                    decorators: [{
                        func: "cspace.util.nameForValueFinder",
                        type: "fluid",
                        options: {
                            list: val.optionlist,
                            names: val.optionnames
                        }
                    }]
                };
            }
            else if (isDecorator(val, "cspace.autocomplete")) {
                newspec[key] = {
                    value: val.value,
                    decorators: [{
                        func: "cspace.util.urnToStringFieldConverter",
                        type: "fluid"   
                    }]
                };                
            } 
            else if (isDecorator(val, "cspace.makeRepeatable")) {
                var decorator = val.decorators[0];
                var opts = decorator.options;               
                newspec[key] = {
                    decorators: [{
                        func: decorator.func,
                        type: decorator.type,
                        options: {
                            elPath: opts.elPath,
                            protoTree: {
                                expander: {
                                    tree: {
                                        expander: {
                                            repeatID: opts.protoTree.expander.tree.expander.repeatID,
                                            tree: resolveReadOnlyUISpecImpl(opts.protoTree.expander.tree.expander.tree),
                                            type: opts.protoTree.expander.tree.expander.type,
                                            pathAs: opts.protoTree.expander.tree.expander.pathAs,
                                            controlledBy: opts.protoTree.expander.tree.expander.controlledBy 
                                        }
                                    },
                                    type: opts.protoTree.expander.type
                                }
                            }
                        }
                    }]
                };
            }
        });  
        return newspec;   
    };
    
    /** Function to return an apropriate uispec, based on the two parameters.
     * If the readOnly parameter is set to true, a call to UISpecToReadOnlyImpl is 
     * made. This will modify the uispec to be a read only version of the 
     * generate a readonly uispec based on the passed uispec. If readOnly is false,
     * the uispec will be returned unmodified.
     * @param uispec the uispec that potentially should be converted to Read only.
     * @param readOnly flag telling whether the uispec should be modified to readonly
     * @return unmodified uispec if readOnly is false. Else the uispec modified to read only
     */
    cspace.util.resolveReadOnlyUISpec = function (uispec, readOnly) {
        return readOnly ? resolveReadOnlyUISpecImpl(uispec) : uispec;
    };
        
    cspace.util.globalLoadingIndicator = function (container, options) {
        var that = fluid.initView("cspace.util.globalLoadingIndicator", container, options);
        that.indicator = createMarkup(that);
        that.show = function () {
            that.indicator.show();
            that.update();
        };
        
        that.update = function () {
            updateDimensions(that);
        };
        
        that.hide = function () {
            that.indicator.hide();
        };
        
        return that;  
    };
    
    fluid.defaults("cspace.util.globalLoadingIndicator", {
        imageUrl: "../images/indeterminateProgressSpinner_92x92_blackonwhite.gif",
        selectors: {
            image: "img",
            message: "span"  
        },
        styles: {
            rootClass: "cs-loading-root"
        },
        strings: {
            loadingMessage: "Loading..."          
        },
        heightExpand: 5,
        markup: "<div><div class=\"cs-loading-centre\"><span>Message here</span><br/><img src=\"#\"/></div></div>"
    });
    
    cspace.util.globalLoadingAssociator = function (options) {
        var that = fluid.initLittleComponent("cspace.util.globalLoadingAssociator", options);
        var indicator = cspace.util.globalLoadingIndicator(that.options.indicatorTarget, that.options.indicatorOptions);
        that.supplySpecs = function (resourceSpecs) {
            var mainWait = that.options.mainWaitSpec;
            if (!mainWait) {
                indicator.show();
            }
            fluid.each(resourceSpecs, function (spec, key) {
                spec.options.success = cspace.util.composeCallbacks(spec.options.success, key === mainWait ? indicator.show : indicator.update);
            });
            if (!resourceSpecs[mainWait]) {
                indicator.show();
            }
        };
        that.wrapCallback = function (callback) {
            return cspace.util.composeCallbacks(
                indicator.hide, callback
                );
        };
        return that;     
    };

    fluid.defaults("cspace.util.globalLoadingAssociator", {
        indicatorTarget: "#all-content",
        mainWaitSpec: "recordEditor",
        indicatorOptions: {}
    });
    
    cspace.util.refreshComponents = function (that) {
        fluid.each(that.options.components, function (component, name) {
            var subComponent = that[name];
            if (subComponent.refreshView) {
                subComponent.refreshView();
            }
        });
    };
    
    cspace.util.modelBuilder = function (options) {
        var records = cspace.permissions.getPermissibleRelatedRecords(options.related, options.resolver, options.recordTypeManager, options.permission);
        return fluid.invokeGlobalFunction(options.callback, [options, records]);
    };
    
    cspace.util.modelBuilder.fixupModel = function (model) {
        fluid.remove_if(model.categories, function (category) {
            return category === undefined;
        });
    };
    
    cspace.util.globalNavigator = function (options) {
        var that = fluid.initView("cspace.util.globalNavigator", "body", options);
        fluid.initDependents(that);
        that.bindEvents();
        return that;
    };
    
    cspace.util.globalNavigator.bindEvents = function (that) {
        that.container.delegate(that.options.selectors.include, "click", function () {
            var target = $(this);
            if (target.is(that.options.selectors.exclude)) {
                return;
            }
            that.events.onPerformNavigation.fire(function () {
                window.location = target.attr("href");
            });
            return false;
        });
        that.container.delegate(that.options.selectors.forms, "submit", function () {
            var form = $(this);
            that.events.onPerformNavigation.fire(function () {
                form[0].submit();
            });
            return false;
        });
        that.events.onPerformNavigation.addListener(function (callback) {
            callback();
        }, "onPerformNavigationFinal", undefined, "last");
    };
    
    fluid.defaults("cspace.util.globalNavigator", {
        selectors: {
            include: "a",
            exclude: "[href*=#], .csc-confirmation-exclusion, .ui-autocomplete a",
            forms: ".csc-header-logout-form"
        },
        invokers: {
            bindEvents: {
                funcName: "cspace.util.globalNavigator.bindEvents",
                args: ["{globalNavigator}"]
            }
        },
        events: {
            onPerformNavigation: "preventable"
        }
    });
    
    cspace.globalSetup = function (tag, options) {
        var that = fluid.initLittleComponent("cspace.globalSetup");
        fluid.staticEnvironment.cspacePage = fluid.typeTag(tag);
        fluid.initDependents(that);
        that.init = function (tag, options) {
            options = options || {};
            if (tag) {
                fluid.staticEnvironment.cspacePage = fluid.typeTag(tag);
            }
            fluid.fetchResources({
                config: {
                    href: options.configURL || fluid.invoke("cspace.util.getDefaultConfigURL"),
                    options: {
                        dataType: "json"
                    }
                },
                loginstatus: {
                    href: fluid.invoke("cspace.util.getLoginURL"),
                    options: {
                        dataType: "json",
                        success: function (data) {
                            if (!data.login && !that.noLogin) {
                                var currentUrl = document.location.href;
                                var loginUrl = currentUrl.substr(0, currentUrl.lastIndexOf('/'));
                                window.location = loginUrl;
                            }
                        },
                        fail: function () {
                            fluid.fail("PageBuilder was not able to retrieve login info and permissions, so failing");
                        }
                    }
                }
            }, function (resourceSpecs) {
                options = fluid.merge({"pageBuilder.options.model": "preserve", "pageBuilder.options.applier": "nomerge"}, {
                    pageBuilder: {
                        options: {
                            userLogin: resourceSpecs.loginstatus.resourceText
                        }
                    }, 
                    pageBuilderIO: {
                        options: {}
                    }}, resourceSpecs.config.resourceText, options
                );
                if (that.pageBuilderIO) {
                    that.instantiator.clearComponent(that, "pageBuilderIO");
                }
                that.options.components.pageBuilderIO = {
                    type: "cspace.pageBuilderIO",
                    options: options.pageBuilderIO.options
                };
                fluid.initDependent(that, "pageBuilderIO", that.instantiator);
                that.pageBuilderIO.initPageBuilder(options.pageBuilder.options);
            });
        };
        that.init(null, options);
        return that;
    };
    
    cspace.globalSetup.noLogin = function (options) {
        var that = fluid.initLittleComponent("cspace.globalSetup.noLogin", options);
        return that.options.noLogin;
    };
    fluid.demands("noLogin", "cspace.login", [{
        noLogin: true
    }]);
    
    fluid.defaults("cspace.globalSetup", {
        components: {
            instantiator: "{instantiator}",
            globalNavigator: {
                type: "cspace.util.globalNavigator"
            },
            messageBar: {
                type: "cspace.messageBar"
            },
            noLogin: {
                type: "cspace.globalSetup.noLogin"
            }
        }
    });
    
    cspace.recordTypes = function (options) {
        var that = fluid.littleComponent("cspace.recordTypes")(options);
        that.setup();
        return that;
    };
    
    cspace.recordTypes.setup = function (that) {
        that.config = {
            strategies: [that.options.strategy(that.options)]
        };
        that.all = that.getRecordTypes("recordlist");
        that.procedures = that.getRecordTypes("recordtypes.procedures");
        that.vocabularies = that.getRecordTypes("recordtypes.vocabularies");
        that.cataloging = that.getRecordTypes("recordtypes.cataloging");
        that.nonVocabularies = that.cataloging.concat(that.procedures);
    };
    
    fluid.defaults("cspace.recordTypes", {
        mergePolicy: {
            schema: "preserve",
            model: "preserve"
        },
        invokers: {
            setup: {
                funcName: "cspace.recordTypes.setup",
                args: "{recordTypes}"
            },
            getRecordTypes: {
                funcName: "fluid.get",
                args: ["{recordTypes}.options.model", "@0", "{recordTypes}.config"]
            }
        },
        model: {},
        strategy: cspace.util.schemaStrategy
    });
    
    cspace.util.togglable = function (container, options) {
        var that = fluid.initView("cspace.util.togglable", container, options);
        
        that.locate("header").addClass(that.options.styles[that.options["default"]])
            .addClass(that.options.styles.header);
        that.container.delegate(that.options.selectors.header, "click", function () {
            var source = $(this);
            source.next(that.options.selectors.togglable).toggle();
            source.toggleClass(that.options.styles.expanded);
            source.toggleClass(that.options.styles.collapsed);
            return false;
        });
        
        return that;
    };
    fluid.defaults("cspace.util.togglable", {
        selectors: {
            header: ".csc-togglable-header",
            togglable: ".csc-togglable-togglable"
        },
        styles: {
            expanded: "cs-togglable-expanded",
            collapsed: "cs-togglable-collapsed",
            header: "cs-togglable-header"
        },
        "default": "expanded"
    });
    
    cspace.util.keyCode = function (evt) {
        return evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0);          
    };
    
    cspace.util.login = function (options) {
        return fluid.initLittleComponent("cspace.util.login", options);
    };
    
    // TODO: This should be done by the renderer.
    cspace.util.removeRendererDecorators = function (that) {
        fluid.each(that, function (component, name) {
            if (name.indexOf("**") > -1) {
                that.options.rendererOptions.instantiator.clearComponent(that, name);
            }
        });
    };
    
})(jQuery, fluid);
