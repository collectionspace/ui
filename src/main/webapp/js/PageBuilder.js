/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/

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
        if (!docString || docString === "") {
            return;
        }

//        var headTag = docString.match(/<head(.|\s)*?\/head>/gi)[0];
        var bodyTag = docString.match(/<body(.|\s)*?\/body>/gi);
        if (bodyTag) {
            bodyTag = bodyTag[0];
        } else {
            bodyTag = docString;
        }
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
    
    var expandOptions = function (pageBuilder, args) {        
        $.each(args, function (index, arg) {
            if (arg) {
                var type = typeof(arg);
                if (type === "object") {
                    expandOptions(pageBuilder, arg);
                }
                else if (type === "string" && arg.indexOf("{pageBuilder}") === 0) {
                    args[index] = fluid.model.getBeanValue(pageBuilder, arg.substring(14, arg.length));
                }
            }
        });
    };

    var invokeDependencies = function (that) {
        that.events.onDependencySetup.fire(that.uispec);
        
        that.components = [];
        for (var region in that.dependencies) {
            if (that.dependencies.hasOwnProperty(region)) {
                var dep = that.dependencies[region];
                expandOptions(that, dep.args);
                fluid.log("PageBuilder.js before executing " + dep.funcName);
                that.components[region] = fluid.invokeGlobalFunction(dep.funcName, dep.args);
                fluid.log("PageBuilder.js after executing " + dep.funcName);
            }
        }
    };

    var setupModelAndDependencies = function (that) {
        that.applier = fluid.makeChangeApplier(that.model);    
        fluid.log("PageBuilder.js before invoking dependencies");
        invokeDependencies(that);
        fluid.log("PageBuilder.js after invoking dependencies");        
        that.events.pageReady.fire();
    };
    
    var setUpPageBuilder = function (that) {
        that.model = cspace.util.createBaseModel();
        cspace.util.createEmptyModel(that.model, that.uispec);
        fluid.log("PageBuilder.js after creating empty model");
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);
        that.dataContext.events.afterFetch.addListener(function () {
            setupModelAndDependencies(that);
        });
        
        if (that.options.csid) {
            that.dataContext.fetch(that.options.csid);
            fluid.log("PageBuilder.js after fetching record " + that.options.csid);
        } else {
            setupModelAndDependencies(that);
        }
    };

    var assembleHTML = function (that) {
        fluid.log("PageBuilder.js before fetching resources");
        fluid.fetchResources(that.options.pageSpec, function (resourceSpecs) {
            fluid.log("PageBuilder.js after fetching resources");
            for (var regionName in resourceSpecs) {
                if (resourceSpecs.hasOwnProperty(regionName) && (regionName !== "callbackCalled")) {
                    var region = resourceSpecs[regionName];
                    inject(region.resourceText, region.templateSelector, $(region.targetSelector));
                }
                
            }
            if (!that.options.htmlOnly) {
                setUpPageBuilder(that);                
            } else {
                that.events.pageReady.fire();
            }
        });

    };

    cspace.pageBuilder = function (dependencies, options) {
        var that = {
            dependencies: dependencies
        };

        fluid.mergeComponentOptions(that, "cspace.pageBuilder", options);
        fluid.instantiateFirers(that, that.options);

        fluid.log("PageBuilder.js before checking loginstatus");

        // TODO: We should consider refactoring this work. We have several calls to the server that need
        //       to happen synchronously - perhaps it should be rolled into a single call.
        
        // determine if logged in and redirect
        if (!cspace.util.useLocalData()) {
            var loginRedirect = false;
            jQuery.ajax({
                async: false,
                url: "../../chain/loginstatus",
                cache: false,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    loginRedirect = !data.login;
                    fluid.log("PageBuilder.js after checking loginstatus");
                }
            });
            
            if (loginRedirect) {
                var currentUrl = document.location.href;
                var loginUrl = currentUrl.substr(0, currentUrl.lastIndexOf('/'));
                window.location = loginUrl;     
            }
        }
            
        fluid.log("PageBuilder.js before fetching uispec");
            
        // Fetch UI spec if required
        if (!that.uispec && that.options.pageType) {
            // TODO: Once we have changed our local versus remote strategy this can also be cleaned up.
            //       Ideally, we would default to the server url and could configure for the local page and for tests
            var urlTemplate = that.options.uispecUrl ||
                (cspace.util.useLocalData() ? "./uispecs/%pageType/uispec.json" : "../../chain/%pageType/uispec");                                
            var uispecUrl = fluid.stringTemplate(urlTemplate, {pageType: that.options.pageType});

            // TODO:    Workaround until App layer is generating role uispecs:
            if (that.options.pageType === "role") {
                uispecUrl = "./uispecs/role/uispec.json";
            }
            if (that.options.pageType === "users") {
            	uispecUrl = "./uispecs/users/uispec.json";
            }
            
            jQuery.ajax({
                async: false,
                url: uispecUrl,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    that.uispec = data;
                    fluid.log("PageBuilder.js after fetching uispec");
                },
                error: function (xhr, textStatus, errorThrown) {
                    fluid.fail("Error fetching " + that.options.pageType + " uispec:" + textStatus);
                }
            });
        }        
        
        if (options && options.pageSpec) {
            assembleHTML(that);
        } else {
            setUpPageBuilder(that);
        }
        
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
        htmlOnly: false,
        uispecUrl: "",
        pageType: ""
    });
})(jQuery, fluid);
