/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true, window*/

fluid.registerNamespace("cspace.util");

(function ($, fluid) {
    "use strict";

    fluid.log("Utilities.js loaded");

    // Calls to this should cease to appear in application code
    cspace.util.useLocalData = function () {
        return document.location.protocol === "file:";
    };

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
            return classEntry || [category];
        };
        return that;
    };

    fluid.defaults("cspace.recordTypeManager", {
        gradeNames: ["fluid.littleComponent"],
        mergePolicy: {
            recordTypes: "nomerge"
        },
        recordTypes: "{recordTypes}"
    });

    cspace.util.addTrailingSlash = function (url) {
        return url + ((url.charAt(url.length - 1) !== "/") ? "/" : "");
    };

    cspace.util.extractTenant = function () {
        var that = fluid.initLittleComponent("cspace.util.extractTenant");
        var pathSegs = window.location.href.split("/");
        return fluid.find(pathSegs, function (seg, index) {
            if (seg === that.options.segment.options.path) {
                return pathSegs[index + 1];
            }
        });
    };
    fluid.defaults("cspace.util.extractTenant", {
        segment: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.extractTenant.segment"
            }
        }
    });
    fluid.defaults("cspace.util.extractTenant.segment", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        path: "ui"
    });

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
                    url: options.url,
                    options: options.options
                }
            }
        };
    };

    fluid.defaults("cspace.specBuilderImpl", {
        gradeNames: ["fluid.littleComponent"],
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
        } else if (that.options.urlRenderer) {
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

    cspace.urlExpander = function (options) {
        var that = fluid.initLittleComponent("cspace.urlExpander", options);
        return function (url) {
            return fluid.stringTemplate(url, that.options.vars);
        };
    };

    fluid.defaults("cspace.urlExpander", {
        gradeNames: ["fluid.littleComponent"],
        vars: {
            tenant: "../../../tenant",
            tname: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.extractTenant"
                }
            },
            chain: "../../../chain",
            webapp: "..",
            test: "../../../../test"
        }
    });

    cspace.util.urlBuilder = function (url, options) {
        var that = fluid.initLittleComponent("cspace.util.urlBuilder", options);
        if (typeof url === "string") {
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

    cspace.util.lookupMessage = function (messageBase, key) {
        return messageBase[key] || fluid.stringTemplate("[String for key: %key is missing. Please, add it to messageBundle.]", {key: key});
    };

    cspace.util.stringBuilder = function (strings, options) {
        var that = fluid.initLittleComponent("cspace.util.stringBuilder", options);
        if (typeof strings === "string") {
            return fluid.stringTemplate(strings, that.options.vars);
        }
        fluid.each(strings, function (string, key) {
            strings[key] = fluid.stringTemplate(string, that.options.vars);
        });
        return strings;
    };

    cspace.componentStringBuilder = function (strings, options) {
        return {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.stringBuilder",
                args: [strings, options]
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
        gradeNames: ["fluid.littleComponent"],
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
                url: "%webapp/bundle/core-messages.properties",
                options: {
                    dataType: "text"
                }
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
        var that = fluid.initLittleComponent(options.value.targetTypeName, options);
        var wrapper = that.options.delay ? function (func) {
            setTimeout(func, that.options.delay);
        } : function (func) {
            func();
        };

        that.resolveUrl = function (directModel) {
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
        };

        that.makeAjaxOpts = function (model, directModel, callback, type, errorCallback) {
            var togo = {
                type: type,
                url: that.resolveUrl(directModel),
                contentType: "application/json; charset=UTF-8",
                dataType: "json",
                success: function (data) {
                    var responseParser = that.options.responseParser;
                    if (responseParser) {
                        data = typeof responseParser === "string" ?
                                fluid.invokeGlobalFunction(responseParser, [data, directModel]) :
                                responseParser(data, directModel);
                    }
                    callback(data);
                },
                error: function (xhr, textStatus, errorThrown) {
                    fluid.log("Data fetch error for url " + togo.url + " - textStatus: " + textStatus);
                    fluid.log("ErrorThrown: " + errorThrown);
                    if (errorCallback) {
                        errorCallback(xhr, textStatus, errorThrown);
                    }
                }
            };
            if (model) {
                togo.data = JSON.stringify(model);
            }
            return togo;
        };

        that.get = function (directModel, callback, errorCallback) {
            var ajaxOpts = that.makeAjaxOpts(null, directModel, callback, "GET", errorCallback);
            wrapper(function () {
                $.ajax(ajaxOpts);
            });
        };
        if (that.options.writeable) {
            that.put = function (model, directModel, callback, errorCallback) {
                var ajaxOpts = that.makeAjaxOpts(model, directModel, callback, "POST", errorCallback);
                $.ajax(ajaxOpts);
            };
        }
        return that;
    };
    
    cspace.util.provideErrorCallback = function (that, url, message) {
        var lookup = that.lookupMessage || that.options.parentBundle.resolve;
        return function (xhr, textStatus, errorThrown) {
            that.displayErrorMessage(fluid.stringTemplate(lookup(message), {
                url: url,
                status: textStatus
            }));
        };
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

    cspace.util.getDefaultConfigURL = function (options) {
        var that = fluid.initLittleComponent("cspace.util.getDefaultConfigURL", options);
        fluid.initDependents(that);
        var url = fluid.stringTemplate(that.options.url, {
            recordType: that.getRecordType()
        });
        return that.options.urlRenderer(url);
    };

    cspace.util.getDefaultConfigURL.getRecordTypeLocal = function () {
        var url = cspace.util.getDefaultConfigURL.getRecordType();
        if (url === "record") {
            return cspace.util.getUrlParameter("recordtype");
        }
        return url;
    };

    cspace.util.getDefaultConfigURL.getRecordType = function () {
        var url = window.location.pathname;
        return url.substring(url.lastIndexOf("/") + 1, url.indexOf(".html"));
    };

    fluid.defaults("cspace.util.getDefaultConfigURL", {
        gradeNames: ["fluid.littleComponent"],
        url: "%webapp/config/%recordType.json",
        invokers: {
            getRecordType: "getRecordType"
        },
        urlRenderer: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }
    });

    cspace.util.getLoginURL = function (options) {
        var that = fluid.initLittleComponent("cspace.util.getLoginURL", options);
        return that.options.urlRenderer(that.options.url);
    };

    fluid.defaults("cspace.util.getLoginURL", {
        gradeNames: ["fluid.littleComponent"],
        url: "%tenant/%tname/loginstatus",
        urlRenderer: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }
    });

    cspace.util.getDefaultSchemaURL = function (recordType, options) {
        var that = fluid.initLittleComponent("cspace.util.getDefaultSchemaURL", options);
        var url = fluid.stringTemplate(that.options.url, {
            recordType: recordType
        });
        return that.options.urlRenderer(url);
    };

    fluid.defaults("cspace.util.getDefaultSchemaURL", {
        url: "%tenant/%tname/%recordType/uischema",
        urlRenderer: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.urlExpander"
            }
        }
    });

    cspace.util.getUISpecURL = function (pageType, options) {
        var that = fluid.initLittleComponent("cspace.util.getUISpecURL", options);
        var url = fluid.stringTemplate(that.options.url, {
            pageType: pageType
        });
        return that.options.urlRenderer(url);
    };

    fluid.defaults("cspace.util.getUISpecURL", {
        url: "%tenant/%tname/%pageType/uispec",
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
            } else {
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
            var complete = true, key;
            for (key in that.waitSet) {
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
            var key;
            for (key in that.waitSet) {
                fluid.clear(that.waitSet[key]);
            }
            that.fired = false;
            that.options.callback = newCallback;
        };
        return that;
    };

    cspace.util.recordTypeSelector = function (options) {
        var that = fluid.initLittleComponent("cspace.util.recordTypeSelector", options);
        fluid.initDependents(that);
        var model = cspace.permissions.getPermissibleRelatedRecords(that.options.related, that.permissionsResolver, that.recordTypeManager, that.options.permission);
        that.model = model;
        that.produceComponent = function () {
            var togo = {};
            if (model.length > 0) {
                togo[that.options.componentID] = {
                    selection: model[0],
                    optionlist: model,
                    optionnames: fluid.transform(model, function (recordType) {
                        return that.messageResolver.resolve(recordType);
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
        gradeNames: ["fluid.littleComponent"],
        components: {
            recordTypeManager: "{recordTypeManager}",
            permissionsResolver: "{permissionsResolver}",
            messageResolver: "{globalBundle}"
        },
        permission: "read"
    });

    // This will eventually go away once the getBeanValue strategy is used everywhere.
    cspace.util.getBeanValue = function (root, EL, schema, permManager) {
        if (EL === "" || EL === null || EL === undefined) {
            return root;
        }
        var segs = fluid.model.parseEL(EL);
        var i = 0;
        for (i; i < segs.length; ++i) {
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
            } else if (type === "object") {
                subSchema = subSchema.properties;
                root[seg] = {};
            } else {
                root[seg] = undefined;
            }
            root = root[seg];
            if (!root) {
                return root;
            }
            // TODO: This will show you the whole WORLD, whether you want it or not.
            var subSegment;
            for (subSegment in subSchema) {
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
                return function (root, segment) {
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
                    } else if (type === "object") {
                        schema = schema.properties;
                        return {};
                    } else {
                        return;
                    }
                };
            }
        };
    };
    fluid.defaults("cspace.util.schemaStrategy", {
        gradeNames: "fluid.littleComponent",
        mergePolicy: {
            schema: "nomerge"
        }
    });

    cspace.util.buildUrl = function (operation, baseUrl, recordType, csid, fileExtension) {
        if (operation === "addRelations") {
            return cspace.util.addTrailingSlash(baseUrl) + "relationships/";
        } else if (operation === "removeRelations") {
            return cspace.util.addTrailingSlash(baseUrl) + "relationships/0";
        } else {
            return cspace.util.addTrailingSlash(baseUrl) + recordType + "/" + (csid ? csid + fileExtension : "");
        }
    };

    cspace.util.invokeWithoutFail = function (toInvoke, args) {
        if (toInvoke) {
            try {
                toInvoke.apply(null, args);
            } catch (e) {
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

    var isDecorator = function (source, type) {
        var decorator = fluid.makeArray(source.decorators)[0];
        if (!decorator) {
            return false;
        }
        if (decorator.func) {
            return decorator.func === type;
        }
        return decorator.type === type;
    };

    cspace.util.urnToStringFieldConverter = function (container, options) {
        var that = fluid.initView("cspace.util.urnToStringFieldConverter", container, options);
        var func = that.container.val() ? "val" : "text";
        that.container[func](that.options.convert(that.container[func]()));
        that.container.prop("disabled", true);
        return that;
    };

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
        gradeNames: ["fluid.viewComponent"],
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
        selector.prop("disabled", true);
    };

    fluid.defaults("cspace.util.nameForValueFinder", {
        gradeNames: ["fluid.viewComponent"],
        invokers: {
            assignValue: {
                funcName: "cspace.util.nameForValueFinder.assignValue",
                args: ["{nameForValueFinder}.container", "{nameForValueFinder}.options"]
            }
        }
    });

    fluid.defaults("cspace.util.loadingIndicator", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: "cspace.util.loadingIndicator.preInitFunction",
        postInitFunction: "cspace.util.loadingIndicator.postInitFunction",
        styles: {
            loading: "cs-loading-indicator",
            contain: "cs-loading-contain"
        },
        showOn: null,
        hideOn: null,
        events: {
            showOn: null,
            hideOn: null
        },
        spinnerDimensions: {
            height: 92,
            width: 92
        },
        loadOnInit: false
    });

    cspace.util.loadingIndicator.postInitFunction = function (that) {

        fluid.each(fluid.makeArray(that.options.showOn), function (event) {
            event.addListener(that.show, undefined, undefined, "first");
        });
        
        fluid.each(fluid.makeArray(that.options.hideOn), function (event) {
            event.addListener(that.hide, undefined, undefined, "last");
        });

        that.indicator = $("<div/>");
        that.indicator.hide();
        that.indicator.addClass(that.options.styles.loading);
        $(document.body).append(that.indicator);

        if (that.options.loadOnInit) {
            that.show();
        }
    };

    cspace.util.loadingIndicator.preInitFunction = function (that) {
        that.show = function () {
            that.indicator.show();
        };
        that.hide = function () {
            that.indicator.hide();
        };
        that.options.listeners = {
            showOn: {
                listener: that.show,
                priority: "first"
            },
            hideOn: {
                listener: that.hide,
                priority: "last"
            }
        };
    };

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
        that.container.delegate(that.options.selectors.include, "click", function (evt) {
            // IF shift or ctrl is pressed - not a navigation away so no need to fire onPerformNavigation
            if (evt.shiftKey || evt.ctrlKey || evt.metaKey) {
                return;
            }
            var target = $(this);
            if (target.is(that.options.selectors.exclude)) {
                return;
            }
            that.events.onPerformNavigation.fire(function () {
                // NOTE: dispatchEvent has proven to be extremely unreliable in cross
                // browser testing. Thus we resolve to more straitforward redirect. 
                window.location.href = target.attr("href");
            });
            return false;
        });
        that.container.delegate(that.options.selectors.forms, "submit", function () {
            var target = $(this);
            that.events.onPerformNavigation.fire(function () {
                target[0].submit();
            });
            return false;
        });
        that.events.onPerformNavigation.addListener(function (callback) {
            callback();
        }, "onPerformNavigationFinal", undefined, "last");
    };

    fluid.defaults("cspace.util.globalNavigator", {
        gradeNames: ["fluid.viewComponent"],
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
        fluid.instantiateFirers(that, that.options);
        that.options.components.noLogin.options = {
            tag: tag
        };
        fluid.initDependents(that);
        that.init = function (tag, options) {
            options = options || {};
            that.events.onFetch.fire();
            fluid.fetchResources({
                config: {
                    href: options.configURL || fluid.invoke("cspace.util.getDefaultConfigURL"),
                    options: {
                        dataType: "json",
                        error: function (xhr, textStatus, errorThrown) {
                            that.displayErrorMessage("Error fetching config file: " + textStatus);
                        }
                    }
                },
                loginstatus: {
                    href: fluid.invoke("cspace.util.getLoginURL"),
                    options: {
                        dataType: "json",
                        success: function (data) {
                            if (data.isError === true) {
                                fluid.each(data.messages, function (message) {
                                    that.displayErrorMessage(message);
                                });
                                return;
                            }
                            if (!data.login && !that.noLogin) {
                                var currentUrl = document.location.href;
                                var loginUrl = currentUrl.substr(0, currentUrl.lastIndexOf('/'));
                                window.location = loginUrl;
                            }
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            that.displayErrorMessage("PageBuilder was not able to retrieve login information and user permissions: " + textStatus);
                        }
                    }
                }
            }, function (resourceSpecs) {
                if (!that.globalBundle || !that.messageBar) {
                    that.events.afterFetch.fire();
                }
                options = fluid.merge({
                    "pageBuilder.options.model": "preserve", 
                    "pageBuilder.options.applier": "nomerge",
                    "pageBuilder.options.userLogin": "nomerge"
                }, {
                    pageBuilder: {
                        options: {
                            userLogin: resourceSpecs.loginstatus.resourceText
                        }
                    },
                    pageBuilderIO: {
                        options: {
                            pageCategory: tag
                        }
                    }
                }, resourceSpecs.config.resourceText, options);
                var newPageBuilderIOName = "pageBuilderIO-" + fluid.allocateGuid();
                that.options.components[newPageBuilderIOName] = {
                    type: "cspace.pageBuilderIO",
                    options: options.pageBuilderIO.options
                };
                fluid.initDependent(that, newPageBuilderIOName, that.instantiator);
                that[newPageBuilderIOName].initPageBuilder(options.pageBuilder.options);
            }, {amalgamateClasses: that.options.amalgamateClasses});
        };
        that.init(tag, options);
        return that;
    };

    cspace.globalSetup.noLogin = function (options) {
        var that = fluid.initLittleComponent("cspace.globalSetup.noLogin", options);
        return that.options.tag === "cspace.login";
    };

    fluid.defaults("cspace.globalSetup", {
        gradeNames: ["fluid.eventedComponent"],
        events: {
            onFetch: null,
            pageReady: null,
            onError: null,
            afterFetch: null
        },
        amalgamateClasses: [
            "fastTemplate",
            "fastResource"
        ],
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage"
        },
        components: {
            instantiator: "{instantiator}",
            globalBundle: {
                type: "cspace.globalBundle",
                createOnEvent: "afterFetch",
                priority: "first"
            },
            globalNavigator: {
                type: "cspace.util.globalNavigator"
            },
            noLogin: {
                type: "cspace.globalSetup.noLogin"
            },
            messageBar: {
                type: "cspace.messageBar",
                createOnEvent: "afterFetch"
            },
            loadingIndicator: {
                type: "cspace.util.loadingIndicator",
                options: {
                	loadOnInit: true,
                    hideOn: [
                        "{globalSetup}.events.onError"
                    ],
                    showOn: [
                    	"{globalSetup}.events.onFetch"
                    ]
                }
            }
        }
    });
    
    cspace.util.displayErrorMessage = function (messageBar, message, loadingIndicator) {
        if (loadingIndicator) {
            loadingIndicator.hide();
        }
        messageBar.show(message, Date(), true);
    };
    
    fluid.defaults("cspace.namespaces", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        mergePolicy: {
            schema: "nomerge"
        },
        strategy: cspace.util.schemaStrategy,
        postInitFunction: "cspace.namespaces.postInit",
        invokers: {
            isNamespace: {
                funcName: "cspace.namespaces.isNamespace",
                args: ["{namespaces}.namespaces", "{arguments}.0"]
            }
        }
    });
    cspace.namespaces.postInit = function (that) {
        that.namespaces = fluid.get(that.model, fluid.model.composeSegments("namespaces", that.options.recordType), {
            strategies: [that.options.strategy({
                schema: that.options.schema
            })]
        });
    };
    cspace.namespaces.isNamespace = function (namespaces, namespace) {
        if (!namespaces) {
            return false;
        }
        return $.inArray(namespace, namespaces) > -1;
    };

    cspace.recordTypes = function (options) {
        var that = fluid.initLittleComponent("cspace.recordTypes", options);
        fluid.initDependents(that);
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
        that.administration = that.getRecordTypes("recordtypes.administration");
        that.nonVocabularies = that.cataloging.concat(that.procedures);
    };

    fluid.defaults("cspace.recordTypes", {
        gradeNames: ["fluid.littleComponent"],
        mergePolicy: {
            schema: "nomerge",
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
            .addClass(that.options.styles.header).fluid("tabbable");

        that.getNext = function (source) {
            var next = source.next(that.options.selectors.togglable);
            if (next.length > 0) {
                return next;
            }
            // Assume that the source is last in the block.
            return source.parent().next(that.options.selectors.togglable);
        };

        var toggle = function (source) {
            that.getNext(source).toggle();
            source.toggleClass(that.options.styles.expanded);
            source.toggleClass(that.options.styles.collapsed);
            return false;
        };

        // Need clean listners to cover the case when the markup was rendered.
        // Listeners from wiped markup retain and thus double.
        that.container.undelegate(that.options.selectors.header, "keyup");
        that.container.undelegate(that.options.selectors.header, "click");
        // Using fluid.activatable didn't work + need to delegate since the
        // markup can get re-rendered.
        that.container.delegate(that.options.selectors.header, "keyup", function (event) {
            var key = cspace.util.keyCode(event);
            if (key !== $.ui.keyCode.ENTER && key !== $.ui.keyCode.SPACE) {
                return;
            }
            return toggle($(this));
        });

        that.container.delegate(that.options.selectors.header, "click", function () {
            return toggle($(this));
        });

        return that;
    };
    fluid.defaults("cspace.util.togglable", {
        gradeNames: ["fluid.viewComponent"],
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
        return evt.keyCode || evt.which || 0;
    };

    cspace.util.login = function (options) {
        return fluid.initLittleComponent("cspace.util.login", options);
    };
    fluid.defaults("cspace.util.login", {
        gradeNames: ["fluid.littleComponent"]
    });

    fluid.defaults("cspace.util.relationResolver", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        invokers: {
            isPrimary: {
                funcName: "cspace.util.relationResolver.isPrimary",
                args: ["{relationResolver}.model", "{arguments}.0"]
            },
            isRelated: {
                funcName: "cspace.util.relationResolver.isRelated",
                args: ["{relationResolver}.model", "{arguments}.0", "{arguments}.1"]
            }
        }
    });
    cspace.util.relationResolver.isPrimary = function (model, csid) {
        return model.csid === csid;
    };
    cspace.util.relationResolver.isRelated = function (model, recordtype, csid) {
        if (!model.relations[recordtype]) {
            return false;
        }
        return fluid.find(model.relations[recordtype], function (related) {
            if (related.csid === csid) {
                return true;
            }
        }) || false;
    };

    cspace.pageCategory = function (options) {
        var that = fluid.initLittleComponent("cspace.pageCategory", options);
        return fluid.typeTag(that.options.pageCategory);
    };
    fluid.defaults("cspace.pageCategory", {
        gradeNames: "fluid.littleComponent"
    });

    cspace.util.isLocalStorage = function () {
        try {
            return "localStorage" in window && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    };
    fluid.defaults("cspace.util.localStorageDataSource", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        preInitFunction: "cspace.util.localStorageDataSource.preInitFunction",
        invokers: {
            get: {
                funcName: "cspace.util.localStorageDataSource.get",
                args: ["{localStorageDataSource}.resolveElPath", "{arguments}.0"]
            },
            set: {
                funcName: "cspace.util.localStorageDataSource.set",
                args: ["{localStorageDataSource}.resolveElPath", "{arguments}.0", "{arguments}.1"]
            },
            resolveElPath: {
                funcName: "cspace.util.localStorageDataSource.resolveElPath",
                args: ["{localStorageDataSource}.options.elPath", "{localStorageDataSource}.options.termMap", "{arguments}.0"]
            }
        },
        elPath: "",
        termMap: {}
    });
    cspace.util.localStorageDataSource.get = function (resolveElPath, directModel) {
        var value = localStorage[resolveElPath(directModel)];
        if (!value) {
            return;
        }
        return JSON.parse(value);
    };
    cspace.util.localStorageDataSource.set = function (resolveElPath, model, directModel) {
        if (!model) {
            localStorage.removeItem(resolveElPath(directModel));
            return;
        }
        localStorage[resolveElPath(directModel)] = JSON.stringify(model);
    };
    cspace.util.localStorageDataSource.resolveElPath = function (elPath, termMap, directModel) {
        var expander = fluid.invoke("cspace.urlExpander");
        var map = fluid.copy(termMap);
        map = fluid.transform(map, function (entry) {
            if (entry.charAt(0) === "%") {
                entry = fluid.get(directModel, entry.substring(1));
            }
            return entry;
        });
        var replaced = fluid.stringTemplate(elPath, map);
        replaced = expander(replaced);
        return replaced;
    };
    cspace.util.localStorageDataSource.preInitFunction = function () {
        if (!cspace.util.isLocalStorage()) {
            // TODO: Be more graceful.
            fluid.fail("Your browser does not support local storage!");
        }
    };

    cspace.util.preInitMergeListeners = function (options, listeners) {
        options.listeners = options.listeners || {};
        fluid.each(listeners, function (value, key) {
            if (!options.listeners[key]) {
                options.listeners[key] = value;
            } else {
                options.listeners[key] = fluid.makeArray(options.listeners[key]);
                options.listeners[key].push(value);
            }
        });
    };

    cspace.util.resolveReadOnly = function (options) {
        var that = fluid.initLittleComponent("cspace.util.resolveReadOnly", options);

        // Return true if read only is enforced.
        if (that.options.readOnly) {
            return true;
        }
        // If there's no target (recordType) there is no concept of read only and thus we return false.
        if (!that.options.target) {
            return false;
        }

        that.recordPerms = {};
        fluid.each(that.options.perms, function (permission) {
            that.recordPerms[permission] = cspace.permissions.resolve({
                permission: permission,
                target: that.options.target,
                permissions: that.options.permissions
            });
        });
        return !(that.options.csid && that.recordPerms.update || that.recordPerms.create);
    };

    fluid.defaults("cspace.util.resolveReadOnly", {
        gradeNames: ["fluid.littleComponent"],
        mergePolicy: {
            permissions: "nomerge"
        },
        perms: ["create", "update"]
    });

    cspace.util.validateNumber = function (number, type) {
        if (number === null) {
            return false;
        }
        if (!number) {
            return true;
        }
        if(typeof number !== "string" || number.constructor !== String) {
            return false;
        }
        var isNumber = !isNaN(new Number(number));
        if (!isNumber) {
            return false;
        }
        if (type === "integer") {
            return number.indexOf(".") < 0;
        }
        if (type === "float") {
            return number.split(".").length <= 2;
        }
        return true;
    };

    cspace.util.validate = function (value, type, messageBar, message) {
        var valid = cspace.util.validateNumber(value, type);
        if (!valid && messageBar) {
            messageBar.show(message, null, true);
        }
        return valid;
    };
    
    fluid.defaults("cspace.validator", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        finalInitFunction: "cspace.validator.finalInit",
        mergePolicy: {
            schema: "nomerge"
        },
        recordType: "",
        invokers: {
            lookupMessage: "cspace.util.lookupMessage",
            validatePrimitive: {
                funcName: "cspace.util.validate",
                args: ["{arguments}.0", "{arguments}.1", "{messageBar}", "{arguments}.2"]
            }
        }
    });
    
    var validateParseNumber = function (value, type, parse, validate, message) {
        var valid = validate(value, type, message);
        if (!valid) {
            throw message || "Invalid Number";
        }
        return parse(value, 10);
    };
    
    var validatePrimitive = function (value, type, validate, message) {
        switch (type) {
        case "integer":
            return validateParseNumber(value, type, parseInt, validate, message);
        case "float":
            return validateParseNumber(value, type, parseFloat, validate, message);
        default:
            return value;
        }
    };
    
    var validateImpl = function (data, schema, validate, lookupMessage, recordType) {
        fluid.each(data, function (value, key) {
            var subSchema = schema[key];
            if (!value || !subSchema) {
                return;
            }
            var type = subSchema.type;
            if (fluid.isPrimitive(value)) {
                data[key] = validatePrimitive(value, type, validate, fluid.stringTemplate(lookupMessage("invalidNumber"), {
                    label: lookupMessage(cspace.util.getLabel(key, recordType)) + ": "
                }));
            } else if (typeof value === "object") {
                if (type === "array") {
                    subSchema = subSchema.items ? fluid.transform(value, function () {
                        return subSchema.items;
                    }) : [];
                } else if (type === "object") {
                    subSchema = subSchema.properties;
                }
                validateImpl(value, subSchema, validate, lookupMessage, recordType);
            }
        });
    };

    cspace.validator.finalInit = function (that) {
        var schema = that.options.schema;
        // Only validate fields.
        schema = schema[that.options.recordType].properties.fields.properties;

        that.validate = function (data) {
            var thisData = fluid.copy(data);
            try {
                // Only validate fields.
                validateImpl(thisData.fields, schema, that.validatePrimitive, that.lookupMessage, that.options.recordType);
            } catch (e) {
                return;
            }
            return thisData;
        };
    };
    
    cspace.util.getLabel = function (key, recordType) {
        // TODO: This is a hack, since cataloging is also called collection-object in other layers.
        var prefix = recordType === "cataloging" ? "collection-object-" : (recordType + "-");
        return prefix + key + "Label"
    };
    
    cspace.util.findLabel = function (required) {
        return $(required).parents(".info-pair").find(".label").text();
    };
    
    cspace.util.processReadOnly = function (container, readOnly) {
        fluid.each(["input", "select", "textarea"], function (tag) {
            container.find(tag).prop("disabled", function (index, oldPropertyValue) {
                // if oldPropertyValue is "disabled" or true: leave it unchanged.
                return oldPropertyValue || readOnly;
            });
        });
    };
    
    cspace.util.merge = function () {
        var togo = [];
        fluid.each(arguments, function (arr) {
            $.merge(togo, fluid.makeArray(arr));
        });
        return togo;
    };
    
    cspace.util.composeSegments = function (root, path) {
        return fluid.model.composeSegments.apply(null, root ? fluid.remove_if(fluid.makeArray(arguments), function (arg) {
            if (!arg) {return true;}
        }) : [path]);
    };
    
})(jQuery, fluid);