/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

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
		that.locate("close", that.dlg).click(function () {
            that.close();
        });
        that.locate("proceed", that.dlg).click(function (e) {
            that.options.successHandler(that)();
        });
        that.locate("act", that.dlg).click(function (e) {
            that.options.action();
        });
        that.dlg.bind("dialogclose", function () {
            that.events.afterClose.fire();
        });
        that.dlg.bind("dialogopen", function () {
            that.events.afterOpen.fire();
        });
	};
	
	var addButtonToTree = function (id, strings, styles) {
	    return {
            ID: id,
            decorators: [{
                type: "attrs",
                attributes: {
                    alt: strings[id + "Alt"],
                    value: strings[id + "Text"]
                } 
            }, {
                type: "addClass",
                classes: styles[id]
            }]
        };
	};
	
	var buildTree = function (strings, styles, enableButtons) {	    
	    var tree = {
	        children: [{
	            ID: "message:",
                messagekey: "primaryMessage"
	        }, {
                ID: "close",
                decorators: {
                    type: "attrs",
                    attributes: {
                        alt: strings.closeAlt                        
                    }
                }
            }]
	    };
	    
	    $.each(enableButtons, function (index, button) {
	        tree.children.push(addButtonToTree(button, strings, styles));
	    });
                
        if (strings.secondaryMessage) {
            tree.children.push({
                ID: "message:",
                messagekey: "secondaryMessage"
            });
        }
        
	    return tree;
	};
	
    var setupConfirmation = function (that) {
        var resources = {
            confirmation: {
                href: that.options.confirmationTemplateUrl,
                cutpoints: fluid.engage.renderUtils.selectorsToCutpoints(that.options.selectors, {})
            }
        };
        fluid.fetchResources(resources, function () {
            that.templates = fluid.parseTemplates(resources, ["confirmation"], {});
            that.dlg = $("<div></div>", that.container[0].ownerDocument)
                .dialog({
                    autoOpen: false,
                    modal: true,
                    title: that.options.strings.confirmationTitle
                });
            that.refreshView();
            that.events.afterFetchTemplate.fire();
        });
    };

	cspace.confirmation = function (container, options) {
		var that = fluid.initView("cspace.confirmation", container, options);
        that.model = {href: "#"};   // destination to nav to on successful navigation
        
        that.updateEventListeners = function (action) {
            updateHandlerForEvents(action, that.options.actionSuccessEvents, that.options.successHandler(that));
            updateHandlerForEvents(action, that.options.actionErrorEvents, that.close);
        };
        
        that.refreshView = function () {
            fluid.reRender(that.templates, that.dlg, buildTree(that.options.strings, that.options.styles, that.options.enableButtons), {
                messageLocator: fluid.messageLocator(that.options.strings, fluid.stringTemplate)
            });
            bindEvents(that);
            that.events.afterRender.fire();
        };
        
        that.close = function () {
            that.updateEventListeners("remove");
            that.dlg.dialog("close");
        };
        that.open = function (targetHref) {
            that.model.href = targetHref;
            that.updateEventListeners("add");
            that.dlg.dialog("open");
        };
        
        setupConfirmation(that);
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
            cancel: ".csc-confirmationDialogButton-cancel",
            proceed: ".csc-confirmationDialogButton-proceed",
            act: ".csc-confirmationDialogButton-act",
			close: ".csc-confirmationDialog-closeBtn",
			// Had to add a : because we currently can not use the expander
			// with repeating rows and message bundle at the same time.
			"message:": ".csc-confirmationDialog-text"
        },
        enableButtons: ["act", "proceed", "cancel"],    // selector names
        strings: {
            primaryMessage: "You are about to leave this record.",
            secondaryMessage: "Save Changes?",
            confirmationTitle: "Confirmation.",
            actText: "Save",
            actAlt: "save and proceed",
            cancelText: "Cancel",
            cancelAlt: "cancel",
            proceedText: "Don't Save",
            proceedAlt: "proceed without saving",
            closeAlt: "close dialog"
        },
        events: {
            afterRender: null,
            afterOpen: null,
            afterClose: null,
            afterFetchTemplate: null
        },
        styles: {
            cancel: "cs-confirmationDialogButton-cancel",
            proceed: "cs-confirmationDialogButton-proceed",
            act: "cs-confirmationDialogButton-act"
        },
        confirmationTemplateUrl: "../html/Confirmation.html"
    });
	
})(jQuery, fluid);