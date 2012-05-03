/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("TitleBar.js loaded");
    
    var setupTitleBar = function (that) {
        // Create a resolvers' config for titleBar's fluid.get
        that.config = $.extend(true, {}, fluid.model.defaultGetConfig, {
            resolvers: that.options.resolvers
        });
    };
    
    cspace.titleBar = function (container, options) {
        var that = fluid.initRendererComponent("cspace.titleBar", container, options);
        fluid.initDependents(that);
        setupTitleBar(that);
        that.renderer.refreshView();
        that.bindEvents();
        return that;
    };
    
    cspace.titleBar.repeatableMatchResolver = function (options, trundler) {
        trundler = trundler.trundle(options.queryPath);
        return fluid.find(trundler.root, function(value, key) {
            var trundleKey = trundler.trundle(key);
            var trundleChild = trundleKey.trundle(options.childPath);
            if (trundleChild.root === options.value) {
                return trundleKey;
            } 
        });
    };
    
    cspace.titleBar.bindEvents = function (that) {
        fluid.each(that.options.fields, function (field) {
            if (!field) {
                return;
            }
            var path = field.queryPath || field;
            if (typeof path !== "string") {
                return;
            }
            that.options.recordApplier.modelChanged.addListener(path, function () {
                that.renderer.refreshView();
            });
        });
    };
    
    cspace.titleBar.fixFieldValue = function (fieldValue) {
        if (!fieldValue) {
            return "";
        }
        return fieldValue.indexOf("urn") < 0 ? fieldValue : cspace.util.urnToString(fieldValue);
    };
    
    cspace.titleBar.buildTitle = function (that) {
        var title = "";
        if (that.options.fields.length < 1) {
            return title;
        }
        var separatorIndex = 0;
        fluid.each(that.options.fields, function (field) {
            var fieldValue = cspace.titleBar.fixFieldValue(fluid.copy(fluid.get(that.options.recordModel, field, that.config)));
            if (fieldValue) {
                title += (separatorIndex !== 0 ? that.options.separator : "") + fieldValue;
                ++separatorIndex;
            }
        });
        return title;
    }; 
    
    cspace.titleBar.produceTree = function (that) {
        var vocab = cspace.vocab.resolve({
            model: that.options.recordModel,
            recordType: that.model.recordType,
            vocab: that.vocab
        });
        return {
            recordType: {
                messagekey: "${recordType}",
                decorators: {"addClass": "{styles}.recordType"}
            },
            expander: {
                type: "fluid.renderer.condition",
                condition: vocab || false,
                trueTree: {
                    vocab: {
                        messagekey: "titlebar-vocab",
                        args: [that.options.parentBundle.resolve("vocab-" + vocab)],
                        decorators: {"addClass": "{styles}.vocab"}
                    }
                }
            },
            title: {
                value: that.buildTitle()
            }
        };
    };
    
    fluid.defaults("cspace.titleBar", {
        gradeNames: "fluid.rendererComponent",
        selectors: {
            title: ".csc-titleBar-value",
            recordType: ".csc-titleBar-recordType",
            vocab: ".csc-titleBar-vocab"
        },
        styles: {
            recordType: "cs-titleBar-recordType",
            vocab: "cs-titleBar-vocab"
        },
        invokers: {
            bindEvents: {
                funcName: "cspace.titleBar.bindEvents",
                args: "{titleBar}"
            },
            buildTitle: {
                funcName: "cspace.titleBar.buildTitle",
                args: "{titleBar}"
            },
            fixFieldValue: {
                funcNale: "cspace.titleBar.fixFieldValue",
                args: "@0"
            }
        },
        mergePolicy: {
            recordModel: "preserve",
            recordApplier: "nomerge"
        },
        resolvers: {
            repeatableMatch: cspace.titleBar.repeatableMatchResolver
        },
        components: {
            vocab: "{vocab}"
        },
        strings: {},
        fields: [],
        parentBundle: "{globalBundle}",
        produceTree: cspace.titleBar.produceTree,
        separator: " - ",
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/TitleBarTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        }
    });

    fluid.fetchResources.primeCacheFromResources("cspace.titleBar");
})(jQuery, fluid);
