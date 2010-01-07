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
                that.locate("messageContainer").hide();
                that.events.onError.fire("fetch UISpec");
            }
        });
    };

    var fetchRelatedRecordsUISpec = function (that, callback) {
        jQuery.ajax({
            // TODO: Figure out where the UI spec will come from!
            url: "./related-records/spec/spec.json",
            type: "GET",
            dataType: "json",
            success: callback,
            error: function (xhr, textStatus, errorThrown) {
                that.showSpecErrorMessage(that.options.strings.specFetchError + textStatus + that.options.strings.errorRecoverySuggestion);
                that.locate("messageContainer").hide();
                that.events.onError.fire("fetch related records UISpec");
            }
        });
    };

    displayTimestampedMessage = function (that, msg, time) {
        that.locate("feedbackMessage").text(msg);
        that.locate("timestamp").text(time);
        that.locate("messageContainer").show();
        
    };

    var buildEmptyModelFromSpec = function (spec) {
        var model = {};
        for (var key in spec) {
            if (spec.hasOwnProperty(key)) {
                fluid.model.setBeanValue(model, key, (spec[key].hasOwnProperty("repeated") ? [""] : ""));
            }
        }
        return model;
    };
    
    var makeDCErrorHandler = function (that) {
        return function(operation/*["create", "delete", "fetch", "update"]*/, modelPath, message){
            var msgKey = operation + "FailedMessage";
            var msg = that.options.strings[msgKey] + message;
            displayTimestampedMessage(that, msg, "");
            that.events.onError.fire(operation);
            if (operation === "create") {
                // This is only temporary until http://issues.collectionspace.org/browse/CSPACE-263
                // is resolved
                that.options.csid = undefined;
                that.applier.requestChange("fields.csid", undefined);
            }
        };
    };

    var makeDisplayFieldUpdater = function (selector) {
        return function (model, oldModel, changeRequest) {
            $(selector).text(fluid.model.getBeanValue(model, changeRequest.path));
        };
    };

    var setupModel = function (that) {
        that.applier = fluid.makeChangeApplier(that.model);

        // check the spec for any model fields that need to be displayed in an extra field
        for (var key in that.spec) {
            if (that.spec.hasOwnProperty(key)) {
                var modelfield = that.spec[key];
                if (modelfield.hasOwnProperty("displayOnlySelectors")) {
                    var displayOnlySelectors = modelfield.displayOnlySelectors;
                    for (var i=0, len = displayOnlySelectors.length; i<len; i++) {
                        var sel = displayOnlySelectors[i];
                        that.displayOnlyFields[key] = sel;
                        that.applier.modelChanged.addListener(key, makeDisplayFieldUpdater(sel));                        
                    }
                }
            }
        }
    };
	
	var setupConfirmation = function (that) {
        
        var resources = {
            confirmation: {
                href: that.options.confirmationTemplateUrl
            }
        };
        
        var confirmation = $("<div></div>", that.container[0].ownerDocument)
            .html("You are about to navigate from the current record. Please confirm...")
            .dialog({
                autoOpen: false,
                title: "Confirmation."
            });
		
		confirmation.parent().css("overflow", "visible")
        
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["confirmation"], {});
            fluid.reRender(templates, confirmation, {});
        });
        
		$("a:not([href^=#])").live("click", function (e) {
           confirmation.dialog("open");
			var href = e.originalTarget.href;
			cspace.confirmation(confirmation, {model: {href: href}, action: that.save});
           return false;
       });		
   };

    var bindEventHandlers = function (that) {

        that.dataContext.events.afterCreate.addListener(function (modelPath, data) {
            that.applier.requestChange(that.options.idField, data.fields.csid);
            that.events.afterCreateObjectDataSuccess.fire(data, that.options.strings.createSuccessfulMessage);
	        displayTimestampedMessage(that, that.options.strings.createSuccessfulMessage, Date());
            that.options.csid = data.fields.csid;
        });

        that.dataContext.events.afterUpdate.addListener(function (modelPath, data) {
            that.events.afterUpdateObjectDataSuccess.fire(data, that.options.strings.updateSuccessfulMessage);
	        displayTimestampedMessage(that, that.options.strings.updateSuccessfulMessage, Date());
        });

        that.dataContext.events.afterFetch.addListener(function (modelPath, data) {
            setupModel(that);
            that.refreshView();
        });

        that.events.pageRendered.addListener(function () {
            for (var path in that.displayOnlyFields) {
                if (that.displayOnlyFields.hasOwnProperty(path)) {
                    $(that.displayOnlyFields[path]).text(fluid.model.getBeanValue(that.model, path) + " ");
                }
            }
        });
        
        for (var key in that.options.templates) {
            if (that.options.templates.hasOwnProperty(key)) {
                var templ = that.options.templates[key];
                if (templ.hasOwnProperty("setupFunction")) {
                    var func = templ.setupFunction;
                    var data = templ.data;
                    that.events.pageRendered.addListener(function () {
						var args = [that.model.fields.csid];
                        if (data) {
							 args.push(that.model[data]);
                        }
                        fluid.invokeGlobalFunction(func, args);
                    });
                }
            }
        }
		
		setupConfirmation(that);

        that.dataContext.events.onError.addListener(makeDCErrorHandler(that));
    };
    
    var setupDataContext = function (that) {
        return function(spec, textStatus){
            that.spec = spec.spec;

            // insert the resourceMapper options retrieved with the UISpec into the options structure
            that.options.dataContext.options = that.options.dataContext.options || {};
            that.options.dataContext.options.modelToResourceMap = spec.modelToResourceMap;
            that.options.dataContext.options.replacements = spec.replacements;

            that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);

            bindEventHandlers(that);
            
            fluid.model.copyModel(that.model, buildEmptyModelFromSpec(that.spec));
            var queryParams = {};
            if (that.options.csid) {
                fluid.model.setBeanValue(queryParams, that.options.idField, that.options.csid);
                that.dataContext.fetch("*", queryParams);
            } else {
                setupModel(that);
                that.refreshView();
            }
        };
    };
    
    var renderRelatedRecords = function (that) {
        return function (spec, textStatus) {
            
        };
    };

    var setupRelatedRecords = function (that){
        fetchRelatedRecordsUISpec(that, renderRelatedRecords(that));
    };

    var setupDataEntry = function (that) {
        fetchUISpec(that, setupDataContext(that));
    };

    /**
     * Object Entry component
     */
    cspace.dataEntry = function (container, options) {
        var that = fluid.initView("cspace.dataEntry", container, options);
        that.model = {
            fields: {},
            relations: {}
        };
        that.spec = {};
        that.displayOnlyFields = {};

        that.refreshView = function () {
            cspace.renderer.renderPage(that);
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
            if (that.options.csid) {
                that.dataContext.update("*");
            } else {
                that.applier.requestChange(that.options.idField, "");
                that.dataContext.create("*");
            }
            return false;
        };

        setupDataEntry(that);
        setupRelatedRecords(that);
        return that;
    };
    
    cspace.saveId = "save";
    
    fluid.defaults("cspace.dataEntry", {
        dataContext: {
            type: "cspace.resourceMapperDataContext"
        },
        events: {
	        onSave: null,
            afterCreateObjectDataSuccess: null,  // params: data, textStatus
            afterUpdateObjectDataSuccess: null,  // params: data, textStatus
            onError: null,  // params: operation
            pageRendered: null
        },
        selectors: {
            errorDialog: ".csc-error-dialog",
            errorMessage: ".csc-error-message",
            save: ".csc-save",
            saveSecondary: ".csc-save-bottom",
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            relatedRecords: ".csc-related-records"
        },
        strings: {
            specFetchError: "I'm sorry, an error has occurred fetching the UISpec: ",
            errorRecoverySuggestion: "Please try refreshing your browser",
            updateSuccessfulMessage: "Object Record successfully saved",
            createSuccessfulMessage: "New Object Record successfully created",
            updateFailedMessage: "Error saving Record: ",
            createFailedMessage: "Error creating Record: ",
            deleteFailedMessage: "Error deleting Record: ",
            fetchFailedMessage: "Error retriving Record: ",
            defaultTermIndicator: " (default)",
            noDefaultInvitation: "-- Select an item from the list --"
        },
        templates: {
            header: {
                url: "../html/header.html",
                id: "name-header"
            },
            body: {
                url: "../html/ObjectEntryTemplate.html",
                id: "csc-object-entry-template"
            },
            rightSidebar:  {
                url: "../html/right-sidebar.html",
                id: "csc-right-sidebar",
                setupFunction: "cspace.setupRightSidebar",
                data: "relations"
            },
            footer: {
                url: "../html/footer.html",
                id: "footer"
            }
        },
        csid: null,
        idField: "fields.csid",
        alternateFields: [],
		 confirmationTemplateUrl: "../html/Confirmation.html",
        
        // Ultimately, the UISpec will be loaded via JSONP (see CSPACE-300). Until then,
        // load it manually via ajax
        uiSpecUrl: "./schemas/collection-object/schema.json"

    });
})(jQuery, fluid_1_1);
