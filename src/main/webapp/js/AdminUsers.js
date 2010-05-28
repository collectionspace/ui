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

    var validate = function (domBinder, userDetailsApplier, passwordValidator) {
        // In the default configuration, the email address used as the userid.
        // If all required fields are present and the userid is not set, use the email
        if (!domBinder.locate("userId").val()) {
            userDetailsApplier.requestChange("fields.userId", domBinder.locate("email").val());
        }
        
        if (domBinder.locate("password").is(":visible") && (domBinder.locate("password").val() !== domBinder.locate("passwordConfirm").val())) {
            cspace.util.displayTimestampedMessage(domBinder, "Passwords don't match");
            return false;
        }
        
        var password = domBinder.locate("password");
        if (password.is(":visible") && (password.val() !== domBinder.locate("passwordConfirm").val())) {
        	cspace.util.displayTimestampedMessage(domBinder, "Passwords don't match");
            return false;
        }
        
        if (password.is(":visible") && !passwordValidator.validateLength(password.val())) {
            return false;
        }

        return true;
    };
    
    var restoreUserList = function (userListEditor, domBinder) {
        return function () {
            domBinder.locate("unSearchButton").hide();
            userListEditor.options.updateList(userListEditor, userListEditor.refreshView);
        };
    };

    var submitSearch = function (listEditor, domBinder, queryURL, successEvent) {
        return function () {
            var query = cspace.util.isLocal() ? "" : domBinder.locate("searchField").val();
            var model = listEditor.model;
            // TODO: Use the DC for this
            var url = queryURL + query;
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    // applier.requestChange("*", data);
                    // requestChange() to "*" doesn't work (see FLUID-3507)
                    // the following workaround compensates:
                    fluid.model.copyModel(model.list, data.results);                    
                    listEditor.refreshView();
                    domBinder.locate("unSearchButton").show();
                    successEvent.fire();
                },
                error: function (xhr, textStatus, errorThrown) {
                    fluid.fail("Error retrieving search results:" + textStatus);
                }
            });
        };
    };

    var bindEventHandlers = function (that) {

        that.locate("searchButton").click(submitSearch(that.userListEditor, that.dom, that.options.queryURL, that.events.afterSearch));
        that.locate("unSearchButton").click(restoreUserList(that.userListEditor, that.dom)).hide();

        that.userListEditor.details.events.onSave.addListener(function () {
            return validate(that.dom, that.userListEditor.detailsApplier, that.passwordValidator);
        });
        that.userListEditor.events.pageReady.addListener(function () {
            that.events.afterRender.fire();
        });
        
        that.userListEditor.events.afterAddNewListRow.addListener(function () {
        	that.passwordValidator.bindEvents();
        });
    };

    cspace.adminUsers = function (container, options) {
        var that = fluid.initView("cspace.adminUsers", container, options);
        that.userListEditor = fluid.initSubcomponent(that, "userListEditor", [that.container, that.options.recordType, 
            that.options.uispec, fluid.COMPONENT_OPTIONS]);
        that.passwordValidator = fluid.initSubcomponent(that, "passwordValidator", [that.container, fluid.COMPONENT_OPTIONS]);
        bindEventHandlers(that);
        
        return that;
    };

    fluid.defaults("cspace.adminUsers", {
        recordType: "users",
        userListEditor: {
            type: "cspace.listEditor",
            options: {
                dataContext: {
                    options: {
                        recordType: "users"
                    }
                }
            }
        },
        passwordValidator: {
        	type: "cspace.passwordValidator"
        },
        selectors: {
            searchField: ".csc-user-searchField",
            searchButton: ".csc-user-searchButton",
            unSearchButton: ".csc-user-unSearchButton",
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            userId: ".csc-user-userID",
            email: ".csc-user-email",
            userName: ".csc-user-userName",
            password: ".csc-user-password",
            passwordConfirm: ".csc-user-passwordConfirm"
        },
        events: {
            afterRender: null,
            afterSearch: null
        },
        queryURL: "../../chain/users/search?query="
    });

})(jQuery, fluid);
