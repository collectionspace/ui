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


    // Ultimately, the UISpec will be loaded via JSONP (see CSPACE-300). Until then,
    // load it manually via ajax
    var fetchUISpec = function (that, callback) {
        jQuery.ajax({
            url: that.options.uiSpecUrl,
            type: "GET",
            dataType: "json",
            success: callback,
            error: function (xhr, textStatus, errorThrown) {
                that.showErrorMessage("COnfiguration information temporarily unavailable, sorry");
            }
        });
    };

    var bindEventHandlers = function (that) {
        that.dataContext.events.modelChanged.addListener(function (newModel, oldModel, source) {
            that.events.modelChanged.fire(newModel, oldModel, source);
            that.refreshView();
            that.locate("errorMessage").hide();
        });

        that.dataContext.events.onError.addListener(function (operation, modelPath, message) {
            // temporary, for testing only:
            that.showErrorMessage("Records temporarily unavailable, sorry");
        });
    };

    var createDataContextSetup = function (that) {
        return function (spec, textStatus) {
            that.spec = spec.spec;

            // insert the resourceMapper options retrieved with the UISpec into the options structure
            that.options.dataContext.options = that.options.dataContext.options || {};
            that.options.dataContext.options.modelToResourceMap = spec.modelToResourceMap;

            that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);

            bindEventHandlers(that);
            that.locate("errorMessage").hide();
            that.dataContext.fetch("*", {});
        };
    };

    var setupRecordList = function (that) {
        fetchUISpec(that, createDataContextSetup(that));
    };

    cspace.recordList = function (container, options) {
        var that = fluid.initView("cspace.recordList", container, options);
        that.model = {
            records: []
        };
        that.spec = {};

        that.showErrorMessage = function (msg) {
            that.locate("errorMessage").text(msg).show();
        };

        that.refreshView = function () {
            var tree = cspace.renderer.buildComponentTree(that.spec, that.model);
            var cutpoints = cspace.renderer.createCutpoints(that.spec);
            fluid.selfRender(that.container, tree, {cutpoints: cutpoints, model: that.model, debugMode: true});
        };

        setupRecordList(that);
        return that;
    };
    
    fluid.defaults("cspace.recordList", {
        dataContext: {
            type: "cspace.resourceMapperDataContext"
        },
        selectors: {
            numberOfItems: ".csc-num-items",    // present in sidebar, not in find/edit
            row: ".csc-record-list-row",
            columns: {
                col1: ".csc-record-list-col-1",
                col2: ".csc-record-list-col-2"
            },
            errorMessage: ".csc-error-message"
        },
        events: {
            modelChanged: null
        },
        uiSpecUrl: "./find-edit/spec/spec.json",
        template: {
            url: "list.html",
            id: "list"
        }
    });

})(jQuery, fluid_1_1);
