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
    
    var setUpPageBuilder = function (that) {
        setupModel(that.applier, that.model, that.options.pageType, that.options.recordType, that.schema);
        that.events.onDependencySetup.fire(that.options.uispec);
        fluid.initDependents(that);
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

    cspace.pageBuilderIO = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderIO", options);
        fluid.instantiateFirers(that, that.options);
        fluid.initDependents(that);
        
        that.options.components = {
            pageBuilder: {
                type: "cspace.pageBuilder",
                options: {}
            }
        };
        
        that.initPageBuilder = function (options) {
            var pageSpecs = fluid.copy(that.options.pageSpec);
            var resourceSpecs = fluid.copy(pageSpecs);
            var pageSpecManager = cspace.pageSpecManager(pageSpecs);
            var readOnly = cspace.pageBuilderIO.resolveReadOnly({
                permissions: options.userLogin.permissions,
                csid: that.options.csid,
                readOnly: readOnly,
                target: that.options.recordType
            });
            var urlExpander = cspace.urlExpander({
                vars: {
                    readonly: readOnly ? that.options.readOnlyUrlVar : ""
                }
            });
            
            fluid.each(resourceSpecs, function (spec, key) {
                spec.href = urlExpander(spec.href);
                spec.options = {
                    success: pageSpecManager.makeCallback(spec, key)
                };
            });
            fluid.each(that.options.schema, function (resource, key) {
                resourceSpecs[resource] = {
                    href: fluid.invoke("cspace.util.getDefaultSchemaURL", resource),
                    options: {
                        dataType: "json",
                        success: function (data) {
                            options.schema = options.schema || {};
                            fluid.merge(null, options.schema, data);
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            fluid.fail("Error fetching " + options.recordType + " schema:" + textStatus);
                        }
                    }
                };
            });
            
            if (that.options.csid) {
                var dcthat = that.dataContext;
                resourceSpecs.record = that.dataContext.getResourceSpec("fetch", dcthat.options, dcthat.events.afterFetch, dcthat.events, that.options.csid);
            }
            
            if (options.pageType) {
                resourceSpecs.uispec = {
                    href: that.options.uispecUrl || fluid.invoke("cspace.util.getUISpecURL", options.pageType),
                    options: {
                        dataType: "json",
                        success: function (data) {
                            // This is unfortunate but necessarry in order to prevent the expansion of uispec.
                            options.uispec = data;
                            var recordPath = isTab(options.pageType) ? "details" : "recordEditor";
                            if (options.uispec[recordPath]) {
                                options.uispec[recordPath] = 
                                    cspace.util.resolveReadOnlyUISpec(options.uispec[recordPath], readOnly);
                            }
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            fluid.fail("Error fetching " + options.pageType + " uispec:" + textStatus);
                        }
                    }
                };
            }
            fluid.each(resourceSpecs,
                function (spec) {
                    spec.timeSuccess = true;
                }
            );
            that.indicator.supplySpecs(resourceSpecs);
            
            var fetchCallback = function () {
                if (!options.htmlOnly) {
                    that.options.components.pageBuilder.options = options;
                    fluid.initDependent(that, "pageBuilder", that.instantiator);
                }
                pageSpecManager.conclude();
                that.events.pageReady.fire();
            };
            fetchCallback = that.indicator.wrapCallback(fetchCallback);
            fluid.fetchResources(resourceSpecs, fetchCallback, {amalgamateClasses: that.options.amalgamateClasses});
        };
        
        return that;
    };
    fluid.defaults("cspace.pageBuilderIO", {
        gradeNames: ["fluid.littleComponent"],
        schema: [
            "recordlist",
            "recordtypes"
        ],
        amalgamateClasses: [
            "fastTemplate"
        ],
        model: {},
        mergePolicy: {
            model: "preserve",
            applier: "nomerge"
        },
        readOnlyUrlVar: "readonly/",
        components: {
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
            },
            indicator: {
                type: "cspace.util.globalLoadingAssociator"
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
            pageReady: null
        }
    });
    
    cspace.pageBuilderIO.resolveReadOnly = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderIO.resolveReadOnly", options);
        
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
    
    fluid.defaults("cspace.pageBuilderIO.resolveReadOnly", {
        gradeNames: ["fluid.littleComponent"],
        perms: ["create", "update"]
    });
    
    cspace.pageBuilder = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilder", options);
        that.dataContext = that.options.dataContext;
        that.model = that.options.model || {};
        that.applier = that.options.applier || fluid.makeChangeApplier(that.model);
        that.schema = that.options.schema;
        that.permissions = that.options.userLogin.permissions;
        fluid.instantiateFirers(that, that.options);
        setUpPageBuilder(that);
        return that;
    };

    fluid.defaults("cspace.pageBuilder", {
        gradeNames: ["fluid.littleComponent"],
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
            globalBundle: {
                type: "cspace.globalBundle"
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
            uispec: "noexpand"
        }
    });
    
})(jQuery, fluid);
