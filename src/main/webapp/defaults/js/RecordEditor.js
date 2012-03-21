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
//
//    // operation = one of "create", "delete", "fetch", "update"
//    var makeDCErrorHandler = function (that) {
//        return function (operation, message, data) {
//            if (data && data.messages) {
//                // TODO: expand this branch as sophistication increases for CSPACE-3142
//                fluid.each(data.messages, function (message) {
//                    that.messageBar.show(message.message, null, data.isError);
//                });
//            } else {
//                var msgKey = operation + "FailedMessage";
//                var msg = that.options.strings[msgKey] + message;
//                that.messageBar.show(fluid.stringTemplate(msg, {
//                    record: that.lookupMessage(that.options.recordType)
//                }), null, true);
//            }
//            that.locate("save").prop("disabled", false);
//            that.events.onError.fire(operation);
//            if (operation === "create") {
//                // This is only temporary until http://issues.collectionspace.org/browse/CSPACE-263
//                // is resolved
//                that.options.applier.requestChange("csid", undefined);
//            }
//        };
//    };
//
//    var validateIdentificationNumber = function (domBinder, container, messageBar, message) {
//        return function () {
//            var required = domBinder.locate("identificationNumber");
//            if (required === container) {
//                return true;
//            }
//            if ($.trim(required.val()) === "") {
//                messageBar.show(message, null, true);
//                return false;
//            }
//            return true;
//        };
//    };
//    
//    var validateRequiredFields = function (domBinder, messageBar, message) {
//        var required = domBinder.locate("requiredFields");
//        var i;
//        for (i = 0; i < required.length; i++) {
//            if (required[i].value === "") {
//                messageBar.show(fluid.stringTemplate(message, {field: cspace.util.findLabel(required[i])}), null, true);
//                return false;
//            }
//        }
//        return true;
//    };
//    
//    var processChanges = function (that, revert) {
//        that.unsavedChanges = revert;
//        that.locate("cancel").prop("disabled", !revert);
//    };
//    
//    var recordSaveHandler = function (that, data, action) {
//        var message = action.toLowerCase() + "SuccessfulMessage";
//        that.options.applier.requestChange("", data);
//        that.refreshView();
//        that.messageBar.show(fluid.stringTemplate(that.options.strings[message], {
//            record: that.lookupMessage(that.options.recordType)
//        }), Date());
//        processChanges(that, false);
//        that.locate("save").prop("disabled", false);
//    };
//
//    var bindEventHandlers = function (that) {
//        
//        that.events.onSave.addListener(validateIdentificationNumber(that.dom, that.container, that.messageBar, that.lookupMessage(fluid.stringTemplate("%recordtype-identificationNumberRequired", { recordtype: that.options.recordType }))));
//        
//        that.events.onSave.addListener(function () {
//            return validateRequiredFields(that.dom, that.messageBar, that.options.strings.missingRequiredFields);
//        });
//        
//        that.events.afterRenderRefresh.addListener(function () {
//            clearLocalStorage(that); 
//        });
//        
//        that.applier.modelChanged.addListener("fields", function (model, oldModel, changeRequest) {
//            processChanges(that, true);
//        });
//        
//        that.globalNavigator.events.onPerformNavigation.addListener(function (callback) {
//            if (that.unsavedChanges) {
//                that.confirmation.open("cspace.confirmation.saveDialog", undefined, {
//                    listeners: {
//                        onClose: function (userAction) {
//                            if (userAction === "act") {
//                                that.options.dataContext.events.afterSave.addListener(function () {
//                                    processChanges(that, false);
//                                    callback();
//                                }, undefined, undefined, "last");
//                                that.requestSave(function () {
//                                    
//                                });
//                            } else if (userAction === "proceed") {
//                                that.rollback();
//                                callback();
//                            }
//                        }
//                    },
//                    parentBundle: that.options.parentBundle
//                });
//                return false;
//            }
//        }, that.options.navigationEventNamespace);
//    };
//    
//    var bindHandlers = function (that) {
//        that.locate("save").click(that.requestSave);
//        that.locate("deleteButton").click(that.remove);
//        that.locate("cancel").click(function () {
//            that.cancel();
//        });
//        that.locate("createFromExistingButton").click(that.createNewFromExistingRecord);
////        cspace.util.setZIndex();      
//    };
//
//    var setupRecordEditor = function (that) {
//        bindEventHandlers(that);
//        if (!that.options.deferRendering) {
//            that.refreshView();
//        }
//        that.events.afterRenderRefresh.fire(that);
//    };
//    
//    var clearLocalStorage = function (that) {
//        var modelToClone = that.localStorage.get(that.localStorage.options.elPath);
//        if (modelToClone) {
//            that.localStorage.set();
//            processChanges(that, true);
//        }
//    }; 
//    
//    fluid.defaults("cspace.recordEditor", {
//        gradeNames: ["fluid.rendererComponent", "autoInit"],
//        preInitFunction: "cspace.recordEditor.preInit",
//        finalInitFunction: "cspace.recordEditor.finalInit",
//        mergePolicy: {
//            fieldsToIgnore: "replace",
//            "rendererOptions.instantiator": "nomerge",
//            "rendererOptions.parentComponent": "nomerge",
//            "rendererFnOptions.uispec": "uispec",
//            "uispec": "nomerge",
//            "resolver": "nomerge"
//        },
//        components: {
//            messageBar: "{messageBar}",
//            globalNavigator: "{globalNavigator}",
//            namespaces: "{namespaces}",
//            recordDataSource: {
//                type: "cspace.recordEditor.dataSource",
//                options: {
//                    recordType: "{cspace.recordEditor}.options.recordType"
//                }
//            },
//            confirmation: {
//                type: "cspace.confirmation"
//            },
//            recordEditorTogglable: {
//                type: "cspace.util.togglable",
//                options: {
//                    selectors: {
//                        header: "{recordEditor}.options.selectors.header",
//                        togglable: "{recordEditor}.options.selectors.togglable"
//                    }
//                }
//            },
//            localStorage: {
//                type: "cspace.util.localStorageDataSource",
//                options: {
//                    elPath: "modelToClone"
//                }
//            },
//            validator: {
//                type: "cspace.validator"
//            }
//        },
//        invokers: {
//            lookupMessage: "cspace.util.lookupMessage",
//            rollback: {
//                funcName: "cspace.recordEditor.rollback",
//                args: "{recordEditor}"
//            },
//            remove: "remove",
//            afterDeleteAction: "afterDelete",
//            checkDeleteDisabling: "checkDeleteDisabling", //whether to disable delete button
//            checkCreateFromExistingDisabling: "checkCreateFromExistingDisabling", //whether to disable createFromExisting button
//            reloadAndCloneRecord: "reloadAndCloneRecord",
//            createNewFromExistingRecord: "createNewFromExistingRecord",
//            cancel: "cancel",
//            hasMediaAttached: "hasMediaAttached",
//            hasRelations: "hasRelations",
//            cloneAndStore: "cspace.recordEditor.cloneAndStore"
//        },
//        navigationEventNamespace: undefined,
//        produceTree: "cspace.recordEditor.produceTree",
//        events: {
//            afterFetch: null,
//            onSave: "preventable",
//            onCancel: null,
//            cancelSave: null,
//            afterRemove: null, // params: textStatus
//            onError: null, // params: operation
//            afterRenderRefresh: null,
//            onRefreshView: null
//        },
//        listeners: {
//            afterFetch: "{cspace.recordEditor}.afterFetchHandler"
//        },
//        showDeleteButton: false,
//        showCreateFromExistingButton: false,
//        saveCancelPermission: "update",
//        selectors: {
//            save: ".csc-save",
//            recordTraverser: ".csc-recordTraverser",
//            cancel: ".csc-cancel",
//            deleteButton: ".csc-delete",
//            createFromExistingButton: ".csc-createFromExisting",
//            requiredFields: ".csc-required:visible",
//            header: ".csc-recordEditor-header",
//            togglable: ".csc-recordEditor-togglable"
//        },
//        selectorsToIgnore: ["recordTraverser", "requiredFields", "identificationNumber", "header", "togglable"],
//        fieldsToIgnore: ["csid", "fields.csid"],
//        rendererFnOptions: {
//            cutpointGenerator: "cspace.recordEditor.cutpointGenerator"
//        },
//        rendererOptions: {
//            autoBind: true,
//            instantiator: "{instantiator}",
//            parentComponent: "{recordEditor}"
//        },
//        parentBundle: "{globalBundle}",
//        resolver: "{permissionsResolver}",
//        strings: {},
//        urls: cspace.componentUrlBuilder({
//            deleteURL: "%webapp/html/findedit.html",
//            cloneURL: "%webapp/html/%recordType.html"
//        })
//    });

    fluid.defaults("cspace.recordEditor", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        mergePolicy: {
            fieldsToIgnore: "replace",
            "uispec": "nomerge"
        },
        fieldsToIgnore: ["fields.csid"],
        preInitFunction: "cspace.recordEditor.preInit",
        finalInitFunction: "cspace.recordEditor.finalInit",
        selectors: {
            recordRendererContainer: ".csc-recordEditor-renderer-container",
            header: ".csc-recordEditor-header",
            togglable: ".csc-recordEditor-togglable"
        },
        components: {
            recordRenderer: {
                type: "cspace.recordEditor.recordRenderer",
                container: "{cspace.recordEditor}.dom.recordRendererContainer",
                options: {
                    //TODO: Hopefully this is here temporarily for backwork compatibility.
                    events: {
                        afterRender: "{cspace.recordEditor}.events.afterRender"
                    },
                    model: "{cspace.recordEditor}.model",
                    applier: "{cspace.recordEditor}.applier",
                    uispec: "{cspace.recordEditor}.options.uispec"
                },
                createOnEvent: "afterFetch"
            },
            recordDataSource: {
                type: "cspace.recordEditor.dataSource",
                options: {
                    recordType: "{cspace.recordEditor}.options.recordType"
                }
            },
            localStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "modelToClone"
                }
            },
            recordEditorTogglable: {
                type: "cspace.util.togglable",
                options: {
                    selectors: {
                        header: "{cspace.recordEditor}.options.selectors.header",
                        togglable: "{cspace.recordEditor}.options.selectors.togglable"
                    }
                }
            }
        },
        events: {
            afterRender: null,
            afterFetch: null,
            onSave: "preventable",
            onCancel: null,
            cancelSave: null,
            afterRemove: null, // params: textStatus
            onError: null, // params: operation
            afterRenderRefresh: null,
            onRefreshView: null
        }
    });

    cspace.recordEditor.preInit = function (that) {};

    cspace.recordEditor.finalInit = function (that) {
        var modelToClone = that.localStorage.get();
        if (modelToClone) {
            that.localStorage.set();
            that.applier.requestChange("", modelToClone);
            that.events.afterFetch.fire();
        } else {
            that.recordDataSource.get(function (data) {
                if (!data) {
                    //TODO
                    console.log("ERROR");
                }
                if (data.isError) {
                    //TODO
                    console.log("ERROR");
                }
                that.applier.requestChange("", data);
                that.events.afterFetch.fire();
            });
        }
    };

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
        renderOnInit: true,
        parentBundle: "{globalBundle}",
        strings: {},
        selectors: {}
    });

    cspace.recordEditor.recordRenderer.provideProduceTree = function (recordType) {
        return recordType === "media" ? "cspace.recordEditor.recordRenderer.produceTreeMedia" : "cspace.recordEditor.recordRenderer.produceTree";
    };

    cspace.recordEditor.recordRenderer.produceTree = function (that) {
        return fluid.copy(that.options.uispec);
    };

    cspace.recordEditor.recordRenderer.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
    };

    fluid.defaults("cspace.recordEditor.dataSource", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        mergePolicy: {
            schema: "nomerge"
        },
        components: {
            source: {
                type: "cspace.recordEditor.dataSource.source",
                options: {
                    writeable: true,
                    removable: true
                }
            }
        },
        urls: cspace.componentUrlBuilder({
            recordURL: "%tenant/%tname/basic/%recordType/%csid"
        }),
        csid: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.util.getUrlParameter",
                args: "csid"
            }
        },
        schema: "{pageBuilder}.schema",
        finalInitFunction: "cspace.recordEditor.dataSource.finalInit"
    });

    cspace.recordEditor.dataSource.finalInit = function (that) {
        //TODO: Think about error callbacks.
        that.get = function (callback) {
            if (!that.options.csid) {
                callback(cspace.util.getBeanValue({}, that.options.recordType, that.options.schema));
                return;
            }
            that.source.get({
                csid: that.options.csid,
                recordType: that.options.recordType
            }, callback);
        };
        that.set = function (model, callback) {
            that.options.csid = that.options.csid || model.csid;
            that.source.set(model, {
                csid: that.options.csid,
                recordType: that.options.recordType
            }, function (data) {
                if (data.csid) {
                    that.options.csid = that.options.csid || data.csid;
                }
                callback(data);
            })
        };
        that.remove = function (callback) {
            if (!that.options.csid) {
                return callback();
            }
            that.source.remove({
                csid: that.options.csid,
                recordType: that.options.recordType
            }, callback);
        };
    };

    fluid.demands("cspace.recordEditor.dataSource.source",  ["cspace.localData", "cspace.recordEditor.dataSource"], {
        funcName: "cspace.recordEditor.dataSource.testDataSource",
        args: {
            targetTypeName: "cspace.recordEditor.dataSource.testDataSource",
            termMap: {
                recordType: "%recordType",
                csid: "%csid"
            }
        }
    });
    fluid.demands("cspace.recordEditor.dataSource.source", ["cspace.recordEditor.dataSource"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.recordEditor.dataSource}.options.urls.recordURL",
            termMap: {
                recordType: "%recordType",
                csid: "%csid"
            },
            targetTypeName: "cspace.recordEditor.dataSource.source"
        }
    });

    fluid.defaults("cspace.recordEditor.dataSource.testDataSource", {
        url: "%test/data/basic/%recordType/%csid.json"
    });
    cspace.recordEditor.dataSource.testDataSource = cspace.URLDataSource;

