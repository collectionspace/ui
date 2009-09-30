/*global jQuery, jqUnit, cspace*/
(function ($) {
    
    var testSpec  = {
        "foo": {
            "selector": "brack foofer",
            "decorators": [
                {"type": "jQuery",
                 "func": "click",
                 "args": [alert]}
            ]
        },
        "bar": {
            "selector": ".hello .goodbye",
            "decorators": []
        }
    };
    var dataEntryTest = new jqUnit.TestCase("DataEntry Tests");

    // this tests a modal dialog - it might have to remain last in the file
    dataEntryTest.test("showSpecErrorMessage", function () {
        jqUnit.notVisible("Error dialog should not be visible to start", ".csc-error-dialog");

        var objEntry = cspace.dataEntry("#main");

        jqUnit.isVisible("Error dialog should be visible", ".csc-error-dialog");
        var errorMessage = $(".csc-error-message").text();
        jqUnit.assertTrue("Error string should contain specFetchError", (errorMessage.indexOf(objEntry.options.strings.specFetchError) > -1));
        jqUnit.assertTrue("Error string should contain errorRecoverySuggestion", (errorMessage.indexOf(objEntry.options.strings.errorRecoverySuggestion) > -1));
    });
    
    dataEntryTest.test("renderer.createCutpoints", function () {
        var cutpoints = cspace.renderer.createCutpoints(testSpec);
        jqUnit.assertEquals("There should be 2 cutpoints", 2, cutpoints.length);
        jqUnit.assertEquals("Field 'foo' should exist ", "foo", cutpoints[0].id);
        jqUnit.assertEquals("Field 'foo' should have ", "brack foofer", cutpoints[0].selector);
        jqUnit.assertEquals("Field 'bar' should exist ", "bar", cutpoints[1].id);
        jqUnit.assertEquals("Field 'ar' should have ", ".hello .goodbye", cutpoints[1].selector);
    });
    
    dataEntryTest.test("renderer.buildComponentTree", function () {
        var dataModel = {
            "foo": "foofer",
            "bar": "bat"
        };
        var expectedTree = {
            children: [
                {
                    ID: "foo",
                    valuebinding: "foo",
                    decorators: [
                        {"type": "jQuery",
                         "func": "click",
                         "args": [alert]}
                    ]
                },
                {
                    ID: "bar",
                    valuebinding: "bar"
                }
            ]
        };
        var tree = cspace.renderer.buildComponentTree(testSpec, dataModel);
        jqUnit.assertDeepEq("Tree should be ", expectedTree, tree);
    });
})(jQuery);
