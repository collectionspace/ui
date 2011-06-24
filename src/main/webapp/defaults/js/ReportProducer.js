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
                args: ["{reportProducer}.confirmation", "{reportProducer}.model", "{reportProducer}.options", "{reportProducer}.events"]
            }
        },
        components: {
            confirmation: {
                type: "cspace.confirmation"
            },
            reportStatus: {
                type: "cspace.reportProducer.reportStatus",
                createOnEvent: "ready",
                container: "{reportProducer}.reportLoadingIndicatorContainer"
            }
        },
        events: {
            onError: null,
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
            reportButton: "Create"
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
            reportTypeList: [""],
            reportTypeNames: ["Please select a value"],
            reportTypeSelection: "",
            enableReporting: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.permissions.resolve",
                    args: {
                        resolver: "{permissionsResolver}",
                        permission: "read",
                        // TODO: Double check that this is the right perm. level.
                        target: "reporting"
                    }
                }
            }
        },
        finalInitFunction: "cspace.reportProducer.finalInit",
        postInitFunction: "cspace.reportProducer.postInit",
        preInitFunction: "cspace.reportProducer.preInit"
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.reportProducer");
    
    cspace.reportProducer.preInit = function (that) {
        that.options.listeners = {
            reportStarted: function () {
                that.reportStatus.show();
            },
            reportFinished: function () {
                that.reportStatus.hide();
            },
            onError: function () {
                that.reportStatus.hide();
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
        that.events.ready.fire();
    };
    
    cspace.reportProducer.generateReport = function (confirmation, model, options, events) {
        confirmation.open("cspace.confirmation.deleteDialog", undefined, {
            strings: {
                primaryMessage: "Are you sure you want to run this report",
                actText: "Create",
                actAlt: "Create Report"
            },
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "act") {
//                        events.reportStarted.fire();
                        // TODO: Send a request with callback:
//                        events.reportFinished.fire();
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
                optionnames: "${reportTypeNames}",
                optionlist: "${reportTypeList}",
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
            message: "Creating %report report...",
            stop: "Stop" 
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.reportProducer.reportStatus");
    
    cspace.reportProducer.reportStatus.produceTree = function (that) {
        return {
            message: {
                messagekey: "message",
                decorators: {"addClass": "{styles}.repormessagetType"}
            },
            stop: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.stop                        
                    }
                }, {"addClass": "{styles}.stop"}]
            }
        };
    };
    cspace.reportProducer.reportStatus.finalInit = function (that) {
        that.show = function () {
            that.refreshView();
            that.container.show();
        };
        that.hide = that.container.hide;
    };
    
})(jQuery, fluid);