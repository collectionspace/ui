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
    
    var bareTabsBoxTest = new jqUnit.TestCase("Tabs Tests");
    
    var tabsTest = cspace.tests.testEnvironment({
        testCase: bareTabsBoxTest,
        permissions: cspace.tests.sampleUserPerms
    });
    
    var setupTabs = function (options) {
        return cspace.tabs(container, options);
    };
    
    tabsTest.test("Initialization with restricted Loan In", function () {
        var tabs = setupTabs();
        jqUnit.assertEquals("Loainin tab must be excluded, total number of tabs is", 7, tabs.tabsList.locate("tab").length);
        jqUnit.assertEquals("Acquisition tab must be excluded", 0, tabs.tabsList.locate("tabLink").filter(":contains('Acquisition')").length);
    });
    
    var morePermissions = {};
    fluid.model.copyModel(morePermissions, cspace.tests.sampleUserPerms);
    morePermissions.acquisition = ["create", "read", "update", "delete", "list"];
    
    var tabsTestMorePerms = cspace.tests.testEnvironment({
        testCase: bareTabsBoxTest,
        permissions: morePermissions
    });
    
    tabsTestMorePerms.test("Initialization", function () {
        var tabs = setupTabs();
        jqUnit.assertEquals("Loainin tab must be excluded, total number of tabs is", 8, tabs.tabsList.locate("tab").length);
        jqUnit.assertEquals("Acquisition tab must be included", 1, tabs.tabsList.locate("tabLink").filter(":contains('Acquisition')").length);
    });
};

(function () {
    tabsTester(jQuery);
}());