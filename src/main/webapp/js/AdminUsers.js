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

    var validate = function (domBinder, userDetailsApplier) {
        // In the default configuration, the email address used as the userid.
        // If all required fields are present and the userid is not set, use the email
        if (!domBinder.locate("userId").val()) {
            userDetailsApplier.requestChange("fields.userId", domBinder.locate("email").val());
        }
        
        if (domBinder.locate("password").is(":visible") && (domBinder.locate("password").val() !== domBinder.locate("passwordConfirm").val())) {
            cspace.util.displayTimestampedMessage(domBinder, "Passwords don't match");
            return false;
        }
        return true;
    };
    
    var restoreUserList = function (dc, domBinder) {
        return function () {
            domBinder.locate("unSearchButton").hide();
            dc.fetch(cspace.util.isLocal() ? "records/list" : null);
        };
    };

    var submitSearch = function (domBinder, userListEditor) {
        return function () {
            var query = domBinder.locate("searchField").val();
            var model = userListEditor.listApplier.model;
            // TODO: Use the DC for this
            var url = (cspace.util.isLocal() ? "data/users/search/list.json" : "../../chain/users/search?query=" + query);
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    // that.userListApplier.requestChange("*", data);
                    // requestChange() to "*" doesn't work (see FLUID-3507)
                    // the following workaround compensates:
                    fluid.model.copyModel(model, data.results);
                    userListEditor.list.updateModel(model);
                    userListEditor.showNewListRow(false);
                    domBinder.locate("unSearchButton").show();
                },
                error: function (xhr, textStatus, errorThrown) {
                    fluid.fail("Error retrieving search results:" + textStatus);
                }
            });
        };
    };

    var bindEventHandlers = function (that) {

        that.locate("searchButton").click(submitSearch(that.dom, that.userListEditor));
        that.locate("unSearchButton").click(restoreUserList(that.userListEditor.listDC, that.dom)).hide();

        that.userListEditor.details.events.onSave.addListener(function () {
            return validate(that.dom, that.userListEditor.detailsApplier);
        });
        that.userListEditor.events.pageReady.addListener(function () {
            that.events.afterRender.fire();
        });
    };

    cspace.adminUsers = function (container, options) {
        var that = fluid.initView("cspace.adminUsers", container, options);
        that.userListEditor = fluid.initSubcomponent(that, "userListEditor", [that.container, that.options.recordType, 
            that.options.uispec, fluid.COMPONENT_OPTIONS]);
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
            afterRender: null
        }
    });

})(jQuery, fluid);
