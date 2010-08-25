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
    
    var setUpPageBuilder = function (that) {
        // TODO: Once we have a real schema from the app layer this code will be cleaned up. 
        //       The else statement will go away completely and the first parameter to 'getBeanValue' will be the actual model.
        //       We are currently not doing this because our inferred empty model is likely to have an incorrect structure
        //       that may cause errors upon save. 
        //       Note: this block is almost identical to a code block in ListEditor around line 106
        if (that.schema) {
        	var model = cspace.util.getBeanValue({}, that.options.pageType, that.schema);
            that.applier.requestChange("", model);
        }
        else {
            cspace.util.createEmptyModel(that.model, that.uispec);
        }
        
        that.events.onDependencySetup.fire(that.uispec);
        
        fluid.withEnvironment({pageBuilder: that},
                                function () {
                                    that.dependencies = fluid.expander.expandLight(that.dependencies);
                                }
        );
        
        that.components = [];
        for (var region in that.dependencies) {
            if (that.dependencies.hasOwnProperty(region)) {
                var dep = that.dependencies[region];
                fluid.log("PageBuilder.js before executing " + dep.funcName);
                that.components[region] = fluid.invokeGlobalFunction(dep.funcName, dep.args);
                fluid.log("PageBuilder.js after executing " + dep.funcName);
            }
        }
    };

    cspace.pageBuilder = function (dependencies, options) {
        var that = {
            dependencies: dependencies,
            model: cspace.util.createBaseModel()
        };
        that.applier = fluid.makeChangeApplier(that.model);

        fluid.mergeComponentOptions(that, "cspace.pageBuilder", options);
        fluid.instantiateFirers(that, that.options);
        
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);

        // everything we have got so far needs to be disposed as HTML
        var resourceSpecs = that.options.pageSpec;
        fluid.each(resourceSpecs, function (spec) {
            spec.options = {
                success:  function (text) {
                    inject(text, spec.templateSelector, $(spec.targetSelector));
                }
            };
        });
        
        // determine if logged in and redirect
        if (!cspace.util.useLocalData()) {
            resourceSpecs.loginStatus = {
                href: "../../chain/loginstatus",
                options: {
                    dataType: "json",
                    success: function (data) {
                        if (!data.login) {
                            var currentUrl = document.location.href;
                            var loginUrl = currentUrl.substr(0, currentUrl.lastIndexOf('/'));
                            window.location = loginUrl;     
                        }
                    }
                } 
            };
        }
        
        // TODO: This is a hack which is in place because we aren't getting schemas from the app layer yet
        //       Currently we only have hardcoded schemas for users and roles which are fetched from the file system.
        if (that.options.pageType === "role" || that.options.pageType === "users") {
            resourceSpecs.schema = {
                href: that.options.schemaUrl || cspace.util.getDefaultURL("schema"),
                options: {
                    dataType: "json",
                    success: function (data) {
                        that.schema = data;
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        // Because there is no schema we will infer it from the uispec later.
                    }
                }
            };
        }
        
        if (that.options.csid) {
            var dcthat = that.dataContext;
            resourceSpecs.record = that.dataContext.getResourceSpec("fetch", dcthat.options, dcthat.events.afterFetch, dcthat.events, that.options.csid);
        }
            
        // Fetch UI spec if required
        if (!that.uispec && that.options.pageType) {
            // TODO: Once we have changed our local versus remote strategy this can also be cleaned up.
            //       Ideally, we would default to the server url and could configure for the local page and for tests
            var urlTemplate = that.options.uispecUrl ||
                (cspace.util.useLocalData() ? "./uispecs/%pageType/uispec.json" : "../../chain/%pageType/uispec");                                
            var uispecUrl = fluid.stringTemplate(urlTemplate, {pageType: that.options.pageType});

            // TODO:    Workaround until App layer is generating users uispecs correctly:
            if (that.options.pageType === "users") {
                uispecUrl = "./uispecs/users/uispec.json";
            }

            resourceSpecs.uispec = {
                href: uispecUrl,
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
        
        fluid.log("PageBuilder.js before issuing I/O"); // fetch EVERYTHING
        fluid.fetchResources(resourceSpecs, function () {
            fluid.log("PageBuilder.js completing initialisation - I/O returned");
            if (!that.options.htmlOnly) {
                setUpPageBuilder(that);                
            }
            that.events.pageReady.fire(); 
        });
        
        return that;
    };

    fluid.defaults("cspace.pageBuilder", {
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
        pageType: ""
    });
})(jQuery, fluid);
