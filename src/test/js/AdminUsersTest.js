/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/

var adminUsersTester = function(){
    var adminUsersTest = new jqUnit.TestCase("AdminUsers Tests", function () {
        adminUsersTest.fetchTemplate("../../main/webapp/html/administration.html", ".csc-users-userAdmin");
    });
    
    adminUsersTest.test("Creation", function () {
        var testOpts = {
            uispec: "../../main/webapp/html/uispecs/users/uispec.json",
            userListDataContext: {
                options: {
                    baseUrl: "../../main/webapp/html/data",
                    fileExtension: ".json"
                }
            },
            listeners: {
                afterRender: function () {
                    jqUnit.assertEquals("User list should have right number of entries", 4, adminUsers.model.userList.items.length);
                    jqUnit.assertEquals("User list should contain expected user", "Megan Forbes", adminUsers.model.userList.items[1].screenName);
                    start();
                }
            }
        };
        stop();
        var adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
    });
};

(function () {
    adminUsersTester();
}());

