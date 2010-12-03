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
    
    fluid.demands("cspace.createNew", "cspace.test", [container, fluid.COMPONENT_OPTIONS]);
    
    var fetchPermissionsAndTest = function(url, testCallback) {
        fluid.fetchResources({ 
            permissions: {
                href: url,
                options: {
                    dataType: "json"
                }               
            }
         }, function (resourceSpecs) {
             testCallback(resourceSpecs.permissions.resourceText.permissions);
             start();
         });
         stop();
    };
    
    var assertStyling = function(createNewPage, outerStyle) {
        jqUnit.assertTrue("Checking if container styled as "+outerStyle, createNewPage.locate("categories").hasClass(outerStyle));
        createNewPage.locate("category:").each(function(index, elem) {
            jqUnit.assertTrue("Checking style of category "+index, $(elem).hasClass(createNewPage.options.styles["category"+(index+1)]));           
        });
    };
        
    var createNewTest = new jqUnit.TestCase("CreateNew Tests");
    
    var createNew = function (options) {
        options = options || {};
        options.resolverGetConfig = options.resolverGetConfig ||
        [cspace.util.censorWithSchemaStrategy({
            permissions: options.permissions,
            operations: ["create", "update", "delete"],
            method: "OR"
        })];
        return fluid.invoke("cspace.createNew", [options]);
    };
    
    createNewTest.test("All headers and records shown", function () {
        var createNewPage = createNew();
        createNewPage.refreshView();
        jqUnit.assertEquals("Number of headers shown:", 3, createNewPage.locate("categoryHeader").length);
        jqUnit.assertEquals("Number of records shown ", 9, createNewPage.locate("radio").length);
        //styling:
        assertStyling(createNewPage, createNewPage.options.styles.totalOf3);        
    });
    
    createNewTest.test("Hiding Records", function () {
        fetchPermissionsAndTest("../../main/webapp/html/data/login/status.json", function (permissions) {
            //remove permissions from first, middle and last record of procedures:
            permissions.acquisition = [];
            permissions.loanin = [];
            permissions.movement = [];
        
            var createNewPage = createNew({
                permissions: permissions
            });
            createNewPage.refreshView();

            jqUnit.assertEquals("All headers shown:", 3, createNewPage.locate("categoryHeader").length);
            jqUnit.assertEquals("Number of records shown ", 6, createNewPage.locate("radio").length);
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
    });
    
    createNewTest.test("Categories Rendering", function () {
        fetchPermissionsAndTest("../../main/webapp/html/data/login/status.json", function (permissions) {
            permissions.cataloging = [];
            permissions.person = [];
            permissions.organization = [];
    
            var createNewPage = createNew({
                permissions: permissions
            });
            createNewPage.refreshView();
    
            jqUnit.assertEquals("Number of headers shown:", 1, createNewPage.locate("categoryHeader").length);
            //styling:
            assertStyling(createNewPage, createNewPage.options.styles.totalOf1);  
        });
    });
    
    createNewTest.test("Two Categories styling", function () {
        fetchPermissionsAndTest("../../main/webapp/html/data/login/status.json", function (permissions) {
            permissions.cataloging = [];
            
            var createNewPage = createNew({
                permissions: permissions
            });
            createNewPage.refreshView();
    
            assertStyling(createNewPage, createNewPage.options.styles.totalOf2);  
        });
    });
};

(function () {
    createNewTester(jQuery);
}());