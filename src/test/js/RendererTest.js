/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, same*/

var rendererTester = function(){

    var rendererTest = new jqUnit.TestCase("Renderer Tests");

    rendererTest.test("Cutpoints", function () {
        var cutpoints = cspace.renderer.buildCutpointsFromSpec(testUISpecs.findEditObjects.spec);
        jqUnit.assertDeepEq("Cutpoints for the Find/Edit Objects data", testCutpoints.findEditObjects, cutpoints);
        cutpoints = cspace.renderer.buildCutpointsFromSpec(testUISpecs.findEditProcedures.spec);
        jqUnit.assertDeepEq("Cutpoints for the Find/Edit Procedures data", testCutpoints.findEditProcedures, cutpoints);
        cutpoints = cspace.renderer.buildCutpointsFromSpec(testUISpecs.relatedObjects.spec);
        jqUnit.assertDeepEq("Cutpoints for the Related Objects data", testCutpoints.relatedObjects, cutpoints);
        cutpoints = cspace.renderer.buildCutpointsFromSpec(testUISpecs.relatedProcedures.spec);
        jqUnit.assertDeepEq("Cutpoints for the Related Procedures data", testCutpoints.relatedProcedures, cutpoints);
    });
    
    rendererTest.test("Component trees", function () {
        var tree = cspace.renderer.buildComponentTreeForRows(testUISpecs.findEditObjects.spec, testData.objects);
        jqUnit.assertDeepEq("Tree for the Find/Edit Objects data", testComponentTrees.findEditObjects, tree);
        tree = cspace.renderer.buildComponentTreeForRows(testUISpecs.findEditProcedures.spec, testData.procedures);
        jqUnit.assertDeepEq("Tree for the Find/Edit Procedures data", testComponentTrees.findEditProcedures, tree);
        tree = cspace.renderer.buildComponentTreeForRows(testUISpecs.relatedObjects.spec, testData.objects);
        jqUnit.assertDeepEq("Tree for the Related Objects data", testComponentTrees.relatedObjects, tree);
        tree = cspace.renderer.buildComponentTreeForRows(testUISpecs.relatedProcedures.spec, testData.procedures);
        jqUnit.assertDeepEq("Tree for the Related Procedures data", testComponentTrees.relatedProcedures, tree);
    });
    
    rendererTest.test("Repeated items", function () {
        var cutpoints = cspace.renderer.buildCutpointsFromSpec(testUISpecs.repeatedItems.spec);
        jqUnit.assertDeepEq("Cutpoints for UISpec with repeated items", testCutpoints.repeatedItems, cutpoints);
        var tree = cspace.renderer.buildComponentTree(testUISpecs.repeatedItems.spec, testData.repeatedItems);
        jqUnit.assertDeepEq("Tree for model with repeated items", testComponentTrees.repeatedItems, tree);
    });
};


(function () {
    rendererTester();
}());

