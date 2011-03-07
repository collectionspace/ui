/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("AdminRoles.js loaded");
    
    var bindEventHandlers = function (that) {
        that.roleListEditor.events.pageReady.addListener(function () {
            that.events.afterRender.fire();
        });
    };

    cspace.adminRoles = function (container, options, demandsOptions) {
        options = options || {};
        fluid.merge(null, options.value || options, demandsOptions);
        var that = fluid.initView("cspace.adminRoles", container, options);
        fluid.initDependents(that);
        bindEventHandlers(that);
        return that;
    };
    
    fluid.demands("roleListEditor", "cspace.adminRoles", ["{adminRoles}container", 
        "{adminRoles}options.recordType", "{adminRoles}options.uispec", fluid.COMPONENT_OPTIONS]);
    
    cspace.adminRoles.assertDisplay = function (displayString) {
        return displayString !== "none";
    };

    fluid.defaults("cspace.adminRoles", {
        recordType: "role",
        components: {
            roleListEditor: {
                type: "cspace.listEditor",
                options: {
                    dataContext: {
                        options: {
                            recordType: "role"
                        }
                    }
                }
            }
        },
        events: {
            afterRender: null
        }
    });
    
    fluid.demands("role", ["cspace.pageBuilder", "cspace.localData"], ["{pageBuilder}.options.selectors.role", fluid.COMPONENT_OPTIONS, {
        recordType: "role/records.json",
        components: {
            roleListEditor: {
                options: {
                    baseUrl: "../../../test/data/"
                }
            }
        }
    }]);
    
    fluid.demands("role", "cspace.pageBuilder", ["{pageBuilder}.options.selectors.role", fluid.COMPONENT_OPTIONS]);

})(jQuery, fluid);
