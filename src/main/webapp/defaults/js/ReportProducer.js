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
            generateReport: {
                funcName: "cspace.reportProducer.generateReport",
                args: ["{reportProducer}.confirmation", "{reportProducer}.options.strings", "{reportProducer}.requestReport"]
            },
            requestReport: {
                funcName: "cspace.reportProducer.requestReport",
                args: ["{reportProducer}.model", "{reportProducer}.options", "{reportProducer}.events", "{arguments}.0", "{arguments}.1"]
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
            globalNavigator: "{globalNavigator}"
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
            reportHeader: "Create Report",
            reportButton: "Create",
            reportError: "Error creating report: ",
            primaryMessage: "Are you sure you want to run this report",
            actText: "Create",
            actAlt: "Create Report",
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
            reportTypes: ["Please select a value"],
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
            reportUrl: "%chain/reporting"
        }),
        finalInitFunction: "cspace.reportProducer.finalInit",
        postInitFunction: "cspace.reportProducer.postInit",
        preInitFunction: "cspace.reportProducer.preInit"
    });
    
    cspace.reportProducer.getReportTypes = function (recordType, strategy, options) {
        var config = {
            strategies: [fluid.invokeGlobalFunction(strategy, [options])]
        }; 
        return fluid.makeArray(fluid.get({}, fluid.model.composeSegments("reporting", recordType), config));
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.reportProducer");
    
    cspace.reportProducer.preInit = function (that) {
        that.options.listeners = {
            reportStarted: function () {
                that.applier.requestChange("reportInProgress", true);
                that.applier.requestChange("reportTypeSelection", that.model.reportTypeSelection || that.model.reportTypes[0]);
                that.reportStatus.show(that.model.reportTypeSelection);
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
    };
    
    cspace.reportProducer.postInit = function (that) {
        that.reportLoadingIndicatorContainer = $("<div/>")
            .addClass(that.options.selectors.reportLoadingIndicatorContainer.substr(1))
            .addClass(that.options.styles.reportLoadingIndicatorContainer)
            .hide();
        $("body").append(that.reportLoadingIndicatorContainer);
    };
    
    cspace.reportProducer.finalInit = function (that) {
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
    };
    
    cspace.reportProducer.requestReport = function (model, options, events, stop, callback) {
        if (!stop) {
            events.reportStarted.fire();
        }
        fluid.fetchResources({
            report: {
                href: options.urls.reportUrl,
                options: {
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify({
                        recordType: options.recordType,
                        stop: stop,
                        reportType: model.reportTypeSelection
                    }),
                    success: function (data) {
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
    
    cspace.reportProducer.generateReport = function (confirmation, strings, requestReport) {
        confirmation.open("cspace.confirmation.deleteDialog", undefined, {
            strings: {
                primaryMessage: strings.primaryMessage,
                actText: strings.actText,
                actAlt: strings.actAlt
            },
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "act") {
                        requestReport(false);
                    }
                }
            }
        });
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
                optionnames: "${reportTypes}",
                optionlist: "${reportTypes}",
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
            message: "Creating %reportType report...",
            stop: "Stop" 
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.reportProducer.reportStatus");
    
    cspace.reportProducer.reportStatus.produceTree = function (that) {
        return {
            message: {
                messagekey: "message",
                args: {reportType: "${reportType}"},
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
        that.show = function (reportType) {
            that.applier.requestChange("reportType", reportType);
            that.refreshView();
            that.container.show();
        };
        that.hide = function () {
            that.container.hide();
        }
    };
    
})(jQuery, fluid);