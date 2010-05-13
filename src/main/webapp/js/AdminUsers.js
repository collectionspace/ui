/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid*/

cspace = cspace || {};

(function ($, fluid) {

    var validate = function (domBinder, userDetailsApplier, passwordValidator) {
        // In the default configuration, the email address used as the userid.
        // If all required fields are present and the userid is not set, use the email
        if (!domBinder.locate("userId").val()) {
            userDetailsApplier.requestChange("fields.userId", domBinder.locate("email").val());
        }
        
        var password = domBinder.locate("password");
        if (password.is(":visible") && (password.val() !== domBinder.locate("passwordConfirm").val())) {
            cspace.util.displayTimestampedMessage(domBinder, "Passwords don't match");
            return false;
        }
        
        if (!passwordValidator.validateLength(password)) {
            return false;
        }

        return true;
    };
       
    var addNewUser = function (that) {
        return function(e){
            fluid.model.copyModel(that.userListEditor.details.model,{
                fields: {
                    userId: "",
                    screenName: "", 
                    password: "", 
                    email: "",
                    // TODO: This access into the UISpec is completely inappropriate
                    // We need a better way of initializing to the default
                    status: that.options.uispec.details[".csc-user-status"]["default"]
                }
            });
            that.userListEditor.details.refreshView();

            if (!that.passwordValidator) {
                that.passwordValidator = cspace.passwordValidator(that.container);
            }
            
            that.userListEditor.showDetails(true);
            that.userListEditor.showNewListRow(true);
        };
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
        
        that.locate("newUser").click(addNewUser(that));

        that.userListEditor.details.events.onSave.addListener(function () {
            return validate(that.dom, that.userListEditor.detailsApplier, that.passwordValidator);
        });
        that.userListEditor.events.pageReady.addListener(function () {
            that.events.afterRender.fire();
        });
    };

    cspace.adminUsers = function (container, options) {
        var that = fluid.initView("cspace.adminUsers", container, options);
        that.userListEditor = fluid.initSubcomponent(that, "userListEditor", [that.container, that.options.recordType, 
            that.options.uispec, fluid.COMPONENT_OPTIONS]);
        that.passwordValidator = null;
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
            newUser: ".csc-user-createNew",
            userId: ".csc-user-userID",
            email: ".csc-user-email",
            password: ".csc-user-password",
            passwordConfirm: ".csc-user-passwordConfirm"
        },
        events: {
            afterRender: null
        }
    });

})(jQuery, fluid);
