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

    var addButtonToTree = function (id, strings, styles) {
        return {
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

    cspace.confirmationDialog = function (container, options) {
        var that = fluid.initRendererComponent("cspace.confirmationDialog", container, options);
        that.refreshView();
        bindEventHandlers(that);
        return that;
    };
    
    cspace.confirmationDialog.produceTree = function (that) {
        var options = that.options;
        var tree = {
            expander: {
                repeatID: "message:",
                tree: {
                    messagekey: "${{message}}"
                },
                type: "fluid.renderer.repeat",
                pathAs: "message",
                controlledBy: "messages"
            },
            close: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        alt: options.strings.closeAlt                        
                    }
                }
            }
        };
        fluid.each(options.enableButtons, function (button) {
            tree[button] = addButtonToTree(button, options.strings, options.styles);
        });
        return tree;
    };
    
    fluid.defaults("cspace.confirmationDialog", {
        produceTree: cspace.confirmationDialog.produceTree,
        events: {
            onClose: null
        },
        strings: {
            cancelText: "Cancel",
            cancelAlt: "cancel",
            closeAlt: "close dialog"
        },
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
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "slowTemplate",
                url: "%webapp/html/components/Confirmation.html"
            })
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.confirmationDialog");
    
    var bindEvents = function (that) {
        that.confirmationDialog.events.onClose.addListener(function (userAction) {
            that.popup.dialog("close");
            that.popup.empty();
        });
    };
    
    var setupConfirmation = function (that) {
        that.popup = $("<div></div>");
        that.popup.dialog({
            autoOpen: false,
            modal: true,
            title: that.options.strings.title
        });
    };

    cspace.confirmation = function (options) {
        var that = fluid.initLittleComponent("cspace.confirmation", options);
        setupConfirmation(that);
        fluid.initDependents(that);
        
        that.open = function (strategy, container, options) {
            if (!strategy) {
                fluid.fail("Confirmation requires a strategy");
            }
            container = container || that.popup;
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
        strings: {
            title: "Confirmation."
        }
    });
    
    cspace.confirmation.deleteDialog = function (container, options) {
        var that = fluid.initLittleComponent("cspace.confirmation.deleteDialog", options);
        return cspace.confirmationDialog(container, that.options);
    };
    
    fluid.defaults("cspace.confirmation.deleteDialog", {
        enableButtons: ["act", "cancel"],
        model: {
            messages: ["primaryMessage"]
        },
        strings: {
            primaryMessage: "Delete this record?",
            actText: "Delete",
            actAlt: "delete record"
        }
    });
    
    cspace.confirmation.saveDialog = function (container, options) {
        var that = fluid.initLittleComponent("cspace.confirmation.saveDialog", options);
        return cspace.confirmationDialog(container, that.options);
    };
    
    fluid.defaults("cspace.confirmation.saveDialog", {
        enableButtons: ["act", "cancel", "proceed"],
        model: {
            messages: ["primaryMessage", "secondaryMessage"]
        },
        strings: {
            primaryMessage: "You are about to leave this record.",
            secondaryMessage: "Save Changes?",
            actText: "Save",
            actAlt: "save and proceed",
            proceedText: "Don't Save",
            proceedAlt: "proceed without saving"
        }
    });

    cspace.confirmation.alertDialog = function (container, options) {
        var that = fluid.initLittleComponent("cspace.confirmation.alertDialog", options);
        return cspace.confirmationDialog(container, that.options);
    };

    fluid.defaults("cspace.confirmation.alertDialog", {
        enableButtons: ["act"],
        model: {
            messages: ["primaryMessage", "secondaryMessage"]
        },
        strings: {
            title: "Alert",
            primaryMessage: "Record Successfully Deleted",
            secondaryMessage: "Redirecting..",
            actText: "OK",
            actAlt: "Accept"
        }
    });
    
})(jQuery, fluid);