/*
Copyright 2012 University of California at Berkeley

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.batchRunner", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        mergePolicy: {
            recordModel: "preserve",
            recordApplier: "nomerge"
        },
        produceTree: "cspace.batchRunner.produceTree",
        invokers: {
            runBatch: "cspace.batchRunner.runBatch",
            requestBatch: {
                funcName: "cspace.batchRunner.requestBatch",
                args: ["{batchRunner}.model", "{batchRunner}.options", "{batchRunner}.events", "{arguments}.0", "{arguments}.1"]
            },
            checkBatchButtonDisabling: {
                funcName: "cspace.batchRunner.checkBatchButtonDisabling",
                args: ["{batchRunner}.model", "{batchRunner}.options.recordModel"]
            },
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        },
        parentBundle: "{globalBundle}",
        components: {
            confirmation: {
                type: "cspace.confirmation"
            },
            batchStatus: {
                type: "cspace.batchRunner.batchStatus",
                createOnEvent: "ready",
                container: "{batchRunner}.batchLoadingIndicatorContainer",
                options: {
                    events: {
                        onStop: "{batchRunner}.events.onStop"
                    }
                }
            },
            messageBar: "{messageBar}",
            globalNavigator: "{globalNavigator}",
            batchTypesSource: {
                type: "cspace.batchRunner.batchTypesSource"
            }
        },
        events: {
            onError: null,
            onStop: null,
            onSynchronousFetch: null,
            batchStarted: null,
            batchFinished: null,
            ready: null
        },
        selectors: {
            batchHeader: ".csc-batchRunner-header",
            batchButton: ".csc-batchRunner-button",
            batchType: ".csc-batchRunner-type",
            batch: ".csc-batchRunner",
            batchLoadingIndicatorContainer: ".csc-batchRunner-loadingIndicatorContainer"
        },
        selectorsToIgnore: ["batchLoadingIndicatorContainer"],
        strings: {},
        styles: {
            batchHeader: "cs-batchRunner-header",
            batchButton: "cs-batchRunner-button",
            batch: "cs-batchRunner",
            batchType: "cs-batchRunner-batchType",
            batchLoadingIndicatorContainer: "cs-batchRunner-loadingIndicator"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/BatchRunnerTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        model: {
            batchnames: ["Please select a value"],
            batchlist: [""],
            batchTypeSelection: "",
            batchInProgress: false,
            enableBatch: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.permissions.resolve",
                    args: {
                        resolver: "{permissionsResolver}",
                        permission: "read",
                        target: "batch"
                    }
                }
            }
        },
        urls: cspace.componentUrlBuilder({
            batchTypesUrl: "%tenant/%tname/batch/search/%recordType",
            batchUrl: "%tenant/%tname/invokebatch/%batchcsid/%recordType/%csid"
        }),
        finalInitFunction: "cspace.batchRunner.finalInit",
        postInitFunction: "cspace.batchRunner.postInit",
        preInitFunction: "cspace.batchRunner.preInit"
    });
    
    fluid.defaults("cspace.batchRunner.testBatchTypesSource", {
        url: "%test/data/%recordType/batch.json"
    });
    cspace.batchRunner.testBatchTypesSource = cspace.URLDataSource;
    
    fluid.fetchResources.primeCacheFromResources("cspace.batchRunner");
    
    cspace.batchRunner.checkBatchButtonDisabling = function (model, recordModel) {
        if (!recordModel.csid) {
            return true;
        }
        return model.batchlist.length < 2 && !model.batchlist[0];
    };
    
    cspace.batchRunner.preInit = function (that) {
        that.options.recordApplier.modelChanged.addListener("csid", function () {
            that.refreshView();
        });
    };
    
    cspace.batchRunner.postInit = function (that) {
        that.batchLoadingIndicatorContainer = $("<div/>")
            .addClass(that.options.selectors.batchLoadingIndicatorContainer.substr(1))
            .addClass(that.options.styles.batchLoadingIndicatorContainer)
            .hide();
        $("body").append(that.batchLoadingIndicatorContainer);


        that.events.batchStarted.addListener(function () {
            that.applier.requestChange("batchInProgress", true);
            that.applier.requestChange("batchTypeSelection", that.model.batchTypeSelection || that.model.batchlist[0]);

            var selectionIndex = $.inArray(that.model.batchTypeSelection, that.model.batchlist);
            var batchNewFocus = that.model.batchnewfocuses[selectionIndex];

            if (!batchNewFocus) {
               that.batchStatus.show({
                    batchType: that.model.batchTypeSelection,
                    batchName: that.model.batchnames[selectionIndex]
                })
            };
        });

        that.events.batchFinished.addListener(function (data) {
            that.applier.requestChange("batchInProgress", false);
            that.batchStatus.hide();

            if (data.batchNewFocus) {
                if (data.response.primaryURICreated) {
                    window.location = data.response.primaryURICreated;
                }
            }
            else {
                that.messageBar.show(fluid.stringTemplate(that.lookupMessage("batch-batchComplete"), {
                    batchName: data.batchName,
                    userNote: data.response.userNote
                }), null, false);
            }
        });

        that.events.onError.addListener(function (message) {
            that.applier.requestChange("batchInProgress", false);
            that.batchStatus.hide();
            that.messageBar.show(that.lookupMessage("batch-batchError") + message, null, true)
        });

        that.events.onStop.addListener(function (batchType) {
            that.applier.requestChange("batchInProgress", false);
            that.applier.requestChange("batchTypeSelection", batchType);
            that.requestBatch(true);
        });
    };
    
    cspace.batchRunner.finalInit = function (that) {
        that.batchTypesSource.get({
            recordType: that.options.recordType
        }, function (data) {
            if (!data) {
                    that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                        url: that.batchTypesSource.options.url
                    }));
                    return;
                }
                if (data.isError === true) {
                    fluid.each(data.messages, function (message) {
                        that.displayErrorMessage(message);
                    });
                    return;
                }
            if (data.batchlist.length > 0) {
                that.applier.requestChange("batchnames", data.batchnames);
                that.applier.requestChange("batchlist", data.batchlist);
                that.applier.requestChange("batchnewfocuses", data.batchnewfocuses);
            }
            that.refreshView();
            that.globalNavigator.events.onPerformNavigation.addListener(function (callback) {
                if (that.model.batchInProgress) {
                    that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
                        model: {
                            messages: ["batch-dialog-primaryMessage", "batch-dialog-secondaryMessage"],
                            messagekeys: {
                                primaryMessage: "batch-dialog-stopPrimaryMessage",
                                secondaryMessage: "batch-dialog-stopSecondaryMessage",
                                actText: "batch-dialog-stopActText",
                                actAlt: "batch-dialog-stopActAlt"
                            }
                        },
                        listeners: {
                            onClose: function (userAction) {
                                if (userAction === "act") {
                                    that.requestBatch(true, callback);
                                }
                            }
                        },
                        parentBundle: that.options.parentBundle
                    });
                    return false;
                }
            });
            that.events.ready.fire();
        }, cspace.util.provideErrorCallback(that, that.batchTypesSource.options.url, "errorFetching"));
    };
    
    cspace.batchRunner.requestBatch = function (model, options, events, stop, callback) {
        if (!stop) {
            events.batchStarted.fire();
        }

        var href = fluid.stringTemplate(options.urls.batchUrl, {
            batchcsid: model.batchTypeSelection,
            recordType: options.recordType,
            csid: options.recordModel.csid
        });

        var batchType = model.batchTypeSelection;
        var selectionIndex = $.inArray(batchType, model.batchlist);
        var batchName = model.batchnames[selectionIndex];
        var batchNewFocus = model.batchnewfocuses[selectionIndex];
        
        if (batchNewFocus) {
            events.onSynchronousFetch.fire();
        }
        
        var invocationSource = cspace.URLDataSource({
            value: {
                targetTypeName: "cspace.batchRunner.invocationSource"
            },
            //writeable: true,
            url: href
        });
        
        invocationSource.get(
            {},
            function (data) {
                if (!data) {
                    events.onError.fire(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                        url: that.batchTypesSource.options.url
                    }));
                    return;
                }
                if (data.isError === true) {
                    events.onError.fire(data.messages.join(". "));
                    return;
                }
                
                events.batchFinished.fire({
                    batchName: batchName,
                    batchNewFocus: batchNewFocus,
                    response: data
                });
                
                if (callback) {
                    callback();
                }
            },
            function (xhr, textStatus, errorThrown) {
                events.onError.fire(textStatus);
            }
        );
    };
    
    var openConfirmation = function (confirmation, name, model, parentBundle, onClose) {
        confirmation.open("cspace.confirmation." + name, undefined, {
            model: model,
            listeners: {
                onClose: onClose
            },
            parentBundle: parentBundle
        });
    };
    
    cspace.batchRunner.runBatch = function (confirmation, parentBundle, requestBatch, recordEditor) {
        if (recordEditor && recordEditor.unsavedChanges) {
            openConfirmation(confirmation, "saveDialog", {
                messages: [ "batch-dialog-primaryMessageSave" ],
                messagekeys: {
                    actText: "batch-dialog-actTextSave",
                    actAlt: "batch-dialog-actAltSave",
                    proceedText: "batch-dialog-proceedTextSave",
                    proceedAlt: "batch-dialog-proceedAltSave"
                }
            }, 
            parentBundle,
            function (userAction) {
                if (userAction === "act") {
                    recordEditor.options.dataContext.events.afterSave.addListener(function () {
                        requestBatch(false);
                    }, undefined, undefined, "last");
                    recordEditor.requestSave();
                } else if (userAction === "proceed") {
                    requestBatch(false);
                }
            });
        }
        else {
            openConfirmation(confirmation, "deleteDialog", {
                messages: [ "batch-dialog-primaryMessage" ],
                messagekeys: {
                    actText: "batch-dialog-actText",
                    actAlt: "batch-dialog-actAlt"
                }
            }, 
            parentBundle,
            function (userAction) {
                if (userAction === "act") {
                    requestBatch(false);
                }
            });
        }
    };
    
    cspace.batchRunner.produceTree = function (that) {
        return {
            expander: {
                type: "fluid.renderer.condition",
                condition: "${enableBatch}",
                trueTree: {
                    batch: {
                        decorators: {"addClass": "{styles}.batch"}
                    }
                }
            },
            batchHeader: {
                messagekey: "batch-batchHeader",
                decorators: {"addClass": "{styles}.batchHeader"}
            },
            batchType: {
                optionnames: "${batchnames}",
                optionlist: "${batchlist}",
                selection: "${batchTypeSelection}",
                decorators: {"addClass": "{styles}.batchType"}
            },
            batchButton: {
                messagekey: "batch-batchButton",
                decorators: [{
                    addClass: "{styles}.batchButton"
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.runBatch
                }, {
                    type: "jQuery",
                    func: "prop",
                    args: {
                        disabled: that.checkBatchButtonDisabling
                    }
                }]
            }
        };
    };
    
    fluid.defaults("cspace.batchRunner.batchStatus", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "slowTemplate",
                url: "%webapp/html/components/BatchStatusTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        events: {
            onStop: null
        },
        produceTree: "cspace.batchRunner.batchStatus.produceTree",
        finalInitFunction: "cspace.batchRunner.batchStatus.finalInit",
        selectors: {
            message: ".csc-batchStatus-message", 
            stop: ".csc-batchStatus-stop"
        },
        styles: {
            message: "cs-batchStatus-message", 
            stop: "cs-batchStatus-stop"
        },
        parentBundle: "{globalBundle}",
        strings: { }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.batchRunner.batchStatus");
    
    cspace.batchRunner.batchStatus.produceTree = function (that) {
        return {
            message: {
                messagekey: "batch-message",
                args: ["${batchName}"],
                decorators: {"addClass": "{styles}.message"}
            },
            stop: {
                messagekey: "batch-stop",
                decorators: [{
                    "addClass": "{styles}.stop"
                }, {
                    type: "jQuery",
                    func: "click",
                    args: function () {
                        that.events.onStop.fire(that.model.batchType);
                    }
                }]
            }
        };
    };
    cspace.batchRunner.batchStatus.finalInit = function (that) {
        that.show = function (model) {
            that.applier.requestChange("", model);
            that.refreshView();
            that.container.show();
        };
        that.hide = function () {
            that.container.hide();
        }
    };
    
})(jQuery, fluid);