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
        that.events.onDependencySetup.fire(that.uispec);
        that.globalNavigator = that.options.globalNavigator;
        that.messageBar = that.options.messageBar;
        that.globalSetup = that.options.globalSetup;
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

    cspace.pageBuilderSetup = function (options) {
        var that = {};
        fluid.fetchResources({
            config: {
                href: options.configURL || cspace.util.getDefaultConfigURL(),
                options: {
                    dataType: "json"
                }
            },
            loginstatus: { //get login status and permissions
                href: fluid.invoke("cspace.util.getLoginURL"),
                options: {
                    dataType: "json",
                    success: function (data) {
                        if (!data.login) {
                            var currentUrl = document.location.href;
                            var loginUrl = currentUrl.substr(0, currentUrl.lastIndexOf('/'));
                            window.location = loginUrl;     
                        } else {
                            options.permissions = data.permissions;
                            options.currentUserId = data.currentUserId;
                        }
                    },
                    fail: function () {
                        fluid.fail("PageBuilder was not able to retrieve login info and permissions, so failing");
                    }
                }
            }
        }, function (resourceSpecs) {
            fluid.merge({
                model: "preserve",
                applier: "preserve"
            }, resourceSpecs.config.resourceText, options);
            that.pageBuilder = cspace.pageBuilder(resourceSpecs.config.resourceText);
        });
        return that;
    };
    
    cspace.pageBuilder = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilder", options);
        that.model = that.options.model || {};
        that.applier = that.options.applier || fluid.makeChangeApplier(that.model);
        that.schema = {};
        that.permissions = that.options.permissions;
        that.currentUserId = that.options.currentUserId;
        
        fluid.instantiateFirers(that, that.options);
        
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);

        // everything we have got so far needs to be disposed as HTML
        var pageSpecs = fluid.copy(that.options.pageSpec);
        var resourceSpecs = fluid.copy(pageSpecs);
        var pageSpecManager = cspace.pageSpecManager(pageSpecs);
        
        that.readOnly = cspace.pageBuilder.resolveReadOnly({
            permissions: that.permissions,
            csid: that.options.csid,
            readOnly: that.options.readOnly,
            target: that.options.recordType
        });
            
        var urlExpander = cspace.urlExpander({
            vars: {
                readonly: that.readOnly ? that.options.readOnlyUrlVar : ""
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
                        fluid.merge(null, that.schema, data);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        fluid.fail("Error fetching " + that.options.recordType + " schema:" + textStatus);
                    }
                }
            };
        });
        
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
                        var recordPath = isTab(that.options.pageType) ? "details" : "recordEditor";
                        if (that.uispec[recordPath]) {
                            that.uispec[recordPath] = cspace.util.resolveReadOnlyUISpec(that.uispec[recordPath], that.readOnly);
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        fluid.fail("Error fetching " + that.options.pageType + " uispec:" + textStatus);
                    }
                }
            };
        }
        
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

    fluid.defaults("cspace.pageBuilder", {
        amalgamateClasses: [
            "fastTemplate"
        ],
        selectors: {
            header: ".csc-header-container",
            titleBar: ".csc-titleBar-container",
            pivotSearch: ".csc-pivot-searchBox",
            tabs: ".csc-tabs-template",
            sidebar: ".csc-sidebar-container"
        },
        components: {
            header: {
                type: "cspace.header",
                options: {
                    schema: "{pageBuilder}.schema",
                    permissions: "{pageBuilder}.permissions"
                }
            },
            permissionsResolver: {
                type: "cspace.permissions.resolver",
                options: {
                    permissions: "{pageBuilder}.permissions"
                }
            },
            recordTypeManager: {
                type: "cspace.recordTypeManager"
            },
            globalBundle: {
                type: "cspace.globalBundle"
            },
            recordTypes: {
                type: "cspace.recordTypes",
                options: {
                    schema: "{pageBuilder}.schema"
                }
            }
        },
        schema: [
            "recordlist",
            "recordtypes"
        ],
        events: {
            pageReady: null,
            onDependencySetup: null
        },
        dataContext: {
            type: "cspace.dataContext"
        },
        readOnlyUrlVar: "readonly/",
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
    
    cspace.pageBuilder.resolveReadOnly = function (options) {
        // Return true if read only is enforced.
        if (options.readOnly) {
            return true;
        }
        // If there's no target (recordType) there is no concept of read only and thus we return false.
        if (!options.target) {
            return false;
        }
        var that = fluid.initLittleComponent("cspace.pageBuilder.resolveReadOnly", options);
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
    
    fluid.defaults("cspace.pageBuilder.resolveReadOnly", {
        perms: ["create", "update"]
    });
    
    cspace.pageBuilderSetup.setupRecord = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupRecord", options);
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupRecord", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        csid: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.getUrlParameter",
                args: "csid"
            }
        }
    });
    
    cspace.pageBuilderSetup.setupLocalRecord = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupLocalRecord", options);
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupLocalRecord", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        csid: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.getUrlParameter",
                args: "csid"
            }
        },
        dataContext: {
            options: {
                baseUrl: "data",
                fileExtension: ".json"
            }
        }
    });
    
    cspace.pageBuilderSetup.setupLocalFindEdit = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupLocalFindEdit", options);
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupLocalFindEdit", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        components: {
            search: {
                options: {
                    searchUrlBuilder: cspace.search.localSearchUrlBuilder
                }
            }
        }
    });
    
    cspace.pageBuilderSetup.setupRole = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupRole", options);
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupRole", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        components: {
            role: {
                options: {
                    roleListEditor: {
                        options: {
                            dataContext: {
                                options: {
                                    dataSource: {
                                        options: {
                                            sources: {
                                                permission: {
                                                    merge: cspace.dataSource.mergePermissions
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    cspace.pageBuilderSetup.setupLocalRole = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupLocalRole", options);
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupLocalRole", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        components: {
            role: {
                options: {
                    recordType: "role/records/list.json",
                    roleListEditor: {
                        options: {
                            baseUrl: "data/",
                            dataContext: {
                                options: {
                                    baseUrl: "data/",
                                    fileExtension: ".json",
                                    dataSource: {
                                        options: {
                                            sources: {
                                                permission: {
                                                    merge: cspace.dataSource.mergePermissions,
                                                    href: "data/permission/list.json"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    cspace.pageBuilderSetup.setupUsers = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupUsers", options);
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupUsers", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        components: {
            users: {
                options: {
                    userListEditor: {
                        options: {
                            dataContext: {
                                options: {
                                    dataSource: {
                                        options: {
                                            sources: {
                                                role: {
                                                    merge: cspace.dataSource.mergeRoles
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    cspace.pageBuilderSetup.setupLocalUsers = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupLocalUsers", options);
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupLocalUsers", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        components: {
            users: {
                options: {
                    recordType: "users/records/list.json",
                    queryURL: "data/users/search/list.json",
                    userListEditor: {
                        options: {
                            baseUrl: "data/",
                            dataContext: {
                                options: {
                                    baseUrl: "data/",
                                    fileExtension: ".json",
                                    dataSource: {
                                        options: {
                                            sources: {
                                                role: {
                                                    merge: cspace.dataSource.mergeRoles,
                                                    href: "data/role/list.json"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    cspace.pageBuilderSetup.setupTabs = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupTabs", options);
        that.options.components = {
            relatedRecordsTab: {
                options: {
                    listEditor: {
                        options: {
                            data: options.model.relations[that.options.related] 
                        }
                    }
                }
            }
        };
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupTabs", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        }
    });
    
    cspace.pageBuilderSetup.setupLocalTabs = function (options) {
        var that = fluid.initLittleComponent("cspace.pageBuilderSetup.setupLocalTabs", options);
        that.options.components.relatedRecordsTab.options.listEditor.options.data =
            options.model.relations[that.options.related];
        return cspace.pageBuilderSetup(that.options);
    };
    
    fluid.defaults("cspace.pageBuilderSetup.setupLocalTabs", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        },
        components: {
            relatedRecordsTab: {
                options: {
                    listEditor: {
                        options: {
                            dataContext: {
                                options: {
                                    baseUrl: "data",
                                    fileExtension: ".json"
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.tabs"], {
        funcName: "cspace.pageBuilderSetup.setupTabs",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.tabs", "cspace.localData"], {
        funcName: "cspace.pageBuilderSetup.setupLocalTabs",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.role"], {
        funcName: "cspace.pageBuilderSetup.setupRole",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.role", "cspace.localData"], {
        funcName: "cspace.pageBuilderSetup.setupLocalRole",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.users"], {
        funcName: "cspace.pageBuilderSetup.setupUsers",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.users", "cspace.localData"], {
        funcName: "cspace.pageBuilderSetup.setupLocalUsers",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.findedit"], fluid.COMPONENT_OPTIONS);
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.findedit", "cspace.localData"], {
        funcName: "cspace.pageBuilderSetup.setupLocalFindEdit",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.record"], {
        funcName: "cspace.pageBuilderSetup.setupRecord",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.record", "cspace.localData"], {
        funcName: "cspace.pageBuilderSetup.setupLocalRecord",
        args: fluid.COMPONENT_OPTIONS
    });
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.createnew"], fluid.COMPONENT_OPTIONS);
    
    fluid.demands("cspace.pageBuilderSetup", ["cspace.myCollectionSpace"], fluid.COMPONENT_OPTIONS);
    
    cspace.setup = function (tag, options) {
        fluid.staticEnvironment.cspacePage = fluid.typeTag(tag);
        var that = fluid.initLittleComponent("cspace.setup", options);
        fluid.initDependents(that);
        return that;
    };
    
    fluid.defaults("cspace.setup", {
        components: {
            pageBuilderSetup: {
                type: "cspace.pageBuilderSetup",
                options: {
                    model: "{setup}.options.model",
                    applier: "{setup}.options.applier",
                    related: "{setup}.options.related",
                    primary: "{setup}.options.primary",
                    configURL: "{setup}.options.configURL",
                    // TODO: FIX PAGE BUILDER SETUP!!!
                    globalNavigator: "{globalNavigator}",
                    globalSetup: "{globalSetup}",
                    messageBar: "{messageBar}"
                }
            }
        },
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        }
    });
    
})(jQuery, fluid);
