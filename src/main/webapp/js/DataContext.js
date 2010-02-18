/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {
    
    var types = {
        create: "POST",
        fetch: "GET",
        update: "PUT",
        remove: "DELETE"
    };

    var buildUrl = function (baseUrl, recordType, csid, fileExtension) {
        return cspace.util.addTrailingSlash(baseUrl) + recordType + "/" + (csid ? csid + fileExtension : "");
    };

    /*
     * that: the DataContext object
     * operation: string ("create", "fetch", "update", "remove"); will be displayed in the case of an error
     * successEvent: event to fire after success
     * csid: the csid to fetch (optional)
     */
    var ajax = function (that, operation, successEvent, csid) {
        var opts = {
            url: buildUrl(that.options.baseUrl, that.options.recordType, csid, that.options.fileExtension),
            type: types[operation],
            dataType: that.options.dataType,
            success: function (data, textStatus) {
                successEvent.fire(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                that.events.onError.fire(operation, textStatus);
            }
        };
        if (operation === "create" || operation === "update") {
            opts.data = JSON.stringify(that.model);
        }
        jQuery.ajax(opts);
    };

    var bindEventHandlers = function (that) {
        that.events.afterFetch.addListener(function (data) {
            that.updateModel(data);
        });
    };

    /**
     * The Data Context, an object that provides generic CRUD operations for models.
     * 
     * @param {Object} model the model that is bound to this data context
     * @param {Object} options configuration options
     */
    cspace.dataContext = function (model, options) {
        var that = {
            model: model
        };
        fluid.mergeComponentOptions(that, "cspace.dataContext", options);
        fluid.instantiateFirers(that, that.options);

        that.updateModel = function (newModel, source) {
            var oldModel = {};
            fluid.model.copyModel(oldModel, that.model);
            $.extend(true, that.model, newModel);
            that.events.modelChanged.fire(that.model, oldModel, source);
        };
        
        that.fetch = function (csid) {
            ajax(that, "fetch", that.events.afterFetch, csid);
        };
        
        that.update = function () {
            ajax(that, "update", that.events.afterUpdate, that.model.csid);
        };
        
        that.create = function () {
            ajax(that, "create", that.events.afterCreate);
        };

        that.baseUrl = function () {
            return that.options.baseUrl;
        };

        bindEventHandlers(that);
        return that;
    };

    fluid.defaults("cspace.dataContext", {
        events: {
            modelChanged: null,    // newModel, oldModel, source
            afterCreate: null,   // data
            afterRemove: null, // 
            afterFetch: null,  //  data
            afterUpdate: null,  //  data
            onError: null      // operation["create", "remove", "fetch", "update"], message
        },
        baseUrl: "../../chain",
        recordType: "",
        dataType: "json",
        fileExtension: ""
    });

})(jQuery, fluid_1_2);
