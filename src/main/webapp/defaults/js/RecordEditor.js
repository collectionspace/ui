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
                that.options.messageBar.show(fluid.stringTemplate(msg, {
                    record: that.lookupMessage(that.options.recordType)
                }), null, true);
            }
            that.locate("save").prop("disabled", false);
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
        that.locate("cancel").prop("disabled", !revert);
    };
    
    var recordSaveHandler = function (that, data, action) {
        var message = action.toLowerCase() + "SuccessfulMessage";
        that.options.applier.requestChange("", data);
        that.refreshView();
        that.options.messageBar.show(fluid.stringTemplate(that.options.strings[message], {
            record: that.lookupMessage(that.options.recordType)
        }), Date());
        processChanges(that, false);
        that.locate("save").prop("disabled", false);
    };

    var bindEventHandlers = function (that) {
        
        that.events.onSave.addListener(validateIdentificationNumber(that.dom, that.container, that.options.messageBar, that.options.strings.identificationNumberRequired));
        
        that.events.onSave.addListener(function () {
            return validateRequiredFields(that.dom, that.options.messageBar, that.options.strings.missingRequiredFields);
        });
        
        that.events.afterRenderRefresh.addListener(function () {
            clearLocalStorage(that); 
        });

        that.options.dataContext.events.afterCreate.addListener(function (data) {
            recordSaveHandler(that, data, "Create");
        });

        that.options.dataContext.events.afterUpdate.addListener(function (data) {
            recordSaveHandler(that, data, "Update");
        });

        that.options.dataContext.events.afterRemove.addListener(function () {
            that.events.afterRemove.fire(fluid.stringTemplate(that.options.strings.removeSuccessfulMessage, {
                record: that.lookupMessage(that.options.recordType)
            }));
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
        that.locate("createFromExistingButton").click(that.createNewFromExistingRecord);
        cspace.util.setZIndex();      
    };

    var setupRecordEditor = function (that) {
        bindEventHandlers(that);
        if (!that.options.deferRendering) {
            that.refreshView();
        }
        that.events.afterRenderRefresh.fire(that);
    };
    
    var clearLocalStorage = function (that) {
        var modelToClone = that.localStorage.get(that.localStorage.options.elPath);
        if (modelToClone) {
            that.localStorage.set();
            processChanges(that, true);
        }
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
        
        that.checkLocalStorage = function () {
            var modelToClone = that.localStorage.get();  
            if (modelToClone) {
                that.applier.requestChange("", modelToClone);
            }            
        };

        that.checkLocalStorage();
        that.rollbackModel = fluid.copy(that.model.fields);
        
        that.refreshView = function () {
            fluid.log("RecordEditor.js before render");
            that.renderer.refreshView();
            processChanges(that, false);
            that.rollbackModel = fluid.copy(that.model.fields);
            that.options.messageBar.hide();
            bindHandlers(that);
            initDeferredComponents(that);
            fluid.log("RecordEditor.js renderPage end");
        };
        that.refreshNoSave = function () {
            fluid.log("RecordEditor.js before render");
            that.renderer.refreshView();
            that.options.messageBar.hide();
            bindHandlers(that);
            initDeferredComponents(that);
            fluid.log("RecordEditor.js renderPage end");
        };


        cspace.recordEditor.hasMediaAttached = function (that) {
            return (that.model.fields && that.model.fields.blobCsid);
        };

        cspace.recordEditor.hasRelations = function (that) {
            return (that.model.csid && that.model.relations && !$.isEmptyObject(that.model.relations));
        };
        /*
         * return: Boolean true if the save was submitted, false if it was prevented by any event listeners.
         * Note that a return value of true does not necessarily indicate that the save was successful, only that
         * it was successfully submitted.
         */
        that.requestSave = function () {
            var ret = that.events.onSave.fire(that.model);
            if (ret !== false) {
                if (that.namespaces) {
                    var namespace = cspace.util.getDefaultConfigURL.getRecordType();
                    if (that.namespaces.isNamespace(namespace)) {
                        that.options.applier.requestChange("namespace", namespace);
                    }
                }
                if (that.validator) {
                    var validatedModel = that.validator.validate(that.model);
                    if (!validatedModel) {
                        return false;
                    }
                    else {
                        that.applier.requestChange("", validatedModel)
                    }
                }
                that.locate("save").prop("disabled", true);
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
                        that.options.dataContext.remove(that.model.csid);
                        processChanges(that, false);
                    }
                }
            },
            strings: {
                primaryMessage: that.options.strings.deletePrimaryMessage
            },
            termMap: {
                record: that.lookupMessage(that.options.recordType),
                media: that.hasMediaAttached(that) ? that.options.strings.deleteMessageMediaAttached : "",
                relations: that.hasRelations(that) ? that.options.strings.deleteMessageWithRelated : ""
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
                primaryMessage: fluid.stringTemplate(that.options.strings.removeSuccessfulMessage, {
                    record: that.lookupMessage(that.options.recordType)
                })
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
        that.options.messageBar.show(fluid.stringTemplate(that.options.strings.removeSuccessfulMessage, {
            record: that.lookupMessage(that.options.recordType)
        }), null, false);
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
                        func: "prop",
                        args: {
                            disabled: that.checkDeleteDisabling
                        }
                    }]
                }
            }
        };
        var createFromExistingButton = {
            type: "fluid.renderer.condition",
            condition: that.options.showCreateFromExistingButton,
            trueTree: {
                createFromExistingButton: {
                    decorators: [{
                        type: "attrs",
                        attributes: {
                            value: that.options.strings.createFromExistingButton
                        }
                    }, {
                        type: "jQuery",
                        func: "prop",
                        args: {
                            disabled: that.checkCreateFromExistingDisabling
                        }
                    }]
                }
            }
        };
        var saveCancel = {
            type: "fluid.renderer.condition",
            condition: {
                funcName: "cspace.permissions.resolve",
                args: {
                    permission: that.options.saveCancelPermission,
                    target: that.options.recordType,
                    resolver: that.options.resolver
                }
            },
            trueTree: {
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
            }
        };
        var tree = fluid.copy(that.options.uispec);
        tree.expander = fluid.makeArray(tree.expander); //make an expander array in case we have expanders in the uispec
        tree.expander.push(deleteButton);
        tree.expander.push(createFromExistingButton);
        tree.expander.push(saveCancel);
        return tree;
    };
    
    // NOTE: THIS IS A HACK BECAUSE THE SERVER DOES NOT RETURN ANY PAYLOAD RELATED TO THE MEDIA ATTACHED (CSPACE-3757).
    cspace.recordEditor.produceTreeMedia = function (that) {
        var tree = cspace.recordEditor.produceTree(that);
        fluid.merge(null, tree.expander[1].trueTree, {
            mediaImage: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        src: "${fields.blobs.0.imgThumb}"
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
        window.open(that.model.fields.blobs[0].imgOrig, "_blank", fluid.stringTemplate(that.options.strings.originalMediaOptions, {
            height: that.options.originalMediaDimensions.height,
            width: that.options.originalMediaDimensions.width
        }));
    };
    
    cspace.recordEditor.provideProduceTree = function (recordType) {
        return recordType === "media" ? cspace.recordEditor.produceTreeMedia : cspace.recordEditor.produceTree;
    };
    
    cspace.recordEditor.produceTreeTemplate = function (that) {
        var tree = cspace.recordEditor.produceTree(that);
        tree.templateEditor = {
            decorators: {
                type: "fluid",
                func: "cspace.templateEditor"
            }
        };
        return tree;
    };

    cspace.recordEditor.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };
    
    cspace.recordEditor.cancel = function (that) {
        that.rollback();
    };
    
    cspace.recordEditor.reloadAndCloneRecord = function (that) {
        var modelToClone = fluid.copy(that.model);
        delete modelToClone.csid;
        if (modelToClone.fields) {
            delete modelToClone.fields.csid;
        }
        that.localStorage.set(modelToClone);
        window.location = fluid.stringTemplate(that.options.urls.cloneURL, {recordType: that.options.recordType});
    };
    
    cspace.recordEditor.createNewFromExistingRecord = function (globalNavigator, callback) {
        globalNavigator.events.onPerformNavigation.fire(callback);
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
    
    cspace.recordEditor.checkCreateFromExistingDisabling = function (model) {
        //disable if: model.csid is not set (not saved)
        if (model && !model.csid) {
            return true;
        }
        return false;
    };
    
    fluid.defaults("cspace.recordEditor", {
        gradeNames: "fluid.rendererComponent",
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
            namespaces: "{namespaces}",
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
            },
            recordEditorLoadingIndicator: {
                type: "cspace.util.loadingIndicator",
                options: {
                    hideOn: [
                        "{recordEditor}.events.afterRender",
                        "{recordEditor}.options.dataContext.events.onError"
                    ],
                    events: {
                        showOn: "{recordEditor}.options.dataContext.events.onSave"
                    }
                }
            },
            localStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "modelToClone"
                }
            },
            validator: {
                type: "cspace.validator"
            }
        },
        invokers: {
            lookupMessage: "cspace.util.lookupMessage",
            rollback: {
                funcName: "cspace.recordEditor.rollback",
                args: "{recordEditor}"
            },
            remove: "remove",
            afterDeleteAction: "afterDelete",
            checkDeleteDisabling: "checkDeleteDisabling", //whether to disable delete button
            checkCreateFromExistingDisabling: "checkCreateFromExistingDisabling", //whether to disable createFromExisting button
            reloadAndCloneRecord: "reloadAndCloneRecord",
            createNewFromExistingRecord: "createNewFromExistingRecord",
            cancel: "cancel",
            hasMediaAttached: "hasMediaAttached",
            hasRelations: "hasRelations"
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
            onError: null, // params: operation
            afterRenderRefresh: null 
        },
        showDeleteButton: false,
        showCreateFromExistingButton: false,
        saveCancelPermission: "update",
        selectors: {
            save: ".csc-save",
            cancel: ".csc-cancel",
            deleteButton: ".csc-delete",
            createFromExistingButton: ".csc-createFromExisting",
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
            updateSuccessfulMessage: "%record successfully saved",
            createSuccessfulMessage: "New %record successfully created",
            removeSuccessfulMessage: "%record successfully deleted",
            updateFailedMessage: "Error saving %record: ",
            createFailedMessage: "Error creating %record: ",
            deleteFailedMessage: "Error deleting %record: ",
            fetchFailedMessage: "Error retriving %record: ",
            addRelationsFailedMessage: "Error adding related records: ",
            removeRelationsFailedMessage: "Error removing related records: ",
            defaultTermIndicator: " (default)",
            noDefaultInvitation: "-- Select an item from the list --",
            missingRequiredFields: "Some required fields are empty",
            save: "Save",
            cancel: "Cancel changes",
            deleteButton: "Delete",
            createFromExistingButton: "Create new from existing",
            deletePrimaryMessage: "Delete this %record%relations%media?",
            deleteMessageWithRelated: " and its relationships",
            deleteMessageMediaAttached: " and its attached media"
        },
        urls: cspace.componentUrlBuilder({
            deleteURL: "%webapp/html/findedit.html",
            cloneURL: "%webapp/html/%recordType.html"
        })
    });
    
})(jQuery, fluid);
