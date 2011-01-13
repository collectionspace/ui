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
    
    var permissionsTest = new jqUnit.TestCase("Permissions Test");
    
    permissionsTest.test("cspace.permissions.logicalCombine", function() {
        function testLogical(values, method, result) {
            jqUnit.assertEquals(JSON.stringify(values) + " " + method + ": ",
                result, cspace.permissions.logicalCombine(values, method === "AND"));
        }
        testLogical([true], "AND", true);
        testLogical([false], "AND", false);
        testLogical([true, false], "AND", false);
        testLogical([true, true, true], "AND", true);
        testLogical([false, false, false], "AND", false);
        testLogical([], "AND", false);
        
        testLogical([true], "OR", true);
        testLogical([false], "OR", false);
        testLogical([true, false], "OR", true);
        testLogical([true, true, true], "OR", true);
        testLogical([false, false, false], "OR", false);
        testLogical([], "OR", false);
    });
    
    permissionsTest.test("cspace.permissions.resolve", function() {
        function testResolve(options, result) {
            jqUnit.assertEquals(JSON.stringify(options) + ": ",
                result, cspace.permissions.resolve($.extend(true, {permissions: cspace.tests.sampleUserPerms}, options)));
        }
        testResolve({permission: "read", oneOf: "person"}, true);
        testResolve({permission: "read", oneOf: ["person", "loanout", "loanin"]}, true);
        testResolve({permission: "read", oneOf: ["person", "loanout", "loanin", "quilts"]}, true);
        testResolve({permission: "read", oneOf: ["person", "loanout", "loanin", "acquisition"]}, true);
        testResolve({permission: "read", allOf: "person"}, true);
        testResolve({permission: "read", allOf: ["person", "loanout", "loanin"]}, true);
        testResolve({permission: "read", allOf: ["person", "loanout", "loanin", "quilts"]}, false);
        testResolve({permission: "read", allOf: ["person", "loanout", "loanin", "acquisition"]}, false);
        
        testResolve({permission: "golf", oneOf: ["person", "loanout", "loanin", "acquisition"]}, false);
        testResolve({permission: "golf", allOf: ["person", "loanout", "loanin", "acquisition"]}, false);
    });
    
    permissionsTest.test("cspace.permissions.resolveMultiple", function() {
        function testResolve(options, result) {
            jqUnit.assertEquals(JSON.stringify(options) + ": ",
                result, cspace.permissions.resolveMultiple($.extend(true, {permissions: cspace.tests.sampleUserPerms}, options)));
        }
        testResolve({allOf: [{oneOf: ["loanout", "movement"], permission: "update"}, {target: "cataloging", permission: "update"}]}, true);
        testResolve({allOf: [{oneOf: ["loanout", "movement"], permission: "update"}, {target: "loanin", permission: "update"}]}, false);
        testResolve({allOf: [{oneOf: ["loanin", "movement"], permission: "update"}, {target: "cataloging", permission: "update"}]}, true);
        testResolve({allOf: [{allOf: ["loanin", "movement"], permission: "update"}, {target: "cataloging", permission: "update"}]}, false);
        testResolve({allOf: [{oneOf: ["loanin", "acquisition"], permission: "update"}, {target: "cataloging", permission: "update"}]}, false);
        testResolve({target: [{oneOf: ["loanout", "movement"], permission: "update"}, {target: "cataloging", permission: "update"}]}, true);
        testResolve({allOf: [{oneOf: ["loanout", "movement"], permission: "update"}, {target: "cataloging", permission: "update"}, 
            {allOf: [{allOf: ["person", "organization"], permission: "read"}, {target: "cataloging", permission: "delete"}]}]}, true);
        testResolve({allOf: [{oneOf: ["loanout", "movement"], permission: "update"}, {target: "cataloging", permission: "update"}, 
            {allOf: [{allOf: ["person", "acquisition"], permission: "read"}, {target: "cataloging", permission: "delete"}]}]}, false);
    });
    
    permissionsTest.test("cspace.permissions.manager", function () {
        expect(14);        
        var manager = cspace.permissions.manager({permissions: cspace.tests.sampleUserPerms});
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