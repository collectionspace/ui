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
    fluid.log("AdminUsers.js loaded");

    var validate = function (messageBar, domBinder, userDetailsApplier, passwordValidator, strings) {
        // In the default configuration, the email address used as the userid.
        // If all required fields are present and the userid is not set, use the email
        if (!domBinder.locate("userId").val()) {
            userDetailsApplier.requestChange("fields.userId", domBinder.locate("email").val());
        }
        
        if (domBinder.locate("password").is(":visible") && (domBinder.locate("password").val() !== domBinder.locate("passwordConfirm").val())) {
            messageBar.show(strings.passwordsDoNotMatch, null, true);
            return false;
        }
        
        var password = domBinder.locate("password");
        if (password.is(":visible") && (password.val() !== domBinder.locate("passwordConfirm").val())) {
            messageBar.show(strings.passwordsDoNotMatch, null, true);
            return false;
        }
        
        if (password.is(":visible") && !passwordValidator.validateLength(password.val())) {
            return false;
        }
        return true;
    };

    var bindEventHandlers = function (that) {
        that.locate("unSearchButton").click(function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                that.locate("searchField").val("")
                that.locate("unSearchButton").hide();
                that.userListEditor.updateList();
            });
        }).hide();
        that.locate("searchButton").click(function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                that.userListEditor.updateList();
                that.locate("unSearchButton").show();
            });
        });

        that.userListEditor.details.events.onSave.addListener(function () {
            return validate(that.options.messageBar, that.dom, that.userListEditor.options.detailsApplier, that.passwordValidator, that.options.strings);
        });
        that.userListEditor.events.pageReady.addListener(function () {
            that.events.afterTreeRender.fire(that);
        });
        
        that.userListEditor.events.afterAddNewListRow.addListener(function () {
            that.passwordValidator.bindEvents();
        });
        
        that.userListEditor.details.events.afterRender.addListener(function () {
            that.locate("deleteButton")[that.options.login.options.csid === that.userListEditor.details.model.csid ? "hide" : "show"]();
        });
    };

    fluid.defaults("cspace.adminUsers", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        recordType: "users",
        finalInitFunction: "cspace.adminUsers.finalInit",
        components: {
            passwordValidator: {
                type: "cspace.passwordValidator"
            },
            userListEditor: {
                type: "cspace.listEditor"
            },
            globalNavigator: "{globalNavigator}"
        },
        produceTree: "cspace.adminUsers.produceTree",
        selectors: {
            searchField: ".csc-user-searchField",
            deleteButton: ".csc-delete",
            searchButton: ".csc-user-searchButton",
            unSearchButton: ".csc-user-unSearchButton",
            userId: ".csc-user-userID",
            email: ".csc-user-email",
            userName: ".csc-user-userName",
            password: ".csc-user-password",
            passwordConfirm: ".csc-user-passwordConfirm",
            userListHeader: ".csc-users-listHeader",
            addUser: ".csc-users-addUser",
            detailsHeader: ".csc-users-detailsHeader",
            detailsNone: ".csc-users-detailsNone",
            detaulsNoneSelected: ".csc-users-detailsNoneSelected"
        },
        renderOnInit: true,
        selectorsToIgnore: ["searchField", "deleteButton", "searchButton", "unSearchButton", "userId", "email", "userName", "password", "passwordConfirm"],
        events: {
            afterTreeRender: null,
            afterSetup: null
        },
        strings: {
            searchError: "Error retrieving search results: ",
            passwordsDoNotMatch: "Passwords don't match.",
            userListHeader: "Users",
            addUser: "+ User",
            detailsHeader: "User Details",
            detailsNone: "Please select a user from the list, or create a new user.",
            detaulsNoneSelected: "No user selected."
        },
        login: "{userLogin}",
        messageBar: "{messageBar}",
        queryURL: "../../../chain/users/search?query="
    });
    
    cspace.adminUsers.produceTree = function (that) {
        return {
            userListHeader: {
                messagekey: "userListHeader"
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
            addUser: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.strings.addUser
                    }
                }
            }
        };
    };
    
    cspace.adminUsers.finalInit = function (that) {
        bindEventHandlers(that);
        that.events.afterSetup.fire(that);
    };

})(jQuery, fluid);
