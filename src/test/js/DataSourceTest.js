/*
Copyright 2010 

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, expect*/
"use strict";

var dataSourceTester = function ($) {
    
    var dataSource;
    var schema;
    
    $.ajax({
        url: "../../main/webapp/html/uischema/users.json",
        async: false,
        dataType: "json",
        success: function (data) {
            schema = data;
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error fetching adminisrtation schema.");
        }
    });
    
    var dataSourceTest = new jqUnit.TestCase("DataSource Tests", function () {
        cspace.util.isTest = true;
    });
    
    var expectedBaseModel = {
        "relations": {},
        "termsUsed": [],
        "fields": {
            "status": "Active",
            "role": [
                {
                    "roleId": "94bf9d26-7147-421e-8e99-a2f0308dba20",
                    "roleName": "ROLE_TENANT_ADMINISTRATOR",
                    "roleSelected": false
                },
                {
                    "roleId": "a9bf8595-ffc6-40b6-9d86-d4dc8ff7e62e",
                    "roleName": "ROLE_TENANT_READER",
                    "roleSelected": false
                },
                {
                    "roleId": "1b375821-709d-4080-8294-174318d56c71",
                    "roleName": "ROLE_ART JUGGLER",
                    "roleSelected": false
                }
            ]
        }
    };
    
    var setupDataSource = function (opts) {
        var options = fluid.merge(null, {
            recordType: "users",
            schema: schema,
            baseUrl: "../../main/webapp/html/data/",
            fileExtension: ".json",
            sources: {
                role: {
                    href: "../../main/webapp/html/data/role/list.json",
                    path: "fields.role",
                    resourcePath: "items",
                    merge: cspace.dataSource.mergeRoles
                }
            }
        }, opts);
        return cspace.dataSource(options);
    };
    
    dataSourceTest.test("Assemble a new model", function () {
        dataSource = setupDataSource({
            listeners: {
                afterFetchResources: function (model) {                    
                    jqUnit.assertDeepEq("New model should inlcude all components", expectedBaseModel, model);
                    start();
                }
            }
        });
        var model = dataSource.provideModel();
        stop();
    });
    
    dataSourceTest.test("Assemble an existing model", function () {
        dataSource = setupDataSource({
            listeners: {
                afterFetchResources: function (model) {
                    var expectedModel = {
                        "message": "",
                        "relations": [
                            
                        ],
                        "csid": "7871b484-77ee-4f4c-a62e-9060ead319ca",
                        "ok": true,
                        "fields": {
                            "email": "test@test.test",
                            "status": "active",
                            "createdAt": "2010-09-01T12:56:40.000",
                            "userId": "test@test.test",
                            "screenName": "Kasper Markus",
                            "role": expectedBaseModel.fields.role,
                            "csid": "7871b484-77ee-4f4c-a62e-9060ead319ca"
                        }
                    };
                    expectedModel.fields.role[1].roleSelected = true;
                    jqUnit.assertDeepEq("Existing model should inlcude all components", expectedModel, model);
                    start();
                }
            }
        });
        var model = dataSource.provideModel("7871b484-77ee-4f4c-a62e-9060ead319ca");
        stop();
    });
};

(function () {
    dataSourceTester(jQuery);
}());