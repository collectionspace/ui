/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

var utilitiesTester = function ($) {
    
    var uispec, expectedBase;
    
    var repeatable = {
        decorators: [
            {
                func: "cspace.makeRepeatable",
                type: "fluid",
                options: {
                    "elPath": "fields.responsibleDepartments",
                    "protoTree": {
                        ".csc-object-identification-other-number": "${fields.otherNumbers.0.otherNumber}",
                        ".csc-object-identification-other-number-type": {
                            optionnames: [
                                "Lender",
                                "Obsolete"
                            ],
                            optionlist: [
                                "lender",
                                "obsolete"
                            ],
                            selection: "${fields.otherNumbers.0.otherNumberType}" 
                        }
                    }
                }
            }
        ]
    };
    
    var nestedRepeatable = {
        decorators: [
            {
                func: "cspace.makeRepeatable",
                type: "fluid",
                options: {
                    "elPath": "fields.responsibleDepartments",
                    "protoTree": {
                        ".csc-object-identification-other-number": "${fields.otherNumbers.0.otherNumber.0.nestedNumber}",
                        ".csc-object-identification-other-number-type": {
                            optionnames: [
                                "Lender",
                                "Obsolete"
                            ],
                            optionlist: [
                                "lender",
                                "obsolete" 
                            ],
                            selection: "${fields.otherNumbers.0.otherNumber.0.nestedNumberType}"
                        }
                    }
                }
            }
        ]
    };
    
    var utilitiesTest = new jqUnit.TestCase("Utilities Tests", function () {
        cspace.util.isTest = true;
        uispec = {
            recordEditor: {}
        };        
        expectedBase = {            
            fields: {                
                otherNumbers: []
            }
        };
    });
    
    utilitiesTest.test("Test cspace.util.createEmptyModel simple", function () {
        uispec.recordEditor[".csc-object-identification-responsible-department"] = repeatable;
        var model = {};
        cspace.util.createEmptyModel(model, uispec);
        jqUnit.assertDeepEq("Given uispec with repeatable, model is build with proper array property", 
            expectedBase, model);
    });
    utilitiesTest.test("Test cspace.util.createEmptyModel nested", function () {
        uispec.recordEditor[".csc-object-identification-responsible-department"] = repeatable;        
        var protoTree = uispec.recordEditor[".csc-object-identification-responsible-department"].decorators[0].options.protoTree;
        protoTree[".csc-test-nested"] = nestedRepeatable;
        expectedBase.fields.otherNumbers.push({
            otherNumber: []
        });
        var model = {};
        cspace.util.createEmptyModel(model, uispec);
        jqUnit.assertDeepEq("Given uispec with nested repeatable, model is build with proper array property", 
            expectedBase, model);
    });
};

(function () {
    utilitiesTester(jQuery);
}());