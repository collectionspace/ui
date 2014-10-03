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
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 0
                                }
                            }
                        },
                        "persontest1": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 1
                                }
                            }
                        },
                        "persontest2": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 2
                                }
                            }
                        },
                        "ulan_pa": {
                            "properties": {
                                "nptAllowed": {
                                    "default": false,
                                    "type": "boolean"
                                },
                                "order": {
                                    "type": "number",
                                    "default": 3
                                }
                            },
                            "type": "object"
                        }
                    },
                    "type": "object"
                },
                "concept": {
                    "properties": {
                        "concept": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 2
                                }
                            }
                        },
                        "activity": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 1
                                }
                            }
                        },
                        "material": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 0
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
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 0
                                }
                            }
                        },
                        "placetest1": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 1
                                }
                            }
                        },
                        "placetest2": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 2
                                }
                            }
                        }
                    },
                    "type": "object"
                },
                "work": {
                    "properties": {
                        "work": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 0
                                }
                            }
                        },
                        "cona_work": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 1
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
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 0
                                }
                            }
                        },
                        "organizationtest": {
                            "type": "object",
                            "properties": {
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 1
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
                                "nptAllowed": {
                                    "type": "boolean",
                                    "default": true
                                },
                                "order": {
                                    "type": "number",
                                    "default": 0
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
        "conditioncheck": ["create", "read", "update", "delete", "list"],
        "organization": ["create", "read", "update", "delete", "list"],
        "place": ["create", "read", "update", "delete", "list"],
        "work": ["create", "read", "update", "delete", "list"],
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
    
    var recordSortingTest = function(options) {
        utilitiesTest.test("cspace.recordTypes", function () {
            var recTypes = cspace.recordTypes({
                schema: cspace.tests.sampleSchema,
                sortRecords: options.sortRecords
            });
            
            fluid.each(options.recordTypes, function(values, name) {
                jqUnit.assertDeepEq(name + " should contain", values, recTypes[name]);
            });
        });
    };

    fluid.each([{
        sortRecords: null,
        recordTypes: {
            "all": [
                "person",
                "intake",
                "loanin",
                "loanout",
                "conditioncheck",
                "acquisition",
                "organization",
                "place",
                "work",
                "concept",
                "cataloging",
                "movement",
                "objectexit",
                "media"
            ],
            "cataloging": ["cataloging"],
            "procedures": [
                "intake",
                "loanin",
                "loanout",
                "conditioncheck",
                "acquisition",
                "movement",
                "objectexit",
                "media"
            ],
            "vocabularies": [
                "person",
                "organization",
                "place",
                "work",
                "concept"
            ]
        }
    }, {
        recordTypes: {
            "all": [
                "person",
                "intake",
                "loanin",
                "loanout",
                "conditioncheck",
                "acquisition",
                "organization",
                "place",
                "work",
                "concept",
                "cataloging",
                "movement",
                "objectexit",
                "media"
            ],
            "cataloging": ["cataloging"],
            "procedures": [
                "intake",
                "loanin",
                "loanout",
                "conditioncheck",
                "acquisition",
                "movement",
                "objectexit",
                "media"
            ],
            "vocabularies": [
                "person",
                "organization",
                "place",
                "work",
                "concept"
            ]
        }
    }, {
        sortRecords: ["cataloging", "procedures", "vocabularies"],
        recordTypes: {
            "all": [
                "person",
                "intake",
                "loanin",
                "loanout",
                "conditioncheck",
                "acquisition",
                "organization",
                "place",
                "work",
                "concept",
                "cataloging",
                "movement",
                "objectexit",
                "media"
            ],
            "cataloging": ["cataloging"],
            "procedures": [
                "acquisition",
                "conditioncheck",
                "intake",
                "loanin",
                "loanout",
                "media",
                "movement",
                "objectexit"
            ],
            "vocabularies": [
                "concept",
                "organization",
                "person",
                "place",
                "work"
            ]
        }
    }], function (test) {
        recordSortingTest(test);
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
            "work": "work",
            "organization": "organization",
            "location": "location"
        }, vocab.authorities);

        jqUnit.assertDeepEq("Person vocabs", {
            person: "person",
            persontest1: "persontest1",
            persontest2: "persontest2",
            ulan_pa: "ulan_pa"
        }, vocab.authority.person.vocabs);

        jqUnit.assertDeepEq("Person nptAllowed vocabs", {
            person: true,
            persontest1: true,
            persontest2: true,
            ulan_pa: false
        }, vocab.authority.person.nptAllowed.vocabs);

        jqUnit.assertDeepEq("Person order vocabs", [
            "person", "persontest1", "persontest2", "ulan_pa"
        ], vocab.authority.person.order.vocabs);

        jqUnit.assertDeepEq("Person order vocabs", [
            "material", "activity", "concept"
        ], vocab.authority.concept.order.vocabs);

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
        jqUnit.assertEquals("Resolve namespace", "work", cspace.vocab.resolve({
            recordType: "work",
            vocab: vocab
        }));
        jqUnit.assertUndefined("Resolve namespace", cspace.vocab.resolve({
            recordType: "objectexit",
            vocab: vocab
        }));
    });

    utilitiesTest.test("New Super Applier", function () {
        expect(7);
        var one = {
                field1: "field1",
                field2: "field2"
            },
            oneApplier = fluid.makeChangeApplier(one),
            two = {
                field3: "field3",
                field4: "field4"
            },
            twoApplier = fluid.makeChangeApplier(two);
        var togo = fluid.assembleModel({
            one: {
                model: one,
                applier: oneApplier
            },
            two: {
                model: two,
                applier: twoApplier
            }
        });
        jqUnit.assertDeepEq("Combined model should be", {
            one: {
                field1: "field1",
                field2: "field2"
            },
            two: {
                field3: "field3",
                field4: "field4"
            }
        }, togo.model);
        togo.applier.requestChange("one.field2", "NEW");
        togo.applier.requestChange("two.field3", "NEW");
        jqUnit.assertEquals("Model should be updated", "NEW", togo.model.one.field2);
        jqUnit.assertEquals("Model should be updated", "NEW", togo.model.two.field3);
        togo.applier.modelChanged.addListener("one.field1", function () {
            jqUnit.assertEquals("Model should be updated", "NEW", togo.model.one.field1);
        });
        togo.applier.modelChanged.addListener("two.field4", function () {
            jqUnit.assertEquals("Model should be updated", "NEW", togo.model.two.field4);
        });
        togo.applier.requestChange("one.field1", "NEW");
        togo.applier.requestChange("two.field4", "NEW");
        jqUnit.assertDeepEq("Combined model should be", {
            one: {
                field1: "NEW",
                field2: "NEW"
            },
            two: {
                field3: "NEW",
                field4: "NEW"
            }
        }, togo.model);
        togo.applier.modelChanged.addListener("three.field5", function () {
            jqUnit.assertEquals("Model should be updated", "NEW", togo.model.three.field5);
        });
        var three = {
            field5: "field5"
        }, threeApplier = fluid.makeChangeApplier(three);
        fluid.attachModel(togo.model, "three", three);
        togo.applier.addSubApplier("three", threeApplier);
        togo.applier.requestChange("three.field5", "NEW");

        togo.applier.modelChanged.addListener("four.field6", function () {
            jqUnit.assertTrue("This test should never run", false);
        }, "toRemove");
        var four = {
            field6: "field6"
        }, fourApplier = fluid.makeChangeApplier(four);
        togo.applier.modelChanged.removeListener("toRemove");
        fluid.attachModel(togo.model, "four", four);
        togo.applier.addSubApplier("four", fourApplier);
        togo.applier.requestChange("four.field6", "NEW");
    });
    
    /* autoLogout testing sets */
    cspace.autoLogout.testWarnUser = function () {
        jqUnit.assertTrue("We are going to show some warning here", true);
    };
    
    cspace.autoLogout.testProcessLoginStatus = function (that) {
        jqUnit.assertTrue("We are going to do some model processing here", true);
        that.options.loginExpiryTime = that.model.maxInterval;
    };
    
    cspace.autoLogout.testLogoutUser = function (that) {
        jqUnit.assertTrue("We are going to logout user here", true);
        start();
    };
    
    utilitiesTest.asyncTest("Autologout component with default settings. Should not do anything and should be running without errors.", function () {
        expect(0);
        var options = {
                invokers: {
                    logoutUser: {
                        funcName: "cspace.autoLogout.testLogoutUser"
                    }
                },
                loginExpiryTime: null,
                loginExpiryNotificationTime: null
            },
            autoLogout = cspace.autoLogout(options);
        start();
    });
    
    utilitiesTest.asyncTest("Autologout component which does not have warning function but has warning time set.", function () {
        expect(1);
        var waitTime = 0.002,
            options = {
                invokers: {
                    logoutUser: {
                        funcName: "cspace.autoLogout.testLogoutUser"
                    }
                },
                loginExpiryTime: waitTime,
                loginExpiryNotificationTime: waitTime - 0.001
            },
            autoLogout = cspace.autoLogout(options);
            
        autoLogout.applier.requestChange("", {
            maxInterval: waitTime
        });
    });
    
    utilitiesTest.asyncTest("Autologout component which does not have warning time but has warning function set.", function () {
        expect(1);
        var waitTime = 0.002,
            options = {
                invokers: {
                    logoutUser: {
                        funcName: "cspace.autoLogout.testLogoutUser"
                    },
                    warnUser: {
                        funcName: "cspace.autoLogout.testWarnUser"
                    }
                },
                loginExpiryTime: waitTime,
                loginExpiryNotificationTime: null
            },
            autoLogout = cspace.autoLogout(options);
            
        autoLogout.applier.requestChange("", {
            maxInterval: waitTime
        });
    });
    
    utilitiesTest.asyncTest("Autologout component test without processModel.", function () {
        expect(2);
        var waitTime = 0.002,
            options = {
                invokers: {
                    logoutUser: {
                        funcName: "cspace.autoLogout.testLogoutUser"
                    },
                    warnUser: {
                        funcName: "cspace.autoLogout.testWarnUser"
                    }
                },
                loginExpiryTime: waitTime,
                loginExpiryNotificationTime: waitTime - 0.001
            },
            autoLogout = cspace.autoLogout(options);
            
        autoLogout.applier.requestChange("", {
            maxInterval: waitTime
        });
    });
    
    utilitiesTest.asyncTest("Autologout component test with all invokers set.", function () {
        expect(4);
        var waitTime = 0.002,
            options = {
                invokers: {
                    logoutUser: {
                        funcName: "cspace.autoLogout.testLogoutUser"
                    },
                    warnUser: {
                        funcName: "cspace.autoLogout.testWarnUser"
                    },
                    processModel: {
                        funcName: "cspace.autoLogout.testProcessLoginStatus",
                        args: ["{autoLogout}"]
                    }
                },
                loginExpiryNotificationTime: waitTime - 0.001
            },
            autoLogout = cspace.autoLogout(options);
            
        autoLogout.applier.requestChange("", {
            maxInterval: waitTime
        });
    });
    /* autoLogout testing sets */
};

(function () {
    utilitiesTester(jQuery);
}());
