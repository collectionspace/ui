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
                    "organization"
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
                    "objectexit"
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
            "cataloging",
            "movement",
            "objectexit"
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
        "movement": ["create", "read", "update", "delete", "list"],
        "cataloging": ["create", "read", "update", "delete", "list"]
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
        "organization": ["create", "read", "update", "delete", "list"]
};

fluid.demands("cspace.urlExpander", ["cspace.localData", "cspace.test"],
    {
    args: {
        vars: {
            chain: "..",
            webapp: "../../main/webapp"
        }
    }
});

cspace.tests.filterToKeys = function(toFilter, keyHolder) {
    return fluid.remove_if(jQuery.extend({}, toFilter), function(value, key) {
        return !keyHolder[key];
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
            that.options.testCase.test(message, 
                function() {fluid.withEnvironment(that.environment, func);}
                );
        });
    };
    
    return that;
};

/* Automatically construct a "test harness environment" composed from a set of
subcomponents, in order to properly contextualise tests which require environmental
resolution, without bringing in the whole of pageBuilder as a component root */ 

fluid.defaults("cspace.tests.testEnvironment", {
    mergePolicy: {
        permissions: "replace",
        schema: "replace"  
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
        recordTypeManager: {
            type: "cspace.recordTypeManager"
        },
        globalBundle: {
            type: "cspace.globalBundle"
        },
        globalNavigator: {
            type: "cspace.util.globalNavigator",
        },
        recordTypes: {
            type: "cspace.recordTypes",
            options: {
                schema: "{testEnvironment}.options.schema"
            }
        }
    }
});