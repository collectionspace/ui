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

    var hidePermissions = function (domBinder) {
        domBinder.locate("permissions").hide();
        domBinder.locate("permissionsNone").show();
    };
    var showPermissions = function (domBinder) {
        domBinder.locate("permissionsNone").hide();
        domBinder.locate("permissions").show();
    };
    var retrieveRoleList = function (roleList, model) {
        // TODO: Use the DC for this
        var url = (cspace.util.isLocal() ? "data/roles/records/list.json" : "../../chain/roles");
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data, textStatus) {
                // that.roleListApplier.requestChange("*", data);
                // requestChange() to "*" doesn't work (see FLUID-3507)
                // the following workaround compensates:
                fluid.model.copyModel(model, data);
                roleList.updateModel(model.items);
            },
            error: function (xhr, textStatus, errorThrown) {
                fluid.fail("Error retrieving role list:" + textStatus);
            }
        });
    };

    var addNewRole = function(container, permissions, domBinder, uispec){
        return function(e){
            fluid.model.copyModel(permissions.model,{
                fields: {
                    permissions: [
                        {
                            recordType: "",
                            permission: ""
                        }
                    ]
                }
            });
            showPermissions(domBinder);
            domBinder.locate("newRoleRow").show();
        };
    };

    var loadRole = function(that){
        return function(e){
            var csid = that.locate("csid", e.target.parentNode).text();
            that.dataContext.fetch(csid);
        };
    };

    validate = function (domBinder, permissionsApplier) {
        var required = domBinder.locate("requiredFields");
        for (var i = 0; i < required.length; i++) {
            if (required[i].value === "") {
                cspace.util.displayTimestampedMessage(domBinder, "All fields required");
                return false;
            }
        }
        // In the default configuration, the email address used as the roleid.
        // If all required fields are present and the roleid is not set, use the email
        if (!domBinder.locate("roleID").val()) {
            permissionsApplier.requestChange("fields.roleID", domBinder.locate("email").val());
        }
        if (domBinder.locate("password").val() !== domBinder.locate("passwordConfirm").val()) {
            cspace.util.displayTimestampedMessage(domBinder, "Passwords don't match");
            return false;
        }
        return true;
    };

    var bindEventHandlers = function (that) {

        that.locate("newRole").click(addNewRole(that.container, that.permissions, that.dom, that.options.uispec));
        that.locate("roleListRow").live("click", loadRole(that));
        that.dataContext.events.afterCreate.addListener(function () {
            that.locate("newRoleRow").hide();
            retrieveRoleList(that.roleList, that.roleListApplier.model);
        });
        that.permissions.events.pageRendered.addListener(function () {
            that.locate("newRoleRow").hide();
            showPermissions(that.dom);
        });
        that.dataContext.events.onError.addListener(function (operation, message) {
            that.locate("newRoleRow").hide();
            if (operation === "fetch") {
                
            }
        });
        that.permissions.events.onCancel.addListener(function () {
            hidePermissions(that.dom);
            that.locate("newRoleRow").hide();
        });
        that.permissions.events.onSave.addListener(function () {
            return validate(that.dom, that.permissionsApplier);
        });
    };

    setUpRoleAdministrator = function (that) {
        bindEventHandlers(that);
        retrieveRoleList(that.roleList, that.roleListApplier.model);
        hidePermissions(that.dom);
        that.locate("newRoleRow").hide();
    };

    cspace.adminRoles = function (container, options) {
        var that = fluid.initView("cspace.adminRoles", container, options);
        that.model = {
            roleList: [],
            permissions: {
                fields: {}
            }
        };
        that.roleListApplier = fluid.makeChangeApplier(that.model.roleList);
        that.roleList = fluid.initSubcomponent(that, "roleList", [
            that.options.selectors.roleList, {
                uispec: that.options.uispec.roleList,
                data: that.model.roleList,
                dataContext: cspace.dataContext(that.model.roleList)
            }
        ]);

        that.permissionsApplier = fluid.makeChangeApplier(that.model.permissions);
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model.permissions, fluid.COMPONENT_OPTIONS]);
        that.permissions = fluid.initSubcomponent(that, "permissions", [
            that.options.selectors.permissions,
            that.permissionsApplier,
            {
                uispec: that.options.uispec.permissions,
                dataContext: that.dataContext
            }
        ]);

        setUpRoleAdministrator(that);
        return that;
    };

    fluid.defaults("cspace.adminRoles", {
        roleList: {
            type: "cspace.recordList"
        },
        permissions: {
            type: "cspace.recordEditor"
        },
        dataContext: {
            type: "cspace.dataContext",
            options: {
                recordType: "roles",
                dataType: "json",
                fileExtension: ""
            }
        },
        selectors: {
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            roleList: ".csc-role-roleList",
            csid: ".csc-role-roleList-csid",
            roleListRow: ".csc-role-roleList-row",
            permissions: ".csc-permissions",
            permissionsNone: ".csc-permissions-none",
            newRole: ".csc-role-createNew",
            newRoleRow: ".csc-role-addNew",
            roleID: ".csc-role-roleID",
            email: ".csc-role-email",
            password: ".csc-role-password",
            passwordConfirm: ".csc-role-passwordConfirm",
            requiredFields: ".csc-role-required"
        }
    });

})(jQuery, fluid_1_2);
