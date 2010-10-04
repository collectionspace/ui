/*
Copyright 2010 

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("DataSource.js loaded");
    
    
    /**
     * Builds a resourceSpec structure for all additional resources that will need to be fetched.
     */
    var buildResourceSpec = function (that) {
        var sources = that.options.sources;        
        that.resourceSpec = {};
        if (!sources) {
            return;
        }
        for (var key in sources) {
            var source = sources[key];
            if (!source.href) {
                continue;
            }
            that.resourceSpec[key] = {
                href: source.href,
                options: {
                    dataType: "json"
                }
            };
        };
    };
    
    var fetchResourcesCallback = function (that) {
        var recordType = that.options.recordType;
        return function (resourceSpec) {
            var model;
            var schema = that.options.schema;
            
            if (resourceSpec[recordType]) {
                model = resourceSpec[recordType].resourceText;
                delete resourceSpec[recordType];
            }
            
            if (schema) {
                // TODO: Need to refactor this somehow.
                var schemaModel = {};
                schemaModel[recordType] = model;
                model = cspace.util.getBeanValue(model ? schemaModel : {}, recordType, schema);
            }
            
            // For all aditional resources the existing model is merged with the data from those resources.
            fluid.each(resourceSpec, function (resource, key) {
                var source = that.options.sources[key];
                var targetModel = {};
                fluid.model.copyModel(targetModel, resource.resourceText);
                targetModel = fluid.model.getBeanValue(targetModel, source.resourcePath);
                source.merge(targetModel, fluid.model.getBeanValue(model, source.path));
                fluid.model.setBeanValue(model, source.path, targetModel);
            });
            
            that.events.afterFetchResources.fire(model);
        };
    };
    
    cspace.dataSource = function (options) {
        var that = fluid.initLittleComponent("cspace.dataSource", options);
        
        buildResourceSpec(that);
        
        // Publics method that will either provide a full existing model or create a new model based on 
        // whether csid was provided or not.
        that.provideModel = function (csid) {
            var recordType = that.options.recordType;
            if (csid) {
                that.resourceSpec[recordType] = {
                    href: cspace.util.buildUrl(null, that.options.baseUrl, recordType, csid, that.options.fileExtension),
                    options: {
                        dataType: "json"
                    }
                };
            }
            fluid.fetchResources(that.resourceSpec, fetchResourcesCallback(that));
        };
        
        // Need events in order to be able to track asynchronous resource fetching. 
        fluid.instantiateFirers(that, that.options);
        return that;
    };
    
    /**
     * Default merge function for lists of rows used in users dataSource.
     * %param target: target structure that will be used as a result value.
     * %param source: source structure that will be used to alter the target structure. 
     */
    cspace.dataSource.mergeRoles = function (target, source) {
        fluid.transform(target, function (item, key) {
            item.roleId = item.csid;
            item.roleName = item.number;
            item.roleSelected = false;
            delete item.number;
            delete item.csid;
            delete item.summary;
            delete item.recordtype;
            if (source) {
                $.each(source, function (i, value) {
                    if (item.roleName === value.roleName) {
                        item.roleSelected = true;
                        return false;
                    }
                });
            }
        });
    };
    
    /**
     * Default merge function for lists of permissions used in role dataSource.
     * %param target: target structure that will be used as a result value.
     * %param source: source structure that will be used to alter the target structure. 
     */
    cspace.dataSource.mergePermissions = function (target, source) {
        fluid.transform(target, function (item, key) {
            item.resourceName = item.summary;
            item.permission = "delete";
            delete item.number;
            delete item.csid;
            delete item.summary;
            delete item.recordtype;
            if (source) {
                $.each(source, function (i, value) {
                    if (item.resourceName === value.resourceName) {
                        item.permission = value.permission;
                        return false;
                    }
                });
            }
        });
    };    
    
    fluid.defaults("cspace.dataSource", {
        events: {
            afterFetchResources: null
        },
        recordType: "", // Main record's type, generally inhereted from parent dataContext.
        baseUrl: "../../chain", // Url that will be put in the base path when building main record's fetch url.
        fileExtension: "",
        schema: null, // Schema that will fill the model if necessary.
        uispec: null, // If there is no schema and no existing model, uispec will be used to build an empty model. TODO: this will go away when schema is everywhere
        sources: null // Structure that describes all additional resources that will be merged with the base model.
    });
    
})(jQuery, fluid);