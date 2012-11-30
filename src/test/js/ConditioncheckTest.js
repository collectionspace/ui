/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, cspace, start, stop */
"use strict";

var conditioncheckTester = function () { 

    var bareConditioncheckTests = new jqUnit.TestCase("Conditioncheck Tests", function () {
        cspace.util.isTest = true;
        bareConditioncheckTests.fetchTemplate("../../main/webapp/defaults/html/record.html", ".fl-container-1024");
    });
    
    var conditioncheckTests = cspace.tests.testEnvironment({testCase: bareConditioncheckTests});
    
    conditioncheckTests.asyncTest("Creation", function () {
        var opts = {
            configURL: "../../main/webapp/defaults/config/conditioncheck.json",
            pageBuilderIO: {
                options: {
                    listeners: {
                        "pageReady.conditioncheckCreationTest": function () {
                            jqUnit.assertValue("conditioncheck should have a record editor", cspace.tests.getPageBuilderIO(conditioncheck).pageBuilder.recordEditor);
                            start();
                        }
                    },
                    pageSpec: {
                        recordEditor: {
                            href: "../../main/webapp/defaults/html/pages/ConditioncheckTemplate.html"
                        }
                    }
                }
            }
        };
        var conditioncheck = cspace.globalSetup("cspace.record", opts);
    });
};

jQuery(document).ready(function () {
    conditioncheckTester();
});