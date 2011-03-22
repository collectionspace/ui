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
};

(function () {
    permissionsTester(jQuery);
}());