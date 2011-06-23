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
                args: ["{reportProducer}.model", "{reportProducer}.options"]
            }
        },
        selectors: {
            reportHeader: ".csc-reportProducer-header",
            reportButton: ".csc-reportProducer-button",
            reportType: ".csc-reportProducer-type",
            report: ".csc-reportProducer"
        },
        strings: {
            reportHeader: "Create Report",
            reportButton: "Create"
        },
        styles: {
            reportHeader: "cs-reportProducer-header",
            reportButton: "cs-reportProducer-button",
            report: "cs-reportProducer",
            reportType: "cs-reportProducer-reportType"
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
        finalInitFunction: "cspace.reportProducer.finalInit"
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.reportProducer");
    
    cspace.reportProducer.finalInit = function (that) {
        that.refreshView();
    };
    
    cspace.reportProducer.generateReport = function (model, options) {
        // TODO: Generate report here.
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
    
})(jQuery, fluid);