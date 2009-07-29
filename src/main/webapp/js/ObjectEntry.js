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
                that.showSpecErrorMessage(that.options.strings.specFetchError + textStatus + that.options.strings.errorRecoverySuggestion);
                that.locate("savedMessage").hide();
            }
        });
    };

    var buildFullUISpec = function (that) {
        var fullUISpec = fluid.copy(that.spec);
        
		// This makes the assumption that 'save' exists. This should be configurable.
        fullUISpec.save = {
            "selector": that.options.selectors.save,
            "validators": [],
            "decorators": [
                {type: "jQuery",
                    func: "click", 
                    args: that.save
                }
            ]
        };
        fullUISpec.saveSecondary = {
            "selector": that.options.selectors.saveSecondary,
            "validators": [],
            "decorators": [
                {type: "jQuery",
                    func: "click", 
                    args: that.save
                }
            ]
        };
        return fullUISpec;
    };
    
    var buildEmptyModelFromSpec = function (spec) {
        var model = {};
        for (var key in spec) {
            if (spec.hasOwnProperty(key)) {
                model[key] = "";
            }
        }
        return model;
    };
    
    var setupDataContext = function (that) {
        return function(spec, textStatus){
            that.spec = spec.spec;

            // insert the resourceMapper options retrieved with the UISpec into the options structure
            that.options.dataContext.options = that.options.dataContext.options || {};
            that.options.dataContext.options.modelToResourceMap = spec.modelToResourceMap;
            that.options.dataContext.options.replacements = spec.replacements;

            that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);

            that.dataContext.events.modelChanged.addListener(function (data, textStatus) {
                that.updateModel(data);
                that.locate("savedMessage").hide();
            });
            that.model = buildEmptyModelFromSpec(that.spec);
            if (that.options.objectId) {
                var queryParams = {};
                queryParams[that.options.idField] = that.options.objectId;
                that.dataContext.fetch("*", queryParams);
            }
            else {
                that.refreshView();
            }
        };
    };
    
    var bindEventHandlers = function (that) {
        that.events.afterSaveObjectDataSuccess.addListener(function () {
            that.locate("savedMessage").text(that.options.strings.saveSuccessfulMessage).show();
        });
        
        that.events.afterSaveObjectDataError.addListener(function (xhr, msg, error) {
            that.locate("savedMessage").text(that.options.strings.saveFailedMessage+msg).show();
        });
    };
    
    var setupObjectEntry = function (that) {
        that.objectDAO = fluid.initSubcomponent(that, "dao", [fluid.COMPONENT_OPTIONS]);
        bindEventHandlers(that);
        fetchUISpec(that, setupDataContext(that));
    };

    /**
     * Object Entry component
     */
    cspace.objectEntry = function (container, options) {
        var that = fluid.initView("cspace.objectEntry", container, options);
        that.model = {};
        that.spec = {};

        that.refreshView = function () {
            cspace.renderer.renderPage(that);
        };
        
        that.updateModel = function (newModel, source) {
            that.events.modelChanged.fire(newModel, that.model, source);
            fluid.clear(that.model);
            fluid.model.copyModel(that.model, newModel);
            that.refreshView();
        };
        
        that.showSpecErrorMessage = function (msg) {
            that.locate("errorMessage", "body").text(msg);
            that.locate("errorDialog", "body").dialog({
                modal: true,
                dialogClass: "fl-widget"
            });
        };

        that.save = function () {
            that.events.onSave.fire(that.model);
            if (that.options.objectId) {
                that.objectDAO.saveObjectForId(that.model,
                    that.options.objectId,
                    that.events.afterSaveObjectDataSuccess.fire,
                    that.events.afterSaveObjectDataError.fire
                );        
            } else {
                that.objectDAO.saveNewObject(that.model,
                    that.events.afterSaveObjectDataSuccess.fire,
                    that.events.afterSaveObjectDataError.fire
                );        
            }
            return false;
        };

        setupObjectEntry(that);
        return that;
    };
    
    cspace.saveId = "save";
    
    var createTemplateRenderFunc = function (resource, key, node, model, opts) {
        return function () {
            var templates = fluid.parseTemplates(resource, [key], {});
            fluid.reRender(templates, node, model, opts);
        };
    };
    
    cspace.renderer = {
        buildCutpoints: function (spec) {
            var cutpoints = [];
            
            var index = 0;
            for (var key in spec) {
                if (spec.hasOwnProperty(key)) {
                    cutpoints[index] = {
                        id: key,
                        selector: spec[key].selector
                    };
                    index += 1;
                }
            }
            return cutpoints;
        },

        buildComponentTree: function (spec, model) {
            var tree = {children: []};
            
            var index = 0;
            for (var key in spec) {
                if (spec.hasOwnProperty(key)) {
                    tree.children[index] = {
                        ID: key,
                        valuebinding: key
                    };
                    if (spec[key].decorators && spec[key].decorators.length > 0) {
                        tree.children[index].decorators = spec[key].decorators;
                    }
                    index += 1;
                }
            }
            return tree;
        },

        renderPage: function (that) {
            var fullUISpec = buildFullUISpec(that);
            var renderOptions = {
                model: that.model,
//                debugMode: true,
                autoBind: true
            };
            var cutpoints = cspace.renderer.buildCutpoints(fullUISpec);            
            var model = cspace.renderer.buildComponentTree(fullUISpec, that.model);
            for (var key in that.options.templates) {
                if (that.options.templates.hasOwnProperty(key)) {
                    var templ = that.options.templates[key];
                    var resource = {};
                    resource[key] = {
                        href: templ.url,
                        nodeId: templ.id,
                        cutpoints: cutpoints
                    };
                    fluid.fetchResources(resource,
                        createTemplateRenderFunc(resource, key, fluid.byId(templ.id), model, renderOptions));
                }
            }
        }    
    };
    
    fluid.defaults("cspace.objectEntry", {
        dao: {
            type: "cspace.collectionObjectDAO"
        },
        dataContext: {
            type: "cspace.resourceMapperDataContext"
        },
        events: {
            modelChanged: null,
			onSave: null,
            afterSaveObjectDataSuccess: null,  // params: data, textStatus
            afterSaveObjectDataError: null  // params: XMLHttpRequest, textStatus, errorThrown
        },
        selectors: {
            errorDialog: ".csc-error-dialog",
            errorMessage: ".csc-error-message",
            save: ".csc-save",
            saveSecondary: ".csc-save-bottom",
            savedMessage: ".csc-saved-message"
        },
        strings: {
            specFetchError: "I'm sorry, an error has occurred fetching the Spec: ",
            errorRecoverySuggestion: "Please try refreshing your browser",
            saveSuccessfulMessage: "Object record successfully saved",
            saveFailedMessage: "Error: Object record not saved: "
        },
        templates: {
//            header: {
//                url: "../html/ObjectEntryHeaderTemplate.html",
//                id: "csc-header"
//            },
            body: {
                url: "../html/ObjectEntryTemplate.html",
                id: "csc-object-entry-template"
            }
        },
        objectId: null,
        idField: "id",

        // Ultimately, the UISpec will be loaded via JSONP (see CSPACE-300). Until then,
        // load it manually via ajax
        uiSpecUrl: "./objects/schema/schema.json"
    });
})(jQuery, fluid_1_1);
