/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.reportProducer", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        produceTree: "cspace.reportProducer.produceTree",
        invokers: {
            generateReport: "cspace.reportProducer.generateReport",
            requestReport: {
                funcName: "cspace.reportProducer.requestReport",
                args: ["{reportProducer}.model", "{globalModel}", "{reportProducer}.options", "{reportProducer}.events", "{arguments}.0", "{arguments}.1"]
            },
            checkReportButtonDisabling: {
                funcName: "cspace.reportProducer.checkReportButtonDisabling",
                args: ["{reportProducer}.model", "{globalModel}"]
            },
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        },
        parentBundle: "{globalBundle}",
        components: {
            globalModel: "{globalModel}",
            confirmation: {
                type: "cspace.confirmation"
            },
            reportStatus: {
                type: "cspace.reportProducer.reportStatus",
                createOnEvent: "ready",
                container: "{reportProducer}.reportLoadingIndicatorContainer",
                options: {
                    events: {
                        onStop: "{reportProducer}.events.onStop"
                    }
                }
            },
            messageBar: "{messageBar}",
            globalNavigator: "{recordEditor}.globalNavigator",
            reportTypesSource: {
                type: "cspace.reportProducer.reportTypesSource"
            }
        },
        events: {
            onError: null,
            onStop: null,
            reportStarted: null,
            reportFinished: null,
            ready: null
        },
        selectors: {
            reportHeader: ".csc-reportProducer-header",
            reportButton: ".csc-reportProducer-button",
            reportType: ".csc-reportProducer-type",
            report: ".csc-reportProducer",
            reportLoadingIndicatorContainer: ".csc-reportProducer-loadingIndicatorContainer"
        },
        selectorsToIgnore: ["reportLoadingIndicatorContainer"],
        strings: {},
        styles: {
            reportHeader: "cs-reportProducer-header",
            reportButton: "cs-reportProducer-button",
            report: "cs-reportProducer",
            reportType: "cs-reportProducer-reportType",
            reportLoadingIndicatorContainer: "cs-reportProducer-loadingIndicator"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/ReportProducerTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        model: {
            reportnames: ["Please select a value"],
            reportlist: [""],
            reportTypeSelection: "",
            reportInProgress: false,
            enableReporting: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.permissions.resolve",
                    args: {
                        resolver: "{permissionsResolver}",
                        permission: "read",
                        target: "reporting"
                    }
                }
            }
        },
        urls: cspace.componentUrlBuilder({
            reportTypesUrl: "%tenant/%tname/reporting/search/%recordType",
            reportUrl: "%tenant/%tname/invokereport/%reportcsid/%recordType/%csid"
        }),
        finalInitFunction: "cspace.reportProducer.finalInit",
        postInitFunction: "cspace.reportProducer.postInit",
        preInitFunction: "cspace.reportProducer.preInit"
    });
    
    fluid.defaults("cspace.reportProducer.testReportTypesSource", {
        url: "%test/data/%recordType/reporting.json"
    });
    cspace.reportProducer.testReportTypesSource = cspace.URLDataSource;
    
    fluid.fetchResources.primeCacheFromResources("cspace.reportProducer");
    
    cspace.reportProducer.checkReportButtonDisabling = function (model, globalModel) {
        if (!fluid.get(globalModel.model, "primaryModel.csid")) {
            return true;
        }
        return model.reportlist.length < 2 && !model.reportlist[0];
    };
    
    cspace.reportProducer.preInit = function (that) {
        that.options.listeners = {
            reportStarted: function () {
                that.applier.requestChange("reportInProgress", true);
                that.applier.requestChange("reportTypeSelection", that.model.reportTypeSelection || that.model.reportlist[0]);
                that.reportStatus.show({
                    reportType: that.model.reportTypeSelection,
                    reportName: that.model.reportnames[$.inArray(that.model.reportTypeSelection, that.model.reportlist)]
                });
            },
            reportFinished: function () {
                that.applier.requestChange("reportInProgress", false);
                that.reportStatus.hide();
            },
            onError: function (message) {
                that.applier.requestChange("reportInProgress", false);
                that.reportStatus.hide();
                that.messageBar.show(that.lookupMessage("reporting-reportError") + message, null, true)
            },
            onStop: function (reportType) {
                that.applier.requestChange("reportInProgress", false);
                that.applier.requestChange("reportTypeSelection", reportType);
                that.requestReport(true);
            }
        };
    };
    
    cspace.reportProducer.postInit = function (that) {
        that.reportLoadingIndicatorContainer = $("<div/>")
            .addClass(that.options.selectors.reportLoadingIndicatorContainer.substr(1))
            .addClass(that.options.styles.reportLoadingIndicatorContainer)
            .hide();
        $("body").append(that.reportLoadingIndicatorContainer);
    };
    
    cspace.reportProducer.finalInit = function (that) {
        that.globalModel.applier.modelChanged.addListener("primaryModel.csid", function () {
            that.refreshView();
        });
        that.reportTypesSource.get({
            recordType: that.options.recordType
        }, function (data) {
            if (!data) {
                    that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                        url: that.reportTypesSource.options.url
                    }));
                    return;
                }
                if (data.isError === true) {
                    fluid.each(data.messages, function (message) {
                        that.displayErrorMessage(message);
                    });
                    return;
                }
            if (data.reportlist.length > 0) {
                that.applier.requestChange("reportnames", data.reportnames);
                that.applier.requestChange("reportlist", data.reportlist);
            }
            that.refreshView();
            that.globalNavigator.addListener(function (callback) {
                if (that.model.reportInProgress) {
                    that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
                        model: {
                            messages: ["reporting-dialog-primaryMessage", "reporting-dialog-secondaryMessage"],
                            messagekeys: {
                                primaryMessage: "reporting-dialog-stopPrimaryMessage",
                                secondaryMessage: "reporting-dialog-stopSecondaryMessage",
                                actText: "reporting-dialog-stopActText",
                                actAlt: "reporting-dialog-stopActAlt"
                            }
                        },
                        listeners: {
                            onClose: function (userAction) {
                                if (userAction === "act") {
                                    that.requestReport(true, callback);
                                }
                            }
                        },
                        parentBundle: that.options.parentBundle
                    });
                    return false;
                }
            });
            that.events.ready.fire();
        }, cspace.util.provideErrorCallback(that, that.reportTypesSource.options.url, "errorFetching"));
    };
    
    cspace.reportProducer.requestReport = function (model, globalModel, options, events, stop, callback) {
        if (!stop) {
            events.reportStarted.fire();
        }
        var href = fluid.stringTemplate(options.urls.reportUrl, {
            reportcsid: model.reportTypeSelection,
            recordType: options.recordType,
            csid: globalModel.model.primaryModel.csid
        });
        fluid.fetchResources({
            report: {
                href: href,
                options: {
                    type: "GET",
                    success: function (data) {
                        if (data.isError) {
                            fluid.each(data.messages, function(message) {
                                events.onError.fire(message.message);
                            });
                            return;
                        }
                        window.location = href;
                        events.reportFinished.fire();
                        if (callback) {
                            callback();
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        events.onError.fire(textStatus);
                    }
                }
            }
        });
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
    
    cspace.reportProducer.generateReport = function (confirmation, parentBundle, requestReport, recordEditor) {
        if (fluid.get(recordEditor, "changeTracker.unsavedChanges")) {
            openConfirmation(confirmation, "saveDialog", {
                messages: [ "reporting-dialog-primaryMessageSave" ],
                messagekeys: {
                    actText: "reporting-dialog-actTextSave",
                    actAlt: "reporting-dialog-actAltSave",
                    proceedText: "reporting-dialog-proceedTextSave",
                    proceedAlt: "reporting-dialog-proceedAltSave"
                }
            }, 
            parentBundle,
            function (userAction) {
                if (userAction === "act") {
                    recordEditor.events.afterSave.addListener(function () {
                        requestReport(false);
                    }, undefined, undefined, "last");
                    recordEditor.events.onSave.fire();
                } else if (userAction === "proceed") {
                    requestReport(false);
                }
            });
        }
        else {
            openConfirmation(confirmation, "deleteDialog", {
                messages: [ "reporting-dialog-primaryMessage" ],
                messagekeys: {
                    actText: "reporting-dialog-actText",
                    actAlt: "reporting-dialog-actAlt"
                }
            }, 
            parentBundle,
            function (userAction) {
                if (userAction === "act") {
                    requestReport(false);
                }
            });
        }
    };
    
    cspace.reportProducer.produceTree = function (that) {
        return {
            expander: {
                type: "fluid.renderer.condition",
                condition: "${enableReporting}",
                trueTree: {
                    report: {
                        decorators: {"addClass": "{styles}.report"}
                    }
                }
            },
            reportHeader: {
                messagekey: "reporting-reportHeader",
                decorators: {"addClass": "{styles}.reportHeader"}
            },
            reportType: {
                optionnames: "${reportnames}",
                optionlist: "${reportlist}",
                selection: "${reportTypeSelection}",
                decorators: {"addClass": "{styles}.reportType"}
            },
            reportButton: {
                messagekey: "reporting-reportButton",
                decorators: [{
                    addClass: "{styles}.reportButton"
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.generateReport
                }, {
                    type: "jQuery",
                    func: "prop",
                    args: {
                        disabled: that.checkReportButtonDisabling
                    }
                }]
            }
        };
    };
    
    fluid.defaults("cspace.reportProducer.reportStatus", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "slowTemplate",
                url: "%webapp/html/components/ReportStatusTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        events: {
            onStop: null
        },
        produceTree: "cspace.reportProducer.reportStatus.produceTree",
        finalInitFunction: "cspace.reportProducer.reportStatus.finalInit",
        selectors: {
            message: ".csc-reportStatus-message", 
            stop: ".csc-reportStatus-stop"
        },
        styles: {
            message: "cs-reportStatus-message", 
            stop: "cs-reportStatus-stop"
        },
        parentBundle: "{globalBundle}",
        strings: { }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.reportProducer.reportStatus");
    
    cspace.reportProducer.reportStatus.produceTree = function (that) {
        return {
            message: {
                messagekey: "reporting-message",
                args: ["${reportName}"],
                decorators: {"addClass": "{styles}.message"}
            },
            stop: {
                messagekey: "reporting-stop",
                decorators: [{
                    "addClass": "{styles}.stop"
                }, {
                    type: "jQuery",
                    func: "click",
                    args: function () {
                        that.events.onStop.fire(that.model.reportType);
                    }
                }]
            }
        };
    };
    cspace.reportProducer.reportStatus.finalInit = function (that) {
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