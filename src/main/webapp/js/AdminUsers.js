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

    var addNewUser = function (e) {
        console.log("the Add New User row was clicked!!");
    };

    var loadUser = function(that){
        return function(e){
            var csid = that.locate("csid", e.target.parentNode).text();
            $.ajax({
                url: "data/user/"+csid+".json",
                type: "GET",
                dataType: "json",
                success: function (data, textStatus) {
                    console.log("Got data for  user data for csid "+csid);
                    // that.userDetailsApplier.requestChange("*", data);
                    // requestChange() to "*" doesn't work (see FLUID-3507)
                    // the following workaround compensates:
                    fluid.model.copyModel(that.userDetailsApplier.model, data);
                    that.userDetails.refreshView();
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log("Error fetching user data for csid "+csid);
                }
            });
        };
    };

    var bindEventHandlers = function (that) {

        that.locate("newUser").click(addNewUser);
        that.locate("userListRow").live("click", loadUser(that));
        
        that.userDetailsApplier.modelChanged.addListener("*", function (model, oldModel, changeRequest) {
            console.log("model.userDetails changed!");
        });
    };

    cspace.adminUsers = function (container, options) {
        var that = fluid.initView("cspace.adminUsers", container, options);
        that.model = {
            userList: [
                {csid: "963852741", name: "Carl Hogsden", status: "active"},
                {csid: "369258147", name: "Megan Forbes", status: "active"},
                {csid: "147258369", name: "Anastasia Cheetham", status: "inactive"},
                {csid: "741852963", name: "Jesse Martinez", status: "active"}
            ],
            userDetails: {
                fields: {}
            }
        };
        that.userListApplier = fluid.makeChangeApplier(that.model.userList);
        that.userDetailsApplier = fluid.makeChangeApplier(that.model.userDetails);

        that.userList = fluid.initSubcomponent(that, "userList", [
            that.options.selectors.userList, {
                uispec: that.options.uispec.userList,
                data: that.model.userList,
                dataContext: cspace.dataContext()
            }
        ]);
        that.userDetails = fluid.initSubcomponent(that, "userDetails", [
            that.options.selectors.userDetails, {
                uispec: that.options.uispec.userDetails,
                applier: that.userDetailsApplier,
                dataContext: cspace.dataContext()
            }
        ]);

        bindEventHandlers(that);
        return that;
    };

    fluid.defaults("cspace.adminUsers", {
        userList: {
            type: "cspace.recordList"
        },
        userDetails: {
            type: "cspace.dataEntry"
        },
        selectors: {
            userList: ".csc-user-userList",
            csid: ".csc-user-userList-csid",
            userListRow: ".csc-user-userList-row",
            userDetails: ".csc-user-userDetails",
            newUser: ".csc-user-addNew"
        }
    });
})(jQuery, fluid_1_2);
