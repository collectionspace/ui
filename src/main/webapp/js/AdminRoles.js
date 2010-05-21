/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    var bindEventHandlers = function (that) {
        that.roleListEditor.events.pageReady.addListener(function () {
            that.events.afterRender.fire();
        });
    };

    cspace.adminRoles = function (container, options) {
        var that = fluid.initView("cspace.adminRoles", container, options);
        that.roleListEditor = fluid.initSubcomponent(that, "roleListEditor", [that.container, that.options.recordType, 
            that.options.uispec, fluid.COMPONENT_OPTIONS]);
        bindEventHandlers(that);
        return that;
    };

    fluid.defaults("cspace.adminRoles", {
        recordType: "role",
        roleListEditor: {
            type: "cspace.listEditor",
            options: {
                dataContext: {
                    options: {
                        recordType: "role"
                    }
                }
            }
        },
        selectors: {
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp"
        },
        events: {
            afterRender: null
        }
    });

})(jQuery, fluid);
