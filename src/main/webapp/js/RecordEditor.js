/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RecordEditor.js loaded");

    // operation = one of "create", "delete", "fetch", "update"
    var makeDCErrorHandler = function (that) {
        return function (operation, message, data) {
            if (data && data.messages) {
                // TODO: expand this branch as sophistication increases for CSPACE-3142
                fluid.each(data.messages, function(message) {
                    that.options.messageBar.show(message.message, null, data.isError);
                });
            }
            else {
                var msgKey = operation + "FailedMessage";
                var msg = that.options.strings[msgKey] + message;
                that.options.messageBar.show(msg, null, true);
            }
            that.locate("save").removeAttr("disabled");
            that.events.onError.fire(operation);
            if (operation === "create") {
                // This is only temporary until http://issues.collectionspace.org/browse/CSPACE-263
                // is resolved
                that.options.applier.requestChange("csid", undefined);
            }
        };
    };

    var validateIdentificationNumber = function (domBinder, container, messageBar, message) {
        return function () {
            var required = domBinder.locate("identificationNumber");
            if (required === container) {
                return true;
            }
            if ($.trim(required.val()) === "") {
                messageBar.show(message, null, true);
                return false;
            }
            return true;
        };
    };
    
    var validateRequiredFields = function (domBinder, messageBar, message) {
        var required = domBinder.locate("requiredFields");
        for (var i = 0; i < required.length; i++) {
            if (required[i].value === "") {
                messageBar.show(message, null, true);
                return false;
            }
        }
        return true;
    };
    
    var recordSaveHandler = function (that, data, action) {
        var message = action.toLowerCase() + "SuccessfulMessage";
        that.options.applier.requestChange("", data);
        that.refreshView();
        that.options.messageBar.show(that.options.strings[message], Date());
        that.unsavedChanges = false;
        that.locate("save").removeAttr("disabled");
    };

    var bindEventHandlers = function (that) {
        
        that.events.onSave.addListener(validateIdentificationNumber(that.dom, that.container, that.options.messageBar, that.options.strings.identificationNumberRequired));

        that.events.onSave.addListener(function () {
            that.options.messageBar.show(that.options.strings.savingMessage);
        });
        
        that.events.onSave.addListener(function () {
            return validateRequiredFields(that.dom, that.options.messageBar, that.options.strings.missingRequiredFields);
        });

        that.options.dataContext.events.afterCreate.addListener(function (data) {
            recordSaveHandler(that, data, "Create");
            that.locate("deleteButton").removeAttr("disabled").removeClass("deactivate");            
        });

        that.options.dataContext.events.afterUpdate.addListener(function (data) {
            recordSaveHandler(that, data, "Update");
        });

        that.options.dataContext.events.afterRemove.addListener(function () {
            that.events.afterRemove.fire(that.options.strings.removeSuccessfulMessage);
        });

        that.options.dataContext.events.modelChanged.addListener(function (data) {
            that.refreshView();
        });
        
        that.options.dataContext.events.afterFetch.addListener(function () {
            that.unsavedChanges = false;
        });
        
        that.options.applier.modelChanged.addListener("fields", function (model, oldModel, changeRequest) {
            that.unsavedChanges = true;
        });

        that.options.dataContext.events.onError.addListener(makeDCErrorHandler(that));
        
        that.options.globalNavigator.events.onPerformNavigation.addListener(function (callback) {
            if (that.unsavedChanges) {
                that.confirmation.open("cspace.confirmation.saveDialog", undefined, {
                    listeners: {
                        onClose: function (userAction) {
                            if (userAction === "act") {
                                that.options.dataContext.events.afterSave.addListener(function () {
                                    that.unsavedChanges = false;
                                    callback();
                                }, undefined, undefined, "last");
                                that.requestSave();
                            }
                            else if (userAction === "proceed") {
                                that.rollback();
                                callback();
                            }
                        }
                    }
                });
                return false;
            }
        }, that.options.navigationEventNamespace);
    };
    
    var bindHandlers = function (that) {
        that.locate("save").click(that.requestSave);
        that.locate("deleteButton").click(that.remove);
        that.locate("cancel").click(function () {
            that.options.globalNavigator.events.onPerformNavigation.fire(function () {
                that.cancel();
            });
        });
        cspace.util.setZIndex();      
    };
    
    var setupRecordEditor = function (that) {
        bindEventHandlers(that);
        if (!that.options.deferRendering) {
            that.refreshView();
        }
        that.unsavedChanges = false;
    };
    
    cspace.recordEditor = function (container, options) {
        var that = fluid.initRendererComponent("cspace.recordEditor", container, options);
        fluid.initDependents(that);
        
        that.refreshView = function () {
            fluid.log("RecordEditor.js before render");
            fluid.withEnvironment({
                parent: that
            }, function () {
                that.renderer.refreshView();
            });
            if (!that.model.csid || (that.model.fields.email === "admin@collectionspace.org")) {
                that.locate("deleteButton").attr("disabled", "disabled").addClass("deactivate");
            } else {
                that.locate("deleteButton").removeAttr("disabled").removeClass("deactivate");
            }
            that.unsavedChanges = false;
            that.rollbackModel = fluid.copy(that.model.fields);
            that.options.messageBar.hide();
            bindHandlers(that);
            that.events.afterRender.fire(that);
            fluid.log("RecordEditor.js renderPage end");
        };

        /*
         * return: Boolean true if the save was submitted, false if it was prevented by any event listeners.
         * Note that a return value of true does not necessarily indicate that the save was successful, only that
         * it was successfully submitted.
         */
        that.requestSave = function () {
            var ret = that.events.onSave.fire(that.model);
            if (ret !== false) {
                that.locate("save").attr("disabled", "disabled");
                if (that.model.csid) {
                    that.options.dataContext.update();
                } else {
                    that.options.applier.requestChange("csid", "");
                    that.options.dataContext.create();
                }
                return true;
            }
            return false;
        };
        
        that.remove = function () {
            that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
                listeners: {
                    onClose: function (userAction) {
                        if (userAction === "act") {
                            that.options.dataContext.remove(that.model.csid);
                            that.unsavedChanges = false;
                        }
                    }
                }
            });
        };

        setupRecordEditor(that);

        return that;
    };
    
    cspace.recordEditor.rollback = function (that) {
        that.options.applier.requestChange("fields", that.rollbackModel);
        that.refreshView();
    };
    
    cspace.recordEditor.produceTree = function (that) {
        return fluid.merge(null, {
            save: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.save                        
                    }
                }
            },
            cancel: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.cancel
                    }
                }
            }
        }, that.options.uispec);
    };
    
    cspace.recordEditor.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };
    
    cspace.recordEditor.cancel = function (that) {
        that.options.messageBar.hide();
        that.unsavedChanges = false;
        that.events.onCancel.fire();
    }
    
    cspace.recordEditor.cancelRecord = function (that) {
        that.events.onCancel.fire();
        window.location = that.options.urls.cancel;
    }
    
    fluid.defaults("cspace.recordEditor", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve",
            "rendererFnOptions.uispec": "uispec",
            "rendererOptions.applier": "applier"
        },
        components: {
            confirmation: {
                type: "cspace.confirmation"
            }
        },
        invokers: {
            rollback: {
                funcName: "cspace.recordEditor.rollback",
                args: "{recordEditor}"
            },
            cancel: {
                funcName: "cspace.recordEditor.cancel",
                args: "{recordEditor}"
            }
        },
        navigationEventNamespace: undefined,
        globalNavigator: "{globalNavigator}",
        messageBar: "{messageBar}",
        produceTree: cspace.recordEditor.produceTree,
        events: {
            onSave: "preventable",
            onCancel: null,
            afterRemove: null, // params: textStatus
            onError: null,  // params: operation
            afterRender: null
        },
        selectors: {
            save: ".csc-save",
            cancel: ".csc-cancel",
            deleteButton: ".csc-delete",
            requiredFields: ".csc-required:visible"
        },
        selectorsToIgnore: ["deleteButton", "requiredFields", "identificationNumber"],
        rendererFnOptions: {
            cutpointGenerator: "cspace.recordEditor.cutpointGenerator",
        },
        rendererOptions: {
            autoBind: true
        },
        strings: {
            specFetchError: "I'm sorry, an error has occurred fetching the UISpec: ",
            errorRecoverySuggestion: "Please try refreshing your browser",
            savingMessage: "Saving, please wait...",
            updateSuccessfulMessage: "Record successfully saved",
            createSuccessfulMessage: "New Record successfully created",
            removeSuccessfulMessage: "Record successfully deleted",
            updateFailedMessage: "Error saving Record: ",
            createFailedMessage: "Error creating Record: ",
            deleteFailedMessage: "Error deleting Record: ",
            fetchFailedMessage: "Error retriving Record: ",
            addRelationsFailedMessage: "Error adding related records: ",
            defaultTermIndicator: " (default)",
            noDefaultInvitation: "-- Select an item from the list --",
            missingRequiredFields: "Some required fields are empty",
            save: "Save",
            cancel: "Cancel"
        },
        urls: cspace.componentUrlBuilder({
            cancel: "%webapp/html/findedit.html"
        })
    });
    
    cspace.recordEditor.pageRecordEditor = function (container, options) {
        var that = fluid.initLittleComponent("cspace.recordEditor.pageRecordEditor", options);
        return cspace.recordEditor(container, that.options);
    };
    fluid.defaults("cspace.recordEditor.pageRecordEditor", {
        mergePolicy: {
            model: "preserve",
            applier: "preserve",
            "rendererFnOptions.uispec": "uispec",
            "rendererOptions.applier": "applier"
        },
        invokers: {
            cancel: {
                funcName: "cspace.recordEditor.cancelRecord"
            }
        }
    });
    
    fluid.demands("recordEditor", ["cspace.pageBuilder", "cspace.record"], {
        funcName: "cspace.recordEditor.pageRecordEditor",
        args: ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("recordEditor", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.recordEditor", fluid.COMPONENT_OPTIONS]);
        
})(jQuery, fluid);
