/*global jQuery, fluid_1_0*/

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
    
    var bindEventHandlers = function (that) {
        that.events.afterFetchSchemaSuccess.addListener(function (schema, textStatus) {
            that.schema = schema;
        });
        
        that.events.afterFetchSchemaError.addListener(function (xhr, msg, error) {
            that.showSchemaErrorMessage(that.options.strings.schemaFetchError + msg + that.options.strings.errorRecoverySuggestion);
        });

        that.events.afterFetchObjectDataSuccess.addListener(function (data, textStatus) {
            that.updateModel(data);
        });

        that.events.afterFetchObjectDataError.addListener(function (xhr, msg, error) {
            // TODO: decide on appropriate response to this situation
        });
    };
    
    var setupObjectEntry = function (that) {
        that.objectDAO = fluid.initSubcomponent(that, "dao");
        bindEventHandlers(that);
        that.objectDAO.fetchObjectSchema(that.events.afterFetchSchemaSuccess.fire, that.events.afterFetchSchemaError.fire);
        that.objectDAO.fetchObjectForId(that.options.objectId, that.events.afterFetchObjectDataSuccess.fire, that.events.afterFetchObjectDataError.fire);
    };
    
    cspace.objectEntry = function (container, options) {
        var that = fluid.initView("cspace.objectEntry", container, options);
        that.model = {};
        
        that.refreshView = function () {
            cspace.renderer.renderPage(that);
        };
        
        that.updateModel = function (newModel, source) {
            that.model = newModel;
            that.refreshView();
        };
        
        that.showSchemaErrorMessage = function (msg) {
            that.locate("errorMessage").text(msg);
            that.locate("errorDialog").dialog({
                modal: true,
                dialogClass: "fl-widget"
            });
        };
        
        that.save = function () {
            that.events.onSave.fire(that.model);
            that.objectDAO.saveObjectForId(that.model,
                that.options.objectId,
                that.events.afterSaveObjectDataSuccess.fire,
                that.events.afterSaveObjectDataError.fire
            );        
            return false;
        };

        setupObjectEntry(that);
        return that;
    };
    
    cspace.saveId = "save";
    
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
                cutpoints: cspace.renderer.buildCutpoints(fullUISchema),
                autoBind: true,
                debugMode: true
            };
            fluid.selfRender(that.container,
                             cspace.renderer.buildComponentTree(fullUISchema, that.model),
                             renderOptions);
        }    
    };
    
    fluid.defaults("cspace.objectEntry", {
        dao: {
            type: "cspace.collectionObjectDAO"
        },
        events: {
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
            save: ".csc-save"
        },
        strings: {
            schemaFetchError: "I'm sorry, an error has occurred fetching the Schema: ",
            errorRecoverySuggestion: "Please try refreshing your browser"
        },
        objectId: null
    });
})(jQuery, fluid_1_0);
