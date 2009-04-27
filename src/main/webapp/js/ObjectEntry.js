/*global jQuery, fluid_1_0*/

var cspace = cspace || {};

(function ($, fluid) {

    var bindEventHandlers = function (that) {
        that.events.onFetchSchemaSuccess.addListener(function (schema, textStatus) {
            that.schema = schema;
        });
        
        that.events.onFetchSchemaError.addListener(function (xhr, msg, error) {
            that.showSchemaErrorMessage(that.options.strings.schemaFetchError + msg + that.options.strings.errorRecoverySuggestion);
        });

        that.events.onFetchObjectDataSuccess.addListener(function (data, textStatus) {
            that.updateModel(data);
        });

        that.events.onFetchObjectDataError.addListener(function (xhr, msg, error) {
            console.log("Error fetching object data: " + msg + error);
        });
    };
    
    var setupObjectEntry = function (that) {
        bindEventHandlers(that);
        that.objectDAO = fluid.initSubcomponent(that, "dao");
        that.objectDAO.fetchObjectSchema(that.events.onFetchSchemaSuccess.fire, that.events.onFetchSchemaError.fire);
        that.objectDAO.fetchObjectForId(that.options.objectId, that.events.onFetchObjectDataSuccess.fire, that.events.onFetchObjectDataError.fire);
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
        
        setupObjectEntry(that);
        return that;
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
                    index += 1;
                }
            }
            return tree;
        },
        renderPage: function (component) {
            var renderOptions = {
                model: component.model,
                cutpoints: cspace.renderer.buildCutpoints(component.schema),
                autoBind: true,
                debugMode: true
            };
            fluid.selfRender(component.container,
                             cspace.renderer.buildComponentTree(component.schema, component.model),
                             renderOptions);
        }    
    };
    
    fluid.defaults("cspace.objectEntry", {
        dao: {
            type: "cspace.collectionObjectDAO"
        },
        events: {
            onFetchSchemaSuccess: null,
            onFetchSchemaError: null,
            onFetchObjectDataSuccess: null,
            onFetchObjectDataError: null
        },
        selectors: {
            errorDialog: ".csc-error-dialog",
            errorMessage: ".csc-error-message"
        },
        strings: {
            schemaFetchError: "I'm sorry, an error has occurred fetching the Schema: ",
            errorRecoverySuggestion: "Please try refreshing your browser"
        },
        objectId: null
    });
})(jQuery, fluid_1_0);
