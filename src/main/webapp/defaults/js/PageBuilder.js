/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("PageBuilder.js loaded");
    
    fluid.registerNamespace("cspace.pageBuilder");
    
    var inject = function (docString, selector, container) {
        if (!docString) {
            return;
        }
        var bodyTag = docString.match(/<body(.|\s)*?\/body>/gi);
        bodyTag = bodyTag ? bodyTag[0] : docString;
        var templateContainer = $("<div></div>").html(bodyTag);
        var templateContent = $(selector, templateContainer);
        container.append($(selector, templateContainer)); 
    };
    
    var isTab = function (pageType) {
        return pageType.indexOf("tab") !== -1;
    };
    
    var setupModel = function (applier, existingModel, pageType, recordType, schema) {
        // TODO: This logic shouldn't really be here and needs to be moved to the dataSource once it
        // replaces the dataContext and gathers all the model related logic inside.
        if (!pageType || isTab(pageType) || existingModel.csid) {
            return;
        }
        applier.requestChange("", cspace.util.getBeanValue(existingModel, recordType, schema));
    };
    
    cspace.pageSpecManager = function (pageSpecs) {
        var texts = {};
        function attemptApply() { // Further soundness in correcting FLUID-2792
            var anyApplied = true;
            while (anyApplied) {
                anyApplied = false;
                fluid.each(texts, function (entry, key) {
                    if (!entry.applied) {
                        var spec = pageSpecs[key];
                        var target = $(spec.targetSelector);
                        if (target.length > 0) {
                            inject(entry.text, spec.templateSelector, target);
                            entry.applied = true;
                            anyApplied = true;
                        }
                        else {
                            fluid.log("Deferring application to selector " + spec.targetSelector);
                        }
                    }
                });
            }
        }
        var that = {
            makeCallback: function (that, spec, key) {
                return function (text) {
                    if (!text) {
                        that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                            url: spec.href
                        }));
                        return;
                    }
                    if (text.isError === true) {
                        fluid.each(text.messages, function (message) {
                            that.displayErrorMessage(message);
                        });
                        return;
                    }
                    texts[key] = {text: text};
                    attemptApply();
                };
            },
            conclude: function () {
                fluid.each(texts, function (entry, key) {
                    if (!entry.applied) {
                        var spec = pageSpecs[key];
                        fluid.fail("Error applying templates - template with URL " + spec.href + " could not be applied to target selector " + spec.targetSelector);
                    }
                });
            }
        };
        return that;
    };
    
    // A composite component that has a compose method for modifying resourceSpecs ready to be fetched.
    fluid.defaults("cspace.composite", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            compose: "cspace.composite.compose",
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        }
    });
    // A version of compose for local app.
    cspace.composite.composeLocal = function (resourceSpec) {
        return resourceSpec;
    };
    // A version of compose for deployment.
    cspace.composite.compose = function (that, resourceSpecs) {
        var compositeCallbacks = {};
        var rules = {};
        var urls = that.options.urls;
        
        // Add a composite block to resourceSpecs that will aggregate a number of individual requests.
        resourceSpecs.composite = {
            href: urls.composite,
            options: {
                dataType: "json",
                type: "POST",
                data: {},
                error: cspace.util.provideErrorCallback(that, urls.composite, "errorFetching")
            }
        };
        
        // Go through all of resourceSpecs and move|map matched ones into the composite part.
        fluid.remove_if(resourceSpecs, function (resourceSpec, name) {
            if ($.inArray(name, that.options.resources) < 0) {
                return;
            }
            if (!resourceSpec) {
                return;
            }
            compositeCallbacks[name] = {
                success: resourceSpec.options.success,
                error: resourceSpec.options.error
            };
            var prefixIndex = resourceSpec.href.indexOf(urls.prefix);
            resourceSpec.href = prefixIndex < 0 ? resourceSpec.href : resourceSpec.href.substr(prefixIndex + urls.prefix.length);
            resourceSpecs.composite.options.data[name] = that.transform(resourceSpec, {
                "path": "href",
                "method": "options.type",
                "dataType": "options.dataType"
            });
            return true;
        });
        // Stringify the payload.
        resourceSpecs.composite.options.data = JSON.stringify(resourceSpecs.composite.options.data);
        
        // Make a single success callback that aggregates all individual success and error callbacks.
        resourceSpecs.composite.options.success = function (data) {
            if (!data) {
                that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                    url: resourceSpecs.composite.href
                }));
            }
            if (data.isError === true) {
                fluid.each(data.messages, function (message) {
                    that.displayErrorMessage(message);
                });
                return;
            }
            fluid.each(compositeCallbacks, function (compositeCallback, resource) {
                var thisData = data[resource];
                if (thisData.body.isError === true) {
                    fluid.each(thisData.body.messages, function (message) {
                        compositeCallback.error(null, message.message);
                    });
                    return;
                }
                if (thisData.status === 200 || thisData.status === 201) {
                    compositeCallback.success(thisData.body);
                    return;
                }
                compositeCallback.error(thisData.body);
            });
        };
        return resourceSpecs;
    };

    var setTags = function (that, options) {
        fluid.each([that.options.recordType, that.options.namespace], function (type) {
            if (!type) {
                return;
            }
            fluid.each(options.userLogin.permissions[type], function (permission) {
                that[fluid.model.composeSegments(type, permission, "tag")] = fluid.typeTag(fluid.model.composeSegments(type, permission));
            });
        });
    };

    cspace.pageBuilderIO = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderIO", options);
        fluid.instantiateFirers(that, that.options);
        that.recordTypeTag = fluid.typeTag(that.options.namespace || that.options.recordType);
        fluid.initDependents(that);
        
        that.options.components = {
            pageBuilder: {
                type: "cspace.pageBuilder",
                options: {}
            }
        };
        
        that.initPageBuilder = function (options) {
            setTags(that, options);
            var pageSpecs = fluid.copy(that.options.pageSpec);
            var resourceSpecs = that.resourceSpecs = fluid.copy(pageSpecs);
            var pageSpecManager = cspace.pageSpecManager(pageSpecs);
            that.options.readOnly = cspace.util.resolveReadOnly({
                permissions: options.userLogin.permissions,
                csid: that.options.csid,
                readOnly: options.readOnly,
                target: that.options.namespace || that.options.recordType
            });
            
            fluid.each(resourceSpecs, function (spec, key) {
                spec.href = spec.href
                spec.options = {
                    dataType: "html",
                    success: pageSpecManager.makeCallback(that, spec, key),
                    error: function (xhr, textStatus, errorThrown) {
                        cspace.util.provideErrorCallback(that, spec.href, "errorFetching")(xhr, textStatus, errorThrown);
                        that.events.onError.fire();
                    }
                };
            });

            options.schema = options.schema || {};
            fluid.each(that.options.schema, function (resource, key) {
                var url = fluid.invoke("cspace.util.getDefaultSchemaURL", resource);
                resourceSpecs[resource] = {
                    href: url,
                    options: {
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            if (!data) {
                                that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                                    url: url
                                }));
                                return;
                            }
                            if (data.isError === true) {
                                fluid.each(data.messages, function (message) {
                                    that.displayErrorMessage(message);
                                });
                                return;
                            }
                            fluid.each(data, function (schema, key) {
                                options.schema[key] = schema;
                            });
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            cspace.util.provideErrorCallback(that, url, "errorFetching")(xhr, textStatus, errorThrown);
                            that.events.onError.fire();
                        }
                    }
                };
            });
            
            if (that.options.csid) {
                var dcthat = that.dataContext;
                resourceSpecs.record = that.dataContext.getResourceSpec("fetch", dcthat.buildUrl, dcthat.options, dcthat.events.afterFetch, dcthat.events, that.options.csid);
            }
            
            options.pageType = options.pageType || that.options.recordType;
            if (options.pageType) {
                var url = that.options.uispecUrl || fluid.invoke("cspace.util.getUISpecURL", options.pageType);
                resourceSpecs.uispec = {
                    href: url,
                    options: {
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            if (!data) {
                                that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                                    url: url
                                }));
                                return;
                            }
                            if (data.isError === true) {
                                fluid.each(data.messages, function (message) {
                                    that.displayErrorMessage(message);
                                });
                                return;
                            }
                            options.uispec = data;
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            cspace.util.provideErrorCallback(that, url, "errorFetching")(xhr, textStatus, errorThrown);
                            that.events.onError.fire();
                        }
                    }
                };
            }
            fluid.each(resourceSpecs,
                function (spec) {
                    spec.timeSuccess = true;
                }
            );
            
            var fetchCallback = function () {
                if (!options.htmlOnly) {
                    that.options.components.pageBuilder.options = options;
                    fluid.initDependent(that, "pageBuilder", that.instantiator);
                }
                pageSpecManager.conclude();
                that.events.pageReady.fire();
            };
            fluid.fetchResources(that.composite.compose(resourceSpecs), fetchCallback);
        };
        
        return that;
    };
    fluid.defaults("cspace.pageBuilderIO", {
        gradeNames: ["fluid.littleComponent"],
        schema: [
            "recordlist",
            "recordtypes",
            "namespaces"
        ],
        model: {},
        mergePolicy: {
            model: "preserve",
            applier: "nomerge"
        },
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        },
        components: {
            composite: {
                type: "cspace.composite"
            },
            pageCategory: {
                type: "cspace.pageCategory",
                priority: "first",
                options: {
                    pageCategory: "{pageBuilderIO}.options.pageCategory"
                }
            },
            instantiator: "{instantiator}",
            dataContext: {
                type: "cspace.dataContext",
                options: {
                    recordType: "{pageBuilderIO}.options.recordType"
                }
            }
        },
        pageSpec: {},
        csid: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.getUrlParameter",
                args: "csid"
            }
        },
        events: {
            pageReady: null,
            onError: null
        }
    });
    
    fluid.defaults("cspace.pageBuilderIO.templateLocator", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        mergePolicy: {
            pageSpec: "nomerge"
        },
        finalInitFunction: "cspace.pageBuilderIO.templateLocator.finalInit",
        specs: {
            recordEditor: {
                href: "%webapp/html/pages/%recordTypeTemplate%template.html",
                templateSelector: ".csc-%recordType-template",
                targetSelector: ".csc-record-edit-container"
            }
        },
        components: {
            urlExpander: {
                type: "cspace.urlExpander"
            }
        },
        template: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.getUrlParameter",
                args: "template"
            }
        }
    });
    
    cspace.pageBuilderIO.templateLocator.finalInit = function (that) {
        fluid.each(that.options.specs, function (spec, key) {
            that.options.pageSpec[key] = spec;
            that.options.pageSpec[key].templateSelector = fluid.stringTemplate(that.options.pageSpec[key].templateSelector, {recordType: that.options.recordType});
            that.options.pageSpec[key].href = fluid.stringTemplate(that.urlExpander(that.options.pageSpec[key].href), {
                recordType: that.options.recordType.charAt(0).toUpperCase() + that.options.recordType.slice(1),
                template: that.options.template ? ("-" + that.options.template) : ""
            });
        });
    };

    fluid.defaults("cspace.pageBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        preInitFunction: "cspace.pageBuilder.preInit",
        dataContext: "{dataContext}",
        recordType: "{pageBuilderIO}.options.recordType",
        model: "{pageBuilderIO}.options.model",
        selectors: {
            header: ".csc-header-container",
            footer: ".csc-footer-container",
            titleBar: ".csc-titleBar-container",
            pivotSearch: ".csc-pivot-searchBox",
            tabs: ".csc-tabs-template",
            sidebar: ".csc-sidebar-container"
        },
        components: {
            instantiator: "{instantiator}",
            permissionsResolver: {
                type: "cspace.permissions.resolver",
                options: {
                    permissions: "{pageBuilder}.permissions"
                }
            },
            relationResolver: {
                type: "cspace.util.relationResolver"
            },
            recordTypeManager: {
                type: "cspace.recordTypeManager"
            },
            userLogin: {
                type: "cspace.util.login",
                options: {
                    screenName: "{pageBuilder}.options.userLogin.screenName",
                    userId: "{pageBuilder}.options.userLogin.userId",
                    csid: "{pageBuilder}.options.userLogin.csid"
                }
            },
            namespaces: {
                type: "cspace.namespaces",
                options: {
                    schema: "{pageBuilder}.schema"
                }
            },
            recordTypes: {
                type: "cspace.recordTypes",
                options: {
                    schema: "{pageBuilder}.schema"
                }
            },
            footer: {
                type: "cspace.footer"
            }
        },
        events: {
            onDependencySetup: null
        },
        mergePolicy: {
            model: "preserve",
            applier: "nomerge",
            dataContext: "nomerge",
            uispec: "noexpand",
            schema: "nomerge",
            userLogin: "nomerge"
        }
    });
    
    cspace.pageBuilder.preInit = function (that) {
        that.dataContext = that.options.dataContext;
        that.model = that.options.model || {};
        that.applier = that.options.applier || fluid.makeChangeApplier(that.model, {thin: true});
        that.schema = that.options.schema;
        that.permissions = that.options.userLogin.permissions;
        fluid.instantiateFirers(that, that.options);
        setupModel(that.applier, that.model, that.options.pageType, that.options.recordType, that.schema);
        that.events.onDependencySetup.fire(that.options.uispec);
    };
    
    fluid.defaults("cspace.pageBuilder.renderer", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "cspace.pageBuilder.renderer.preInit",
        renderOnInit: true,
        selectors: {
            header: ".csc-pageBuilder-header"
        },
        parentBundle: "{globalBundle}",
        protoTree: {
            header: {
                messagekey: "${header}"
            }
        },
        model: {
            header: "pageBuilder-header-%pageType"
        },
        strings: {}
    });
    
    cspace.pageBuilder.renderer.preInit = function (that) {
        that.model = cspace.util.stringBuilder(that.model, {
            vars: {
                pageType: that.options.pageType
            }
        });
    };
    
})(jQuery, fluid);
