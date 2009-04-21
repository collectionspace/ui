/*global jQuery, fluid_1_0*/

var cspace = cspace || {};

(function ($, fluid) {

	var bindEventHandlers = function (that) {
		that.events.onFetchSchemaSuccess.addListener(function (schema) {
			that.updateModel(schema);
		});
		
		that.events.onFetchSchemaError.addListener(function (xhr, msg, error) {
			that.showSchemaErrorMessage(that.options.strings.schemaFetchError + msg + that.options.strings.errorRecoverySuggestion);
		});
	};
	
	var setupObjectEntry = function (that) {
		bindEventHandlers(that);
        that.objectDAO = fluid.initSubcomponent(that, "dao");
		that.schema = that.objectDAO.fetchObjectSchema(that.events.onFetchSchemaSuccess.fire, that.events.onFetchSchemaError.fire);
	};
	
	cspace.objectEntry = function (container, options) {
		var that = fluid.initView("cspace.objectEntry", container, options);
		that.model = {};
		
    	that.updateModel = function (newModel, source) {
			that.model = newModel;
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
	
    cspace.objectEntry.renderer = {
        buildCutpoints: function (schema) {
            var cutpoints = [];
            
            var index = 0;
            for (key in schema) {
                cutpoints[index++] = {
                    id: key,
                	selector: schema[key].selector
                };
            }
            return cutpoints;
        },
        buildComponentTree: function () {
            var tree = {};
            
            return tree;
        },
        renderPage: function () {
            fluid.selfRender(that.container, buildComponentTree(), {debugMode: true});
        }    
    };
    
	fluid.defaults("cspace.objectEntry", {
        dao: {
            type: "cspace.collectionObjectDAO"
        },
		events: {
			onFetchSchemaSuccess: null,
			onFetchSchemaError: null
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
