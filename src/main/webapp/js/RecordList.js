/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

var cspace = cspace || {};

(function ($, fluid) {

    // This is temporary: Right now, auto-filled numbers are facilitated through a specially
    // named object record. The name of this record must be removed from the list of records.
    var cleanUpRecordList = function (list) {
        var cleanedList = [];
        var ci = 0;
        for (var i = 0; i < list.length; i++) {
            if (list[i] !== "__auto") {
                cleanedList[ci++] = list[i];
            }
        }
        return cleanedList;
    };

    // Ultimately, the UISpec will be loaded via JSONP (see CSPACE-300). Until then,
    // load it manually via ajax
    var fetchUISpec = function (that, callback) {
        jQuery.ajax({
            url: that.options.uiSpecUrl,
            type: "GET",
            dataType: "json",
            success: callback,
            error: function (xhr, textStatus, errorThrown) {
                that.showErrorMessage("Configuration information temporarily unavailable, sorry");
            }
        });
    };

    var bindEventHandlers = function (that) {
        that.dataContext.events.modelChanged.addListener(function (newModel, oldModel, source) {
            that.events.modelChanged.fire(newModel, oldModel, source);
            that.refreshView();
            that.locate("errorMessage").hide();
        });

        that.dataContext.events.onError.addListener(function (operation, message) {
            // temporary, for testing only:
            that.showErrorMessage("Records temporarily unavailable, sorry");
        });
    };

    var createDataContextSetup = function (that) {
        return function (spec, textStatus) {
            that.uispec = spec;

            that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);

            bindEventHandlers(that);
            that.locate("errorMessage").hide();
            if (that.options.data) {
                that.events.modelChanged.fire(that.options.data, that.model.items);
                that.model.items = that.options.data;
                that.refreshView();
                that.locate("errorMessage").hide();
            }
            else {
                if (cspace.util.isLocal()) {
                    that.dataContext.fetch("records/list");
                } else {
                    that.dataContext.fetch();
                }
            }
        };
    };

    var setupRecordList = function (that) {
        if (that.options.uispec) {
            createDataContextSetup(that)(that.options.uispec);
        } else {
            fetchUISpec(that, createDataContextSetup(that));
        }
    };

    cspace.recordList = function (container, options) {
        var that = fluid.initView("cspace.recordList", container, options);
        that.model = {
            items: (options.data? options.data: [])
        };
        that.uispec = {};

        that.showErrorMessage = function (msg) {
            that.locate("errorMessage").text(msg).show();
        };

        that.refreshView = function () {
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
            var protoTree = {};
            fluid.model.copyModel(protoTree, that.uispec);
            cspace.renderUtils.multiplyRows(protoTree, that.model);
            var tree = expander(protoTree);
            var selectors = {};
            cspace.renderUtils.buildSelectorsFromUISpec(that.uispec, selectors);
            var renderOpts = {
                cutpoints: fluid.engage.renderUtils.selectorsToCutpoints(selectors, {}),
                model: that.model,
                debugMode: true,
                autoBind: true,
                applier: that.options.applier
            };
            fluid.selfRender(that.container, tree, renderOpts);
/*
            that.model.items = cleanUpRecordList(that.model.items);
            var tree = cspace.renderer.buildComponentTree(that.uispec, that);
            var cutpoints = cspace.renderer.createCutpoints(that.uispec);
            fluid.selfRender(that.container, tree, {cutpoints: cutpoints, model: that.model});
*/
            that.locate("numberOfItems").text("(" + that.model.items.length + ")");
        };

        setupRecordList(that);
        return that;
    };
    
    fluid.defaults("cspace.recordList", {
        dataContext: {
            type: "cspace.dataContext"
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

})(jQuery, fluid_1_2);
