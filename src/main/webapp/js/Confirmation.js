/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, window, cspace*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("Confirmation.js loaded");
    
    var updateHandlerForEvents = function (action, events, handler) {
        $.each(events, function (index, event) {
            event[action + "Listener"](handler);
        });
    };
    
	var bindEvents = function (that) {
		that.locate("cancel", that.dlg).click(function () {
            that.close();
        });
		that.locate("closeButton", that.dlg).click(function () {
            that.close();
        });
        that.locate("proceed", that.dlg).click(function (e) {
            that.options.successHandler(that)();
        });
        that.locate("act", that.dlg).click(function (e) {
            that.options.action();
        });
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
            bindEvents(that);
            that.events.afterRender.fire();
        });

        return confirmation;
    };

	cspace.confirmation = function (container, options) {
		var that = fluid.initView("cspace.confirmation", container, options);
        that.model = {href: "#"};

        that.dlg = setupConfirmation(that);
        
        that.updateEventListeners = function (action) {
            updateHandlerForEvents(action, that.options.actionSuccessEvents, that.options.successHandler(that));
            updateHandlerForEvents(action, that.options.actionErrorEvents, that.close);
        };        
        
        that.close = function () {
            that.updateEventListeners("remove");
            that.dlg.dialog("close");
            that.events.afterClose.fire();
        };
        that.open = function (targetHref) {
            that.model.href = targetHref;
            that.updateEventListeners("add");
            that.dlg.dialog("open");
            that.events.afterOpen.fire();
        };
		return that;
	};
	
	cspace.confirmation.provideSuccessHandler = function (confirmation) {
	    return function () {
	        confirmation.updateEventListeners("remove");
            window.location = confirmation.model.href;
	    };
	};
	
	fluid.defaults("cspace.confirmation", {
	    successHandler: cspace.confirmation.provideSuccessHandler,
        selectors: {
			dialog: ".csc-confirmationDialog",
            cancel: ".csc-confirmationDialogButton-cancel",
            proceed: ".csc-confirmationDialogButton-proceed",
            act: ".csc-confirmationDialogButton-save",
			closeButton: ".csc-confirmationDialog-closeBtn"
        },
        strings: {
            confirmation: "You are about to navigate from the current record. Please confirm...",
            confirmationTitle: "Confirmation."
        },
        events: {
            afterRender: null,
            afterOpen: null,
            afterClose: null
        },
        confirmationTemplateUrl: "../html/Confirmation.html"
    });
	
})(jQuery, fluid);