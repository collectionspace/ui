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
        mergePolicy: {
            recordModel: "preserve",
            recordApplier: "nomerge"
        },
        produceTree: "cspace.reportProducer.produceTree",
        invokers: {
            generateReport: "cspace.reportProducer.generateReport",
            requestReport: {
                funcName: "cspace.reportProducer.requestReport",
                args: ["{reportProducer}.model", "{reportProducer}.options", "{reportProducer}.events", "{arguments}.0", "{arguments}.1"]
            },
            checkReportButtonDisabling: {
                funcName: "cspace.reportProducer.checkReportButtonDisabling",
                args: ["{reportProducer}.model", "{reportProducer}.options.recordModel"]
            }
        },
        components: {
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
            globalNavigator: "{globalNavigator}",
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
        strings: {
            reportHeader: "Run Report",
            reportButton: "Run",
            reportError: "Error creating report: ",
            primaryMessage: "Are you sure you want to run this report?",
            primaryMessageSave: "Are you sure you want to run this report for unsaved record?",
            actText: "Run",
            actAlt: "Run Report",
            actTextSave: "Save and Run",
            actAltSave: "Save Record and Run Report",
            proceedTextSave: "Run",
            proceedAltSave: "Run Report",
            stopPrimaryMessage: "You are about to navigate away from this page.",
            stopSecondaryMessage: "Do you want to stop current report?",
            stopActText: "Stop",
            stopActAlt: "Stop report."
        },
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
            reportTypesUrl: "%tenant/%tenantname/reporting/search/%recordType",
            reportUrl: "%tenant/%tenantname/invokereport/%reportcsid/%recordType/%csid"
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
    
    cspace.reportProducer.checkReportButtonDisabling = function (model, recordModel) {
        if (!recordModel.csid) {
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
                that.messageBar.show(that.options.strings.reportError + message, null, true)
            },
            onStop: function (reportType) {
                that.applier.requestChange("reportInProgress", false);
                that.applier.requestChange("reportTypeSelection", reportType);
                that.requestReport(true);
            }
        };
        that.options.recordApplier.modelChanged.addListener("csid", function () {
            that.refreshView();
        });
    };
    
    cspace.reportProducer.postInit = function (that) {
        that.reportLoadingIndicatorContainer = $("<div/>")
            .addClass(that.options.selectors.reportLoadingIndicatorContainer.substr(1))
            .addClass(that.options.styles.reportLoadingIndicatorContainer)
            .hide();
        $("body").append(that.reportLoadingIndicatorContainer);
    };
    
    cspace.reportProducer.finalInit = function (that) {
        that.reportTypesSource.get({
            recordType: that.options.recordType
        }, function (data) {
            if (data.reportlist.length > 0) {
                that.applier.requestChange("reportnames", data.reportnames);
                that.applier.requestChange("reportlist", data.reportlist);
            }
            that.refreshView();
            that.globalNavigator.events.onPerformNavigation.addListener(function (callback) {
                if (that.model.reportInProgress) {
                    that.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
                        strings: {
                            primaryMessage: that.options.strings.stopPrimaryMessage,
                            secondaryMessage: that.options.strings.stopSecondaryMessage,
                            actText: that.options.strings.stopActText,
                            actAlt: that.options.strings.stopActAlt
                        },
                        model: {
                            messages: ["primaryMessage", "secondaryMessage"]
                        },
                        listeners: {
                            onClose: function (userAction) {
                                if (userAction === "act") {
                                    that.requestReport(true, callback);
                                }
                            }
                        }
                    });
                    return false;
                }
            });
            that.events.ready.fire();
        });
    };
    
    cspace.reportProducer.requestReport = function (model, options, events, stop, callback) {
        if (!stop) {
            events.reportStarted.fire();
        }
        var href = fluid.stringTemplate(options.urls.reportUrl, {
            reportcsid: model.reportTypeSelection,
            recordType: options.recordType,
            csid: options.recordModel.csid
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
    
    var openConfirmation = function (confirmation, name, strings, onClose) {
        confirmation.open("cspace.confirmation." + name, undefined, {
            strings: strings,
            listeners: {
                onClose: onClose
            }
        });
    };
    
    cspace.reportProducer.generateReport = function (confirmation, strings, requestReport, recordEditor) {
        if (recordEditor && recordEditor.unsavedChanges) {
            openConfirmation(confirmation, "saveDialog", {
                primaryMessage: strings.primaryMessageSave,
                actText: strings.actTextSave,
                actAlt: strings.actAltSave,
                proceedText: strings.proceedTextSave,
                proceedAlt: strings.proceedAltSave
            }, function (userAction) {
                if (userAction === "act") {
                    recordEditor.options.dataContext.events.afterSave.addListener(function () {
                        requestReport(false);
                    }, undefined, undefined, "last");
                    recordEditor.requestSave();
                } else if (userAction === "proceed") {
                    requestReport(false);
                }
            });
        }
        else {
            openConfirmation(confirmation, "deleteDialog", {
                primaryMessage: strings.primaryMessage,
                actText: strings.actText,
                actAlt: strings.actAlt
            }, function (userAction) {
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
                messagekey: "reportHeader",
                decorators: {"addClass": "{styles}.reportHeader"}
            },
            reportType: {
                optionnames: "${reportnames}",
                optionlist: "${reportlist}",
                selection: "${reportTypeSelection}",
                decorators: {"addClass": "{styles}.reportType"}
            },
            reportButton: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.reportButton                        
                    }
                }, {
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
        strings: {
            message: "Creating %reportName report...",
            stop: "Stop" 
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.reportProducer.reportStatus");
    
    cspace.reportProducer.reportStatus.produceTree = function (that) {
        return {
            message: {
                messagekey: "message",
                args: {reportName: "${reportName}"},
                decorators: {"addClass": "{styles}.message"}
            },
            stop: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.stop                        
                    }
                }, {
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