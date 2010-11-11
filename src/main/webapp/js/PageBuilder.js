/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("PageBuilder.js loaded");
    
    fluid.registerNamespace("cspace.pageBuilder");

    var injectElementsOfType = function (container, elementType, elements) {
        if (!elements || elements.length < 1) {
            return;
        }

        var elementsOfType = $(elementType, container);
        var repeat = elementsOfType.length === 0 ? function (idx, element) {
            container.append(element);
        } : function (idx, element) {
            var lastEl = $(elementType + ":last", container);
            lastEl.after(element);
        };

        $.each(elements, repeat);
    };
    
    var inject = function (docString, selector, container) {
        if (!docString) {
            return;
        }
//        var headTag = docString.match(/<head(.|\s)*?\/head>/gi)[0];
        var bodyTag = docString.match(/<body(.|\s)*?\/body>/gi);
        bodyTag = bodyTag ? bodyTag[0] : docString;
        
// Currently, parsing the link and script tags is not working quite properly, so
// for now, forego that process: assume the target HTML has everything you'd need
//        var linkTags = [].concat(headTag.match(/<link(.|\s)*?\/>/gi)).concat(headTag.match(/<link(.|\s)*?\/link>/gi)),
//            scriptTags = headTag.match(/<script(.|\s)*?\/script>/gi);

//        var head = $("head");
//        injectElementsOfType(head, "link", linkTags);
//        injectElementsOfType(head, "script", scriptTags);

        var templateContainer = $("<div></div>").html(bodyTag);
        var templateContent = $(selector, templateContainer);
        container.append($(selector, templateContainer)); 
    };
    
    var setupModel = function (applier, existingModel, pageType, recordType, schema) {
        // TODO: This logic shouldn't really be here and needs to be moved to the dataSource once it
        // replaces the dataContext and gathers all the model related logic inside.
        if (!pageType || pageType.indexOf("tab") !== -1 || existingModel.csid) {
            return;
        }
        applier.requestChange("", cspace.util.getBeanValue(existingModel, recordType, schema));
    };
    
    var setUpPageBuilder = function (that) {
        
        setupModel(that.applier, that.model, that.options.pageType, that.options.recordType, that.schema);
        
        fluid.initDependents(that);        
        
        that.events.onDependencySetup.fire(that.uispec);
        
        fluid.withEnvironment({pageBuilder: that},
            function () {
                that.dependencies = fluid.expander.expandLight(that.dependencies);
            }
        );
        
        that.components = {};
        for (var region in that.dependencies) {
            if (that.dependencies.hasOwnProperty(region)) {
                var dep = that.dependencies[region];
                fluid.log("PageBuilder.js before executing " + dep.funcName);
                that.components[region] = fluid.invokeGlobalFunction(dep.funcName, dep.args);
                fluid.log("PageBuilder.js after executing " + dep.funcName);
            }
        }
    };
    
    cspace.pageSpecManager = function (pageSpecs) {
        var texts = {};
        function attemptApply() {
            fluid.each(texts, function (entry, key) {
                if (!entry.applied) {
                    var spec = pageSpecs[key];
                    var target = $(spec.targetSelector);
                    if (target.length > 0) {
                        inject(entry.text, spec.templateSelector, target);
                        entry.applied = true;
                    }
                    else {
                        fluid.log("Deferring application to selector " + spec.targetSelector);
                    }
                }
            });
        }
        var that = {
            makeCallback: function (spec, key) {
                return function (text) {
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

    cspace.pageBuilder = function (dependencies, options) {
        var that = fluid.initLittleComponent("cspace.pageBuilder", options);
        that.dependencies = dependencies;
        that.model = that.options.model || {};
        that.applier = that.options.applier || fluid.makeChangeApplier(that.model);
        that.schema = {};
        
        fluid.instantiateFirers(that, that.options);
        
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);

        // everything we have got so far needs to be disposed as HTML
        var pageSpecs = fluid.copy(that.options.pageSpec);
        var resourceSpecs = fluid.copy(pageSpecs);
        var pageSpecManager = cspace.pageSpecManager(pageSpecs);
        fluid.each(resourceSpecs, function (spec, key) {
            spec.options = {
                success: pageSpecManager.makeCallback(spec, key)
            };
        });
        
        // determine if logged in and redirect
        resourceSpecs.loginStatus = {
            href: fluid.invoke("cspace.util.getLoginURL"),
            options: {
                dataType: "json",
                success: function (data) {
                    if (!data.login) {
                        var currentUrl = document.location.href;
                        var loginUrl = currentUrl.substr(0, currentUrl.lastIndexOf('/'));
                        window.location = loginUrl;     
                    }
                    that.currentUserId = data.csid;
                    that.permissions = data.permissions;
                }
            } 
        };
        
        fluid.each(that.options.schema, function (resource, key) {
            resourceSpecs[resource] = {
                href: fluid.invoke("cspace.util.getDefaultSchemaURL", resource),
                options: {
                    dataType: "json",
                    success: function (data) {
                        fluid.merge(null, that.schema, data);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        fluid.fail("Error fetching " + that.options.recordType + " schema:" + textStatus);
                    }
                }
            };
        });
        
        if (that.options.recordType) {
            resourceSpecs.schema = {
                href: that.options.schemaUrl || fluid.invoke("cspace.util.getDefaultSchemaURL", that.options.recordType),
                options: {
                    dataType: "json",
                    success: function (data) {
                        fluid.merge(null, that.schema, data);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        fluid.fail("Error fetching " + that.options.recordType + " schema:" + textStatus);
                    }
                }
            };
        }
        
        if (that.options.csid) {
            var dcthat = that.dataContext;
            resourceSpecs.record = that.dataContext.getResourceSpec("fetch", dcthat.options, dcthat.events.afterFetch, dcthat.events, that.options.csid);
        }

        if (that.options.pageType) {
            resourceSpecs.uispec = {
                href: that.options.uispecUrl || fluid.invoke("cspace.util.getUISpecURL", that.options.pageType),
                options: {
                    dataType: "json",
                    success: function (data) {
                        that.uispec = data;
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        fluid.fail("Error fetching " + that.options.pageType + " uispec:" + textStatus);
                    }
                }
            };
        }
        
        // for our dependencies, add any demands for model expansion to the spec list
        fluid.withEnvironment({resourceSpecCollector: resourceSpecs},
            function () {
                that.dependencies = fluid.expander.expandLight(that.dependencies, {noValue: true});
            }
        );
        fluid.each(resourceSpecs,
            function (spec) {
                spec.timeSuccess = true;
            }
        );
        
        var indicator = cspace.util.globalLoadingAssociator();
        indicator.supplySpecs(resourceSpecs);
        
        fluid.log("PageBuilder.js before issuing I/O"); // fetch EVERYTHING
        
        var fetchCallback = function () {
            pageSpecManager.conclude();
            fluid.log("PageBuilder.js completing initialisation - I/O returned");
            if (!that.options.htmlOnly) {
                setUpPageBuilder(that);                
            }
            that.events.pageReady.fire(); 
        };
        fetchCallback = indicator.wrapCallback(fetchCallback);
        
        fluid.fetchResources(resourceSpecs, fetchCallback, {amalgamateClasses: that.options.amalgamateClasses});
        
        return that;
    };
    
    fluid.demands("pivotSearch", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.pivotSearch", fluid.COMPONENT_OPTIONS]);
    
    fluid.demands("header", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.header", fluid.COMPONENT_OPTIONS]);

    fluid.defaults("cspace.pageBuilder", {
        amalgamateClasses: [
            "fastTemplate"
        ],
        selectors: {
            header: ".csc-header-container",
            pivotSearch: ".csc-pivot-searchBox"
        },
        components: {
            header: {
                type: "cspace.header",
                options: {
                    schema: "{pageBuilder}.schema",
                    permissions: "{pageBuilder}.permissions"
                }
            }
        },
        schema: [
            "recordlist"
        ],
        events: {
            pageReady: null,
            onDependencySetup: null
        },
        dataContext: {
            type: "cspace.dataContext"
        },
        pageSpec: {},
        htmlOnly: false,
        uispecUrl: "",
        schemaUrl: "",
        pageType: "",
        recordType: "",
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        }
    });
})(jQuery, fluid);
