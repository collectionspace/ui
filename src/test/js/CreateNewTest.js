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
        createNewPage.locate("category:").each(function(index, elem) {
            jqUnit.assertTrue("Checking style of category "+index, $(elem).hasClass(createNewPage.options.styles["category"+(index+1)]));           
        });
    };
    
    var bareCreateNewTest = new jqUnit.TestCase("Create New Tests");
    
    var createNewTest = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: cspace.tests.sampleUserPerms
    });
    
    var setupCreateNew = function (options) {
        return cspace.createNew(container, options);
    };
    
    createNewTest.test("All headers and records shown", function () {
        var createNewPage = setupCreateNew();
        jqUnit.assertEquals("Number of headers shown:", 3, createNewPage.locate("categoryHeader").length);
        jqUnit.assertEquals("Number of records shown ", 5, createNewPage.locate("radio").length);
        //styling:
        assertStyling(createNewPage, createNewPage.options.styles.totalOf3);        
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
    
    createNewTestLessPerms.test("Hiding Records", function () {
        var createNewPage = setupCreateNew();
        jqUnit.assertEquals("All headers shown:", 3, createNewPage.locate("categoryHeader").length);
        jqUnit.assertEquals("Number of records shown ", 5, createNewPage.locate("radio").length);
        //acquisition:
        var str = createNewPage.options.strings.acquisition;
        jqUnit.assertTrue("Aquisition ("+str+") not shown", $('label:contains("'+str+'")').length < 1);
        str = createNewPage.options.strings.movement;
        jqUnit.assertTrue("Movement ("+str+") not shown", $('label:contains("'+str+'")').length < 1);
        str = createNewPage.options.strings.loanin;
        jqUnit.assertTrue("Loan In ("+str+") not shown", $('label:contains("'+str+'")').length < 1);
        str = createNewPage.options.strings.intake;
        jqUnit.assertTrue("Intake ("+str+") shown", $('label:contains("'+str+'")').length == 1);
        str = createNewPage.options.strings.loanout;
        jqUnit.assertTrue("Loan out ("+str+") shown", $('label:contains("'+str+'")').length == 1);
        //styling:
        assertStyling(createNewPage, createNewPage.options.styles.totalOf3);
    });
    
    var lessCategories = {};
    fluid.model.copyModel(lessCategories, cspace.tests.sampleUserPerms);
    lessCategories.cataloging = [];
    lessCategories.person = [];
    lessCategories.organization = [];
    
    var createNewTestOneCategories = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: lessCategories
    });
    
    createNewTestOneCategories.test("Categories Rendering", function () {
        var createNewPage = setupCreateNew();
        jqUnit.assertEquals("Number of headers shown:", 1, createNewPage.locate("categoryHeader").length);
        //styling:
        assertStyling(createNewPage, createNewPage.options.styles.totalOf1);  
    });
    
    lessCategories.person = ["create", "read", "update", "delete", "list"];
    
    var createNewTestTwoCategories = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: lessCategories
    });
    
    createNewTestTwoCategories.test("Two Categories styling", function () {
        var createNewPage = setupCreateNew();
        jqUnit.assertEquals("Number of headers shown:", 2, createNewPage.locate("categoryHeader").length);
        assertStyling(createNewPage, createNewPage.options.styles.totalOf2);
    });
    
    lessCategories.person = [];
    lessCategories.loanout = [];
    lessCategories.loanin = [];
    lessCategories.movement = [];
    
    
    var createNewTestOneCategories = cspace.tests.testEnvironment({
        testCase: bareCreateNewTest,
        permissions: lessCategories
    });
    
    createNewTestOneCategories.test("No Categories", function () {
        var createNewPage = setupCreateNew();
        jqUnit.assertEquals("Number of headers shown", 0, createNewPage.locate("categoryHeader").length);
        jqUnit.notVisible("Create button should be invisible", createNewPage.locate("createButton"));  
    });
};

(function () {
    createNewTester(jQuery);
}());