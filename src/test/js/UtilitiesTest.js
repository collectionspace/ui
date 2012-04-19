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
    
    var uispec, expectedBase, schema,
        namespaces = {
            "properties": {
                "person": {
                    "properties": {
                        "person": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        },
                        "persontest1": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        },
                        "persontest2": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        }
                    },
                    "type": "object"
                },
                "concept": {
                    "properties": {
                        "concept": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        },
                        "activity": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        },
                        "material": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        }
                    },
                    "type": "object"
                },
                "place": {
                    "properties": {
                        "place": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        },
                        "placetest1": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        },
                        "placetest2": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        }
                    },
                    "type": "object"
                },
                "organization": {
                    "properties": {
                        "organization": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        },
                        "organizationtest": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        }
                    },
                    "type": "object"
                },
                "location": {
                    "properties": {
                        "location": {
                            "type": "object",
                            "properties": {
                                "allowed": {
                                    "type": "boolean",
                                    "default": true
                                }
                            }
                        }
                    },
                    "type": "object"
                }
            },
            "type": "object"
        };
    
    var baserUtilitiesTest = new jqUnit.TestCase("Utilities Tests", function () {
        cspace.util.isTest = true;
        uispec = {
            recordEditor: {}
        };        
        expectedBase = {            
            fields: {                
                otherNumbers: []
            }
        };
        schema = {
            "fields": {
                "type": "object",
                "properties": {
                    "role": {
                        "type": "object",
                        "properties": {
                            "account": {
                                "type": "object"
                            },
                            "role": {
                                "type": "array",
                                "default": [{
                                    "roleName": "ROLE_ADMINISTRATOR",
                                    "roleId": "1",
                                    "roleGroup": "Museum staff",
                                    "roleAssigned": true
                                }]
                            }
                        }
                    }
                }
            }
        };
    });
    
    var utilitiesTest = cspace.tests.testEnvironment({testCase: baserUtilitiesTest});
    
    var setExpectedSchemaBasedModel = function () {
        expectedBase.fields = {
            role: {
                account: {},
                role: [{
                    "roleName": "ROLE_ADMINISTRATOR",
                    "roleId": "1",
                    "roleGroup": "Museum staff",
                    "roleAssigned": true
                }]
            }
        };
    };
    
    var perms = {
        "person": ["create", "read", "update", "delete", "list"],
        "loanout": ["create", "read", "update", "delete", "list"],
        "loanin": ["read", "list"],
        "acquisition": [],
        "organization": ["create", "read", "update", "delete", "list"],
        "place": ["create", "read", "update", "delete", "list"],
        "concept": ["create", "read", "update", "delete", "list"],
        "movement": ["create", "read", "update", "delete", "list"],
        "objectexit": ["create", "read", "update", "delete", "list"],
        "objects": ["create", "read", "update", "delete", "list"]
    };
    
    utilitiesTest.test("Full model from schema with getBeanValue", function () {        
        setExpectedSchemaBasedModel();
        var model = cspace.util.getBeanValue({}, "new", {
            "new": {
                type: "object",
                properties: schema
            }
        });
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase, model);
    });
    
    utilitiesTest.test("Model from schema with getBeanValue", function () {        
        setExpectedSchemaBasedModel();
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("Model from schema with getBeanValue empty array", function () {        
        setExpectedSchemaBasedModel();
        schema.fields.properties.role.properties.role = {
            type: "array"
        };
        expectedBase.fields.role.role = [];
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("Model from schema with getBeanValue with nesting", function () {
        schema.fields.properties.role.properties.newRoleArray = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    nestedRole: {
                        type: "array",
                        "default": [{
                            roleName: "ROLE_ADMINISTRATOR",
                            roleId: "1",
                            roleGroup: "Museum staff",
                            roleAssigned: true
                        }]
                    }
                }
            }
        };
        setExpectedSchemaBasedModel();
        expectedBase.fields.role.newRoleArray = [{
            nestedRole: [{
                roleName: "ROLE_ADMINISTRATOR",
                roleId: "1",
                roleGroup: "Museum staff",
                roleAssigned: true
            }]
        }];
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("Create a model from schema with simple defaults", function () {
        schema.fields.properties.newProperty = {
            type: "string",
            "default": "This is a default"
        };
        setExpectedSchemaBasedModel();        
        expectedBase.fields.newProperty = "This is a default";
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("Get a model with schema and existing model", function () {
        var model = {
            fields: {
                role: {
                    role: []
                }
            }
        }; 
        var fields = cspace.util.getBeanValue(model, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            model.fields, fields);
    });
    
    utilitiesTest.test("Create a model from schema with string fields", function () {
        schema.fields.properties.newProperty = {
            type: "string"
        };
        schema.fields.properties.newPropertyWithDefault = {
            type: "string",
            "default": "blabla"
        };
        setExpectedSchemaBasedModel();
        expectedBase.fields.newPropertyWithDefault = "blabla";
        var model = cspace.util.getBeanValue({}, "fields", schema);
        jqUnit.assertDeepEq("Given a schema, model is build with proper structure and defaults", 
            expectedBase.fields, model);
    });
    
    utilitiesTest.test("GetBeanValue inside the default in schema", function () {        
        setExpectedSchemaBasedModel();
        schema.fields.properties.role["default"] = {
            role: [{
                roleId: 1
            }]
        };
        var roleId = cspace.util.getBeanValue({}, "fields.role.role.0.roleId", schema);
        jqUnit.assertEquals("The correct value should be drawn from default", 1, roleId);
    });
    
    utilitiesTest.test("cspace.util.buildUrl", function () {        
        var args = [[
            "fetch", "base", "someType", "123", ""
        ], [
            "fetch", "base/", "someType", "123", ""
        ], [
            "fetch", "base/", "someType", "123", ".json"
        ], [
            "fetch", "base/", "someType"
        ], [
            "addRelations", "base/"
        ], [
            "addRelations", "base/", "ignore_stuff"
        ]];
        var expected = [
            "base/someType/123",
            "base/someType/123",
            "base/someType/123.json",
            "base/someType/",
            "base/relationships/",
            "base/relationships/"
        ];
        for (var i in args) {
            jqUnit.assertEquals("Built url value is equal to the expected", 
                expected[i], cspace.util.buildUrl.apply(null, args[i]));
        }
    });

    utilitiesTest.test("cspace.util.getDefaultSchemaURL", function () {
        cspace.util.getDefaultSchemaURL("intake");
        jqUnit.assertEquals("Default URL should be", "../uischema/intake.json", 
            fluid.invoke("cspace.util.getDefaultSchemaURL", "intake"));
    });
    
    utilitiesTest.test("cspace.util.urnToStringFieldConverter", function () {
        var selector = ".urnToStringTest";
        cspace.util.urnToStringFieldConverter(selector);
        jqUnit.assertEquals("Deurned text should be", "The Big Lebowsky", $(selector).text());
    });
    
    utilitiesTest.test("cspace.util.nameForValueFinder", function () {
        var selector = ".nameForValueFinderTest";
        cspace.util.nameForValueFinder(selector, {
            list: ["foo", "test"],
            names: ["FOO NAME", "TEST NAME"]
        });
        jqUnit.assertEquals("Value should be converted to the following text", "TEST NAME", $(selector).text());
    });
    
    utilitiesTest.test("cspace.recordTypes", function () {
        var recTypes = cspace.recordTypes({
            schema: cspace.tests.sampleSchema
        });
        jqUnit.assertDeepEq("all should contain", [
            "person",
            "intake",
            "loanin",
            "loanout",
            "acquisition",
            "organization",
            "place",
            "concept",
            "cataloging",
            "movement",
            "objectexit",
            "media"
        ], recTypes.all);
        jqUnit.assertDeepEq("cataloging should contain", [
            "cataloging"
        ], recTypes.cataloging);
        jqUnit.assertDeepEq("procedures should contain", [
            "intake",
            "loanin",
            "loanout",
            "acquisition",
            "movement",
            "objectexit",
            "media"
        ], recTypes.procedures);
        jqUnit.assertDeepEq("vocabularies should contain", [
            "person",
            "organization",
            "place",
            "concept"
        ], recTypes.vocabularies);
    });
    
    utilitiesTest.test("Loading Indicator basic", function () {
        var selector = ".loadingIndicator";
        var indicator = cspace.util.loadingIndicator(selector);
        jqUnit.notVisible("Indicator is invisible", indicator.indicator);
        indicator.events.showOn.fire();
        jqUnit.isVisible("Indicator is visible", indicator.indicator);
        indicator.events.hideOn.fire();
        jqUnit.notVisible("Indicator is invisible", indicator.indicator);
    });

    utilitiesTest.test("Vocab test", function () {
        var namespace = fluid.copy(namespaces);
        var vocab = cspace.vocab({
            schema: {
                namespaces: namespaces
            }
        });
        jqUnit.assertValue("Vocab component iniialized", vocab);

        jqUnit.assertDeepEq("Authorities", {
            "person": "person",
            "concept": "concept",
            "place": "place",
            "organization": "organization",
            "location": "location"
        }, vocab.authorities);

        jqUnit.assertDeepEq("Person vocabs", {
            person: "person",
            persontest1: "persontest1",
            persontest2: "persontest2"
        }, vocab.authority.person.vocabs);

        jqUnit.assertDeepEq("Person allowed vocabs", {
            person: true,
            persontest1: true,
            persontest2: true
        }, vocab.authority.person.allowed.vocabs);

        jqUnit.assertTrue("Person is default", vocab.isDefault("person"));
        jqUnit.assertFalse("Persontest1 is not default", vocab.isDefault("persontest1"));

        jqUnit.assertEquals("Resolve namespace", "person", cspace.vocab.resolve({
            model: {
                namespace: "person"
            },
            vocab: vocab
        }));
        jqUnit.assertEquals("Resolve namespace", "place", cspace.vocab.resolve({
            recordType: "place",
            vocab: vocab
        }));
        jqUnit.assertUndefined("Resolve namespace", cspace.vocab.resolve({
            recordType: "objectexit",
            vocab: vocab
        }));
    });
};

(function () {
    utilitiesTester(jQuery);
}());
