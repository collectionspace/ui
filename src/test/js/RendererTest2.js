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
        var cutpoints = cspace.renderer.createCutpoints(testSpec.spec);
        jqUnit.assertDeepEq("Cutpoints for UISpec with repeated items", testCutpoints, cutpoints);
    });

    rendererTest.test("Component trees", function () {
        var tree = cspace.renderer.buildComponentTree2(testSpec.spec, testModel);
        jqUnit.assertDeepEq("Component tree for UISpec with repeated items", testTree, tree);
    });

};

(function () {
    rendererTester();
}());
