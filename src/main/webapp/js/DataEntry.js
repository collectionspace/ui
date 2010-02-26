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

    var displayTimestampedMessage = function (locater, msg, time) {
        var messageContainer = locater.locate("messageContainer", "body");
        locater.locate("feedbackMessage", messageContainer).text(msg);
        locater.locate("timestamp", messageContainer).text(time);
        messageContainer.show();
        
    };

    var makeDCErrorHandler = function (that) {
        return function (operation/*["create", "delete", "fetch", "update"]*/, message) {
            var msgKey = operation + "FailedMessage";
            var msg = that.options.strings[msgKey] + message;
            displayTimestampedMessage(that.dom, msg, "");
            that.events.onError.fire(operation);
            if (operation === "create") {
                // This is only temporary until http://issues.collectionspace.org/browse/CSPACE-263
                // is resolved
                that.options.applier.requestChange("csid", undefined);
            }
        };
    };

	var setupConfirmation = function (that) {
        var resources = {
            confirmation: {
                href: that.options.confirmationTemplateUrl
            }
        };
        
        var confirmation = $("<div></div>", that.container[0].ownerDocument)
            .html(that.options.strings.confirmation)
            .dialog({
                autoOpen: false,
                modal: true,
                title: that.options.strings.confirmationTitle
            });
		
		confirmation.parent().css("overflow", "visible");
        
        fluid.fetchResources(resources, function () {
            var templates = fluid.parseTemplates(resources, ["confirmation"], {});
            fluid.reRender(templates, confirmation, {});
        });
        
		$("a:not([href*=#])").live("click", function (e) {
            if (that.unsavedChanges) {
                var href;
                if (e.target.nodeName === "IMG") {
                    // this assumes that if the target is an image, it must be wrapped in an <a>
                    href = e.target.parentNode.href;
                } else {
                    href = e.target.href;
                }
                confirmation.dialog("open");
                cspace.confirmation(confirmation, {model: {href: href}, action: that.save});
                return false;
            }
        });		
    };

    var bindEventHandlers = function (that) {

        setupConfirmation(that);

        that.events.onSave.addListener(function () {
            displayTimestampedMessage(that, that.options.strings.savingMessage, "");
        });

        that.options.dataContext.events.afterCreate.addListener(function (data) {
            that.options.applier.requestChange("csid", data.csid);
            that.events.afterCreateObjectDataSuccess.fire(data, that.options.strings.createSuccessfulMessage);
	        displayTimestampedMessage(that, that.options.strings.createSuccessfulMessage, Date());
            that.unsavedChanges = false;
        });

        that.options.dataContext.events.afterUpdate.addListener(function (data) {
            that.events.afterUpdateObjectDataSuccess.fire(data, that.options.strings.updateSuccessfulMessage);
	        displayTimestampedMessage(that, that.options.strings.updateSuccessfulMessage, Date());
            that.unsavedChanges = false;
        });

        that.options.dataContext.events.afterFetch.addListener(function (data) {
            that.refreshView();
        });

        that.events.pageRendered.addListener(function () {
            that.locate("save").click(that.save);
            for (var selector in that.options.uispec) {
                if (that.options.uispec.hasOwnProperty(selector)) {
                    if (selector.indexOf(":") !== -1) {
                        selector = selector.substring(0, selector.indexOf(":"));
                    }
                    var el = $(selector);
                    el.change(function () {
                        that.unsavedChanges = true;
                    });
                }
            }        
        });

        that.options.dataContext.events.onError.addListener(makeDCErrorHandler(that));
   };
    
    var setupDataEntry = function (that) {
        bindEventHandlers(that);
        that.refreshView();
    };
    
    var renderPage = function (that) {
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
        var protoTree = cspace.renderUtils.buildProtoTree(that.options.uispec, that);
        var tree = expander(protoTree);
        cspace.renderUtils.fixSelectionsInTree(tree);
        var selectors = {};
        cspace.renderUtils.buildSelectorsFromUISpec(that.options.uispec, selectors);
        var renderOpts = {
            cutpoints: fluid.engage.renderUtils.selectorsToCutpoints(selectors, {}),
            model: that.model,
            debugMode: true,
            autoBind: true,
            applier: that.options.applier
        };
        fluid.selfRender(that.container, tree, renderOpts);
        that.events.pageRendered.fire();
    };

    /**
     * Object Entry component
     */
    cspace.dataEntry = function (container, options) {
        var that = fluid.initView("cspace.dataEntry", container, options);
        // workaround for FLUID-3505
        that.options.applier = options.applier;
        that.model = that.options.applier.model;
        that.unsavedChanges = false;

        that.refreshView = function () {
            renderPage(that);
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
            if (that.model.csid) {
                that.options.dataContext.update();
            } else {
                that.options.applier.requestChange("csid", "");
                that.options.dataContext.create();
            }
            return false;
        };

        setupDataEntry(that);
        return that;
    };
    
    cspace.saveId = "save";
    
    fluid.defaults("cspace.dataEntry", {
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
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            relatedRecords: ".csc-related-records"
        },
        strings: {
            specFetchError: "I'm sorry, an error has occurred fetching the UISpec: ",
            errorRecoverySuggestion: "Please try refreshing your browser",
            savingMessage: "Saving, please wait...",
            updateSuccessfulMessage: "Record successfully saved",
            createSuccessfulMessage: "New Record successfully created",
            updateFailedMessage: "Error saving Record: ",
            createFailedMessage: "Error creating Record: ",
            deleteFailedMessage: "Error deleting Record: ",
            fetchFailedMessage: "Error retriving Record: ",
            addRelationsFailedMessage: "Error adding related records: ",
            defaultTermIndicator: " (default)",
            noDefaultInvitation: "-- Select an item from the list --",
            confirmation: "You are about to navigate from the current record. Please confirm...",
            confirmationTitle: "Confirmation."
        },
		confirmationTemplateUrl: "../html/Confirmation.html",
        
        // Ultimately, the UISpec will be loaded via JSONP (see CSPACE-300). Until then,
        // load it manually via ajax
        uiSpecUrl: ""

    });
})(jQuery, fluid_1_2);
