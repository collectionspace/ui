/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_1*/

var cspace = cspace || {};

(function ($, fluid) {
    
    fluid.completelyIndirectStringTemplate = function (template, values, model) {
        var newString = template;
        var hasModel = !!model;
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                var searchStr = "%" + key;
                var value = hasModel ? fluid.getBeanValue(model, values[searchStr]) : values[key];
                newString = newString.replace(searchStr, value);
            }
        }
        return newString;
    };

    // This isn't currently used, but might be useful in fuzzing over slashes.
    var addTrailingSlash = function (url) {
        return url + (url.chatAt(length - 1) !== "/") ? "/" : "";
    };
    
    /**
     * The Data Context, an object that provides generic CRUD operations for models.
     * 
     * @param {Object} model the model that is bound to this data context
     * @param {Object} options configuration options
     */
    cspace.dataContext = function (model, options) {
        var that = {};
        fluid.mergeComponentOptions(that, "fluid.dataContext", options);
        fluid.instantiateFirers(that, that.options);
        
        that.fetch = function (modelPath, id) {
            
        };
        
        that.create = function (modelPath) {
            
        };
        
        that.update = function (modelPath) {
            
        };

        // creates or updates as necessary
        that.save = function (modelPath)  {
            
        };
            
        that.remove = function (modelPath) {
            
        };
        
        return that;
    };
    
    fluid.defaults("fluid.dataContext", {
        events: {
            afterSave: null,   // modelPath, oldData, newData
            afterDelete: null, // modelPath
            afterFetch: null,  // modelPath, data
            onError: null      // operation["save", "delete", "fetch"], modelPath, message
        }
    });
    
    /**
     * A UrlFactory is responsible for hiding away the variations between loading data locally for testing
     * and on the server in production
     * 
     * @param {Object} options configuration options for the url factory
     */
    cspace.dataContext.urlFactory = function (options) {
        var that = {};
        fluid.mergeComponentOptions(that, "cspace.dataContext.urlFactory", options);
        that.resourceMapper = fluid.initSubcomponent(that, "resourceMapper", [fluid.COMPONENT_OPTIONS]);
        
        var extension = function () {
            return that.options.resourceFormat ? "." + that.options.resourceFormat : "";
        };
        
        that.urlForModelPath = function (modelPath, model) {
            var resource = that.resourceMapper.map(model, modelPath);
            return that.options.protocol + that.options.baseUrl + resource + extension();
        };
        
        return that;    
    };
    
    fluid.defaults("cspace.dataContext.urlFactory", {
        resourceMapper: {
            type: "cspace.dataContext.staticResourceMapper"
        },
        protocol: (document.location.protocol === "file:") ? "file://" : "http://",
        baseUrl: "/",
        resourceFormat: undefined
    });
    
    /**
     * The StaticResourceMapper is the default strategy for mapping model paths to resource-oriented URLs.
     * 
     * @param {Object} options configuration options for the mapper, including the modelToResourceMap
     */
    cspace.dataContext.staticResourceMapper = function (options) {
        var that = {
            modelToResourceMap: (options && options.modelToResourceMap) ? options.modelToResourceMap : {},
            replacements: (options && options.replacements) ? options.replacements : {}
        };
        
        that.map = function (model, modelPath) {
            if (!modelPath) {
                modelPath = "*";
            }
            
            var result = "";
            if (!that.modelToResourceMap.hasOwnProperty(modelPath)) {
                // TODO: what to return if there's no map??
                return result;
            }

            // TODO: this is pretty inefficient; resolving the values of each key in the replacements, even if we only need a few of them.
            var reps = [];
            for (var key in that.replacements) {
                if (that.replacements.hasOwnProperty(key)) {
                    reps[key] = fluid.model.getBeanValue(model, that.replacements[key]);
                }
            }
            result = fluid.stringTemplate(that.modelToResourceMap[modelPath], reps);

            return result;
        };
        
        return that;
    };
})(jQuery, fluid_1_1);
