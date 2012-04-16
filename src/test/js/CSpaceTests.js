/*
Copyright 2010 

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, fluid*/
"use strict";

// Include this file before Utilities.js in any CSpace tests

fluid.registerNamespace("cspace.util");

cspace.util.isTest = true;

fluid.staticEnvironment.cspaceTests = fluid.typeTag("cspace.test");

fluid.registerNamespace("cspace.tests");

cspace.tests.sampleSchema = {
    "recordtypes": {
        "type": "object",
        "properties": {
            "vocabularies": {
                "default": [
                    "person",
                    "organization",
                    "concept"
                ],
                "type": "array"
            },
            "cataloging": {
                "default": [
                    "cataloging"
                ],
                "type": "array"
            },
            "procedures": {
                "default": [
                    "intake",
                    "loanin",
                    "loanout",
                    "acquisition",
                    "movement",
                    "objectexit",
                    "media"
                ],
                "type": "array"
            }
        }
    },
    "recordlist": {
        "default": [
            "person",
            "intake",
            "loanin",
            "loanout",
            "acquisition",
            "organization",
            "concept",
            "cataloging",
            "movement",
            "objectexit",
            "media"
        ],
        "type": "array"
    }
};
   
cspace.tests.sampleUserPerms = {
        "person": ["create", "read", "update", "delete", "list"],
        "loanout": ["create", "read", "update", "delete", "list"],
        "loanin": ["read", "list"],
        "acquisition": [],
        "organization": ["create", "read", "update", "delete", "list"],
        "concept": ["create", "read", "update", "delete", "list"],
        "movement": ["create", "read", "update", "delete", "list"],
        "cataloging": ["create", "read", "update", "delete", "list"],
        "media": ["create", "read", "update", "delete", "list"],
        "users": ["create", "read", "update", "delete", "list"]
};

cspace.tests.fullPerms = {
        "cataloging": ["create", "read", "update", "delete", "list"],
        "intake": ["create", "read", "update", "delete", "list"],
        "acquisition": ["create", "read", "update", "delete", "list"],
        "loanout": ["create", "read", "update", "delete", "list"],
        "loanin": ["create", "read", "update", "delete", "list"],
        "movement": ["create", "read", "update", "delete", "list"],
        "objectexit": ["create", "read", "update", "delete", "list"],
        "person": ["create", "read", "update", "delete", "list"],
        "organization": ["create", "read", "update", "delete", "list"],
        "concept": ["create", "read", "update", "delete", "list"],
        "media": ["create", "read", "update", "delete", "list"],
        "users": ["create", "read", "update", "delete", "list"]
};

cspace.tests.userLogin = {
    permissions: cspace.tests.sampleUserPerms,
    userId: "admin@collectionspace.org",
    screenName: "admin@collectionspace.org",
    login: true,
    csid: "d4f9f4a8-c1a1-49a3-9414-b20fe7aef0b0"
};

cspace.tests.filterToKeys = function(toFilter, keyHolder) {
    return fluid.remove_if(jQuery.extend({}, toFilter), function(value, key) {
        return !keyHolder[key];
    });
};

cspace.tests.getPageBuilderIO = function (globalSetup, index) {
    index = index || 0;
    var counter = 0; 
    return fluid.find(globalSetup, function (component, name) {
        if (name.indexOf("pageBuilderIO") > -1) {
            if (counter === index) {
                return component;
            }
            ++counter;
        }
    });
};

cspace.tests.testEnvironment = function(options) {
    var that = fluid.initLittleComponent("cspace.tests.testEnvironment", options);
    that.environment = {};

    var withResources = function(callback) {
        fluid.fetchResources({}, callback, {amalgamateClasses: ["fastResource", "slowTemplate", "fastTemplate"]});
    };
    withResources(function() {
        fluid.initDependents(that);
        that.environment = cspace.tests.filterToKeys(that, that.options.components);
    });

    that.test = function(message, func) {
        withResources(function() {
            that.options.testCase.test(message, function() {
                fluid.withEnvironment(that.environment, func);
            });
        });
    };
    
    that.asyncTest = function(message, func) {
        withResources(function() {
            that.options.testCase.asyncTest(message, function() {
                fluid.withEnvironment(that.environment, func);
            });
        });
    };
    
    return that;
};

/* Automatically construct a "test harness environment" composed from a set of
subcomponents, in order to properly contextualise tests which require environmental
resolution, without bringing in the whole of pageBuilder as a component root */ 

fluid.defaults("cspace.tests.testEnvironment", {
    gradeNames: "fluid.modelComponent",
    mergePolicy: {
        permissions: "replace",
        schema: "replace",
        testCase: "nomerge"
    },
    permissions: cspace.tests.sampleUserPerms,
    schema: cspace.tests.sampleSchema,
    components: {
        permissionsResolver: {
            type: "cspace.permissions.resolver",
            options: {
                permissions: "{testEnvironment}.options.permissions"
            }
        },
        relationResolver: {
            type: "cspace.util.relationResolver"
        },
        recordTypeManager: {
            type: "cspace.recordTypeManager"
        },
        globalBundle: {
            type: "cspace.globalBundle"
        },
        globalNavigator: {
            type: "cspace.util.globalNavigator",
        },
        userLogin: {
            type: "cspace.util.login",
        },
        recordTypes: {
            type: "cspace.recordTypes",
            options: {
                schema: "{testEnvironment}.options.schema"
            }
        },
        loadingIndicator: {
            type: "cspace.util.loadingIndicator"
        },
        messageBar: {
            type: "cspace.messageBar"
        }
    }
});

fluid.defaults("cspace.tests.modelHolder", {
    gradeNames: ["fluid.modelComponent", "autoInit"],
    model: "{testEnvironment}.options.model",
    applier: "{testEnvironment}.options.applier"
});