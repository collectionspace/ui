/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.messageBar");
    
    var bindEvents = function (that) {
        that.locate("cancel").click(that.hide);
    };
    
    cspace.messageBarImpl = function (container, options) {
        var that = fluid.initRendererComponent("cspace.messageBarImpl", container, options);
        fluid.initDependents(that);
        that.refreshView = function () {
            that.renderer.refreshView();
            bindEvents(that);
        };
        that.disable = function () {
            // Emptying the show function.
            that.show = function () {};
        };
        return that;
    };
    
    cspace.messageBarImpl.hide = function (container) {
        container.hide();
    };
    
    cspace.messageBarImpl.show = function (that, message, time, isError) {
        // Check if message is an object of type {isError, message} and if not then it is just a plain string message
        message = message.message || message;

        message = fluid.find(message.split(":"), function (mSeg) {
            mSeg = $.trim(mSeg).toUpperCase().replace(/\s/gi, "");
            var resolved = that.options.parentBundle.resolve(mSeg);
            if (resolved !== "[Message string for key " + mSeg + " not found]") {return resolved;}
        }) || message;

        that.applier.requestChange("", {
            message: message,
            time: time
        });
        that.refreshView();
        that.locate("messageBlock")[isError? "addClass": "removeClass"](that.options.styles.error);
        that.container.show();
    };

    cspace.messageBarImpl.produceTree = function (that) {
        return {
            message: "${message}",
            time: "${time}",
            cancel: {
                messagekey: "messagebar-cancel"
            }
        };
    };
    
    fluid.defaults("cspace.messageBarImpl", {
        gradeNames: ["fluid.rendererComponent"],
        model: {},
        selectors: {
            messageBlock: ".csc-messageBar",
            message: ".csc-messageBar-message",
            time: ".csc-messageBar-time",
            cancel: ".csc-messageBar-cancel"
        },
        selectorsToIgnore: ["messageBlock"],
        styles: {
            messageBlock: "cs-messageBar",
            message: "cs-messageBar-message",
            time: "cs-messageBar-time",
            cancel: "cs-messageBar-cancel",
            error: "cs-message-error"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        produceTree: cspace.messageBarImpl.produceTree,
        invokers: {
            hide: {
                funcName: "cspace.messageBarImpl.hide",
                args: ["{messageBarImpl}.container"]
            },
            show: {
                funcName: "cspace.messageBarImpl.show",
                args: ["{messageBarImpl}", "@0", "@1", "@2"]
            }
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/MessageBarTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        }
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.messageBarImpl");
    
    cspace.messageBar = function (container, options) {
        var that = fluid.initView("cspace.messageBar", container, options);

        that.messageBarContainer = that.locate("messageBarContainer");
        if (that.messageBarContainer.length === 0) {
            that.messageBarContainer = $("<div/>").addClass(that.options.selectors.messageBarContainer.substr(1));
            that.container.append(that.messageBarContainer);
        }
        fluid.initDependents(that);
        return that.messageBarImpl;
    };
    
    fluid.defaults("cspace.messageBar", {
        gradeNames: ["fluid.viewComponent"],
        components: {
            messageBarImpl: {
                type: "cspace.messageBarImpl"
            }
        },
        selectors: {
            messageBarContainer: ".csc-messageBar-container"
        }
    });
    
})(jQuery, fluid);