//    cspace.recordEditor.removeWithCheck = function (that) {
//        // If our record is used by any other record then we do not want to allow to
//        // delete it. Just notify a user about it.
//        var removeMessage;
//        if (fluid.makeArray(that.model.refobjs.length) > 0) {
//            removeMessage = "deleteDialog-usedByMessage";
//        } else if (fluid.find(that.model.fields.narrowerContexts, function (element) {
//            return element.narrowerContext || undefined;
//        })) {
//            removeMessage = "deleteDialog-hasNarrowerContextsMessage";
//        } else if (that.model.fields.broaderContext) {
//            removeMessage = "deleteDialog-hasBroaderContextMessage";
//        }
//        
//        if (removeMessage) {
//            that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
//                enableButtons: ["act"],
//                model: {
//                    messages: [removeMessage],
//                    messagekeys: {
//                        actText: "alertDialog-actText"
//                    }
//                },
//                termMap: [
//                    that.lookupMessage(that.options.recordType)
//                ],
//                parentBundle: that.options.parentBundle
//            });
//        } else {
//            cspace.recordEditor.remove(that);
//        }
//    };
//    
//    cspace.recordEditor.remove = function (that) {
//        that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
//            listeners: {
//                onClose: function (userAction) {
//                    if (userAction === "act") {
//                        that.options.dataContext.remove(that.model.csid);
//                        processChanges(that, false);
//                    }
//                }
//            },
//            model: {
//                messages: ["recordEditor-dialog-deletePrimaryMessage"]
//            },
//            termMap: [
//                that.lookupMessage(that.options.recordType),
//                that.hasMediaAttached(that) ? that.options.strings.deleteMessageMediaAttached : "",
//                that.hasRelations(that) ? that.options.strings.deleteMessageWithRelated : ""
//            ],
//            parentBundle: that.options.parentBundle
//        });
//    };
//    
//    cspace.recordEditor.rollback = function (that) {
//        that.options.applier.requestChange("fields", that.rollbackModel);
//        that.refreshView();
//    };
//
//    /*
//     * Opens an alert box informing user printing the string defined in
//     * options.strings.removeSuccessfulMessage. After user dismisses dialog,
//     * user is redirected to the URL defined in: options.urls.deleteURL
//     * Note that deletion should already have taken place before this function is
//     * called. This function merely shows dialog to user and redirects.
//     */
//    cspace.recordEditor.redirectAfterDelete = function (that) {
//        that.confirmation.open("cspace.confirmation.alertDialog", undefined, {
//            listeners: {
//                onClose: function (userAction) {
//                    window.location = that.options.urls.deleteURL;
//                }
//            },
//            parentBundle: that.options.parentBundle,
//            model: {
//                 messages: [ "recordEditor-dialog-removeSuccessfulMessage" ]
//            },
//            termMap: [
//                that.lookupMessage(that.options.recordType)
//            ]
//        });
//    };
//
//    /*
//     * Dismisses the record that the user was in (now deleted) and displays
//     * a message in the messagebar, informing the user that the record was
//     * deleted.
//     */
//    cspace.recordEditor.statusAfterDelete = function (that) {
//        //show messagebar
//        that.messageBar.show(fluid.stringTemplate(that.options.strings.removeSuccessfulMessage, {
//            record: that.lookupMessage(that.options.recordType)
//        }), null, false);
//    };
//    
//    cspace.recordEditor.produceTree = function (that) {
//        var deleteButton = {
//            type: "fluid.renderer.condition",
//            condition: that.options.showDeleteButton,
//            trueTree: {
//                deleteButton: {
//                    decorators: [{
//                        type: "attrs",
//                        attributes: {
//                            value: that.options.strings.deleteButton
//                        }
//                    }, {
//                        type: "jQuery",
//                        func: "prop",
//                        args: {
//                            disabled: that.checkDeleteDisabling
//                        }
//                    }]
//                }
//            }
//        };
//        var createFromExistingButton = {
//            type: "fluid.renderer.condition",
//            condition: that.options.showCreateFromExistingButton,
//            trueTree: {
//                createFromExistingButton: {
//                    messagekey: "recordEditor-createFromExistingButton",
//                    decorators: {
//                        type: "jQuery",
//                        func: "prop",
//                        args: {
//                            disabled: that.checkCreateFromExistingDisabling
//                        }
//                    }
//                }
//            }
//        };
//        var saveCancel = {
//            type: "fluid.renderer.condition",
//            condition: {
//                funcName: "cspace.permissions.resolve",
//                args: {
//                    permission: that.options.saveCancelPermission,
//                    target: that.options.recordType,
//                    resolver: that.options.resolver
//                }
//            },
//            trueTree: {
//                save: {
//                    messagekey: "recordEditor-save"
//                },
//                cancel: {
//                    messagekey: "recordEditor-cancel"
//                }
//            }
//        };
//        var tree = fluid.copy(that.options.uispec);
//        tree.expander = fluid.makeArray(tree.expander); //make an expander array in case we have expanders in the uispec
//        tree.expander.push(deleteButton);
//        tree.expander.push(createFromExistingButton);
//        tree.expander.push(saveCancel);
//        return tree;
//    };
//    
//    // NOTE: THIS IS A HACK BECAUSE THE SERVER DOES NOT RETURN ANY PAYLOAD RELATED TO THE MEDIA ATTACHED (CSPACE-3757).
//    cspace.recordEditor.produceTreeMedia = function (that) {
//        var tree = cspace.recordEditor.produceTree(that);
//        fluid.merge(null, tree.expander[1].trueTree, {
//            mediaImage: {
//                decorators: [{
//                    type: "attrs",
//                    attributes: {
//                        src: "${fields.blobs.0.imgThumb}"
//                    }
//                }, {
//                    type: "addClass",
//                    classes: that.options.styles.mediaImage
//                }, {
//                    type: "jQuery",
//                    func: "click",
//                    args: that.navigateToFullImage
//                }]
//            }
//        });
//        return tree;
//    };
//    
//    cspace.recordEditor.navigateToFullImage = function (that) {
//        window.open(that.model.fields.blobs[0].imgOrig, "_blank", fluid.stringTemplate(that.lookupMessage("media-originalMediaOptions"), {
//            height: that.options.originalMediaDimensions.height,
//            width: that.options.originalMediaDimensions.width
//        }));
//    };
//    
//    cspace.recordEditor.provideProduceTree = function (recordType) {
//        return recordType === "media" ? cspace.recordEditor.produceTreeMedia : cspace.recordEditor.produceTree;
//    };
//    
//    cspace.recordEditor.produceTreeTemplate = function (that) {
//        var tree = cspace.recordEditor.produceTree(that);
//        tree.templateEditor = {
//            decorators: {
//                type: "fluid",
//                func: "cspace.templateEditor"
//            }
//        };
//        return tree;
//    };
//
//    cspace.recordEditor.cutpointGenerator = function (selectors, options) {
//        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
//        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.uispec));
//    };
//    
//    cspace.recordEditor.cancel = function (that) {
//        that.events.onCancel.fire();
//        that.rollback();
//    };
//    
//    cspace.recordEditor.cloneAndStore = function (that) {
//        var modelToClone = fluid.copy(that.model);
//        fluid.each(that.options.fieldsToIgnore, function (fieldPath) {
//            fluid.set(modelToClone, fieldPath);
//        });
//        that.localStorage.set(modelToClone);
//    };
//    
//    cspace.recordEditor.reloadAndCloneRecord = function (that) {
//        that.cloneAndStore();
//        window.location = fluid.stringTemplate(that.options.urls.cloneURL, {recordType: that.options.recordType});
//    };
//    
//    cspace.recordEditor.createNewFromExistingRecord = function (globalNavigator, callback) {
//        globalNavigator.events.onPerformNavigation.fire(callback);
//    };
//
//    //Checks whether delete button should be disabled.
//    //returns true if the delete button should be disabled,
//    //else false
//    cspace.recordEditor.checkDeleteDisabling = function (that) {
//        //disable if: model.csid is not set (new record)
//        if (that.model && !that.model.csid) {
//            return true;
//        }
//        //disable if: if we are looking at admin account
//        if (that.model.fields.email === "admin@collectionspace.org") {
//            return true;
//        }
//        //check whether we need to disable delete button due to related records
//        //that we do not have update permission to (which we need since we will
//        //be modifying their relations when deleting the record)
//        var relations = that.model.relations;
//        //if relations isn't set, no need to check any further
//        if (!relations || relations.length < 1 || $.isEmptyObject(relations)) {
//            return false;
//        }
//        var relatedTypes = [];
//        fluid.each(relations, function (val, recordType) {
//            relatedTypes.push({
//                target: recordType,
//                permission: "update"
//            });
//        });
//        //now build opts for checking permissions
//        return (!cspace.permissions.resolveMultiple({
//            recordTypeManager: that.options.recordTypeManager,
//            resolver: that.options.resolver,
//            allOf: relatedTypes
//        }));
//    };
//    
//    cspace.recordEditor.checkCreateFromExistingDisabling = function (model) {
//        //disable if: model.csid is not set (not saved)
//        if (model && !model.csid) {
//            return true;
//        }
//        return false;
//    };
//
//    cspace.recordEditor.hasMediaAttached = function (that) {
//        return (that.model.fields && that.model.fields.blobCsid);
//    };
//
//    cspace.recordEditor.hasRelations = function (that) {
//        return (that.model.csid && that.model.relations && !$.isEmptyObject(that.model.relations));
//    };
//
//    cspace.recordEditor.finalInit = function (that) {
//        that.refreshView = function () {
//            fluid.log("RecordEditor.js before render");
//            that.events.onRefreshView.fire();
//            that.renderer.refreshView();
//            cspace.util.processReadOnly(that.container, that.options.readOnly);
//            processChanges(that, false);
//            that.rollbackModel = fluid.copy(that.model.fields);
//            that.messageBar.hide();
//            bindHandlers(that);
//            fluid.log("RecordEditor.js renderPage end");
//        };
//        that.refreshNoSave = function () {
//            fluid.log("RecordEditor.js before render");
//            that.events.onRefreshView.fire();
//            that.renderer.refreshView();
//            that.messageBar.hide();
//            bindHandlers(that);
//            fluid.log("RecordEditor.js renderPage end");
//        };
//        /*
//         * return: Boolean true if the save was submitted, false if it was prevented by any event listeners.
//         * Note that a return value of true does not necessarily indicate that the save was successful, only that
//         * it was successfully submitted.
//         */
//        that.requestSave = function (callback) {
//            var ret = that.events.onSave.fire(that.model);
//            if (ret === false) {
//                that.events.cancelSave.fire();
//                return ret;
//            }
//            if (that.namespaces) {
//                var namespace = cspace.util.getDefaultConfigURL.getRecordType();
//                if (that.namespaces.isNamespace(namespace)) {
//                    that.options.applier.requestChange("namespace", namespace);
//                }
//            }
//            if (that.validator) {
//                var validatedModel = that.validator.validate(that.model);
//                if (!validatedModel) {
//                    that.events.cancelSave.fire();
//                    return false;
//                }
//                else {
//                    that.applier.requestChange("", validatedModel)
//                }
//            }
//            that.locate("save").prop("disabled", true);
//            that.recordDataSource.set(that.model, function (data) {
//                callback(data);
//            });
//           return true;
//        };
//
//        var modelToClone = that.localStorage.get();
//        if (modelToClone) {
//            that.localStorage.set();
//            that.applier.requestChange("", modelToClone);
//            that.events.afterFetch.fire();
//        } else {
//            that.recordDataSource.get(function (data) {
//                if (!data) {
//                    //TODO
//                    console.log("ERROR");
//                }
//                if (data.isError) {
//                    //TODO
//                    console.log("ERROR");
//                }
//                that.applier.requestChange("", data);
//                that.events.afterFetch.fire();
//            });
//        }
//    };
//
//    cspace.recordEditor.preInit = function (that) {
//        that.afterFetchHandler = function () {
//            that.rollbackModel = fluid.copy(that.model.fields);
//            setupRecordEditor(that);
//        };
//    };
    
})(jQuery, fluid);
