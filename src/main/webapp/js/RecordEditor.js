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
                fluid.each(data.messages, function (message) {
                    that.options.messageBar.show(message.message, null, data.isError);
                });
            } else {
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
        var i;
        for (i = 0; i < required.length; i++) {
            if (required[i].value === "") {
                messageBar.show(message, null, true);
                return false;
            }
        }
        return true;
    };
    
    var processChanges = function (that, revert) {
        that.unsavedChanges = revert;
        that.locate("cancel").attr("disabled", !revert);
    };
    
    var recordSaveHandler = function (that, data, action) {
        var message = action.toLowerCase() + "SuccessfulMessage";
        that.options.applier.requestChange("", data);
        that.refreshView();
        that.options.messageBar.show(that.options.strings[message], Date());
        processChanges(that, false);
        that.locate("save").removeAttr("disabled");
    };

    var bindEventHandlers = function (that) {
        
        that.events.onSave.addListener(validateIdentificationNumber(that.dom, that.container, that.options.messageBar, that.options.strings.identificationNumberRequired));
        
        that.events.onSave.addListener(function () {
            return validateRequiredFields(that.dom, that.options.messageBar, that.options.strings.missingRequiredFields);
        });
        
        that.events.onSave.addListener(function () {
            that.options.messageBar.show(that.options.strings.savingMessage);
        }, undefined, undefined, "last");

        that.options.dataContext.events.afterCreate.addListener(function (data) {
            recordSaveHandler(that, data, "Create");
        });

        that.options.dataContext.events.afterUpdate.addListener(function (data) {
            recordSaveHandler(that, data, "Update");
        });

        that.options.dataContext.events.afterRemove.addListener(function () {
            that.events.afterRemove.fire(that.options.strings.removeSuccessfulMessage);
        });

        that.options.dataContext.events.afterRemove.addListener(function () {
            that.afterDeleteAction();
        });
        
        that.options.dataContext.events.afterRemoveRelations.addListener(function () {
            that.afterDeleteAction();
        });

        that.options.dataContext.events.modelChanged.addListener(function (data) {
            that.refreshView();
        });
        
        that.options.dataContext.events.afterFetch.addListener(function () {
            processChanges(that, false);
        });
        
        that.options.applier.modelChanged.addListener("fields", function (model, oldModel, changeRequest) {
            processChanges(that, true);
        });

        that.options.dataContext.events.onError.addListener(makeDCErrorHandler(that));
        
        that.options.globalNavigator.events.onPerformNavigation.addListener(function (callback) {
            if (that.unsavedChanges) {
                that.confirmation.open("cspace.confirmation.saveDialog", undefined, {
                    listeners: {
                        onClose: function (userAction) {
                            if (userAction === "act") {
                                that.options.dataContext.events.afterSave.addListener(function () {
                                    processChanges(that, false);
                                    callback();
                                }, undefined, undefined, "last");
                                that.requestSave();
                            } else if (userAction === "proceed") {
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
            that.cancel();
        });
        cspace.util.setZIndex();      
    };

    var setupRecordEditor = function (that) {
        bindEventHandlers(that);
        if (!that.options.deferRendering) {
            that.refreshView();
        }
        processChanges(that, false);
    };
    
    var initDeferredComponents = function (that) {
        fluid.each(that.options.deferredComponents, function (component, name) {
            var instantiator = that.options.rendererOptions.instantiator;
            if (that[name]) {
                instantiator.clearComponent(that, name);
            }
            that.options.components[name] = {
                type: component.type,
                options: component.options
            };
            fluid.initDependent(that, name, instantiator);
        });
    };
    
    cspace.recordEditor = function (container, options) {
        var that = fluid.initRendererComponent("cspace.recordEditor", container, options);
        fluid.initDependents(that);
        
        that.refreshView = function () {
            fluid.log("RecordEditor.js before render");
            that.renderer.refreshView();
            processChanges(that, false);
            that.rollbackModel = fluid.copy(that.model.fields);
            that.options.messageBar.hide();
            bindHandlers(that);
            that.events.afterRender.fire(that);
            initDeferredComponents(that);
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

        setupRecordEditor(that);

        return that;
    };
    
    cspace.recordEditor.remove = function (that) {
        that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "act") {
                        that.options.messageBar.show(that.options.strings.removingMessage, null, false);
                        that.options.dataContext.remove(that.model.csid);
                        processChanges(that, false);
                    }
                }
            },
            strings: {
                primaryMessage: that.options.strings.deletePrimaryMessage
            }
        });
    };
    
    cspace.recordEditor.rollback = function (that) {
        that.options.applier.requestChange("fields", that.rollbackModel);
        that.refreshView();
    };

    /*
     * Opens an alert box informing user printing the string defined in
     * options.strings.removeSuccessfulMessage. After user dismisses dialog,
     * user is redirected to the URL defined in: options.urls.deleteURL
     * Note that deletion should already have taken place before this function is
     * called. This function merely shows dialog to user and redirects.
     */
    cspace.recordEditor.redirectAfterDelete = function (that) {
        that.confirmation.open("cspace.confirmation.alertDialog", undefined, {
            listeners: {
                onClose: function (userAction) {
                    window.location = that.options.urls.deleteURL;
                }
            },
            strings: {
                primaryMessage: that.options.strings.removeSuccessfulMessage
            }
        });
    };

    /*
     * Dismisses the record that the user was in (now deleted) and displays
     * a message in the messagebar, informing the user that the record was
     * deleted.
     */
    cspace.recordEditor.statusAfterDelete = function (that) {
        //show messagebar
        that.options.messageBar.show(that.options.strings.removeSuccessfulMessage, null, false);
    };
    
    cspace.recordEditor.produceTree = function (that) {
        var deleteButton = {
            type: "fluid.renderer.condition",
            condition: that.options.showDeleteButton,
            trueTree: {
                deleteButton: {
                    decorators: [{
                        type: "attrs",
                        attributes: {
                            value: that.options.strings.deleteButton
                        }
                    }, {
                        type: "jQuery",
                        func: "attr",
                        args: {
                            disabled: that.checkDeleteDisabling
                        }
                    }]
                }
            }
        };
        var tree = fluid.merge(null, {
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
        tree.expander = fluid.makeArray(tree.expander); //make an expander array in case we have expanders in the uispec
        tree.expander.push(deleteButton);
        return tree;
    };
    
    // NOTE: THIS IS A HACK BECAUSE THE SERVER DOES NOT RETURN ANY PAYLOAD RELATED TO THE MEDIA ATTACHED.
    cspace.recordEditor.produceTreeMedia = function (that) {
        var tree = cspace.recordEditor.produceTree(that);
        fluid.merge(null, tree.expander[0].trueTree, {
            mediaImage: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        src: fluid.stringTemplate(that.options.urls.thumbnailURL, {csid: that.model.fields.blobCsid})
                    }
                }, {
                    type: "addClass",
                    classes: that.options.styles.mediaImage
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.navigateToFullImage
                }]
            }
        });
        return tree;
    };
    
    cspace.recordEditor.navigateToFullImage = function (that) {
        that.options.globalNavigator.events.onPerformNavigation.fire(function () {
            window.location = fluid.stringTemplate(that.options.urls.fullImageURL, {csid: that.model.fields.blobCsid});
        });
    };
    
    cspace.recordEditor.provideProduceTree = function (recordType) {
        return recordType === "media" ? cspace.recordEditor.produceTreeMedia : cspace.recordEditor.produceTree;
    };

    cspace.recordEditor.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };
    
    cspace.recordEditor.cancel = function (that) {
        that.rollback();
    };

    //Checks whether delete button should be disabled.
    //returns true if the delete button should be disabled,
    //else false
    cspace.recordEditor.checkDeleteDisabling = function (that) {
        //disable if: model.csid is not set (new record)
        if (that.model && !that.model.csid) {
            return true;
        }
        //disable if: if we are looking at admin account
        if (that.model.fields.email === "admin@collectionspace.org") {
            return true;
        }
        //check whether we need to disable delete button due to related records
        //that we do not have update permission to (which we need since we will
        //be modifying their relations when deleting the record)
        var relations = that.model.relations;
        //if relations isn't set, no need to check any further
        if (!relations || relations.length < 1 || $.isEmptyObject(relations)) {
            return false;
        }
        var relatedTypes = [];
        fluid.each(relations, function (val, recordType) {
            relatedTypes.push({
                target: recordType,
                permission: "update"
            });
        });
        //now build opts for checking permissions
        return (!cspace.permissions.resolveMultiple({
            recordTypeManager: that.options.recordTypeManager,
            resolver: that.options.resolver,
            allOf: relatedTypes
        }));
    };
    
    fluid.defaults("cspace.recordEditor", {
        gradeNames: ["fluid.IoCRendererComponent"],
        mergePolicy: {
            model: "preserve",
            applier: "nomerge",
            "rendererOptions.instantiator": "nomerge",
            "rendererOptions.parentComponent": "nomerge",
            "rendererFnOptions.uispec": "uispec",
            "rendererOptions.applier": "applier",
            "dataContext": "nomerge"
        },
        components: {
            confirmation: {
                type: "cspace.confirmation"
            },
            recordEditorTogglable: {
                type: "cspace.util.togglable",
                options: {
                    selectors: {
                        header: "{recordEditor}.options.selectors.header",
                        togglable: "{recordEditor}.options.selectors.togglable"
                    }
                }
            }
        },
        invokers: {
            rollback: {
                funcName: "cspace.recordEditor.rollback",
                args: "{recordEditor}"
            },
            remove: "remove",
            afterDeleteAction: "afterDelete",
            checkDeleteDisabling: "checkDeleteDisabling", //whether to disable delete button
            cancel: "cancel"
        },
        dataContext: "{dataContext}",
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
        showDeleteButton: false,
        selectors: {
            save: ".csc-save",
            cancel: ".csc-cancel",
            deleteButton: ".csc-delete",
            requiredFields: ".csc-required:visible",
            header: ".csc-recordEditor-header",
            togglable: ".csc-recordEditor-togglable"
        },
        selectorsToIgnore: ["requiredFields", "identificationNumber", "header", "togglable"],
        rendererFnOptions: {
            cutpointGenerator: "cspace.recordEditor.cutpointGenerator"
        },
        rendererOptions: {
            autoBind: true,
            instantiator: "{instantiator}",
            parentComponent: "{recordEditor}"
        },
        parentBundle: "{globalBundle}",
        resolver: "{permissionsResolver}",
        strings: {
            specFetchError: "I'm sorry, an error has occurred fetching the UISpec: ",
            errorRecoverySuggestion: "Please try refreshing your browser",
            savingMessage: "Saving, please wait...",
            removingMessage: "Deleting, please wait...",
            updateSuccessfulMessage: "Record successfully saved",
            createSuccessfulMessage: "New Record successfully created",
            removeSuccessfulMessage: "Record successfully deleted",
            updateFailedMessage: "Error saving Record: ",
            createFailedMessage: "Error creating Record: ",
            deleteFailedMessage: "Error deleting Record: ",
            fetchFailedMessage: "Error retriving Record: ",
            addRelationsFailedMessage: "Error adding related records: ",
            removeRelationsFailedMessage: "Error removing related records: ",
            defaultTermIndicator: " (default)",
            noDefaultInvitation: "-- Select an item from the list --",
            missingRequiredFields: "Some required fields are empty",
            save: "Save",
            cancel: "Cancel changes",
            deleteButton: "Delete"
        },
        urls: cspace.componentUrlBuilder({
            deleteURL: "%webapp/html/myCollectionSpace.html",
            thumbnailURL: "%chain/download/%csid/Thumbnail",
            fullImageURL: "%chain/download/%csid/Original"
        })
    });
    
})(jQuery, fluid);
