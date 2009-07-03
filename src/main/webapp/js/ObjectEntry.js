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

    var buildFullUISchema = function (that) {
        var fullUISchema = fluid.copy(that.schema);
        
		// This makes the assumption that 'save' exists. This should be configurable.
        fullUISchema.save = {
            "selector": that.options.selectors.save,
            "validators": [],
            "decorators": [
                {type: "jQuery",
                    func: "click", 
                    args: that.save
                }
            ]
        };
        return fullUISchema;
    };
    
    var buildEmptyModelFromSchema = function (schema) {
        var model = {};
        for (var key in schema) {
            if (schema.hasOwnProperty(key)) {
                model[key] = "";
            }
        }
        return model;
    };
    
    var bindEventHandlers = function (that) {
        that.events.afterFetchSchemaSuccess.addListener(function (schema, textStatus) {
            that.schema = schema;
            that.model = buildEmptyModelFromSchema(schema);
            if (that.options.objectId) {
                that.objectDAO.fetchObjectForId(that.options.objectId, that.events.afterFetchObjectDataSuccess.fire, that.events.afterFetchObjectDataError.fire);
            } else {
                that.refreshView();
            }
        });
        
        that.events.afterFetchSchemaError.addListener(function (xhr, msg, error) {
            that.showSchemaErrorMessage(that.options.strings.schemaFetchError + msg + that.options.strings.errorRecoverySuggestion);
            that.locate("savedMessage").hide();
        });

        that.events.afterFetchObjectDataSuccess.addListener(function (data, textStatus) {
            that.updateModel(data);
            that.locate("savedMessage").hide();
        });

        that.events.afterFetchObjectDataError.addListener(function (xhr, msg, error) {
            // TODO: decide on appropriate response to this situation
            that.locate("savedMessage").hide();
        });
        
        that.events.afterSaveObjectDataSuccess.addListener(function () {
            that.locate("savedMessage").text(that.options.strings.saveSuccessfulMessage).show();
        });
        
        that.events.afterSaveObjectDataError.addListener(function (xhr, msg, error) {
            that.locate("savedMessage").text(that.options.strings.saveFailedMessage+msg).show();
        });
        
        that.events.afterSaveObjectDataSuccess.addListener(function () {
            that.objectDAO.fetchObjects(that.recentActivity.updateModel, console.log("Foo!!"));
        });
    };
    
    var setupObjectEntry = function (that) {
        that.objectDAO = fluid.initSubcomponent(that, "dao", [fluid.COMPONENT_OPTIONS]);
        bindEventHandlers(that);
        that.objectDAO.fetchObjectSchema(that.events.afterFetchSchemaSuccess.fire, that.events.afterFetchSchemaError.fire);
    };
    
    cspace.objectEntry = function (container, options) {
        var that = fluid.initView("cspace.objectEntry", container, options);
        that.model = {};
        that.recentActivity = fluid.initSubcomponent(that, "recentActivity", [".recently-created-container", options]);
        
        that.refreshView = function () {
            cspace.renderer.renderPage(that);
        };
        
        that.updateModel = function (newModel, source) {
            that.events.modelChanged.fire(newModel, that.model, source);
            fluid.clear(that.model);
            fluid.model.copyModel(that.model, newModel);
            that.refreshView();
        };
        
        that.showSchemaErrorMessage = function (msg) {
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
        buildCutpoints: function (schema) {
            var cutpoints = [];
            
            var index = 0;
            for (var key in schema) {
                if (schema.hasOwnProperty(key)) {
                    cutpoints[index] = {
                        id: key,
                        selector: schema[key].selector
                    };
                    index += 1;
                }
            }
            return cutpoints;
        },

        buildComponentTree: function (schema, model) {
            var tree = {children: []};
            
            var index = 0;
            for (var key in schema) {
                if (schema.hasOwnProperty(key)) {
                    tree.children[index] = {
                        ID: key,
                        valuebinding: key
                    };
                    if (schema[key].decorators && schema[key].decorators.length > 0) {
                        tree.children[index].decorators = schema[key].decorators;
                    }
                    index += 1;
                }
            }
            return tree;
        },

        renderPage: function (that) {
            var fullUISchema = buildFullUISchema(that);
            var renderOptions = {
                model: that.model,
//                debugMode: true,
                autoBind: true
            };
            var cutpoints = cspace.renderer.buildCutpoints(fullUISchema);            
            var model = cspace.renderer.buildComponentTree(fullUISchema, that.model);
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
        recentActivity: {
            type: "cspace.recentActivity"
        },
        events: {
            modelChanged: null,
            afterFetchSchemaSuccess: null,
            afterFetchSchemaError: null,
            afterFetchObjectDataSuccess: null,
            afterFetchObjectDataError: null,
            afterSaveObjectDataSuccess: null,
            afterSaveObjectDataError: null,
            onSave: null
        },
        selectors: {
            errorDialog: ".csc-error-dialog",
            errorMessage: ".csc-error-message",
            save: ".csc-save",
            savedMessage: ".csc-saved-message"
        },
        strings: {
            schemaFetchError: "I'm sorry, an error has occurred fetching the Schema: ",
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
        objectId: null
    });
})(jQuery, fluid_1_1);
