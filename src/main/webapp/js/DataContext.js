/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("DataContext.js loaded");
    
    var types = {
        create: "POST",
        fetch: "GET",
        update: "PUT",
        remove: "DELETE",
        addRelations: "POST"
    };

    var buildOpts = function (operation, options, successEvent, events, csid, data) {
        var opts = {
            url: cspace.util.buildUrl(operation, options.baseUrl, options.recordType, csid, options.fileExtension),
            type: types[operation],
            dataType: options.dataType,
            success: function (data, textStatus) {
                successEvent.fire(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                events.onError.fire(operation, textStatus);
            }
        };
        if (data) {
            opts.data = JSON.stringify(data);
        }
        return opts;
    };
    
    /*
     * operation: string ("create", "fetch", "update", "remove", "addRelations"); will be displayed in the case of an error
     * options: 
     * successEvent: event to fire after success
     * events: 
     * csid: the csid to fetch (optional)
     * data: the model or new relations to transmit (optional)
     */
    var ajax = function () {
        var opts = buildOpts.apply(null, arguments);
        $.ajax(opts);
    };

    var bindEventHandlers = function (that) {
        
        fluid.each(["afterCreate", "afterRemove", "afterUpdate", "afterAddRelations"], function (event) {
            that.events[event].addListener(function (data) {
                that.events.afterSave.fire(data);
            }, undefined, undefined, "last");
        });
        
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
            fluid.model.copyModel(that.model, newModel);
            that.events.modelChanged.fire(that.model, oldModel, source);
        };
        
        if (that.options.dataSource.options) {
            that.options.dataSource.options = that.options.dataSource.options || {};
            fluid.merge(null, that.options.dataSource.options, {
                baseUrl: that.options.baseUrl,
                fileExtension: that.options.fileExtension,
                recordType: that.options.recordType
            });
            that.dataSource = fluid.initSubcomponent(that, "dataSource", [
                fluid.COMPONENT_OPTIONS 
            ]);
            that.dataSource.events.afterFetchResources.addListener(function (data) {
                that.events.afterFetch.fire(data);
            });
        }
        
        /** Get a resourceSpec structure that may be used to issue the required
         * I/O for this dataContext operation at a later time. This currently causes
         * a violation of encapsulation which we will need to fix up with IoC later */ 
        that.getResourceSpec = function () {
            var opts = buildOpts.apply(null, arguments);
            var spec = {
                options: opts
            };
            spec.href = opts.url;
            delete spec.options.url;
            return spec;
        };
        
        that.fetch = function (csid) {
            if (that.dataSource) {
                that.dataSource.provideModel(csid);
            }
            else {
                ajax("fetch", that.options, that.events.afterFetch, that.events, csid);
            }
        };
        
        that.update = function () {
            ajax("update", that.options, that.events.afterUpdate, that.events, that.model.csid, that.model);
        };
        
        that.create = function () {
            ajax("create", that.options, that.events.afterCreate, that.events, null, that.model);
        };

        that.remove = function (csid) {
            ajax("remove", that.options, that.events.afterRemove, that.events, csid);
        };

        that.addRelations = function (newRelations) {
            ajax("addRelations", that.options, that.events.afterAddRelations, that.events, null, newRelations);
        };

        that.baseUrl = function () {
            return that.options.baseUrl;
        };

        bindEventHandlers(that);
        return that;
    };

    fluid.defaults("cspace.dataContext", {
        dataSource: {
            type: "cspace.dataSource"
        },
        events: {
            modelChanged: null,    // newModel, oldModel, source
            afterCreate: null,   // data
            afterRemove: null, // 
            afterFetch: null,  //  data
            afterUpdate: null,  //  data
            afterAddRelations: null,  //  data
            afterSave: null,
            onError: null      // operation["create", "remove", "fetch", "update"], message
        },
        baseUrl: "../../chain",
        recordType: "",
        dataType: "json",
        fileExtension: ""
    });

})(jQuery, fluid);
