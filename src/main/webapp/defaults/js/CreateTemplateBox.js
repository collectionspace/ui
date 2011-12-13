/*
Copyright 2011

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.createTemplateBox", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        finalInitFunction: "cspace.createTemplateBox.finalInit",
        preInitFunction: "cspace.createTemplateBox.preInit",
        produceTree: "cspace.createTemplateBox.produceTree",
        model: {
            templateList: [],
            templateNames: [],
            templateType: "",
            strings: {
                recordTypeLabel: "createTemplateBox-recordTypeLabel",
                templateTypeLabel: "createTemplateBox-templateTypeLabel",
                createButtonText: "createTemplateBox-createButtonText"
            }
        },
        parentBundle: "{globalBundle}",
        selectors: {
            recordType: ".csc-createTemplateBox-recordType",
            recordTypeLabel: ".csc-createTemplateBox-recordTypeLabel",
            templateType: ".csc-createTemplateBox-templateType",
            templateTypeLabel: ".csc-createTemplateBox-templateTypeLabel",
            createButton: ".csc-createTemplateBox-createButton"
        },
        styles: {
            recordType: "cs-createTemplateBox-recordType",
            recordTypeLabel: "cs-createTemplateBox-recordTypeLabel",
            templateType: "cs-createTemplateBox-templateType",
            templateTypeLabel: "cs-createTemplateBox-templateTypeLabel",
            createButton: "cs-createTemplateBox-createButton"            
        },
        strings: {},
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        },
        components: {
            recordTypeSelector: {
                type: "cspace.util.recordTypeSelector",
                options: {
                    related: "all",
                    dom: "{createTemplateBox}.dom",
                    componentID: "recordType",
                    selector: "recordType",
                    permission: "{createTemplateBox}.options.permission"
                }
            },
            localStorage: {
                type: "cspace.util.localStorageDataSource", 
                options: {
                    elPath: "modelToClone"
                }
            },
            listSource: {
                type: "cspace.createTemplateBox.listDataSource"
            },
            templateSource: {
                type: "cspace.createTemplateBox.templateDataSource"
            } 
        },
        events: {
            recordTypeChanged: null,
            afterFetch: null
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/CreateTemplateBox.html",
                options: {
                    dataType: "html"
                }
            })
        },
        urls: cspace.componentUrlBuilder({
            cloneURL: "%webapp/html/%recordType.html",
            listUrl: "%tenant/%tname/%recordType/template",
            templateUrl: "%tenant/%tname/%recordType/template/%templateType"
        }),
        permission: "create"
    });
    
    cspace.createTemplateBox.produceTree = function (that) {
        var tree = {
            recordType: {
                decorators: {"addClass": "{styles}.recordType"}
            },
            recordTypeLabel: {
                decorators: {"addClass": "{styles}.recordTypeLabel"}, 
                messagekey: "${strings.recordTypeLabel}"
            },
            expander: {
                type: "fluid.renderer.condition",
                condition: {
                    funcName: "cspace.createTemplateBox.assertTemplateTypes",
                    args: "${templateList}"
                },
                trueTree: {
                    templateType: {
                        optionnames: "${templateNames}",
                        optionlist: "${templateList}",
                        selection: "${templateType}",
                        decorators: {"addClass": "{styles}.templateType"}
                    },
                    templateTypeLabel: {
                        decorators: {"addClass": "{styles}.templateTypeLabel"},
                        messagekey: "${strings.templateTypeLabel}"
                    },
                    createButton: {
                        messagekey: "${strings.createButtonText}",
                        decorators: [{
                            "addClass": "{styles}.createButton"
                        }, {
                            type: "jQuery",
                            func: "click",
                            args: that.createNewRecordFromTemplate
                        }]                
                    }
                }
            }
        };
        tree = $.extend(tree, that.recordTypeSelector.produceComponent());
        if(!that.model.recordType) {
            that.applier.requestChange("recordType", tree.recordType.selection);
        }
        if(!that.model.templateType) {
            that.applier.requestChange("templateType", that.model.templateList[0]);
        }
        tree.recordType.selection = "${recordType}";
        tree.recordType.decorators = {"addClass": "{styles}.recordType"};
        return tree;        
    };
    
    cspace.createTemplateBox.assertTemplateTypes = function () {
        return arguments.length > 0;
    };
    
    cspace.createTemplateBox.preInit = function (that) {
        that.options.listeners = {
            recordTypeChanged: function (recordType) {
                that.listSource.get({
                    recordType: recordType
                }, function (data) {
                    if (!data) {
                        that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                            url: that.listSource.options.url
                        }));
                        return;
                    }
                    if (data.isError === true) {
                        fluid.each(data.messages, function (message) {
                            that.displayErrorMessage(message);
                        });
                        return;
                    }
                    that.applier.requestChange("templateList", data.templateList);
                    that.applier.requestChange("templateNames", data.templateNames);
                    that.refreshView();
                }, cspace.util.provideErrorCallback(that, that.listSource.options.url, "errorFetching"));
            }
        };
        that.applier.modelChanged.addListener("recordType", function () {
            that.events.recordTypeChanged.fire(that.model.recordType);
        });
    };
    
    cspace.createTemplateBox.finalInit = function (that) {
        that.createNewRecordFromTemplate = function () { 
            that.templateSource.get({
                recordType: that.model.recordType,
                templateType: that.model.templateType
            }, function (data) {
                if (!data) {
                    that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                        url: that.templateSource.options.url
                    }));
                    return;
                }
                if (data.isError === true) {
                    fluid.each(data.messages, function (message) {
                        that.displayErrorMessage(message);
                    });
                    return;
                }
                that.localStorage.set(data);
                window.location = fluid.stringTemplate(that.options.urls.cloneURL, {recordType: that.model.recordType});
            }, cspace.util.provideErrorCallback(that, that.templateSource.options.url, "errorFetching"));
        };
        
        that.refreshView();
    };
    
    fluid.defaults("cspace.createTemplateBox.testListDataSource", {
        url: "%test/data/%recordType/template/list.json"
    });
    cspace.createTemplateBox.testListDataSource = cspace.URLDataSource;
    
    fluid.defaults("cspace.createTemplateBox.testTemplateDataSource", {
        url: "%test/data/%recordType/template/%templateType.json"
    });
    cspace.createTemplateBox.testTemplateDataSource = cspace.URLDataSource;    
    
    // This function executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.createTemplateBox");
    
})(jQuery, fluid);