/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var tabsTester = function ($) {
    
    var container = "#main";
    var permissions = {
        "users": ["create", "read", "update", "delete", "list"],
        "person": [],
        "location": ["create", "read", "update", "delete", "list"],
        "idgenerators": ["create", "read", "update", "delete", "list"],
        "loanin": [],
        "userrole": ["create", "read", "update", "delete", "list"],
        "loanout": ["create", "read", "update", "delete", "list"],
        "contact": ["create", "read", "update", "delete", "list"],
        "id": ["create", "read", "update", "delete", "list"],
        "acquisition": ["create", "read", "update", "delete", "list"],
        "organization": ["create", "read", "update", "delete", "list"],
        "locations": ["create", "read", "update", "delete", "list"],
        "movement": ["create", "read", "update", "delete", "list"],
        "role": ["create", "read", "update", "delete", "list"],
        "dimensions": ["create", "read", "update", "delete", "list"],
        "authorization/roles/accountroles": ["create", "read", "update", "delete", "list"],
        "cataloging": ["create", "read", "update", "delete", "list"],
        "objectexit": ["create", "read", "update", "delete", "list"],
        "vocabularyitems": ["create", "read", "update", "delete", "list"],
        "reports": ["create", "read", "update", "delete", "list"],
        "intake": ["create", "read", "update", "delete", "list"],
        "permrole": ["create", "read", "update", "delete", "list"],
        "organizations": ["create", "read", "update", "delete", "list"],
        "permission": ["create", "read", "update", "delete", "list"],
        "persons": ["create", "read", "update", "delete", "list"],
        "relations": ["create", "read", "update", "delete", "list"],
        "authorization/permissions/permroles": ["create", "read", "update", "delete", "list"],
        "vocab": ["create", "read", "update", "delete", "list"],
        "notes": ["create", "read", "update", "delete", "list"]
    };
    
    fluid.demands("tabsList", ["cspace.tabs", "cspace.test"], {
        funcName: "cspace.tabs.provideTabsList",
        args: ["{tabs}.options.selectors.tabsList", fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("cspace.tabs", "cspace.test", [container, fluid.COMPONENT_OPTIONS]);
    
    var tabsTest = new jqUnit.TestCase("Tabs Tests");
    
    var setupTabs = function (options) {
        options = options || {};
        fluid.merge(null, options, {
            permissions: options.permissions || permissions
        });
        return fluid.invoke("cspace.tabs", [options]);
    };
    
    tabsTest.test("Initialization", function () {
        var perms = {};
        fluid.model.copyModel(perms, permissions);
        perms.loanin = ["create", "read", "update", "delete", "list"];
        var tabs = setupTabs({
            permissions: perms
        });
        jqUnit.assertEquals("Loainin tab must be excluded, total number of tabs is", 9, tabs.tabsList.locate("tab:").length);
        jqUnit.assertEquals("Loainin tab must be excluded", 1, tabs.tabsList.locate("tabLink").filter(":contains('Loan In')").length);
    });
    tabsTest.test("Initialization with restricted Loan In", function () {
        var tabs = setupTabs();
        jqUnit.assertEquals("Loainin tab must be excluded, total number of tabs is", 8, tabs.tabsList.locate("tab:").length);
        jqUnit.assertEquals("Loainin tab must be excluded", 0, tabs.tabsList.locate("tabLink").filter(":contains('Loan In')").length);
    });
};

(function () {
    tabsTester(jQuery);
}());