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
            that.events.afterTreeRender.fire();
        });
    };

    fluid.defaults("cspace.adminRoles", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        finalInitFunction: "cspace.adminRoles.finalInit",
        produceTree: "cspace.adminRoles.produceTree",
        renderOnInit: true,
        recordType: "role",
        components: {
            roleListEditor: {
                type: "cspace.listEditor"
            }
        },
        selectors: {
            roleListHeader: ".csc-role-listHeader",
            addRole: ".csc-role-addRole",
            detailsHeader: ".csc-role-detailsHeader",
            detailsNone: ".csc-role-detailsNone",
            detaulsNoneSelected: ".csc-role-detailsNoneSelected"
        },
        strings: {
            roleListHeader: "Roles",
            addRole: "+ Role",
            detailsHeader: "Edit Role",
            detailsNone: "Please select a role from the list, or create a new role.",
            detaulsNoneSelected: "No role selected."
        },
        events: {
            afterTreeRender: null
        }
    });
    
    cspace.adminRoles.produceTree = function (that) {
        return {
            roleListHeader: {
                messagekey: "roleListHeader"
            },
            detailsHeader: {
                messagekey: "detailsHeader"
            },
            detailsNone: {
                messagekey: "detailsNone"
            },
            detaulsNoneSelected: {
                messagekey: "detaulsNoneSelected"
            },
            addRole: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.addRole
                    }
                }
            }
        };
    };
    
    cspace.adminRoles.finalInit = function (that) {
        bindEventHandlers(that);
    };
    
    cspace.adminRoles.assertDisplay = function (displayString) {
        return displayString !== "none";
    };

})(jQuery, fluid);
