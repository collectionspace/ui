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

    var addNewRole = function (container, roleListEditor, domBinder, uispec) {
        return function(e){
            fluid.model.copyModel(roleListEditor.details.model,{
                fields: {}
            });
            roleListEditor.details.refreshView();
            cspace.passwordValidator(container);
            roleListEditor.showDetails(true);
            roleListEditor.showNewListRow(true);
        };
    };
    
    var restoreRoleList = function (dc, domBinder) {
        return function () {
            domBinder.locate("unSearchButton").hide();
            dc.fetch(cspace.util.isLocal() ? "records/list" : null);
        };
    };

    var submitSearch = function (domBinder, roleListEditor) {
        return function () {
            var query = domBinder.locate("searchField").val();
            var model = roleListEditor.listApplier.model;
            // TODO: Use the DC for this
            var url = (cspace.util.isLocal() ? "data/roles/search/list.json" : "../../chain/roles/search?query=" + query);
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    // that.roleListApplier.requestChange("*", data);
                    // requestChange() to "*" doesn't work (see FLUID-3507)
                    // the following workaround compensates:
                    fluid.model.copyModel(model, data.results);
                    roleListEditor.list.updateModel(model);
                    roleListEditor.showNewListRow(false);
                    domBinder.locate("unSearchButton").show();
                },
                error: function (xhr, textStatus, errorThrown) {
                    fluid.fail("Error retrieving search results:" + textStatus);
                }
            });
        };
    };

    var bindEventHandlers = function (that) {

        that.locate("searchButton").click(submitSearch(that.dom, that.roleListEditor));
        that.locate("unSearchButton").click(restoreRoleList(that.roleListEditor.listDC, that.dom)).hide();
        
        that.locate("newRole").click(addNewRole(that.container, that.roleListEditor, that.dom, that.options.uispec));

        that.roleListEditor.details.events.onSave.addListener(function () {
        });
        that.roleListEditor.events.pageReady.addListener(function () {
            that.events.afterRender.fire();
        });
    };

    cspace.adminRoles = function (container, options) {
        var that = fluid.initView("cspace.adminRoles", container, options);
        that.roleListEditor = fluid.initSubcomponent(that, "roleListEditor", [that.container, that.options.recordType, 
            that.options.uispec, fluid.COMPONENT_OPTIONS]);
        bindEventHandlers(that);
        return that;
    };

    fluid.defaults("cspace.adminRoles", {
        recordType: "roles",
        roleListEditor: {
            type: "cspace.listEditor",
            options: {
                dataContext: {
                    options: {
                        recordType: "roles"
                    }
                }
            }
        },
        selectors: {
            searchField: ".csc-role-searchField",
            searchButton: ".csc-role-searchButton",
            unSearchButton: ".csc-role-unSearchButton",
            messageContainer: ".csc-message-container",
            feedbackMessage: ".csc-message",
            timestamp: ".csc-timestamp",
            newRole: ".csc-role-createNew"
        },
        events: {
            afterRender: null
        }
    });

})(jQuery, fluid);
