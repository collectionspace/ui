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
        jqUnit.assertDeepEq("Basic proto pree should be correct", expectedProtoTree, protoTree);
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
        jqUnit.assertDeepEq("Repeated rows should be present in proto tree.", expectedProtoTree, protoTree);
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
        jqUnit.assertDeepEq("Decorator options should be added to uispec decorator specification (no options in uispec)", expectedProtoTree, protoTree);

        testUISpec.selector.decorators[0].options = {
            newOpt: "bat"
        };
        expectedProtoTree.selector.decorators[0].options.newOpt = "bat";

        protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Decorator options should be added to uispec decorator specification (existing options in uispec shouldn't be overwritten)", expectedProtoTree, protoTree);
    });

    rendererTest.test("buildProtoTree(): Fix of selections if model empty", function () {
        var testUISpec = {
            selector: {
                selection: "${field1}",
                optionlist: ["opt1", "opt2"],
                optionnames: ["Option 1", "Option 2"]
            }
        };
        var testThat = {
            model: {}
        };
        var expectedModel = {
            field1: ""
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Process should add missing fields to model", expectedModel, testThat.model);
    });

    rendererTest.test("buildProtoTree(): Links", function () {
        var testUISpec = {
            selector1: {
                linktext: "${displayText}",
                target: "page.html?csid=${csid}"
            }
        };
        var testThat = {
            model: {
                displayText: "Link Text",
                csid: "testID"
            }
        };
        var expectedProtoTree = {
            selector1: {
                linktext: "Link Text",
                target: "page.html?csid=testID"
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Links should be properly expanded", expectedProtoTree, protoTree);
    });

    rendererTest.test("buildSelectorsFromUISpec()", function () {
        var testUISpec = {
            selector1: "${field1}",
            selector2: "${field2}",
            selector3: "${field3}"
        };
        var testSelectors = {};
        var expectedSelectors = {
            selector1: "selector1",
            selector2: "selector2",
            selector3: "selector3"
        };
        cspace.renderUtils.buildSelectorsFromUISpec(testUISpec, testSelectors);
        jqUnit.assertDeepEq("Selectors added to empty list", expectedSelectors, testSelectors);

        testSelectors = {
            existingSelector: ".foo"
        };
        expectedSelectors.existingSelector = ".foo";
        cspace.renderUtils.buildSelectorsFromUISpec(testUISpec, testSelectors);
        jqUnit.assertDeepEq("New selectors should overwrite existing selectors", expectedSelectors, testSelectors);
    });
    
    rendererTest.test("fixSelectionsInTree()", function () {
        var testProtoTree = {
            selector: {
                selection: "${field1}",
                optionlist: ["opt1", "opt2"],
                optionnames: ["Option 1", "Option 2"]
            }
        };
        var expectedBadTree = {
            children: [{
                ID: "selector",
                selection: { valuebinding: "field1" },
                optionlist: [
                    {value: "opt1"},
                    {value: "opt2"}
                ],
                optionnames: [
                    {value: "Option 1"},
                    {value: "Option 2"}
                ]
            }]
        };
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
        var testTree = expander(testProtoTree);
        jqUnit.assertDeepEq("First, confirm the bug is present in the expander", expectedBadTree, testTree);
        var expectedFixedTree = {
            children: [{
                ID: "selector",
                selection: { valuebinding: "field1" },
                optionlist: ["opt1", "opt2"],
                optionnames: ["Option 1", "Option 2"]
            }]
        };
        cspace.renderUtils.fixSelectionsInTree(testTree);
        jqUnit.assertDeepEq("Selections should be fixed", expectedFixedTree, testTree);
    });
};

(function () {
    rendererTester();
}());
