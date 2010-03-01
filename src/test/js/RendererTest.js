/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, same*/

var rendererTester = function(){

    cspace.testDecorator = {
        getDecoratorOptions: function (parentComponent) {
            return {
                option1: parentComponent.options.opt1,
                option2: parentComponent.options.opt2
            };
        }
    };

    var rendererTest = new jqUnit.TestCase("Renderer Tests");

    rendererTest.test("buildProtoTree(): Basic tree, empty model", function () {
        var testUISpec = {
            selector1: "${field1}",
            selector2: "${field2}",
            selector3: "${field3}"
        };
        var testThat = {};
        var expectedProtoTree = {
            selector1: "${field1}",
            selector2: "${field2}",
            selector3: "${field3}"
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Proto Tree should be correct", expectedProtoTree, protoTree);
    });
    
    rendererTest.test("buildProtoTree(): Repeated rows", function () {
        var testUISpec = {
            "rowSelector:": {
                children: [
                    { selector1: "${repeated.0.field1}",
                      selector2: "${repeated.0.field2}" }
                ]
            }
        };
        var testModel = {
            repeated: [
                { field1: "value1a", field2: "value2a" },
                { field1: "value1b", field2: "value2b" },
                { field1: "value1c", field2: "value2c" }
            ]
        };
        var testThat = {
            model: testModel
        };
        var expectedProtoTree = {
            "rowSelector:": {
                children: [
                    { selector1: "${repeated.0.field1}",
                      selector2: "${repeated.0.field2}" },
                    { selector1: "${repeated.1.field1}",
                      selector2: "${repeated.1.field2}" },
                    { selector1: "${repeated.2.field1}",
                      selector2: "${repeated.2.field2}" }
                ]
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Proto Tree should be correct", expectedProtoTree, protoTree);
    });

    rendererTest.test("buildProtoTree(): Decorators", function () {
        var testUISpec = {
            selector: {
                decorators: [{
                    type: "fluid",
                    func: "cspace.testDecorator"
                }]
            }
        };
        var testThat = {
            options: {
                opt1: "foo",
                opt2: "bar"
            }
        };
        var expectedProtoTree = {
            selector: {
                decorators: [{
                    type: "fluid",
                    func: "cspace.testDecorator",
                    options: {
                        option1: "foo",
                        option2: "bar"
                    }
                }]
            }
        };

        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Proto Tree should be correct", expectedProtoTree, protoTree);
    });
};

(function () {
    rendererTester();
}());
