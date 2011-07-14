/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.log("Admin.js loaded");
    fluid.defaults("cspace.admin", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        produceTree: "cspace.admin.produceTree",
        renderOnInit: true,
        components: {
            adminListEditor: {
                type: "cspace.listEditor"
            }
        },
        preInitFunction: "cspace.admin.preInit",
        parentBundle: "{globalBundle}",
        selectors: {
            listHeader: ".csc-admin-listHeader",
            add: ".csc-admin-add",
            detailsHeader: ".csc-admin-detailsHeader",
            detailsNone: ".csc-admin-detailsNone",
            detaulsNoneSelected: ".csc-admin-detailsNoneSelected"
        },
        model: {
            strings: {
                add: "%recordType-admin-add",
                listHeader: "%recordType-admin-listHeader",
                detailsHeader: "%recordType-admin-detailsHeader",
                detailsNone: "%recordType-admin-detailsNone",
                detaulsNoneSelected: "%recordType-admin-detaulsNoneSelected"
            }
        },
        strings: {}
    });
    
    cspace.admin.preInit = function (that) {
        that.model.strings = cspace.util.stringBuilder(that.model.strings, {
            vars: {
                recordType: that.options.recordType
            }
        });
    };
    
    cspace.admin.produceTree = function (that) {
        return {
            listHeader: {
                messagekey: "${strings.listHeader}"
            },
            detailsHeader: {
                messagekey: "${strings.detailsHeader}"
            },
            detailsNone: {
                messagekey: "${strings.detailsNone}"
            },
            detaulsNoneSelected: {
                messagekey: "${strings.detaulsNoneSelected}"
            },
            add: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.parentBundle.messageBase[that.model.strings.add]
                    }
                }
            }
        };
    };
    
    cspace.admin.produceAdminUserTree = function (that) {
        return fluid.merge(null, cspace.admin.produceTree(that), {
            passwordLabel: {
                messagekey: "users-passwordLabel"
            },
            passwordConfirmLabel: {
                messagekey: "users-confirmPasswordLabel"
            },
            passwordInstructionsLabel: {
                messagekey: "users-passwordInstructionsLabel"
            },
            searchNote: {
                messagekey: "users-searchNote"
            },
            searchButton: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.parentBundle.messageBase["users-search"]
                    } 
                }
            },
            unSearchButton: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.parentBundle.messageBase["users-unsearch"]
                    } 
                }
            }
        });
    };
    
    cspace.admin.produceAdminRoleTree = function (that) {
        return fluid.merge(null, cspace.admin.produceTree(that), {
            noneLabel: {
                messagekey: "role-none"
            },
            readLabel: {
                messagekey: "role-read"
            },
            writeLabel: {
                messagekey: "role-write"
            },
            deleteLabel: {
                messagekey: "role-delete"
            }
        });
    };
    
    cspace.admin.assertRoleDisplay = function (displayString) {
        return displayString !== "none";
    };
    
    cspace.admin.finalInit = function (that) {
        that.bindEvents();
        that.events.afterSetup.fire(that);
    };
    
    cspace.admin.validate = function (messageBar, dom, applier, passwordValidator, strings) {
        // In the default configuration, the email address used as the userid.
        // If all required fields are present and the userid is not set, use the email
        if (!dom.locate("userId").val()) {
            applier.requestChange("fields.userId", dom.locate("email").val());
        }
        var password = dom.locate("password");
        if (password.is(":visible")) {
            var pwd = password.val();
            if (pwd !== dom.locate("passwordConfirm").val()) {
                messageBar.show(strings["admin-passwordsDoNotMatch"], null, true);
                return false;
            }
            if (!passwordValidator.validateLength(pwd)) {
                return false;
            }
        }
        return true;
    };

    cspace.admin.bindEventHandlers = function (that) {
        that.locate("unSearchButton").click(function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                that.locate("searchField").val("")
                that.locate("unSearchButton").hide();
                that.adminListEditor.updateList();
            });
        }).hide();
        that.locate("searchButton").click(function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                that.adminListEditor.updateList();
                that.locate("unSearchButton").show();
            });
        });

        that.adminListEditor.details.events.onSave.addListener(that.validate);
        that.adminListEditor.events.pageReady.addListener(function () {
            that.events.afterTreeRender.fire(that);
        });
        
        that.adminListEditor.events.afterAddNewListRow.addListener(function () {
            that.passwordValidator.bindEvents();
        });
        
        that.adminListEditor.details.events.afterRender.addListener(function () {
            that.locate("deleteButton")[that.options.login.options.csid === that.adminListEditor.details.model.csid ? "hide" : "show"]();
        });
    };
    
})(jQuery, fluid);