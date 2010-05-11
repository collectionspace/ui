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
        var adminUsers;
        var recordListUISpec = {
            ".csc-recordList-row:": {
                "children": [
                    {
                        ".csc-user-userList-name": "${items.0.screenName}",
                        ".csc-user-userList-status": "${items.0.status}",
                        ".csc-listEditor-list-csid": "${items.0.csid}"
                    }
                ]
            }
        };
        var testOpts = {
            recordType: "users/records/list.json",
            uispec: {list: recordListUISpec, details: {}},
            userListEditor: {
                options: {
                    baseUrl: "../../main/webapp/html/data/"
                }
            }
        };
        adminUsers = cspace.adminUsers(".csc-users-userAdmin", testOpts);
        jqUnit.assertEquals("User list model should have right number of entries", 4, adminUsers.userListEditor.model.list.length);
        jqUnit.assertEquals("User list model should contain expected user", "Megan Forbes", adminUsers.userListEditor.model.list[1].screenName);
        jqUnit.assertEquals("Rendered table has 4 data rows visible", 4, $(".csc-recordList-row", "#main").length);
    });
};

(function () {
    adminUsersTester();
}());

