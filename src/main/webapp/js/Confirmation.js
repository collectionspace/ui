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
	
    var attachActionListeners = function (successEvents, successHandler, errorEvents, errorHandler) {
        for (var i = 0; i < successEvents.length; i++) {
            successEvents[i].addListener(successHandler);
        }
        for (var j = 0; j < errorEvents.length; j++) {
            errorEvents[j].addListener(errorHandler);
        }
    };
    var removeActionListeners = function (successEvents, successHandler, errorEvents, errorHandler) {
        for (var i = 0; i < successEvents.length; i++) {
            successEvents[i].removeListener(successHandler);
        }
        for (var j = 0; j < errorEvents.length; j++) {
            errorEvents[j].removeListener(errorHandler);
        }
    };
    
	var bindEvents = function (that) {
		that.locate("cancel", that.dlg).click(function () {
            that.close();
        });
		that.locate("closeButton", that.dlg).click(function () {
            that.close();
        });
        that.locate("proceed", that.dlg).click(function (e) {
            that.navigate();
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
        that.navigate = function () {
            removeActionListeners(that.options.actionSuccessEvents, that.navigate, that.options.actionErrorEvents, that.close);
            window.location = that.model.href;
        };
        that.close = function () {
            removeActionListeners(that.options.actionSuccessEvents, that.navigate, that.options.actionErrorEvents, that.close);
            that.dlg.dialog("close");
        };
        that.open = function (targetHref) {
            that.model.href = targetHref;
            attachActionListeners(that.options.actionSuccessEvents, that.navigate, that.options.actionErrorEvents, that.close);
            that.dlg.dialog("open");
        };
		return that;
	};
	
	fluid.defaults("cspace.confirmation", {
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
            afterRender: null
        },
        confirmationTemplateUrl: "../html/Confirmation.html"
    });
	
})(jQuery, fluid);