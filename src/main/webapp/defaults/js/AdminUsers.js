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
    
    fluid.registerNamespace("cspace.adminUsers");

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
            that.events.afterRender.fire(that);
        });
        
        that.userListEditor.events.afterAddNewListRow.addListener(function () {
            that.passwordValidator.bindEvents();
        });
        
        that.userListEditor.details.events.afterRender.addListener(function () {
            that.locate("deleteButton")[that.options.login.options.csid === that.userListEditor.details.model.csid ? "hide" : "show"]();
        });
    };

    cspace.adminUsers = function (container, options) {
        var that = fluid.initView("cspace.adminUsers", container, options);
        fluid.initDependents(that);
        bindEventHandlers(that);
        that.events.afterSetup.fire(that);
        return that;
    };

    fluid.defaults("cspace.adminUsers", {
        gradeNames: ["fluid.viewComponent"],
        recordType: "users",
        components: {
            passwordValidator: {
                type: "cspace.passwordValidator"
            },
            userListEditor: {
                type: "cspace.listEditor"
            },
            globalNavigator: "{globalNavigator}"
        },
        selectors: {
            searchField: ".csc-user-searchField",
            deleteButton: ".csc-delete",
            searchButton: ".csc-user-searchButton",
            unSearchButton: ".csc-user-unSearchButton",
            userId: ".csc-user-userID",
            email: ".csc-user-email",
            userName: ".csc-user-userName",
            password: ".csc-user-password",
            passwordConfirm: ".csc-user-passwordConfirm"
        },
        events: {
            afterRender: null,
            afterSetup: null
        },
        strings: {
            searchError: "Error retrieving search results: ",
            passwordsDoNotMatch: "Passwords don't match."
        },
        login: "{userLogin}",
        messageBar: "{messageBar}",
        queryURL: "../../../chain/users/search?query="
    });

})(jQuery, fluid);
