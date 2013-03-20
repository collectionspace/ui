/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jQuery, fluid, cspace:true*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.log("RecordEditor.js loaded");

    // Record editor component is one of the high level components used for
    // pages that do record/data editing/manipulation.
    fluid.defaults("cspace.recordEditor", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        mergePolicy: {
            // Replace fieldsToIgnore options if passed.
            fieldsToIgnore: "replace",
            "uispec": "nomerge"
        },
        // Fields that are not going to be copied when the user creates a
        // record from existing.
        fieldsToIgnore: ["csid", "fields.csid", "fields.workflow"],
        preInitFunction: "cspace.recordEditor.preInit",
        finalInitFunction: "cspace.recordEditor.finalInit",
        selectors: {
            controlPanel: ".csc-recordEditor-controlPanel-container",
            recordRendererContainer: ".csc-recordEditor-renderer-container",
            header: ".csc-recordEditor-header",
            togglable: ".csc-recordEditor-togglable"
        },
        // Render control panel (a collection of control buttons above and
        // below the record editing area.
        protoTree: {
            controlPanel: {
                decorators: {
                    type: "fluid",
                    func: "cspace.recordEditor.controlPanel"
                }
            }
        },
        selectorsToIgnore: ["recordRendererContainer", "header", "togglable", "identificationNumber"],
        // Record editor template resource. (not the record type specific
        // template).
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RecordEditorTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        components: {
            // Component that does handles message bar manipulations.
            messanger: {
                type: "cspace.recordEditor.messanger"
            },
            // Component that handles confirmation dialogs when saving, deleting
            // a record.
            confirmation: {
                type: "cspace.confirmation"
            },
            // Component that tracks all changes to a record model.
            changeTracker: {
                type: "cspace.recordEditor.changeTracker",
                options: {
                    model: "{cspace.recordEditor}.model",
                    applier: "{cspace.recordEditor}.applier"
                },
                createOnEvent: "afterFetch"
            },
            // Component that handles all saving related functionality,
            saver: {
                type: "cspace.recordEditor.saver",
                createOnEvent: "afterFetch"
            },
            // Component that handles all delete related functionality.
            remover: {
                type: "cspace.recordEditor.remover",
                createOnEvent: "afterFetch",
                options: {
                    recordType: "{cspace.recordEditor}.options.recordType",
                    strings: "{cspace.recordEditor}.options.strings"
                }
            },
            // Component that handles cancelling of all changes.
            canceller: {
                type: "cspace.recordEditor.canceller",
                createOnEvent: "afterFetch"
            },
            // Local storage component that saves current record model
            // before create a new one from existing.
            localStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "modelToClone"
                }
            },
            // Component that handles creation from existing.
            cloner: {
                type: "cspace.recordEditor.cloner",
                options: {
                    model: "{cspace.recordEditor}.model",
                    fieldsToIgnore: "{cspace.recordEditor}.options.fieldsToIgnore",
                    recordType: "{cspace.recordEditor}.options.recordType"
                }
            },
            // Component that does the rendering of the main record editing
            // area.
            recordRenderer: {
                type: "cspace.recordEditor.recordRenderer",
                container: "{cspace.recordEditor}.dom.recordRendererContainer",
                options: {
                    model: "{cspace.recordEditor}.model",
                    applier: "{cspace.recordEditor}.applier",
                    uispec: "{cspace.recordEditor}.options.uispec",
                    resources: "{cspace.templateFetcher}.options.resources",
                    events: {
                        afterRender: "{cspace.recordEditor}.events.afterRecordRender"
                    }
                },
                createOnEvent: "ready"
            },
            // Component that does the async fetching of record type specific
            // template, representing the record editing area.
            templateFetcher: {
                type: "cspace.templateFetcher",
                priority: "first",
                options: {
                    recordType: "{cspace.recordEditor}.options.recordType",
                    events: {
                        afterFetch: "{cspace.recordEditor}.events.afterFetchTemplate"
                    }
                }
            },
            // Component that handles all saving/retreiving data operations.
            recordDataSource: {
                type: "cspace.recordEditor.dataSource",
                options: {
                    recordType: "{cspace.recordEditor}.options.recordType"
                }
            },
            // Renders and styles toggle bars for record editor's sections.
            recordEditorTogglable: {
                type: "cspace.util.togglable",
                options: {
                    selectors: {
                        header: "{cspace.recordEditor}.options.selectors.header",
                        togglable: "{cspace.recordEditor}.options.selectors.togglable"
                    }
                },
                createOnEvent: "afterRecordRender"
            },
            // Component that applies read only styling for all of record
            // editor.
            readOnly: {
                type: "cspace.recordEditor.readOnly",
                container: "{recordEditor}.container",
                createOnEvent: "afterRecordRender"
            },
            // Component handler of vocab related utils.
            vocab: "{vocab}",
            // Global model contains all data for current and related records.
            globalModel: "{globalModel}",
            // Global events contains events visible to all components.
            globalEvents: "{globalEvents}",
            // Component that will trigger confirmation is user navigates
            // with data not saved.
            globalNavigator: {
                type: "cspace.util.globalNavigator",
                options: {
                    listeners: {
                        onPerformNavigation: {
                            listener: "{recordEditor}.onPerformNavigation",
                            namespace: "onPerformNavigationRecordEditor"
                        }
                    }
                }
            }
        },
        events: {
            // Fires when data for the record is fetched.
            afterFetch: null,
            // Local only afterFetch event.
            afterFetchLocal: null,
            // Fires when template is fetched.
            afterFetchTemplate: null,
            // Fires when both template and data are fetched.
            ready: {
                events: {
                    data: "{cspace.recordEditor}.events.afterFetchLocal",
                    template: "{cspace.recordEditor}.events.afterFetchTemplate"
                }
            },
            // Fires as the final afterInit event (last listener to ready).
            afterInit: null,
            // Fires when record is abot to be saved.
            onSave: "preventable",
            // Fires on the firs save of a new record.
            afterCreate: null,
            // Fires when record is saved.
            afterSave: null,
            // Fires when the record is about to be removed.
            onRemove: "preventable",
            // Fires afer the record is removed.
            afterRemove: null,
            // Fires when changes are about to be reverted.
            onCancel: null,
            // Fires if save is cancelled.
            onCancelSave: null,
            // Fires after changes to record are cancelled.
            afterCancel: null,
            // Fires when the user is about to create a new record from
            // existing.
            onCreateFromExisting: null,
            // Fires after the record editor section is rendered.
            afterRecordRender: null,
            // Fires whenever there's an error.
            onError: null,
            // Fires whenever the user changes a record field.
            onChange: null
        },
        listeners: {
            afterSave: "{cspace.recordEditor}.afterSaveHandler",
            afterFetch: {
                listener: "{cspace.recordEditor}.events.afterFetchLocal.fire",
                priority: "last"
            },
            ready: [
                "{cspace.recordEditor}.onReady", {
                listener: "{cspace.recordEditor}.events.afterInit.fire",
                priority: "last"
            }],
            afterRecordRender: [
                "{loadingIndicator}.events.hideOn.fire",
                "{messageBar}.hide"
            ],
            onError: "{loadingIndicator}.events.hideOn.fire",
            onCancel: "{loadingIndicator}.events.showOn.fire",
            afterRemove: "{loadingIndicator}.events.hideOn.fire"
        },
        // Component that contains all messages.
        parentBundle: "{globalBundle}",
        // A flag to show create from existing button.
        showCreateFromExistingButton: false,
        // A flag to show delete button.
        showDeleteButton: false,
        // A flag to indicate that record editor section needs
        // to be rendererd explicitely and not automatically.
        deferRendering: false,
        // A default path into a global modal for current record editor's
        // model.
        globalRef: "primaryModel",
        // Elements on the page that should never be treated as read only.
        neverReadOnlySelectors: {
            createFromExistingButton: ".csc-createFromExisting"
        }
    });

    fluid.fetchResources.primeCacheFromResources("cspace.recordEditor");

    cspace.recordEditor.preInit = function (that) {
        // After save fire a corresponding global event.
        that.afterSaveHandler = function () {
            if (that.options.globalRef !== "primaryModel") {
                return;
            }
            that.globalEvents.events.primaryRecordSaved.fire();
        };
        // Rebder when ready to.
        that.onReady = function () {
            that.refreshView();
        };
        // This is a listener attached to globalNavigator that is activated when
        // the user tries to navigate away with unsaved data.
        // It will trigger a confirmation dialog.
        that.onPerformNavigation = function (callback) {
            // TODO: This is a hack, the listener is not cleared in some cases.
            if (fluid.get(that, "changeTracker.unsavedChanges")) {
                that.confirmation.open("cspace.confirmation.saveDialog", undefined, {
                    listeners: {
                        onClose: function (userAction) {
                            if (userAction === "act") {
                                that.events.afterSave.addListener(function () {
                                    callback();
                                }, undefined, undefined, "last");
                                that.events.onSave.fire();
                            } else if (userAction === "proceed") {
                                that.changeTracker.revert();
                                callback();
                            }
                        }
                    },
                    parentBundle: that.parentBundle
                });
                return false;
            }
        };
    };

    cspace.recordEditor.finalInit = function (that) {
        // Attach this record editor's model and appler to a global model.
        var modelSpec = {},
            modelToClone = that.localStorage.get();

        modelSpec[that.options.globalRef] = {
            model: that.model,
            applier: that.applier
        };
        that.globalModel.attachModel(modelSpec);

        // If the record is not in local storage, fetch it using the data
        // source.
        if (modelToClone) {
            that.localStorage.set();
            that.applier.requestChange("", modelToClone);
            that.events.afterFetch.fire();
        } else {
            that.recordDataSource.get(function (data) {
                if (data.isError) {
                    that.events.onError.fire(data, "fetch");
                    return;
                }
                that.applier.requestChange("", data);
                that.events.afterFetch.fire();
            });
        }
    };

    // Updates the UI to read only if applicable.
    fluid.defaults("cspace.recordEditor.readOnly", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        readOnly: "{cspace.recordEditor}.options.readOnly",
        postInitFunction: "cspace.recordEditor.readOnly.postInit",
        neverReadOnlySelectors: "{cspace.recordEditor}.options.neverReadOnlySelectors"
    });

    cspace.recordEditor.readOnly.postInit = function (that) {
        cspace.util.processReadOnly(that.container, that.options.readOnly, that.options.neverReadOnlySelectors);
    };

    // Component that does cloning from existing.
    fluid.defaults("cspace.recordEditor.cloner", {
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "autoInit"],
        components: {
            localStorage: "{localStorage}",
            globalNavigator: "{globalNavigator}",
            vocab: "{vocab}",
            messageBar: "{messageBar}"
        },
        events: {
            onCreateFromExisting: {
                event: "{cspace.recordEditor}.events.onCreateFromExisting"
            }
        },
        listeners: {
            onCreateFromExisting: "{cspace.recordEditor.cloner}.clone"
        },
        preInitFunction: "cspace.recordEditor.cloner.preInit",
        cloneURL: cspace.componentUrlBuilder("%webapp/html/%recordType.html%vocab")
    });

    cspace.recordEditor.cloner.preInit = function (that) {
        that.copyAndStore = function () {
            var modelToClone = fluid.copy(that.model);
            fluid.each(that.options.fieldsToIgnore, function (fieldPath) {
                fluid.set(modelToClone, fieldPath);
            });
            that.localStorage.set(modelToClone);
        };
        that.clone = function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                that.copyAndStore();
                var vocab = cspace.vocab.resolve({
                    model: that.model,
                    recordType: that.options.recordType,
                    vocab: that.vocab
                });
                that.messageBar.disable();
                window.location = fluid.stringTemplate(that.options.cloneURL, {
                    recordType: that.options.recordType,
                    vocab: vocab ? ("?" + $.param({
                        vocab: vocab
                    })) : ""
                });
            });
        };
    };

    // Component that tracks all the changes to the model.
    fluid.defaults("cspace.recordEditor.changeTracker", {
        gradeNames: ["autoInit", "fluid.modelComponent", "fluid.eventedComponent"],
        preInitFunction: "cspace.recordEditor.changeTracker.preInit",
        events: {
            onChange: {
                event: "{cspace.recordEditor}.events.onChange"
            },
            afterSave: {
                event: "{cspace.recordEditor}.events.afterSave"
            }
        },
        listeners: {
            afterSave: "{cspace.recordEditor.changeTracker}.afterSave"
        }
    });

    cspace.recordEditor.changeTracker.preInit = function (that) {
        that.rollbackModel = fluid.copy(that.model);
        that.unsavedChanges = false;
        that.applier.modelChanged.addListener("fields", function (model, newModel, changeRequest) {
            // This case is specifically for Repeatable which populates Narrower/Broader contexts. We do not want to set that record was changed
            // Important!!  ->  Implementation should use source tracking when it is available in a newer version of Infusion
            if (changeRequest[0].silent) {
                return;
            }
            that.unsavedChanges = true;
            that.events.onChange.fire(that.unsavedChanges);
        });
        // Clear the changes.
        that.revert = function () {
            that.applier.requestChange("", that.rollbackModel);
            that.unsavedChanges = false;
            that.events.onChange.fire(that.unsavedChanges);
        };
        // Regresh the component since the record was saved.
        that.afterSave = function (newModel) {
            that.rollbackModel = newModel;
            that.unsavedChanges = false;
            that.events.onChange.fire(that.unsavedChanges);
        };
    };

    // Validate the record based on the schema.
    fluid.defaults("cspace.recordEditor.validator", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        selectors: {
            identificationNumber: "{cspace.recordEditor}.options.selectors.identificationNumber",
            requiredFields: ".csc-required:visible"
        },
        components: {
            globalBundle: "{globalBundle}",
            globalModel: "{globalModel}",
            modelValidator: {
                type: "cspace.modelValidator"
            }
        },
        events: {
            onValidate: {
                event: "{cspace.recordEditor.saver}.events.onValidate"
            },
            afterValidate: {
                event: "{cspace.recordEditor.saver}.events.afterValidate"
            },
            onError: {
                event: "{cspace.recordEditor}.events.onError"
            }
        },
        recordType: "{cspace.recordEditor}.options.recordType",
        globalRef: "{cspace.recordEditor}.options.globalRef",
        listeners: {
            onValidate: "{cspace.recordEditor.validator}.validate"
        },
        preInitFunction: "cspace.recordEditor.validator.preInit"
    });

    cspace.recordEditor.validator.preInit = function (that) {

        function validate (selector, message) {
            return function () {
                var required = that.locate(selector),
                    valid = true;
                if (required === that.container) {
                    return valid;
                }
                fluid.find(required, function (elem) {
                    if ($.trim($(elem).val()) !== "") {
                        return;
                    }
                    that.events.onError.fire({
                        isError: true,
                        messages: fluid.makeArray(that.globalBundle.resolve(message, [
                            cspace.util.findLabel(elem)
                        ]))
                    });
                    valid = false;
                    return elem;
                });
                return valid;
            };
        }

        // Validate required fields.
        that.validateRequired = validate("requiredFields", "recordEditor-missingRequiredFields");

        // Validate ID Number.
        that.validateIdentificationNumber = validate("identificationNumber", that.options.recordType + "-identificationNumberRequired");

        // Validate both required fields and ID number.
        that.validate = function (model, applier) {
            var valFunctions = ["validateRequired", "validateIdentificationNumber"],
                i;
            for (i = 0; i < valFunctions.length; ++i) {
                if (!that[valFunctions[i]]()) {
                    return;
                }
            }

            var validatedModel = that.modelValidator.validate(model);
            if (!validatedModel) {
                that.events.onError.fire();
                return;
            }
            that.applier.requestChange("", validatedModel);

            that.events.afterValidate.fire();
        };
    };

    // Component that does the saving work.
    fluid.defaults("cspace.recordEditor.saver", {
        gradeNames: ["autoInit", "fluid.eventedComponent"],
        events: {
            onSave: {
                event: "{cspace.recordEditor}.events.onSave"
            },
            beforeSave: null,
            onValidate: null,
            afterValidate: null
        },
        listeners: {
            onSave: "{cspace.recordEditor.saver}.onSaveHandler",
            beforeSave: "{loadingIndicator}.events.showOn.fire",
            afterValidate: "{cspace.recordEditor.saver}.afterValidateHandler"
        },
        preInitFunction: "cspace.recordEditor.saver.preInit",
        invokers: {
            save: "cspace.recordEditor.saver.save",
            afterValidate: "cspace.recordEditor.saver.afterValidate"
        },
        components: {
            validator: {
                type: "cspace.recordEditor.validator",
                container: "{cspace.recordEditor}.container"
            }
        }
    });

    fluid.demands("cspace.recordEditor.saver.save", "cspace.recordEditor.saver", {
        funcName: "cspace.recordEditor.saver.save",
        args: ["{cspace.recordEditor.saver}", "{recordEditor}"]
    });

    // fluid.demands("cspace.recordEditor.saver.save", ["cspace.recordEditor.saver", "movement.lock"], {
    //     funcName: "cspace.recordEditor.saver.saveMovement",
    //     args: ["{cspace.recordEditor.saver}", "{recordEditor}"]
    // });

    // fluid.demands("cspace.recordEditor.saver.save", ["cspace.recordEditor.saver", "movement.lock", "cspace.relatedRecordsTab"], {
    //     funcName: "cspace.recordEditor.saver.saveMovementTab",
    //     args: ["{cspace.recordEditor.saver}", "{recordEditor}", "{relatedRecordsTab}.events.afterAddRelation"]
    // });

    fluid.demands("cspace.recordEditor.saver.afterValidate", "cspace.recordEditor.saver", {
        funcName: "cspace.recordEditor.saver.afterValidate",
        args: "{recordEditor}"
    });

    var openConfirmationMovement = function (that, recordEditor, proceedCallback) {
        // Confirm save.
        recordEditor.confirmation.open("cspace.confirmation.saveDialog", undefined, {
            model: {
                messages: ["lockDialog-primaryMessage", "lockDialog-secondaryMessage", "saveDialog-hardSaveMessage"],
                messagekeys: {
                    actText: "lockDialog-actText",
                    actAlt: "lockDialog-actAlt",
                    proceedText: "lockDialog-proceedText",
                    proceedAlt: "lockDialog-proceedAlt"
                }
            },
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "cancel") {
                        recordEditor.events.onCancelSave.fire();
                        return;
                    }
                    if (userAction === "proceed") {
                        proceedCallback();
                    }
                    cspace.recordEditor.saver.save(that, recordEditor);
                }
            },
            parentBundle: recordEditor.options.parentBundle
        });
    };

    // Location/Movement/Inventory tab specific save function. It takes into
    // consideration locking workflow for that record type.
    // The user has two options: save and hard save.
    cspace.recordEditor.saver.saveMovementTab = function (that, recordEditor, afterAddRelation) {
        openConfirmationMovement(that, recordEditor, function () {
            if (fluid.get(recordEditor.model, "csid")) {
                recordEditor.applier.requestChange("workflowTransition", "lock");
                return;
            }
            afterAddRelation.addListener(function () {
                afterAddRelation.removeListener("saveMovementTab");
                recordEditor.applier.requestChange("workflowTransition", "lock");
                cspace.recordEditor.saver.save(that, recordEditor);
            }, "saveMovementTab", undefined, "last");
        });
    };

    // Location/Movement/Inventory specific save function. It takes into
    // consideration locking workflow for that record type.
    // The user has two options: save and hard save.
    cspace.recordEditor.saver.saveMovement = function (that, recordEditor) {
        openConfirmationMovement(that, recordEditor, function () {
            recordEditor.applier.requestChange("workflowTransition", "lock");
        });
    };

    // Default save function.
    cspace.recordEditor.saver.save = function (that, recordEditor) {
        that.events.beforeSave.fire();
        that.events.onValidate.fire(recordEditor.model, recordEditor.applier);
    };

    // If validation succeeded save the record.
    cspace.recordEditor.saver.afterValidate = function (recordEditor) {
        var vocab = cspace.vocab.resolve({
            model: recordEditor.model,
            recordType: recordEditor.options.recordType,
            vocab: recordEditor.vocab
        });
        if (vocab) {
            recordEditor.applier.requestChange("namespace", vocab);
        }
        recordEditor.recordDataSource.set(recordEditor.model, function (data) {
            if (data.isError) {
                recordEditor.events.onError.fire(data, "save");
                return;
            }
            if (!recordEditor.model.csid) {
                recordEditor.events.afterCreate.fire(data);
            }
            recordEditor.applier.requestChange("", data);
            recordEditor.events.afterSave.fire(data);
        });
    };

    cspace.recordEditor.saver.preInit = function (that) {
        that.onSaveHandler = function () {
            that.save();
        };
        that.afterValidateHandler = function () {
            that.afterValidate();
        };
    };

    // Component that does all removing work.
    fluid.defaults("cspace.recordEditor.remover", {
        gradeNames: ["autoInit", "fluid.eventedComponent"],
        events: {
            onRemove: {
                event: "{cspace.recordEditor}.events.onRemove"
            },
            afterRemove: {
                event: "{cspace.recordEditor}.events.afterRemove"
            },
            onError: {
                event: "{cspace.recordEditor}.events.onError"
            },
            afterFetchProcedures: null,
            afterFetchCataloging: null,
            afterFetch: {
                events: {
                    procedures: "{cspace.recordEditor.remover}.events.afterFetchProcedures",
                    cataloging: "{cspace.recordEditor.remover}.events.afterFetchCataloging"
                },
                args: ["{arguments}.procedures.0", "{arguments}.cataloging.0"]
            }
        },
        listeners: {
            afterFetch: "{cspace.recordEditor.remover}.onAfterFetch",
            onRemove: "{cspace.recordEditor.remover}.onRemoveHandler",
            afterRemove: "{cspace.recordEditor.remover}.afterRemoveHandler"
        },
        components: {
            vocab: "{vocab}",
            // Data source that will be used to check if there are related
            // procedural records.
            proceduresDataSource: {
                type: "cspace.recordEditor.remover.proceduresDataSource"
            },
            // Data source that will be used to check if there are related
            // cataloging records.
            catalogingDataSource: {
                type: "cspace.recordEditor.remover.catalogingDataSource"
            },
            // Data source that will be used to check if there are related
            // terms records.
            refobjsDataSource: {
                type: "cspace.recordEditor.remover.refobjsDataSource"
            },
            globalModel: "{globalModel}"
        },
        invokers: {
            remove: "cspace.recordEditor.remover.remove",
            afterRemove: "cspace.recordEditor.remover.afterRemove",
            hasMediaAttached: "cspace.recordEditor.remover.hasMediaAttached",
            openConfirmation: "cspace.recordEditor.remover.openConfirmation"
        },
        preInitFunction: "cspace.recordEditor.remover.preInit",
        urls: cspace.componentUrlBuilder({
            proceduresURL: '%tenant/%tname/%recordType/procedures/%csid?pageNum=0&pageSize=5&sortDir=1',
            catalogingURL: '%tenant/%tname/%recordType/cataloging/%csid?pageNum=0&pageSize=5&sortDir=1',
            refobjsURL: '%tenant/%tname/vocabularies/%vocab/refobjs/%csid?pageNum=0&pageSize=5&sortDir=1',
            deleteURL: "%webapp/html/findedit.html"
        })
    });

    fluid.demands("cspace.recordEditor.remover.afterRemove", "cspace.recordEditor.remover", {
        funcName: "cspace.recordEditor.remover.redirectAfterDelete",
        args: ["{confirmation}", "{globalBundle}", "{remover}.options.urls.deleteURL", "{recordEditor}.options.recordType"]
    });

    fluid.demands("cspace.recordEditor.remover.afterRemove", ["cspace.recordEditor.remover", "cspace.admin"], {
        funcName: "cspace.recordEditor.remover.statusAfterDelete",
        args: ["{messageBar}", "{recordEditor}.options.strings", "{globalBundle}", "{recordEditor}.options.recordType"]
    });

    fluid.demands("cspace.recordEditor.remover.afterRemove", ["cspace.recordEditor.remover", "cspace.tab"], {
        funcName: "cspace.recordEditor.remover.statusAfterDelete",
        args: ["{messageBar}", "{recordEditor}.options.strings", "{globalBundle}", "{recordEditor}.options.recordType"]
    });

    /*
     * Opens an alert box informing user printing the string defined in
     * options.strings.removeSuccessfulMessage. After user dismisses dialog,
     * user is redirected to the URL defined in: options.urls.deleteURL
     * Note that deletion should already have taken place before this function is
     * called. This function merely shows dialog to user and redirects.
     */
    cspace.recordEditor.remover.redirectAfterDelete = function (confirmation, parentBundle, url, recordType) {
        confirmation.open("cspace.confirmation.alertDialog", undefined, {
            listeners: {
                onClose: function (userAction) {
                    window.location = url;
                }
            },
            parentBundle: parentBundle,
            model: {
                 messages: [ "recordEditor-dialog-removeSuccessfulMessage" ]
            },
            termMap: [
                parentBundle.resolve(recordType)
            ]
        });
    };

    /*
     * Dismisses the record that the user was in (now deleted) and displays
     * a message in the messagebar, informing the user that the record was
     * deleted.
     */
    cspace.recordEditor.remover.statusAfterDelete = function (messageBar, strings, parentBundle, recordType) {
        //show messagebar
        messageBar.show(parentBundle.resolve(strings.removeSuccessfulMessage, [
            parentBundle.resolve(recordType)
        ]), null, false);
    };

    fluid.demands("cspace.recordEditor.remover.openConfirmation", "cspace.recordEditor.remover", {
        funcName: "cspace.recordEditor.remover.openConfirmation",
        args: ["{confirmation}", "{recordDataSource}", "{globalBundle}", "{cspace.recordEditor.remover}", "{arguments}.0", "{arguments}.1"]
    });

    cspace.recordEditor.remover.openConfirmation = function (confirmation, recordDataSource, parentBundle, that, procedures, cataloging) {
        var hasRelations = fluid.get(procedures, "items.length") || 0 + fluid.get(cataloging, "items.length") || 0 > 0;
        confirmation.open("cspace.confirmation.deleteDialog", undefined, {
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "act") {
                        recordDataSource.remove(function (data) {
                            if (data && data.isError) {
                                that.events.onError.fire(data, "delete");
                                return;
                            }
                            that.events.afterRemove.fire();
                        });
                    }
                }
            },
            model: {
                messages: ["recordEditor-dialog-deletePrimaryMessage"]
            },
            termMap: [
                parentBundle.resolve(that.options.recordType),
                that.hasMediaAttached() ? that.options.strings.deleteMessageMediaAttached : "",
                hasRelations ? that.options.strings.deleteMessageWithRelated : ""
            ],
            parentBundle: parentBundle
        });
    };

    cspace.recordEditor.remover.preInit = function (that) {
        that.onAfterFetch = function (procedures, cataloging) {
            that.openConfirmation(procedures, cataloging);
        };
        that.onRemoveHandler = function () {
            that.remove();
        };
        that.afterRemoveHandler = function () {
            that.afterRemove();
        };
    };

    fluid.demands("cspace.recordEditor.remover.proceduresDataSource",  ["cspace.localData", "cspace.recordEditor.remover"], {
        funcName: "cspace.recordEditor.remover.testProceduresDataSource",
        args: {
            targetTypeName: "cspace.recordEditor.remover.testProceduresDataSource",
            termMap: {
                recordType: "%recordType",
                csid: "%csid"
            }
        }
    });
    fluid.demands("cspace.recordEditor.remover.proceduresDataSource", "cspace.recordEditor.remover", {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordEditor.remover}.options.urls.proceduresURL",
            termMap: {
                recordType: "%recordType",
                csid: "%csid"
            },
            targetTypeName: "cspace.recordEditor.remover.proceduresDataSource"
        }
    });
    fluid.defaults("cspace.recordEditor.remover.testProceduresDataSource", {
        url: "%test/data/%recordType/procedure/%csid.json"
    });
    cspace.recordEditor.remover.testProceduresDataSource = cspace.URLDataSource;

    fluid.demands("cspace.recordEditor.remover.catalogingDataSource",  ["cspace.localData", "cspace.recordEditor.remover"], {
        funcName: "cspace.recordEditor.remover.testCatalogingDataSource",
        args: {
            targetTypeName: "cspace.recordEditor.remover.testCatalogingDataSource",
            termMap: {
                recordType: "%recordType",
                csid: "%csid"
            }
        }
    });
    fluid.demands("cspace.recordEditor.remover.catalogingDataSource", "cspace.recordEditor.remover", {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordEditor.remover}.options.urls.catalogingURL",
            termMap: {
                recordType: "%recordType",
                csid: "%csid"
            },
            targetTypeName: "cspace.recordEditor.remover.catalogingDataSource"
        }
    });
    fluid.defaults("cspace.recordEditor.remover.testCatalogingDataSource", {
        url: "%test/data/%recordType/cataloging/%csid.json"
    });
    cspace.recordEditor.remover.testCatalogingDataSource = cspace.URLDataSource;

    fluid.demands("cspace.recordEditor.remover.refobjsDataSource",  ["cspace.localData", "cspace.recordEditor.remover"], {
        funcName: "cspace.recordEditor.remover.testRefobjsDataSource",
        args: {
            targetTypeName: "cspace.recordEditor.remover.testRefobjsDataSource",
            termMap: {
                csid: "%csid",
                vocab: "%vocab"
            }
        }
    });
    fluid.demands("cspace.recordEditor.remover.refobjsDataSource", "cspace.recordEditor.remover", {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordEditor.remover}.options.urls.refobjsURL",
            termMap: {
                csid: "%csid",
                vocab: "%vocab"
            },
            targetTypeName: "cspace.recordEditor.remover.refobjsDataSource"
        }
    });
    fluid.defaults("cspace.recordEditor.remover.testRefobjsDataSource", {
        url: "%test/data/%vocab/refobjs/%csid.json"
    });
    cspace.recordEditor.remover.testRefobjsDataSource = cspace.URLDataSource;

    fluid.demands("cspace.recordEditor.remover.hasMediaAttached", "cspace.recordEditor", {
        funcName: "cspace.recordEditor.remover.hasMediaAttached",
        args: "{cspace.recordEditor}.model"
    });

    cspace.recordEditor.remover.hasMediaAttached = function (model) {
        return (model.fields && model.fields.blobCsid);
    };

    fluid.demands("cspace.recordEditor.remover.remove", "cspace.recordEditor", {
        funcName: "cspace.recordEditor.remover.remove",
        args: "{cspace.recordEditor.remover}"
    });

    // When the user removes the record, first check for related cataloging
    // and procedures.
    cspace.recordEditor.remover.remove = function (that) {
        var csid = fluid.get(that.globalModel.model, "primaryModel.csid");
        that.proceduresDataSource.get({
            recordType: that.options.recordType,
            csid: csid
        }, function (data) {
            that.events.afterFetchProcedures.fire(data);
        });
        that.catalogingDataSource.get({
            recordType: that.options.recordType,
            csid: csid
        }, function (data) {
            that.events.afterFetchCataloging.fire(data);
        });
    };

    // Remove method that also checks hierarchy related relations.
    cspace.recordEditor.remover.removeWithCheck = function (that, model, confirmation, parentBundle, removeMessage) {
        if (fluid.find(model.fields.narrowerContexts, function (element) {
            return element.narrowerContext || undefined;
        })) {
            removeMessage = removeMessage || "deleteDialog-hasNarrowerContextsMessage";
        } else if (model.fields.broaderContext) {
            removeMessage = removeMessage || "deleteDialog-hasBroaderContextMessage";
        }
        if (removeMessage) {
            confirmation.open("cspace.confirmation.deleteDialog", undefined, {
                enableButtons: ["act"],
                model: {
                    messages: [removeMessage],
                    messagekeys: {
                        actText: "alertDialog-actText"
                    }
                },
                termMap: [
                    parentBundle.resolve(that.options.recordType)
                ],
                parentBundle: parentBundle
            });
        } else {
            cspace.recordEditor.remover.remove(that);
        }
    };

    // Remove method that checks wether the auth record is used by other records.
    cspace.recordEditor.remover.removeWithCheckRefobjs = function (that, model, confirmation, parentBundle) {
        var removeMessage;
        that.refobjsDataSource.get({
            vocab: cspace.vocab.resolve({
                model: model,
                recordType: that.options.recordType,
                vocab: that.vocab
            }),
            csid: fluid.get(that.globalModel.model, "primaryModel.csid")
        }, function (data) {
            if (fluid.makeArray(data.items.length) > 0) {
                removeMessage = "deleteDialog-usedByMessage";
            }
            cspace.recordEditor.remover.removeWithCheck(that, model, confirmation, parentBundle, removeMessage);
        });
    };

    // Component that cancels changes done by the user.
    fluid.defaults("cspace.recordEditor.canceller", {
        gradeNames: ["autoInit", "fluid.eventedComponent", "fluid.modelComponent"],
        events: {
            onCancel: {
                event: "{cspace.recordEditor}.events.onCancel"
            },
            afterCancel: {
                event: "{cspace.recordEditor}.events.afterCancel"
            }
        },
        components: {
            changeTracker: "{changeTracker}"
        },
        listeners: {
            onCancel: "{cspace.recordEditor.canceller}.onCancelHandler"
        },
        preInitFunction: "cspace.recordEditor.canceller.preInit",
        invokers: {
            cancel: "cspace.recordEditor.canceller.cancel"
        }
    });

    fluid.demands("cspace.recordEditor.canceller.cancel", "cspace.recordEditor.canceller", {
        funcName: "cspace.recordEditor.canceller.cancel",
        args: "{cspace.recordEditor.canceller}"
    });

    cspace.recordEditor.canceller.cancel = function (that) {
        that.changeTracker.revert();
        that.events.afterCancel.fire();
    };

    cspace.recordEditor.canceller.preInit = function (that) {
        that.onCancelHandler = function () {
            that.cancel();
        };
    };

    // Component that abstracts message bar messaging.
    fluid.defaults("cspace.recordEditor.messanger", {
        gradeNames: ["autoInit", "fluid.eventedComponent"],
        events: {
            onError: {
                event: "{cspace.recordEditor}.events.onError"
            },
            afterSave: {
                event: "{cspace.recordEditor}.events.afterSave"
            }
        },
        listeners: {
            onError: "{cspace.recordEditor.messanger}.onErrorHandler",
            afterSave: {
                listener: "{cspace.recordEditor.messanger}.afterSaveHandler",
                priority: "last",
                namespace: "afterSaveMessanger"
            }
        },
        preInitFunction: "cspace.recordEditor.messanger.preInit",
        components: {
            messageBar: "{messageBar}",
            globalBundle: "{globalBundle}"
        },
        recordType: "{cspace.recordEditor}.options.recordType"
    });

    cspace.recordEditor.messanger.preInit = function (that) {
        // Notify message bar on save.
        that.afterSaveHandler = function () {
            var resolve = that.globalBundle.resolve;
            that.messageBar.show(resolve("recordEditor-saveSuccessfulMessage", [resolve(that.options.recordType)]), Date.today(), false);
        };
        // Notify message bar on error.
        that.onErrorHandler = function (data, operation) {
            if (!data) {
                return;
            }
            if (!data.messages) {
                var resolve = that.globalBundle.resolve;
                data.messages = fluid.makeArray(resolve("recordEditor-" + operation + "FailedMessage", [
                    resolve(that.options.recordType),
                    resolve("recordEditor-unknownError")
                ]));
            }
            var messages = data.messages || fluid.makeArray(data.message);
            fluid.each(messages, function (message) {
                message = message.message || message;
                that.messageBar.show(message, Date.today(), data.isError);
            });
        };
    };

    // Control panel component that renders the contol buttons above and below
    // record editor's edit panel.
    fluid.demands("cspace.recordEditor.controlPanel", "cspace.recordEditor", {
        mergeAllOptions: [{
            recordModel: "{cspace.recordEditor}.model",
            recordApplier: "{cspace.recordEditor}.applier",
            model: {
                showCreateFromExistingButton: "{cspace.recordEditor}.options.showCreateFromExistingButton",
                showDeleteButton: "{cspace.recordEditor}.options.showDeleteButton"
            },
            recordType: "{cspace.recordEditor}.options.recordType"
        }, "{arguments}.1"]
    });

    fluid.demands("cspace.recordEditor.controlPanel", ["cspace.recordEditor", "cspace.relatedRecordsTab"], {
        mergeAllOptions: [{
            recordModel: "{cspace.recordEditor}.model",
            recordApplier: "{cspace.recordEditor}.applier",
            model: {
                showCreateFromExistingButton: false,
                showDeleteButton: false,
                showDeleteRelationButton: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.resolveDeleteRelation",
                        args: {
                            resolver: "{permissionsResolver}",
                            allOf: [{
                                target: "{cspace.relatedRecordsTab}.options.related",
                                permission: "update"
                            }, {
                                target: "{cspace.relatedRecordsTab}.options.primary",
                                permission: "update"
                            }],
                            primaryModel: "{globalModel}.model.primaryModel",
                            relatedModel: "{cspace.recordEditor}.model"
                        }
                    }
                }
            },
            produceTree: "cspace.recordEditor.controlPanel.produceTreeTabs",
            events: {
                onDeleteRelation: "{cspace.relatedRecordsTab}.events.onDeleteRelation"
            },
            recordType: "{cspace.recordEditor}.options.recordType"
        }, "{arguments}.1"]
    });
    
    fluid.demands("cspace.recordEditor.controlPanel", ["cspace.recordEditor", "cspace.admin", "cspace.users"], {
        mergeAllOptions: [{
            recordModel: "{cspace.recordEditor}.model",
            recordApplier: "{cspace.recordEditor}.applier",
            model: {
                showCreateFromExistingButton: "{cspace.recordEditor}.options.showCreateFromExistingButton",
                showDeleteButton: "{cspace.recordEditor}.options.showDeleteButton"
            },
            recordType: "{cspace.recordEditor}.options.recordType",
            userLogin: "{pageBuilder}.options.userLogin"
        }, "{arguments}.1"]
    });

    fluid.defaults("cspace.recordEditor.controlPanel", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "cspace.recordEditor.controlPanel.preInit",
        finalInitFunction: "cspace.recordEditor.controlPanel.finalInit",
        mergePolicy: {
            recordModel: "preserve",
            recordApplier: "nomerge"
        },
        components: {
            changeTracker: "{changeTracker}",
            resolver: "{permissionsResolver}"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/ControlPanelTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        selectors: {
            recordTraverser: ".csc-recordTraverser",
            createFromExistingButton: ".csc-createFromExisting",
            deleteButton: ".csc-delete",
            save: ".csc-save",
            cancel: ".csc-cancel",
            deleteRelationButton: ".csc-deleteRelation",
            goTo: ".csc-goto",
            recordLock: ".csc-recordLock"
        },
        styles: {
            recordTraverser: "cs-recordTraverser"
        },
        events: {
            onSave: {
                event: "{cspace.recordEditor}.events.onSave"
            },
            afterSave: {
                event: "{cspace.recordEditor}.events.afterSave"
            },
            onError: {
                event: "{cspace.recordEditor}.events.onError"
            },
            onCancel: {
                event: "{cspace.recordEditor}.events.onCancel"
            },
            onCancelSave: {
                event: "{cspace.recordEditor}.events.onCancelSave"
            },
            onRemove: {
                event: "{cspace.recordEditor}.events.onRemove"
            },
            onCreateFromExisting: {
                event: "{cspace.recordEditor}.events.onCreateFromExisting"
            },
            onChange: {
                event: "{cspace.recordEditor}.events.onChange"
            }
        },
        listeners: {
            onSave: {
                listener: "{cspace.recordEditor.controlPanel}.disableControlButtons",
                priority: "first"
            },
            afterSave: "{cspace.recordEditor.controlPanel}.enableControlButtons",
            onError: "{cspace.recordEditor.controlPanel}.enableControlButtons",
            onChange: "{cspace.recordEditor.controlPanel}.onChangeHandler",
            onCancelSave: "{cspace.recordEditor.controlPanel}.enableControlButtons"
        },
        urls: cspace.componentUrlBuilder({
            goTo: "%webapp/html/%recordType.html?csid=%csid"
        }),
        produceTree: "cspace.recordEditor.controlPanel.produceTree",
        parentBundle: "{globalBundle}",
        strings: {},
        requiredPermissions: {
            showSaveCancelButtons: "update",
            showDeleteButton: "delete",
            showGoto: "read"
        },
        hideButtonMap: {
            showDeleteButton: ["termlist"]
        }
    });

    // Render spec for control panel for tabs.
    cspace.recordEditor.controlPanel.produceTreeTabs = function (that) {
        return {
            goTo: {
                messagekey: "relatedRecordsTab-goToRecord",
                decorators: {
                    type: "jQuery",
                    func: "hide"
                }
            },
            recordLock: {
                decorators: {
                    type: "fluid",
                    func: "cspace.util.recordLock"
                }
            },
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${showDeleteRelationButton}",
                trueTree: {
                    deleteRelationButton: {
                        messagekey: "tab-list-deleteRelation",
                        decorators: [{
                            type: "jQuery",
                            func: "prop",
                            args: {
                                disabled: "${disableDeleteRelationButton}"
                            }
                        }, {
                            type: "jQuery",
                            func: "click",
                            args: function () {
                                that.events.onDeleteRelation.fire({
                                    csid: that.options.recordModel.csid,
                                    recordtype: that.options.recordType
                                })
                            }
                        }]
                    }
                }
            }, {
                type: "fluid.renderer.condition",
                condition: "${showSaveCancelButtons}",
                trueTree: {
                    save: {
                        messagekey: "recordEditor-save",
                        decorators: {
                            type: "jQuery",
                            func: "click",
                            args: that.events.onSave.fire
                        }
                    },
                    cancel: {
                        messagekey: "recordEditor-cancel",
                        decorators: [{
                            type: "jQuery",
                            func: "click",
                            args: that.events.onCancel.fire
                        }, {
                            type: "jQuery",
                            func: "prop",
                            args: {
                                disabled: "${disableCancelButton}"
                            }
                        }]
                    }
                }
            }]
        };
    };

    // Render spec for control panel.
    cspace.recordEditor.controlPanel.produceTree = function (that) {
        return {
            recordLock: {
                decorators: {
                    type: "fluid",
                    func: "cspace.util.recordLock"
                }
            },
            recordTraverser: {
                decorators: [{
                    addClass: "{styles}.recordTraverser"
                }, {
                    type: "fluid",
                    func: "cspace.recordTraverser"
                }]
            },
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${showCreateFromExistingButton}",
                trueTree: {
                    createFromExistingButton: {
                        messagekey: "recordEditor-createFromExistingButton",
                        decorators: [{
                            type: "jQuery",
                            func: "prop",
                            args: {
                                disabled: "${disableCreateFromExistingButton}"
                            }
                        }, {
                            type: "jQuery",
                            func: "click",
                            args: that.events.onCreateFromExisting.fire
                        }]
                    }
                }
            }, {
                type: "fluid.renderer.condition",
                condition: "${showDeleteButton}",
                trueTree: {
                    deleteButton: {
                        messagekey: "recordEditor-deleteButton",
                        decorators: [{
                            type: "jQuery",
                            func: "prop",
                            args: {
                                disabled: "${disableDeleteButton}"
                            }
                        }, {
                            type: "jQuery",
                            func: "click",
                            args: that.events.onRemove.fire
                        }]
                    }
                }
            }, {
                type: "fluid.renderer.condition",
                condition: "${showSaveCancelButtons}",
                trueTree: {
                    save: {
                        messagekey: "recordEditor-save",
                        decorators: {
                            type: "jQuery",
                            func: "click",
                            args: that.events.onSave.fire
                        }
                    },
                    cancel: {
                        messagekey: "recordEditor-cancel",
                        decorators: [{
                            type: "jQuery",
                            func: "click",
                            args: that.events.onCancel.fire
                        }, {
                            type: "jQuery",
                            func: "prop",
                            args: {
                                disabled: "${disableCancelButton}"
                            }
                        }]
                    }
                }
            }]
        };
    };

    // Check if delete button needs to be disabled.
    cspace.recordEditor.controlPanel.disableDeleteButton = function (rModel) {
        //disable if: model.csid is not set (new record)
        if (!rModel || !rModel.csid) {
            return true;
        }
        //disable if: if we are looking at admin account
        if (rModel.fields.email === "admin@core.collectionspace.org") {
            return true;
        }
        return false;
    };

    cspace.recordEditor.controlPanel.notSaved = function (rModel) {
        //disable if: model.csid is not set (new record)
        return !!(rModel && !rModel.csid);
    };

    cspace.recordEditor.controlPanel.preInit = function (that) {
        var rModel = that.options.recordModel;
        // Adjust buttons on changes to the field.
        that.onChangeHandler = function (unsavedChanges) {
            var notSaved = cspace.recordEditor.controlPanel.notSaved(rModel);
            that.locate("cancel").prop("disabled", !unsavedChanges);
            that.locate("createFromExistingButton").prop("disabled", notSaved);
            that.locate("deleteButton").prop("disabled", cspace.recordEditor.controlPanel.disableDeleteButton(rModel));
            that.hideDeleteButtonForCurrentUser(rModel.fields.userId);
            that.locate("deleteRelationButton").prop("disabled", notSaved);
            that.renderGoTo();
        };
        // Check if goto needs to be enabled.
        that.renderGoTo = function () {
            var rModel = that.options.recordModel,
                goTo = that.locate("goTo"),
                notSaved = cspace.recordEditor.controlPanel.notSaved(rModel);
            if (goTo.length < 1) {
                return;
            }
            goTo[!that.model.showGoto || notSaved ? "hide" : "show"]();
            if (notSaved) {
                return;
            }
            goTo.attr("href", fluid.stringTemplate(that.options.urls.goTo, {recordType: that.options.recordType, csid: rModel.csid}));
        };
        that.disableControlButtons = function () {
            that.locate("save").prop("disabled", true);
            that.locate("createFromExistingButton").prop("disabled", true);
        };
        that.enableControlButtons = function () {
            that.locate("save").prop("disabled", false);
            that.locate("createFromExistingButton").prop("disabled", false);
        };
        that.hideDeleteButtonForCurrentUser = function (userId) {
            var userLogin = that.options.userLogin;
            if (userLogin && userId && (userLogin.userId === userId)) {
                that.applier.requestChange("showDeleteButton", false);
            }
        };
        // Function which sets the flag to be false whenever recordType matches one of the elements in the map for this flag
        that.hideButtonsByRecordType = function (recordType, hideButtonMap) {
            fluid.each(hideButtonMap, function(hideRecordTypes, flag) {
                 if(fluid.find(hideRecordTypes, function(hideRecordType) {
                        return hideRecordType === recordType;
                    })) {
                     that.applier.requestChange(flag, false);
                 }
            });  
        };
        // Function which sets the flag to be false if there are no permissions for the recordType
        that.hideButtonsByPermission = function (recordType, requiredPermissions, resolver) {
             fluid.each(requiredPermissions, function(permission, flag) {
                 that.applier.requestChange(flag, cspace.permissions.resolve({
                    permission: permission,
                    target: recordType,
                    resolver: resolver
                }));
            }); 
        };
    };

    cspace.recordEditor.controlPanel.finalInit = function (that) {
        var rModel = that.options.recordModel,
            notSaved = cspace.recordEditor.controlPanel.notSaved(rModel),
            recordType = that.options.recordType;
        that.applier.requestChange("disableCreateFromExistingButton", notSaved);
        that.applier.requestChange("disableDeleteButton", cspace.recordEditor.controlPanel.disableDeleteButton(rModel));
        that.applier.requestChange("disableDeleteRelationButton", notSaved);
        that.applier.requestChange("disableCancelButton", !that.changeTracker.unsavedChanges);
        
        // Hide buttons if user does not have specific permissions for the recordType
        that.hideButtonsByPermission(recordType, that.options.requiredPermissions, that.resolver);
        
        // Hide buttons for specific recordType
        that.hideButtonsByRecordType(recordType, that.options.hideButtonMap);
        
        that.hideDeleteButtonForCurrentUser(rModel.fields.userId);

        that.refreshView();
        that.renderGoTo();
    };

    fluid.fetchResources.primeCacheFromResources("cspace.recordEditor.controlPanel");

    // Component that fetches record specific templates.
    fluid.defaults("cspace.templateFetcher", {
        gradeNames: ["autoInit", "fluid.eventedComponent"],
        resources: {
            template: cspace.resourceSpecExpander({
                url: "%webapp/html/pages/%recordTypeTemplate%template.html",
                options: {
                    dataType: "html"
                }
            })
        },
        template: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.getUrlParameter",
                args: "template"
            }
        },
        events: {
            afterFetch: null
        },
        finalInitFunction: "cspace.templateFetcher.finalInit"
    });

    cspace.templateFetcher.finalInit = function (that) {
        var template = that.options.resources.template,
            recordType = that.options.recordType,
            templateName = that.options.template ? "-" + that.options.template : "";
        if (recordType) {
            recordType = recordType.charAt(0).toUpperCase() + recordType.slice(1);
        }
        template.url = fluid.stringTemplate(template.url, {
            recordType: recordType,
            template: templateName
        });
        fluid.fetchResources(that.options.resources, function () {
            that.events.afterFetch.fire(that.options.resources.template.resourceText);
        });
    };

    fluid.demands("cspace.recordEditor.recordRenderer", "cspace.recordEditor", {
        options: fluid.COMPONENT_OPTIONS
    });

    fluid.demands("cspace.recordEditor.recordRenderer", ["cspace.recordEditor", "media.read"], {
        options: {
            selectors: {
                uploader: ".csc-media-upload",
                mediaImage: ".csc-media-image"
            },
            selectorsToIgnore: "uploader",
            styles: {
                mediaImage: "cs-media-image"
            },
            components: {
                uploader: {
                    type: "cspace.mediaUploader",
                    container: "{recordRenderer}.dom.uploader",
                    options: {
                        model: "{recordEditor}.model",
                        applier: "{recordEditor}.applier",
                        listeners: {
                            onLink: "{recordEditor}.events.onSave.fire",
                            onRemove: "{recordRenderer}.refreshView"
                        },
                        urls: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.util.urlBuilder",
                                args: {
                                    upload: "%tenant/%tname/uploads/"
                                }
                            }
                        }
                    },
                    createOnEvent: "afterRender"
                }
            }
        }
    });

    fluid.demands("cspace.recordEditor.recordRenderer", ["cspace.recordEditor", "cataloging.read"], {
        options: {
            selectors: {
                hierarchy: ".csc-record-hierarchy"
            },
            selectorsToIgnore: "hierarchy",
            components: {
                hierarchy: {
                    type: "cspace.hierarchy",
                    container: "{recordRenderer}.dom.hierarchy",
                    options: {
                        produceTree: "cspace.hierarchy.produceTreeCataloging",
                        components: {
                            templateFetcher: {
                                options: {
                                    resources: {
                                        template: cspace.resourceSpecExpander({
                                            url: "%webapp/html/components/HierarchyObjectTemplate.html",
                                            options: {
                                                dataType: "html"
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    },
                    createOnEvent: "afterRender"
                }
            }
        }
    });

    fluid.demands("cspace.recordEditor.recordRenderer", ["cspace.recordEditor", "cspace.authority"], {
        options: {
            selectors: {
                hierarchy: ".csc-record-hierarchy"
            },
            selectorsToIgnore: "hierarchy",
            components: {
                hierarchy: {
                    type: "cspace.hierarchy",
                    container: "{recordRenderer}.dom.hierarchy",
                    createOnEvent: "afterRender"
                }
            }
        }
    });

    fluid.demands("cspace.recordEditor.recordRenderer", ["cspace.recordEditor", "cspace.role"], {
        options: {
            selectors: {
                noneLabel: ".csc-role-none",
                readLabel: ".csc-role-read",
                writeLabel: ".csc-role-write",
                deleteLabel: ".csc-role-delete"
            },
            produceTree: "cspace.recordEditor.recordRenderer.produceTreeRoleAdmin"
        }
    });

    fluid.demands("cspace.recordEditor.recordRenderer", ["cspace.recordEditor", "cspace.users"], {
        options: {
            selectors: {
                passwordConfirmLabel: ".csc-users-passwordConfirm-label",
                passwordInstructionsLabel: ".csc-users-passwordInstructions-label"
            },
            produceTree: "cspace.recordEditor.recordRenderer.produceTreeUsersAdmin"
        }
    });

    // Component that does the rendering and data binding for the record.
    fluid.defaults("cspace.recordEditor.recordRenderer", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        mergePolicy: {
            fieldsToIgnore: "replace",
            "rendererOptions.applier": "applier",
            "rendererOptions.instantiator": "nomerge",
            "rendererOptions.parentComponent": "nomerge",
            "rendererFnOptions.uispec": "uispec",
            "uispec": "nomerge"
        },
        produceTree: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.recordEditor.recordRenderer.provideProduceTree",
                args: "{recordEditor}.options.recordType"
            }
        },
        rendererFnOptions: {
            cutpointGenerator: "cspace.recordEditor.recordRenderer.cutpointGenerator"
        },
        rendererOptions: {
            autoBind: true,
            instantiator: "{instantiator}",
            parentComponent: "{recordRenderer}"
        },
        deferRendering: "{recordEditor}.options.deferRendering",
        invokers: {
            navigateToFullImage: "cspace.recordEditor.recordRenderer.navigateToFullImage"
        },
        events: {
            afterSave: {
                event: "{cspace.recordEditor}.events.afterSave"
            },
            afterCancel: {
                event: "{cspace.recordEditor}.events.afterCancel"
            },
            onRenderTreePublic: {
                event: "onRenderTree"
            }
        },
        listeners: {
            afterSave: {
                listener: "{recordRenderer}.refreshViewHandler",
                namespace: "afterSaveRecordRenderer"
            },
            afterCancel: {
                listener: "{recordRenderer}.refreshViewHandler",
                namespace: "afterCancelRecordRenderer"
            },
            onRenderTreePublic: "{recordRenderer}.onRenderTreeHandler"
        },
        preInitFunction: "cspace.recordEditor.recordRenderer.preInit",
        finalInitFunction: "cspace.recordEditor.recordRenderer.finalInit",
        parentBundle: "{globalBundle}",
        strings: {},
        selectors: {}
    });

    fluid.demands("onRenderTreePublic", "cspace.recordEditor.recordRenderer", [
        "{recordEditor}.options",
        "{recordEditor}.model",
        "{pageBuilderIO}.options.readOnly"
    ]);

    cspace.recordEditor.recordRenderer.preInit = function (that) {
        that.refreshViewHandler = function () {
            that.refreshView();
        };
        that.onRenderTreeHandler = function (options, model, readOnly) {
            options.readOnly = cspace.util.isReadOnly(readOnly, model);
        };
    };

    cspace.recordEditor.recordRenderer.finalInit = function (that) {
        if (that.options.deferRendering) {
            return;
        }
        that.refreshView();
    };

    cspace.recordEditor.recordRenderer.provideProduceTree = function (recordType) {
        return recordType === "media" ? "cspace.recordEditor.recordRenderer.produceTreeMedia" : "cspace.recordEditor.recordRenderer.produceTree";
    };

    cspace.recordEditor.recordRenderer.produceTreeMedia = function (that) {
        var tree = cspace.recordEditor.recordRenderer.produceTree(that);
        fluid.merge(null, tree.expander.trueTree, {
            mediaImage: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        src: "${fields.blobs.0.imgThumb}"
                    }
                }, {
                    addClass: "{styles}.mediaImage"
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.navigateToFullImage
                }]
            }
        });
        return tree;
    };

    fluid.demands("cspace.recordEditor.recordRenderer.navigateToFullImage", "cspace.recordEditor.recordRenderer", {
        funcName: "cspace.recordEditor.recordRenderer.navigateToFullImage",
        args: ["{recordEditor}.model", "{recordEditor}.options.originalMediaDimensions", "{globalBundle}"]
    });

    cspace.recordEditor.recordRenderer.navigateToFullImage = function (model, originalMediaDimensions, parentBundle) {
        window.open(model.fields.blobs[0].imgOrig, "_blank", parentBundle.resolve("media-originalMediaOptions", [
            originalMediaDimensions.height,
            originalMediaDimensions.width,
            "yes"
        ]));
    };

    // Default produce tree.
    cspace.recordEditor.recordRenderer.produceTree = function (that) {
        return fluid.copy(that.options.uispec);
    };

    // Produce tree for non-default template.
    cspace.recordEditor.recordRenderer.produceTreeTemplate = function (that) {
        var tree = cspace.recordEditor.recordRenderer.produceTree(that);
        tree.templateEditor = {
            decorators: {
                type: "fluid",
                func: "cspace.templateEditor"
            }
        };
        return tree;
    };

    // Produce tree for user admin record.
    cspace.recordEditor.recordRenderer.produceTreeUsersAdmin = function (that) {
        var tree = cspace.recordEditor.recordRenderer.produceTree(that);
        tree.passwordConfirmLabel = {
            messagekey: "users-confirmPasswordLabel"
        };
        tree.passwordInstructionsLabel = {
            messagekey: "users-passwordInstructionsLabel"
        };

        // Do not render userId unless the user was already created.
        if (!fluid.get(that.model, "fields.userId")) {
            fluid.remove_if(tree, function (val, key) {
                if (key.toLowerCase().indexOf("userid") > -1) {return true;}
            });
        }

        function disable (tree, selector) {
            var valuebinding = tree[selector],
                value = {
                    decorators: {
                        type: "jQuery",
                        func: "prop",
                        args: ["disabled", "disabled"]
                    }
                };
            if (typeof valuebinding === "string") {
                value.value = valuebinding;
            } else {
                fluid.merge(null, value, valuebinding);
            }
            tree[selector] = value;
        }

        // CSPACE-5632: Adding extra protection for admin users.
        if (fluid.get(that.model, "fields.metadataProtection") === "immutable") {
            fluid.each(["email", "userName", "status"], function (field) {
                disable(tree, ".csc-user-" + field);
            });
            disable(tree.expander.tree, ".csc-users-roleSelected");
        } else if (fluid.get(that.model, "fields.rolesProtection") === "immutable") {
            disable(tree.expander.tree, ".csc-users-roleSelected");
        }

        return tree;
    };

    // Produce tree for role admin record.
    cspace.recordEditor.recordRenderer.produceTreeRoleAdmin = function (that) {
        var tree = cspace.recordEditor.recordRenderer.produceTree(that);
        tree.noneLabel = {
            messagekey: "role-none"
        };
        tree.readLabel = {
            messagekey: "role-read"
        };
        tree.writeLabel = {
            messagekey: "role-write"
        };
        tree.deleteLabel = {
            messagekey: "role-delete"
        };
        return tree;
    };

    cspace.recordEditor.recordRenderer.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };

    // Component that does all the IO related to saving, craeting,
    // updating and deleting the record.
    fluid.defaults("cspace.recordEditor.dataSource", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        mergePolicy: {
            schema: "nomerge"
        },
        components: {
            vocab: "{vocab}",
            source: {
                type: "cspace.recordEditor.dataSource.source"
            }
        },
        urls: cspace.componentUrlBuilder({
            recordURL: "%tenant/%tname/basic/%recordType/%csid"
        }),
        csid: "",
        schema: "{pageBuilder}.schema",
        finalInitFunction: "cspace.recordEditor.dataSource.finalInit"
    });

    fluid.demands("cspace.recordEditor.dataSource", "cspace.recordEditor", {
        options: {
            csid: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.recordEditor.dataSource.resolveCsid",
                    args: ["{recordEditor}.model.csid", "{recordEditor}.options.csid"]
                }
            },
            // TODO: BELOW IS A HACK UNTIL WE CAN POST/PUT TO BASIC.
            urls: cspace.componentUrlBuilder({
                recordURLFull: "%tenant/%tname/%recordType/%csid"
            }),
            components: {
                sourceFull: {
                    type: "cspace.recordEditor.dataSource.sourceFull"
                }
            }
        }
    });

    fluid.demands("cspace.recordEditor.dataSource", ["cspace.recordEditor", "cspace.admin"], {
        options: {
            csid: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.recordEditor.dataSource.resolveCsidTab",
                    args: ["{recordEditor}.model.csid", "{recordEditor}.options.csid"]
                }
            },
            urls: cspace.componentUrlBuilder({
                recordURL: "%tenant/%tname/%recordType/%csid"
            })
        }
    });

    fluid.demands("cspace.recordEditor.dataSource", ["cspace.recordEditor", "cspace.admin", "cspace.users"], {
        options: {
            finalInitFunction: "cspace.recordEditor.dataSource.finalInitUserAdmin",
            preInitFunction: "cspace.recordEditor.dataSource.preInitUserAdmin",
            csid: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.recordEditor.dataSource.resolveCsidTab",
                    args: ["{recordEditor}.model.csid", "{recordEditor}.options.csid"]
                }
            },
            urls: cspace.componentUrlBuilder({
                recordURL: "%tenant/%tname/%recordType/%csid",
                roleUrl: "%tenant/%tname/role?pageSize=60"
            }),
            components: {
                sourceRole: {
                    type: "cspace.recordEditor.dataSource.sourceRole"
                }
            },
            events: {
                afterGetSource: null,
                afterGetSourceRole: null,
                afterGet: {
                    events: {
                        source: "{that}.events.afterGetSource",
                        sourceRole: "{that}.events.afterGetSourceRole"
                    },
                    args: ["{arguments}.source.0", "{arguments}.source.1", "{arguments}.sourceRole.0"]
                }
            },
            listeners: {
                afterGet: "{that}.afterGet"
            }
        }
    });

    fluid.demands("cspace.recordEditor.dataSource", ["cspace.recordEditor", "cspace.admin", "cspace.role"], {
        options: {
            finalInitFunction: "cspace.recordEditor.dataSource.finalInitRoleAdmin",
            preInitFunction: "cspace.recordEditor.dataSource.preInitRoleAdmin",
            csid: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.recordEditor.dataSource.resolveCsidTab",
                    args: ["{recordEditor}.model.csid", "{recordEditor}.options.csid"]
                }
            },
            urls: cspace.componentUrlBuilder({
                recordURL: "%tenant/%tname/%recordType/%csid",
                permissionsUrl: "%tenant/%tname/permission/search?actGrp=CRUDL"
            }),
            components: {
                sourcePermissions: {
                    type: "cspace.recordEditor.dataSource.sourcePermissions"
                }
            },
            events: {
                afterGetSource: null,
                afterGetSourcePermissions: null,
                afterGet: {
                    events: {
                        source: "{that}.events.afterGetSource",
                        sourcePermissions: "{that}.events.afterGetSourcePermissions"
                    },
                    args: ["{arguments}.source.0", "{arguments}.source.1"]
                }
            },
            listeners: {
                afterGetSourcePermissions: {
                    listener: "{that}.afterGetSourcePermissions",
                    priority: "first"
                },
                afterGet: "{that}.afterGet"
            }
        }
    });

    fluid.demands("cspace.recordEditor.dataSource", ["cspace.recordEditor", "cspace.relatedRecordsTab"], {
        options: {
            csid: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.recordEditor.dataSource.resolveCsidTab",
                    args: ["{recordEditor}.model.csid", "{recordEditor}.options.csid"]
                }
            },
            // TODO: BELOW IS A HACK UNTIL WE CAN POST/PUT TO BASIC.
            urls: cspace.componentUrlBuilder({
                recordURLFull: "%tenant/%tname/%recordType/%csid"
            }),
            components: {
                sourceFull: {
                    type: "cspace.recordEditor.dataSource.sourceFull"
                }
            }
        }
    });

    fluid.demands("cspace.recordEditor.dataSource", ["cspace.recordEditor", "cspace.authority"], {
        options: {
            csid: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.recordEditor.dataSource.resolveCsid",
                    args: ["{recordEditor}.model.csid", "{recordEditor}.options.csid"]
                }
            },
            // TODO: BELOW IS A HACK UNTIL WE CAN POST/PUT TO BASIC.
            components: {
                sourceFull: {
                    type: "cspace.recordEditor.dataSource.sourceFull"
                }
            },
            urls: cspace.componentUrlBuilder({
                recordURL: "%tenant/%tname/vocabularies/basic/%vocab/%csid",
                recordURLFull: "%tenant/%tname/vocabularies/%vocab/%csid"
            })
        }
    });

    fluid.demands("cspace.recordEditor.dataSource", ["cspace.recordEditor", "cspace.relatedRecordsTab", "cspace.authority"], {
        options: {
            csid: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.recordEditor.dataSource.resolveCsidTab",
                    args: ["{recordEditor}.model.csid", "{recordEditor}.options.csid"]
                }
            },
            // TODO: BELOW IS A HACK UNTIL WE CAN POST/PUT TO BASIC.
            components: {
                sourceFull: {
                    type: "cspace.recordEditor.dataSource.sourceFull"
                }
            },
            urls: cspace.componentUrlBuilder({
                recordURL: "%tenant/%tname/vocabularies/basic/%vocab/%csid",
                recordURLFull: "%tenant/%tname/vocabularies/%vocab/%csid"
            })
        }
    });

    cspace.recordEditor.dataSource.resolveCsidTab = function (modelCsid, optionsCsid) {
        return modelCsid || optionsCsid;
    };

    cspace.recordEditor.dataSource.resolveCsid = function (modelCsid, optionsCsid) {
        return modelCsid || optionsCsid || cspace.util.getUrlParameter("csid");
    };

    // Merge role admin record from role and permissions payloads.
    cspace.recordEditor.dataSource.preInitRoleAdmin = function (that) {
        that.afterGetSourcePermissions = function (data) {
            that.permissions = data;
        };
        that.responseParser = function (role) {
            var permissions = fluid.transform(fluid.copy(that.permissions), function (permission) {
                return {
                    resourceName: permission.summary,
                    display: permission.display,
                    permission: fluid.find(fluid.get(role, "fields.permissions"), function (rolePermission) {
                        if (permission.summary === rolePermission.resourceName) {
                            return rolePermission.permission;
                        }
                    }) || "delete"
                };
            });
            fluid.set(role, "fields.permissions", permissions);
        };
        that.afterGet = function (callback, role) {
            that.responseParser(role);
            callback(role);
        };
    };

    cspace.recordEditor.dataSource.finalInitRoleAdmin = function (that) {
        that.get = function (callback) {
            if (!that.permissions) {
                that.sourcePermissions.get({}, function (data) {
                    that.events.afterGetSourcePermissions.fire(data);
                });
            }
            if (!that.options.csid) {
                that.events.afterGetSource.fire(callback, cspace.util.getBeanValue({}, that.options.recordType, that.options.schema));
                return;
            }
            that.source.get({
                csid: that.options.csid
            }, function (data) {
                that.events.afterGetSource.fire(callback, data);
            });
        };

        that.set = function (model, callback) {
            // Wrap callback with response parser.
            var wrappedCallback = function (role) {
                that.responseParser(role);
                callback(role);
            };

            that.options.csid = model.csid = model.csid || that.options.csid || "";
            var source = that.sourceFull || that.source,
                save = that.options.csid ? "put" : "set";
            source[save](model, {
                csid: that.options.csid,
                vocab: cspace.vocab.resolve({
                    model: null,
                    recordType: that.options.recordType,
                    vocab: that.vocab
                })
            }, function (data) {
                if (data.csid) {
                    that.options.csid = that.options.csid || data.csid;
                }
                wrappedCallback(data);
            });
        };
    };

    // Merge user admin record by merging user and roles payloads.
    cspace.recordEditor.dataSource.preInitUserAdmin = function (that) {
        that.afterGet = function (callback, user, roles) {
            roles = fluid.transform(roles, function (role) {
                return {
                    roleId: role.csid,
                    roleName: role.number,
                    roleSelected: fluid.find(fluid.get(user, "fields.role"), function (roleSelected) {
                        if (role.csid === roleSelected.roleId) {return true;}
                    }) || false
                };
            });
            fluid.set(user, "fields.role", roles);
            callback(user);
        };
    };

    cspace.recordEditor.dataSource.finalInitUserAdmin = function (that) {
        that.get = function (callback) {
            that.sourceRole.get({}, function (data) {
                that.events.afterGetSourceRole.fire(data);
            });
            if (!that.options.csid) {
                that.events.afterGetSource.fire(callback, cspace.util.getBeanValue({}, that.options.recordType, that.options.schema));
                return;
            }
            that.source.get({
                csid: that.options.csid
            }, function (data) {
                that.events.afterGetSource.fire(callback, data);
            });
        };
    };

    cspace.recordEditor.dataSource.finalInit = function (that) {
        //TODO: Think about error callbacks.
        that.get = function (callback) {
            // If it is a new empty record, recreate the
            // skeleton from the schema.
            if (!that.options.csid) {
                callback(cspace.util.getBeanValue({}, that.options.recordType, that.options.schema));
                return;
            }
            that.source.get({
                csid: that.options.csid,
                vocab: cspace.vocab.resolve({
                    model: that.model,
                    recordType: that.options.recordType,
                    vocab: that.vocab
                })
            }, callback);
        };
        that.set = function (model, callback) {
            that.options.csid = model.csid = model.csid || that.options.csid || "";
            var source = that.sourceFull || that.source,
                save = that.options.csid ? "put" : "set";
            source[save](model, {
                csid: that.options.csid,
                vocab: cspace.vocab.resolve({
                    model: null,
                    recordType: that.options.recordType,
                    vocab: that.vocab
                })
            }, function (data) {
                if (data.csid) {
                    that.options.csid = that.options.csid || data.csid;
                }
                callback(data);
            });
        };
        that.remove = function (callback) {
            if (!that.options.csid) {
                return callback();
            }
            var source = that.sourceFull || that.source;
            source.remove(null, {
                csid: that.options.csid,
                vocab: cspace.vocab.resolve({
                    model: null,
                    recordType: that.options.recordType,
                    vocab: that.vocab
                })
            }, callback);
        };
    };

    fluid.demands("cspace.recordEditor.dataSource.source",  ["cspace.localData", "cspace.recordEditor.dataSource"], {
        funcName: "cspace.recordEditor.dataSource.testDataSource",
        args: {
            writeable: true,
            removable: true,
            targetTypeName: "cspace.recordEditor.dataSource.testDataSource",
            termMap: {
                recordType: "{cspace.recordEditor.dataSource}.options.recordType",
                csid: "%csid",
                vocab: "%vocab"
            }
        }
    });
    fluid.demands("cspace.recordEditor.dataSource.source", ["cspace.recordEditor.dataSource"], {
        funcName: "cspace.URLDataSource",
        args: {
            writeable: true,
            removable: true,
            url: "{cspace.recordEditor.dataSource}.options.urls.recordURL",
            termMap: {
                recordType: "{cspace.recordEditor.dataSource}.options.recordType",
                csid: "%csid",
                vocab: "%vocab"
            },
            targetTypeName: "cspace.recordEditor.dataSource.source"
        }
    });

    fluid.defaults("cspace.recordEditor.dataSource.testDataSource", {
        url: "%test/data/basic/%recordType/%csid.json"
    });
    cspace.recordEditor.dataSource.testDataSource = cspace.URLDataSource;

    fluid.demands("cspace.recordEditor.dataSource.sourceFull",  ["cspace.localData", "cspace.recordEditor.dataSource"], {
        funcName: "cspace.recordEditor.dataSource.testDataSourceFull",
        args: {
            writeable: true,
            removable: true,
            targetTypeName: "cspace.recordEditor.dataSource.testDataSourceFull",
            termMap: {
                recordType: "{cspace.recordEditor.dataSource}.options.recordType",
                csid: "%csid",
                vocab: "%vocab"
            }
        }
    });
    fluid.demands("cspace.recordEditor.dataSource.sourceFull", ["cspace.recordEditor.dataSource"], {
        funcName: "cspace.URLDataSource",
        args: {
            writeable: true,
            removable: true,
            url: "{cspace.recordEditor.dataSource}.options.urls.recordURLFull",
            termMap: {
                recordType: "{cspace.recordEditor.dataSource}.options.recordType",
                csid: "%csid",
                vocab: "%vocab"
            },
            responseParser: "cspace.recordEditor.dataSource.responseParser",
            targetTypeName: "cspace.recordEditor.dataSource.sourceFull"
        }
    });

    cspace.recordEditor.dataSource.responseParser = function (data) {
        if (!data) {
            return data;
        }
        delete data.relations;
        delete data.refobjs;
        delete data.termsUsed;
        return data;
    };

    fluid.defaults("cspace.recordEditor.dataSource.testDataSourceFull", {
        url: "%test/data/basic/%recordType/%csid.json"
    });
    cspace.recordEditor.dataSource.testDataSourceFull = cspace.URLDataSource;

    fluid.demands("cspace.recordEditor.dataSource.sourceRole",  ["cspace.localData", "cspace.recordEditor.dataSource"], {
        funcName: "cspace.recordEditor.dataSource.testDataSourceRole",
        args: {
            targetTypeName: "cspace.recordEditor.dataSource.testDataSourceRole",
            termMap: {},
            responseParser: "cspace.recordEditor.dataSource.responseParserRole"
        }
    });
    fluid.demands("cspace.recordEditor.dataSource.sourceRole", ["cspace.recordEditor.dataSource"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordEditor.dataSource}.options.urls.roleUrl",
            termMap: {},
            responseParser: "cspace.recordEditor.dataSource.responseParserRole",
            targetTypeName: "cspace.recordEditor.dataSource.sourceRole"
        }
    });

    cspace.recordEditor.dataSource.responseParserRole = function (data) {
        return data.items;
    };

    fluid.defaults("cspace.recordEditor.dataSource.testDataSourceRole", {
        url: "%test/data/role/records.json"
    });
    cspace.recordEditor.dataSource.testDataSourceRole = cspace.URLDataSource;

    fluid.demands("cspace.recordEditor.dataSource.sourcePermissions",  ["cspace.localData", "cspace.recordEditor.dataSource"], {
        funcName: "cspace.recordEditor.dataSource.testDataSourcePermissions",
        args: {
            targetTypeName: "cspace.recordEditor.dataSource.testDataSourcePermissions",
            termMap: {},
            responseParser: "cspace.recordEditor.dataSource.responseParserPermissions"
        }
    });
    fluid.demands("cspace.recordEditor.dataSource.sourcePermissions", ["cspace.recordEditor.dataSource"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordEditor.dataSource}.options.urls.permissionsUrl",
            termMap: {},
            responseParser: "cspace.recordEditor.dataSource.responseParserPermissions",
            targetTypeName: "cspace.recordEditor.dataSource.sourcePermissions"
        }
    });

    cspace.recordEditor.dataSource.responseParserPermissions = function (data) {
        return data.items;
    };

    fluid.defaults("cspace.recordEditor.dataSource.testDataSourcePermissions", {
        url: "%test/data/permission/list.json"
    });
    cspace.recordEditor.dataSource.testDataSourcePermissions = cspace.URLDataSource;
    
})(jQuery, fluid);
