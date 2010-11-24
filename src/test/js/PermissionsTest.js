/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

var permissionsTester = function ($) {
    
    var  permissionsTest = new jqUnit.TestCase("Permissions Tests", function () {
        cspace.util.isTest = true;
    });
    
    var currentUserPerms = {
        "permissions": {
            "person": ["create", "read", "update", "delete", "list"],
            "loanout": ["create", "read", "update", "delete", "list"],
            "loanin": ["read", "list"],
            "acquisition": [],
            "organization": ["create", "read", "update", "delete", "list"],
            "movement": ["create", "read", "update", "delete", "list"],
            "objects": ["create", "read", "update", "delete", "list"],
            "objectexit": ["create", "read", "update", "delete", "list"]
        }
    };
    
    permissionsTest.test("cspace.permissions.manager", function () {
        expect(14);        
        var manager = cspace.permissions.manager(currentUserPerms);
        jqUnit.assertEquals("Base Resolve Permission, resolve", true, manager.resolvePermissions("loanout", "read"));
        jqUnit.assertEquals("Base Resolve Permission, not resolve", false, manager.resolvePermissions("loanin", "create"));
        jqUnit.assertEquals("Base Resolve Permission, empty", false, manager.resolvePermissions("acquisition", "list"));
        jqUnit.assertEquals("resolvePermissionMin, resolve", true, manager.resolveOR("loanout", ["read", "create"]));
        jqUnit.assertEquals("resolvePermissionMin, resolve", true, manager.resolveOR("loanin", ["read", "create"]));
        jqUnit.assertEquals("resolvePermissionMin, not resolve", false, manager.resolveOR("loanin", ["create"]));
        jqUnit.assertEquals("resolvePermissionMin, empty", false, manager.resolveOR("acquisition", "list"));
        jqUnit.assertEquals("resolvePermissionAll, resolve", true, manager.resolveAND("loanout", ["read", "create"]));
        jqUnit.assertEquals("resolvePermissionAll, resolve", false, manager.resolveAND("loanin", ["read", "create"]));
        jqUnit.assertEquals("resolvePermissionAll, not resolve", false, manager.resolveAND("loanin", ["create"]));
        jqUnit.assertEquals("resolvePermissionAll, resolve", true, manager.resolveAND("loanin", ["read", "list"]));
        jqUnit.assertEquals("resolvePermissionAll, empty", false, manager.resolveAND("acquisition", "list"));
        jqUnit.assertEquals("resolvePermissionAll, empty", true, manager.resolveAND("bla", "list"));
        jqUnit.assertEquals("resolvePermissionAll, empty", true, manager.resolveAND("acquisition", ""));
    });
};

(function () {
    permissionsTester(jQuery);
}());