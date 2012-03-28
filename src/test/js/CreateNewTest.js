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

var createNewTester = function ($) {
    
    var container = "#main";
    
    var assertStyling = function(createNewPage, outerStyle) {
        jqUnit.assertTrue("Checking if container styled as "+outerStyle, createNewPage.locate("categories").hasClass(outerStyle));
        createNewPage.locate("category").each(function(index, elem) {
            jqUnit.assertTrue("Checking style of category "+index, $(elem).hasClass(createNewPage.options.styles["category"+(index+1)]));           
        });
    };
    
    var bareCreateNewTest = new jqUnit.TestCase("Create New Tests");
    
    var createNewTest = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: cspace.tests.sampleUserPerms
    });
    
    var setupCreateNew = function (options, callback) {
        var options = options || {};
        fluid.merge(null, options, {
            listeners: {
                onReady: callback
            }
        });
        return cspace.createNew(container, options);
    };
    
    createNewTest.asyncTest("All headers and records shown", function () {
        var callback = function (createNewPage) {
            jqUnit.assertEquals("Number of headers shown:", 3, createNewPage.locate("categoryHeader").length);
            jqUnit.assertEquals("Number of records shown ", 7, $(".csc-createNew-recordRadio", createNewPage.container).length);
            //styling:
            assertStyling(createNewPage, createNewPage.options.styles.totalOf3);
            start();
        };
        setupCreateNew(null, callback);
    });
    
    var lessPermissions = {};
    fluid.model.copyModel(lessPermissions, cspace.tests.sampleUserPerms);
    lessPermissions.loanin = [];
    lessPermissions.movement = [];
    lessPermissions.intake = ["create", "read", "update", "delete", "list"];
    
    var createNewTestLessPerms = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: lessPermissions
    });
    
    createNewTestLessPerms.asyncTest("Hiding Records", function () {
        var callback = function (createNewPage) {
            jqUnit.assertEquals("All headers shown:", 3, createNewPage.locate("categoryHeader").length);
            jqUnit.assertEquals("Number of records shown ", 7, $(".csc-createNew-recordRadio", createNewPage.container).length);
            //acquisition:
            var str = createNewPage.options.parentBundle.messageBase.acquisition;
            jqUnit.assertTrue("Aquisition ("+str+") not shown", $('label:contains("'+str+'")').length < 1);
            str = createNewPage.options.parentBundle.messageBase.movement;
            jqUnit.assertTrue("Movement ("+str+") not shown", $('label:contains("'+str+'")').length < 1);
            str = createNewPage.options.parentBundle.messageBase.loanin;
            jqUnit.assertTrue("Loan In ("+str+") not shown", $('label:contains("'+str+'")').length < 1);
            str = createNewPage.options.parentBundle.messageBase.intake;
            jqUnit.assertTrue("Intake ("+str+") shown", $('label:contains("'+str+'")').length == 1);
            str = createNewPage.options.parentBundle.messageBase.loanout;
            jqUnit.assertTrue("Loan out ("+str+") shown", $('label:contains("'+str+'")').length == 1);
            //styling:
            assertStyling(createNewPage, createNewPage.options.styles.totalOf3);
            start();
        };
        setupCreateNew(null, callback);
    });
    
    var lessCategories = {};
    fluid.model.copyModel(lessCategories, cspace.tests.sampleUserPerms);
    lessCategories.cataloging = [];
    lessCategories.person = [];
    lessCategories.organization = [];
    lessCategories.place = [];
    
    var createNewTestOneCategories = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: lessCategories
    });
    
    createNewTestOneCategories.asyncTest("Categories Rendering", function () {
        var callback = function (createNewPage) {
            jqUnit.assertEquals("Number of headers shown:", 1, createNewPage.locate("categoryHeader").length);
            //styling:
            assertStyling(createNewPage, createNewPage.options.styles.totalOf1);  
            start();
        };
        setupCreateNew(null, callback);
    });
    
    lessCategories.person = ["create", "read", "update", "delete", "list"];
    
    var createNewTestTwoCategories = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: lessCategories
    });
    
    createNewTestTwoCategories.asyncTest("Two Categories styling", function () {
        var callback = function (createNewPage) {
            jqUnit.assertEquals("Number of headers shown:", 2, createNewPage.locate("categoryHeader").length);
            assertStyling(createNewPage, createNewPage.options.styles.totalOf2);
            start();
        };
        setupCreateNew(null, callback);
    });
    
    lessCategories.person = [];
    lessCategories.loanout = [];
    lessCategories.loanin = [];
    lessCategories.movement = [];
    lessCategories.media = [];
    
    
    var createNewTestNoCategories = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: lessCategories
    });
    
    createNewTestNoCategories.asyncTest("No Categories", function () {
        var callback = function (createNewPage) {
            jqUnit.assertEquals("Number of headers shown", 0, createNewPage.locate("categoryHeader").length);
            jqUnit.notVisible("Create button should be invisible", createNewPage.locate("createButton"));  
            start();
        };
        setupCreateNew(null, callback);
    });

    // ----- Tests for header/menu-item: -------
    var setupHeader = function (options) {
        return cspace.header(container, options);
    };

    createNewTestNoCategories.test("Menu item hidden when no create permissions", function() {
        var header = setupHeader();
        jqUnit.assertTrue("The Create new menu item is not rendered",  header.locate("label").filter(':contains("'+header.options.strings.createNew+'")').length < 1);
    });

    createNewTestOneCategories.test("Menu item shown with at least one create permissions", function() {
        var header = setupHeader();
        jqUnit.assertTrue("The Create new menu item is rendered",  header.locate("label").filter(':contains("'+header.options.parentBundle.messageBase["menuItems-createNew"]+'")').length > 0);
    });
};

(function () {
    createNewTester(jQuery);
}());