/*
Copyright 2010 

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

// Include this file before Utilities.js in any CSpace tests

fluid.registerNamespace("cspace.util");

cspace.util.isTest = true;

fluid.staticEnvironment.cspaceTests = fluid.typeTag("cspace.test");

fluid.registerNamespace("cspace.tests");

fluid.demands("cspace.urlExpander", "cspace.test", 
    {
    args: {
        vars: {
            webapp: "../../main/webapp"
        }
    }
});
