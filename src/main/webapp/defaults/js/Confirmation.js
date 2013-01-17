/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, window, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.log("Confirmation.js loaded");

    // A sub-routine used to build button related part of confirmation's
    // protoTree.
    var addButtonToTree = function (id, resolve, messagekeys, styles) {
        return {
            messagekey: "${messagekeys." + id + "Text}",
            decorators: [{
                type: "attrs",
                attributes: {
                    alt: resolve(messagekeys[id + "Alt"])
                } 
            }, {
                type: "addClass",
                classes: styles[id]
            }]
        };
    };

    // Bind confirmation events such as close, act, etc.
    var bindEventHandlers = function (that) {
        that.locate("close").click(function () {
            that.events.onClose.fire("cancel");
        });        
        fluid.each(that.options.enableButtons, function (button) {
            that.locate(button).click(function () {
                that.events.onClose.fire(button);
            });
        });
    };

    // Confirmation dialog used for various confirmations of user actions
    // such as record deletion, relation deletion, navigation away and etc.
    cspace.confirmationDialog = function (container, options) {
        var that = fluid.initRendererComponent("cspace.confirmationDialog", container, options);
        that.refreshView();
        bindEventHandlers(that);
        return that;
    };

    // Basic confirmation produceTree function.
    cspace.confirmationDialog.produceTree = function (that) {
        var options = that.options;
        var tree = {
            expander: {
                repeatID: "message",
                tree: {
                    messagekey: "${{message}}",
                    args: that.options.termMap
                },
                type: "fluid.renderer.repeat",
                pathAs: "message",
                controlledBy: "messages"
            },
            close: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        alt: that.options.parentBundle.resolve(that.options.model.messagekeys["closeAlt"])
                    }
                }
            }
        };
        fluid.each(options.enableButtons, function (button) {
            tree[button] = addButtonToTree(button, that.options.parentBundle.resolve, that.options.model.messagekeys, options.styles);
        });
        return tree;
    };

    // Confirmation dialog.
    fluid.defaults("cspace.confirmationDialog", {
        produceTree: cspace.confirmationDialog.produceTree,
        events: {
            onClose: null
        },
        // Default actions/buttons available.
        model: {
            messagekeys: {
                cancelText: "saveDialog-cancelText",
                cancelAlt: "saveDialog-cancelAlt",
                closeAlt: "saveDialog-closeAlt"
            }
        },
        strings: { },
        selectors: {
            "message:": ".csc-confirmationDialog-text",
            close: ".csc-confirmationDialog-closeBtn",
            proceed: ".csc-confirmationDialogButton-proceed",
            cancel: ".csc-confirmationDialogButton-cancel",
            act: ".csc-confirmationDialogButton-act"
        },
        styles: {
            cancel: "cs-confirmationDialogButton-cancel",
            proceed: "cs-confirmationDialogButton-proceed",
            act: "cs-confirmationDialogButton-act"
        },
        // Confirmation dialog template.
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "slowTemplate",
                url: "%webapp/html/components/Confirmation.html",
                options: {
                    dataType: "html"
                }
            })
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.confirmationDialog");
    
    var bindEvents = function (that) {
        that.confirmationDialog.events.onClose.addListener(function (userAction) {
            that.popup.dialog("close");
            that.popup.empty();
        }, undefined, undefined, "first");
    };

    // Setup jQuery UI Dialog widget as a backbone for Collection Space
    // confirmation.
    var setupConfirmation = function (that) {
        that.popup = $("<div></div>");
        that.popup.dialog({
            autoOpen: false,
            modal: true,
            title: that.options.parentBundle.resolve("confirmationDialog-title"),
			width: 450,
            open: function () {
                // CSPACE-3811: Focusing on the first input element inside the 
                // confirmation dialog for smooth keyboard navigation.
                $("input", that.popup).eq(0).focus();
            }
        });
    };

    // Confirmation creator function.
    cspace.confirmation = function (options) {
        var that = fluid.initLittleComponent("cspace.confirmation", options);
        setupConfirmation(that);
        fluid.initDependents(that);
        
        that.open = function (strategy, container, options) {
            if (!strategy) {
                fluid.fail("Confirmation requires a strategy");
            }
            container = container || that.popup;
            options = options || {};
            options.parentBundle = that.options.parentBundle;
            if (typeof strategy === "string") {
                that.confirmationDialog = fluid.invokeGlobalFunction(strategy, [container, options]);
            } else {
                that.confirmationDialog = strategy.apply(null, [container, options]);
            }
            bindEvents(that);
            that.popup.dialog("open");
        };
        
        return that;
    };
    
    fluid.defaults("cspace.confirmation", {
        mergePolicy: {
            parentBundle: "nomerge"
        },
        parentBundle: "{globalBundle}"
    });

    // An older implementation of something that resembles
    // grade. This type is used for delete confirmation.
    cspace.confirmation.deleteDialog = function (container, options) {
        var that = fluid.initLittleComponent("cspace.confirmation.deleteDialog", options);
        return cspace.confirmationDialog(container, that.options);
    };
    
    fluid.defaults("cspace.confirmation.deleteDialog", {
        mergePolicy: {
            enableButtons: "replace"
        },
        enableButtons: ["act", "cancel"],
        model: {
            messages: ["deleteDialog-primaryMessage"],
            messagekeys: {
                primaryMessage: "deleteDialog-primaryMessage",
                actText: "deleteDialog-actText",
                actAlt: "deleteDialog-actAlt"
            }
        },
        strings: { }
    });

    // An older implementation of something that resembles
    // grade. This type is used for save confirmation.
    cspace.confirmation.saveDialog = function (container, options) {
        var that = fluid.initLittleComponent("cspace.confirmation.saveDialog", options);
        return cspace.confirmationDialog(container, that.options);
    };
    
    fluid.defaults("cspace.confirmation.saveDialog", {
        mergePolicy: {
            "model.messages": "replace"
        },
        enableButtons: ["act", "cancel", "proceed"],
        model: {
            messages: ["saveDialog-primaryMessage", "saveDialog-secondaryMessage"],
            messagekeys: {
                actText: "saveDialog-actText",
                actAlt: "saveDialog-actAlt",
                proceedText: "saveDialog-proceedText",
                proceedAlt: "saveDialog-proceedAlt"
            }
        },
        strings: { }
    });

    // An older implementation of something that resembles
    // grade. This type is used for alert confirmation.
    cspace.confirmation.alertDialog = function (container, options) {
        var that = fluid.initLittleComponent("cspace.confirmation.alertDialog", options);
        return cspace.confirmationDialog(container, that.options);
    };

    fluid.defaults("cspace.confirmation.alertDialog", {
        enableButtons: ["act"],
        model: {
            messages: ["alertDialog-primaryMessage", "alertDialog-secondaryMessage"],
            messagekeys: {
                actText: "alertDialog-actText",
                actAlt: "alertDialog-actAlt"
            }
        },
        strings: {}
    });
    
})(jQuery, fluid);
