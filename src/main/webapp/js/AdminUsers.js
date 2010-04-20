/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {

    var hideUserDetails = function (domBinder) {
        domBinder.locate("userDetails").hide();
        domBinder.locate("userDetailsNone").show();
    };
    var showUserDetails = function (domBinder, newUser) {
        domBinder.locate("userDetailsNone").hide();
        domBinder.locate("userDetails").show();
        if (newUser) {
            domBinder.locate("hideOnCreate").hide();
            domBinder.locate("hideOnEdit").show();
        } else {
            domBinder.locate("hideOnEdit").hide();
            domBinder.locate("hideOnCreate").show();
        }
    };

    var restoreUserList = function (dc, domBinder, userList, model) {
        return function () {
            domBinder.locate("unSearchButton").hide();
            dc.fetch(cspace.util.isLocal()? "records/list":null);
        };
    };

    var addNewUser = function (container, userDetails, domBinder, uispec) {
        return function(e){
            fluid.model.copyModel(userDetails.model,{
                fields: {
                    userId: "",
                    screenName: "", 
                    password: "", 
                    email: "",
                    // TODO: This access into the UISpec is completely inappropriate
                    // We need a better way of initializing to the default
                    status: uispec.userDetails[".csc-user-status"]["default"]
                }
            });
            userDetails.refreshView();
            cspace.passwordValidator(container);
            showUserDetails(domBinder, true);
            domBinder.locate("newUserRow").show();
        };
    };

    var loadUser = function (that) {
        return function(e){
            var csid = that.locate("csid", e.target.parentNode).text();
            that.dataContext.fetch(csid);
        };
    };

    var validate = function (domBinder, userDetailsApplier) {
        var required = domBinder.locate("requiredFields");
        for (var i = 0; i < required.length; i++) {
            if (required[i].value === "") {
                cspace.util.displayTimestampedMessage(domBinder, "All fields required");
                return false;
            }
        }
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

    var submitSearch = function (domBinder, userList, model) {
        return function () {
            var query = domBinder.locate("searchField").val();
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
                    userList.updateModel(model);
                    domBinder.locate("newUserRow").hide();
                    domBinder.locate("unSearchButton").show();
                },
                error: function (xhr, textStatus, errorThrown) {
                    fluid.fail("Error retrieving search results:" + textStatus);
                }
            });
        };
    };

    var bindEventHandlers = function (that) {

        that.locate("searchButton").click(submitSearch(that.dom, that.userList, that.userListApplier.model));
        that.locate("unSearchButton").click(restoreUserList(that.userListDC, that.dom, that.userList, that.userListApplier.model)).hide();
        
        that.locate("newUser").click(addNewUser(that.container, that.userDetails, that.dom, that.options.uispec));
        that.locate("userListRow").live("click", loadUser(that));
        that.dataContext.events.afterCreate.addListener(function () {
            that.locate("newUserRow").hide();
            that.userListDC.fetch(cspace.util.isLocal()? "records/list":null);
        });
        that.dataContext.events.afterUpdate.addListener(function () {
            that.userListDC.fetch(cspace.util.isLocal()? "records/list":null);
        });
        that.dataContext.events.afterRemove.addListener(function () {
            that.userListDC.fetch(cspace.util.isLocal()? "records/list":null);
        });
        that.userDetails.events.pageRendered.addListener(function () {
            that.locate("newUserRow").hide();
            showUserDetails(that.dom, false);
        });
        that.dataContext.events.onError.addListener(function (operation, message) {
            that.locate("newUserRow").hide();
            if (operation === "fetch") {
                
            }
        });
        that.userDetails.events.onCancel.addListener(function () {
            hideUserDetails(that.dom);
            that.locate("newUserRow").hide();
        });
        that.userDetails.events.onSave.addListener(function () {
            return validate(that.dom, that.userDetailsApplier);
        });

        that.userList.events.afterRender.addListener(that.fireAfterRender);

        that.userListDC.events.modelChanged.addListener(function () {
            that.userList.updateModel(that.model.userList.items);
        });
    };

    setUpUserAdministrator = function (that) {
        bindEventHandlers(that);
        that.userListDC.fetch(cspace.util.isLocal()? "records/list":null);
        hideUserDetails(that.dom);
    };

    cspace.adminUsers = function (container, options) {
        var that = fluid.initView("cspace.adminUsers", container, options);
        that.model = {
            userList: [],
            userDetails: {
                fields: {}
            }
        };
        that.userListApplier = fluid.makeChangeApplier(that.model.userList);
        that.userListDC = fluid.initSubcomponent(that, "userListDataContext", [that.model.userList, fluid.COMPONENT_OPTIONS]);
        that.userList = fluid.initSubcomponent(that, "userList", [
            that.options.selectors.userList, {
                uispec: that.options.uispec.userList,
                data: that.model.userList
            }
        ]);

        that.userDetailsApplier = fluid.makeChangeApplier(that.model.userDetails);
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model.userDetails, fluid.COMPONENT_OPTIONS]);
        that.userDetails = fluid.initSubcomponent(that, "userDetails", [
            that.options.selectors.userDetails,
            that.userDetailsApplier,
            {
                uispec: that.options.uispec.userDetails,
                dataContext: that.dataContext
            }
        ]);

        that.fireAfterRender = function () {
            that.locate("newUserRow").hide();
            that.events.afterRender.fire();
            that.userList.events.afterRender.removeListener(that.fireAfterRender);
        };

        setUpUserAdministrator(that);
        return that;
    };

    fluid.defaults("cspace.adminUsers", {
        userList: {
            type: "cspace.recordList"
        },
        userDetails: {
            type: "cspace.recordEditor"
        },
        userListDataContext: {
            type: "cspace.dataContext",
            options: {
                recordType: "users",
                dataType: "json",
                fileExtension: ""
            }
        },
        dataContext: {
            type: "cspace.dataContext",
            options: {
                recordType: "users",
                dataType: "json",
                fileExtension: ""
            }
        },
        url: "../../chain/users",
        selectors: {
            searchField: ".csc-user-searchField",
            searchButton: ".csc-user-searchButton",
            unSearchButton: ".csc-user-unSearchButton",
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            userList: ".csc-user-userList",
            csid: ".csc-user-userList-csid",
            userListRow: ".csc-user-userList-row",
            userDetails: ".csc-user-userDetails",
            userDetailsNone: ".csc-user-userDetails-none",
            newUser: ".csc-user-createNew",
            newUserRow: ".csc-user-addNew",
            userId: ".csc-user-userID",
            email: ".csc-user-email",
            hideOnCreate: ".csc-user-hideOnCreate",
            hideOnEdit: ".csc-user-hideOnEdit",
            password: ".csc-user-password",
            passwordConfirm: ".csc-user-passwordConfirm",
            requiredFields: ".csc-user-required:visible"
        },
         events: {
             afterRender: null
         }
    });

})(jQuery, fluid_1_2);
