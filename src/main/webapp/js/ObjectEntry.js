/*global jQuery, fluid_0_8*/

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
		that.objectDAO.fetchObjectSchema(that.events.onFetchSchemaSuccess.fire, that.events.onFetchSchemaError.fire);
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
        }
	});
})(jQuery, fluid_0_8);
