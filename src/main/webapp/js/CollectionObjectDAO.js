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
    var DATA_FORMAT = "json";
    
    var ajax = function (that, method, resourceUrl, onSuccess, onError, data, id) {
        jQuery.ajax({
            url: that.urlFactory(that.options.baseUrl, resourceUrl, id),
            type: method,
            dataType: DATA_FORMAT,
            data: data,
            success: onSuccess,
            error: onError
        });
    };
    
    var setupCollectionObjectDAO = function (that) {
        var isLocal = (document.location.protocol === "file:");
        that.urlFactory =  isLocal ? cspace.collectionObjectDAO.createFileSystemURLFactory(that.options.resources) : 
                                     cspace.collectionObjectDAO.serverURLFactory;    
    };
    
    cspace.collectionObjectDAO = function (options) {
        var that = {};
        fluid.mergeComponentOptions(that, "cspace.collectionObjectDAO", options);
        
        that.fetchObjectSchema = function (onSuccess, onError) {
            ajax(that, "GET", that.options.resources.schema, onSuccess, onError);
        };
        
        that.fetchObjects = function (onSuccess, onError) {

        };
        
        that.fetchObjectForId = function (id, onSuccess, onError) {
            ajax(that, "GET", that.options.resources.objects, onSuccess, onError, null, id);
        };
        
        that.saveNewObject = function (collectionObject, onSuccess, onError) {
            ajax(that, "POST", that.options.resources.objects, onSuccess, onError, JSON.stringify(collectionObject), that.options.newObjectIDToken);
        };
        
        that.saveObjectForId = function (collectionObject, id, onSuccess, onError) {
            ajax(that, "PUT", that.options.resources.objects, onSuccess, onError, JSON.stringify(collectionObject), id);
        };
        
        setupCollectionObjectDAO(that);
        return that;    
    };
    
    cspace.collectionObjectDAO.serverURLFactory = function (baseUrl, resourceUrl, id) {
        return baseUrl + resourceUrl + (id ? id : "");
// TEMPORARY 2009-06-10:
// Required to deal with http://issues.collectionspace.org/browse/CSPACE-233
// To test on a local server with the chain application, use the following line instead:
//        return baseUrl + resourceUrl + (id ? id : "schema") + "."+DATA_FORMAT;
    };
    
    cspace.collectionObjectDAO.createFileSystemURLFactory = function (resourceUrls) {
        return function (baseUrl, resourceUrl, id) {
            var serverUrl = cspace.collectionObjectDAO.serverURLFactory(baseUrl, resourceUrl, id);
            if (id) {
                return serverUrl + "." + DATA_FORMAT;
            }
            
            var resourceKey = fluid.findKeyInObject(resourceUrls, resourceUrl);
            return serverUrl + resourceKey + "." + DATA_FORMAT;
        };
    };
    
    fluid.defaults("cspace.collectionObjectDAO", {
        resources: {
            objects: "objects/",
            schema: "objects/schema/"
        },
        baseUrl: "./",
        newObjectIDToken: "NEW_ID"
    });
    
})(jQuery, fluid_1_1);
