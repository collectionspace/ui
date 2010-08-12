/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, same*/

var rendererTester = function(){

    cspace.testDecorator = {
        extendDecoratorOptions: function (options, parentComponent) {
            $.extend(true, options, {
                option1: parentComponent.options.opt1,
                option2: parentComponent.options.opt2
            });
        }
    };

    var rendererTest = new jqUnit.TestCase("Renderer Tests", function () {
        cspace.util.isTest = true;
    });

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

    rendererTest.test("buildProtoTree(): Repeated rows, no data, decorator comes before valuebinding (CSPACE-1888)", function () {
        var testUISpec = {
            "rowSelector:": {
                children: [
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.0.field2}" }
                ]
            }
        };
        var testModel = {
        };
        var testThat = {
            model: testModel
        };
        var expectedProtoTree = {
            "rowSelector:": {
                children: [
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.0.field2}" }
                ]
            }
        };
        var expectedUpdatedModel = {
            repeated: []
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("One row should be present in proto tree.", expectedProtoTree, protoTree);
        jqUnit.assertDeepEq("Model should be updated to reflect repeated field.", expectedUpdatedModel, testThat.model);
    });

    rendererTest.test("buildProtoTree(): Repeated rows, repeated data, decorator comes before valuebinding (CSPACE-1888)", function () {
        var testUISpec = {
            "rowSelector:": {
                children: [
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.0.field2}" }
                ]
            }
        };
        var testModel = {
            repeated: [
                {field2: "foo"},
                {field2: "bar"},
                {field2: "bat"}
            ]
        };
        var testThat = {
            model: testModel
        };
        var expectedProtoTree = {
            "rowSelector:": {
                children: [
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.0.field2}" },
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.1.field2}" },
                    { selector1: {
                            decorators: [{
                                type: "fluid",
                                func: "cspace.testDecorator"
                            }]
                        },
                      selector2: "${repeated.2.field2}" }
                ]
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("One row should be present in proto tree.", expectedProtoTree, protoTree);
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

    rendererTest.test("buildProtoTree(): Repeated decorators, no data", function () {
        var testUISpec = {
            "row:": {
                children: [{
                    fieldA: "${repeated.0.field1}",
                    fieldB: {
                        decorators: [{
                            "type": "fluid",
                            "func": "cspace.autocomplete",
                            "options": {
                                "url": "url.com"
                            }
                        }]
                    }
                }]
            }
        };
        var testModel = {
            repeated: []
        };
        var testThat = {
            model: testModel
        };
        var expectedProtoTree = {
            "row:": {
                children: [{
                    fieldA: "${repeated.0.field1}",
                    fieldB: {
                        decorators: [{
                            "type": "fluid",
                            "func": "cspace.autocomplete",
                            "options": {
                                "url": "url.com"
                            }
                        }]
                    }
                }]
            }
        };
        var protoTree = cspace.renderUtils.buildProtoTree(testUISpec, testThat);
        jqUnit.assertDeepEq("Decorator should be in protoTree", expectedProtoTree, protoTree);
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
    
    rendererTest.test("cspace.renderUtils.expander()", function () {
        var testUISpec = {
            selector1: "${field1}",
            selector2: "${field2}",
            selector3: "${field3}"
        };
        var expectedTree = {
            children: [{
                ID: "selector1",
                valuebinding: "field1"
            }, {
                ID: "selector2",
                valuebinding: "field2"
            }, {
                ID: "selector3",
                valuebinding: "field3"
            }]
        };
        var tree = cspace.renderUtils.expander(testUISpec, {});        
        jqUnit.assertDeepEq("Expander properly expands protoTree to componentTree ", expectedTree, tree);        
    });
    
    rendererTest.test("cspace.renderUtils.cutpointsFromUISpec()", function () {
        var testUISpec = {
            selector1: "${field1}",
            selector2: "${field2}",
            selector3: "${field3}"
        };
        var expectedCutpoints = [{
            id: "selector1",
            selector: "selector1"
        }, {
            id: "selector2",
            selector: "selector2"
        }, {
            id: "selector3",
            selector: "selector3"
        }];
        var cutpoints = cspace.renderUtils.cutpointsFromUISpec(testUISpec);        
        jqUnit.assertDeepEq("Cutpoints are properly generated from the uispec ", expectedCutpoints, cutpoints);        
    });
    
    rendererTest.test("cspace.renderUtils.buildSelectorsFromUISpec() with expander", function () {
        var testUISpec = {            
            ".csc-role-group": "${fields.groupName}",
            "expander": {
                "type": "fluid.renderer.repeat",
                "controlledBy": "fields.permissions",
                "pathAs": "row",
                "repeatID": ".csc-permissions-record-row:",
                "tree": {
                    ".csc-permissions-record-type": "${{row}.recordType}",
                    "expander": {
                        "type": "fluid.renderer.selection.inputs",
                        "rowID": ".csc-permissions-radio:",
                        "labelID": ".csc-permissions-record-permission-label",
                        "inputID": ".csc-permissions-record-permission",
                        "selectID": "permissions-select",
                        "tree": {
                            "selection": "${{row}.permission}",
                            "optionlist": ["none", "read", "write", "delete"],
                            "optionnames": ["none", "read", "write", "delete"],
                            "default": "write"
                        }
                    }
                }
            }
        };
        var expectedSelectors = {
            ".csc-role-group": ".csc-role-group",
            ".csc-permissions-record-row:": ".csc-permissions-record-row",
            ".csc-permissions-record-type": ".csc-permissions-record-type",
            ".csc-permissions-radio:": ".csc-permissions-radio",
            ".csc-permissions-record-permission-label": ".csc-permissions-record-permission-label",
            ".csc-permissions-record-permission": ".csc-permissions-record-permission",
            
            // TODO: Selectors below are actually a bug and should be ingored in the uispec.
            "selection": "selection",
            "optionlist": "optionlist",
            "optionnames": "optionnames",
            "default": "default"
            
        };
        var selectors = {};
        cspace.renderUtils.buildSelectorsFromUISpec(testUISpec, selectors);        
        jqUnit.assertDeepEq("Selectors are properly generated from the uispec ", expectedSelectors, selectors);        
    });
};

(function () {
    rendererTester();
}());
