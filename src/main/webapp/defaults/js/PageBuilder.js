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
            if (typeof that.options.resources[name] === "undefined") {
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
        var type = that.options.recordType;
        if (!type) {
            return;
        }
        fluid.each(options.userLogin.permissions[type], function (permission) {
            that[fluid.model.composeSegments(type, permission, "tag")] = fluid.typeTag(fluid.model.composeSegments(type, permission));
        });
    };

    fluid.defaults("cspace.pageBuilderIO", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: "cspace.pageBuilderIO.preInit",
        finalInitFunction: "cspace.pageBuilderIO.finalInit",
        schema: {
            "recordlist": null,
            "recordtypes": null,
            "namespaces": null
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
            instantiator: "{instantiator}"
        },
        events: {
            pageReady: null,
            onError: null
        }
    });

    cspace.pageBuilderIO.preInit = function (that) {
        that.recordTypeTag = fluid.typeTag(that.options.namespace || that.options.recordType);
    };

    cspace.pageBuilderIO.finalInit = function (that) {
        that.options.components = {
            pageBuilder: {
                type: "cspace.pageBuilder",
                options: {}
            }
        };

        that.initPageBuilder = function (options) {
            var resourceSpecs = {};
            setTags(that, options);

            that.options.readOnly = cspace.util.resolveReadOnly({
                permissions: options.userLogin.permissions,
                csid: that.options.csid,
                readOnly: options.readOnly,
                target: that.options.recordType
            });

            options.schema = options.schema || {};
            fluid.each(that.options.schema, function (resource, key) {
                var url = fluid.invoke("cspace.util.getDefaultSchemaURL", key);
                resourceSpecs[key] = {
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
                that.events.pageReady.fire();
            };
            fluid.fetchResources(that.composite.compose(resourceSpecs), fetchCallback);
        };
    };

    fluid.defaults("cspace.pageBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        preInitFunction: "cspace.pageBuilder.preInit",
        recordType: "{pageBuilderIO}.options.recordType",
        selectors: {
            header: ".csc-header-container",
            footer: ".csc-footer-container",
            titleBar: ".csc-titleBar-container",
            pivotSearch: ".csc-pivot-searchBox",
            tabs: ".csc-tabs-template",
            sidebar: ".csc-sidebar-container",
            recordEditor: ".csc-record-edit-container"
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
            vocab: {
                type: "cspace.vocab",
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
            uispec: "noexpand",
            schema: "nomerge",
            userLogin: "nomerge"
        }
    });
    
    cspace.pageBuilder.preInit = function (that) {
        that.schema = that.options.schema;
        that.permissions = that.options.userLogin.permissions;
        fluid.instantiateFirers(that, that.options);
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
