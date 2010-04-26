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

    var setupRecordList = function (that) {
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

    cspace.recordList = function (container, options) {
        var that = fluid.initView("cspace.recordList", container, options);
        that.model = {
            items: (options.data? options.data: [])
        };
        that.renderTemplate = undefined;

        that.showErrorMessage = function (msg) {
            that.locate("errorMessage").text(msg).show();
        };

        that.updateModel = function (newModel) {
            fluid.model.copyModel(that.model.items, newModel);
            that.refreshView();
        };

        that.refreshView = function () {
            that.locate("noneYetMessage").hide();
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
            var protoTree = cspace.renderUtils.buildProtoTree(that.options.uispec, that);
            var tree = expander(protoTree);
            var selectors = {};
            cspace.renderUtils.buildSelectorsFromUISpec(that.options.uispec, selectors);
            var renderOpts = {
                cutpoints: fluid.engage.renderUtils.selectorsToCutpoints(selectors, {}),
                model: that.model,
                // debugMode: true,
                autoBind: true//,
           //     applier: that.options.applier
            };
            if (!that.renderTemplate) {
                that.renderTemplate = fluid.selfRender(that.container, tree, renderOpts);
            } else {
                that.renderTemplate =fluid.reRender(that.renderTemplate, that.container, tree, renderOpts);
            }
            if (that.model.items.length <= 0) {
                that.locate("noneYetMessage").show();
            }
            that.locate("numberOfItems").text("(" + that.model.items.length + ")");
            that.events.afterRender.fire();
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
            errorMessage: ".csc-error-message",
            noneYetMessage: ".csc-no-records-message"
        },
        events: {
            modelChanged: null,
            afterRender: null
        }
    });

})(jQuery, fluid_1_2);
