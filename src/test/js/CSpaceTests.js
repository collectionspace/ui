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
   
cspace.tests.sampleUserPerms = {
        "person": ["create", "read", "update", "delete", "list"],
        "loanout": ["create", "read", "update", "delete", "list"],
        "loanin": ["read", "list"],
        "acquisition": [],
        "organization": ["create", "read", "update", "delete", "list"],
        "movement": ["create", "read", "update", "delete", "list"],
        "cataloging": ["create", "read", "update", "delete", "list"]
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
