/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

var repeatableTester = function ($) {
    var briefDescUISpec;
    var briefDescModel;

    var repeatableTest = new jqUnit.TestCase("Repeatable Tests", function () {
        cspace.util.isTest = true;
    });
    
    var basicSetup = function (options) {
        options = options || {};
        var container = options.container || "#simpleFieldContainer";
        var cutpoints = options.cutpoints || [{
                id: "myTextField",
                selector: ".cst-simpleTestField"
            }
        ];
        var model = options.model || {
            myTexts: [
                {
                    myText: options.text || ""
                }
            ]
        };

        return cspace.repeatable(container, {
                model: model,
                elPath: "myTexts",
                applier: fluid.makeChangeApplier(model),
                protoTree: {
                    expander: {
                        repeatID: "repeat:",
                        type: "fluid.renderer.repeat",
                        pathAs: "row",
                        controlledBy: "myTexts",
                        tree: {
                            "myTextField": "${{row}.myText}"
                        }
                    }
                },
                renderOptions: {
                    cutpoints: cutpoints
                }
            }
        );        
    };

    // TODO: This is related to testing cspace brief description
    //       When the Repeatable component moves to Infusion this part of the test file will likely remain in the cspace code base.
    var setupRepeatableWithBriefDesc = function () {
        if (!briefDescUISpec) {
            jQuery.ajax({
                async: false,
                url: "../../main/webapp/html/uispecs/cataloging/uispec.json",
                dataType: "json",
                success: function (data) {
                    briefDescUISpec = data.recordEditor[".csc-object-identification-brief-description"].decorators[0];
                },
                error: function (xhr, textStatus, error) {
                    fluid.log("Unable to load cataloging uispec for testing");
                }
            }); 
        }
        
        if (!briefDescModel) {
            jQuery.ajax({
                async: false,
                url: "../../main/webapp/html/data/cataloging/1984.068.0335b.json",
                dataType: "json",
                success: function (data) {
                    briefDescModel = data;
                },
                error: function (xhr, textStatus, error) {
                    fluid.log("Unable to load cataloging data for testing");
                }
            });
            
        }

        var model = {}, options = {};
        fluid.model.copyModel(model, briefDescModel);

        var opts = {
            model : model,
            applier : fluid.makeChangeApplier(model),
            protoTree : briefDescUISpec.options.protoTree.expander.tree
        };
        
        fluid.merge({
            protoTree: "replace"
        }, briefDescUISpec.options, opts);

        repeatableTest.fetchTemplate("../../main/webapp/html/CatalogingTemplate.html", ".csc-object-identification-brief-description");
        return cspace.makeRepeatable(".csc-object-identification-brief-description", briefDescUISpec.options);
    };
    
    var basicMarkupGenerateTest = function (repeatable, repeatEl, text) {
        var container = repeatable.container;
        // 13 asserts
        
        var ul = $("ul", container);
        jqUnit.exists("The ul has been generated inside container", ul);
       
        var li = $("li", ul);
        jqUnit.exists("The li has been generated inside the ul", li);
        jqUnit.assertTrue("The li has the repeat selector", li.hasClass("csc-repeatable-repeat"));
        
        var field = $(repeatEl, li);
        jqUnit.exists("The field has been placed inside the li", field);
        jqUnit.assertFalse("The field no longer has the repeat selector", field.hasClass("csc-repeatable-repeat"));
        jqUnit.assertEquals("The original model was rendered ", text, field.val());
        jqUnit.exists("The delete has been generated inside the li", $(".csc-repeatable-delete", li));
        
        var primary = $(".csc-repeatable-primary", li);
        jqUnit.exists("The primary has been generated inside the li", primary);
        jqUnit.assertTrue("primary has the default selector on it", primary.hasClass("csc-repeatable-primary"));
        jqUnit.assertTrue("primary has the styling selector on it", primary.hasClass("cs-repeatable-primary"));

        var addButton = $(".csc-repeatable-add", container);
        jqUnit.exists("The add button has been generated inside container", addButton);
        jqUnit.assertEquals("The text of the add button is correct", repeatable.options.strings.add, addButton.val());
        jqUnit.notExists("The add button is not in the ul", $(".csc-repeatable-add", ul));        
    };
    
    repeatableTest.test("Markup Generation for Basic Component", function () {
        expect(13);
        var myRepeatable = basicSetup({text: "blue"});
        
        basicMarkupGenerateTest(myRepeatable, ".cst-simpleTestField", "blue");
    });
   
    repeatableTest.test("Markup Generation For a Table", function () {
        expect(7);
        var myRepeatable = basicSetup({
            container: "#tableContainerNoHeader", 
            cutpoints: [{
                id: "myTextField",
                selector: ".cst-tableTestField"
            }],
            text: "circle"
        });
        var container = myRepeatable.container;
        
        var ul = $("ul", container);
        jqUnit.notExists("No ul has been generated inside container", ul);
       
        var tr = $("tr", container);
        jqUnit.assertTrue("The tr has the repeat selector", tr.hasClass("csc-repeatable-repeat"));
        jqUnit.exists("The delete has been generated inside a table cell in the row ", $("td > .csc-repeatable-delete", tr));
        jqUnit.exists("The primary has been generated inside a table cell in the row ", $("td > .csc-repeatable-primary", tr));
        jqUnit.assertEquals("The original model was rendered ", "circle", $(".cst-tableTestField", tr).val());

        var addButton = $(".csc-repeatable-add", container);
        jqUnit.exists("The add button has been generated inside container", addButton);
        var table = $("table", container);
        jqUnit.notExists("The add button is not in the table", $(".csc-repeatable-add", table));
    });
    
    var tableSetup = function (tableId) {
        return basicSetup({
            container: tableId, 
            cutpoints: [{
                id: "myTextField",
                selector: ".cst-tableTestField"
            }], 
            text: "circle"
        });
    }; 

    var basicMarkupGenTableTest = function (tableId, elName) {
        expect(3);
        var headerRow = $(tableId + " " + fluid.defaults("cspace.repeatable").selectors.headerRow);
        var previousHeaderColumnCount = $(elName, headerRow).length;
        var myRepeatable = tableSetup(tableId);
        var colHeaders = $(elName, headerRow);
        var newLength = colHeaders.length;
        
        jqUnit.assertEquals("The table header row has had two columns added to it ", previousHeaderColumnCount + 2, newLength);
        jqUnit.assertEquals("The first column header is empty ", "", $(colHeaders[0]).text());
        jqUnit.assertEquals("The last column header is empty ", "", $(colHeaders[newLength - 1]).text());
    };
    
    repeatableTest.test("Markup Generation For Table Headers: basic TR/TH", function () {
        basicMarkupGenTableTest("#tableContainerTrTh", "th");
    });
    
    repeatableTest.test("Markup Generation For Table Headers: plain TR/TD", function () {
        basicMarkupGenTableTest("#tableContainerTrTd", "td");
    });

    repeatableTest.test("Markup Generation For Table Headers: THEAD/TR/TH", function () {
        basicMarkupGenTableTest("#tableContainerTheadTrTh", "th");
    });
    
    repeatableTest.test("Markup Generation For Table Headers: THEAD/TR/TD with multiple rows", function () {
        expect(3);
        var headerRow = $("#tableContainerTheadMultipleTrTd " + fluid.defaults("cspace.repeatable").selectors.headerRow);
        var previousHeaderColumnCount = $("td", headerRow).length;
        var myRepeatable = tableSetup("#tableContainerTheadMultipleTrTd");
    
        var colHeaders = $("td", headerRow);
        var newLength = colHeaders.length;
        jqUnit.assertEquals("The table header row has had two columns added to it ", previousHeaderColumnCount + (2 * previousHeaderColumnCount), newLength);
        jqUnit.assertEquals("The first column header is empty ", "", $(colHeaders[0]).text());
        jqUnit.assertEquals("The last column header is empty ", "", $(colHeaders[newLength - 1]).text());
    });
    
    repeatableTest.test("Markup Generation For Table Headers: THEAD/TR, no TD", function () {
        expect(1);
        var headerRow = $("#tableContainerTheadTrNoTd " + fluid.defaults("cspace.repeatable").selectors.headerRow);
        var previousHeaderColumnCount = $("td", headerRow).length;
        var myRepeatable = tableSetup("#tableContainerTheadTrNoTd");
    
        var colHeaders = $("td", headerRow);
        jqUnit.assertEquals("The table header row should have no columns added ", previousHeaderColumnCount, colHeaders.length);
    });
    
    repeatableTest.test("Markup Generation For Table Headers: no header present", function () {
        expect(2);
        
        var headerRow = $("#tableContainerNoHeader " + fluid.defaults("cspace.repeatable").selectors.headerRow);
        jqUnit.assertEquals("Before testing, there should be nothing with the header row selector", 0, headerRow.length);
        var myRepeatable = tableSetup("#tableContainerNoHeader");
        jqUnit.assertEquals("After initializing, there should still be nothing with the header row selector", 0, headerRow.length);
    });
    
    repeatableTest.test("Multi rows in the model", function () {     
        expect(4);
        var myRepeatable = basicSetup({model: {
                myTexts: [
                    {
                        myText: "cat"
                    },
                    {
                        myText: "dog"
                    },
                    {
                        myText: "fish"
                    }

                ]
            }}
        );

        var li = $("li", myRepeatable.container);
        jqUnit.assertEquals("There are three items rendered", 3, li.length);
        jqUnit.assertEquals("cat is the first item", "cat", $(".cst-simpleTestField", li.eq(0)).val());
        jqUnit.assertEquals("dog is the second item", "dog", $(".cst-simpleTestField", li.eq(1)).val());
        jqUnit.assertEquals("fish is the first item", "fish", $(".cst-simpleTestField", li.eq(2)).val());

    });
  
    repeatableTest.test("Add Functionality", function () {     
        expect(3);
        var myRepeatable = basicSetup();
        
        jqUnit.assertEquals("Model is of length 1 initially", 1, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath).length);
        myRepeatable.locate("add").click();
        jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath).length);

        var li = $("li", myRepeatable.container);
        jqUnit.assertEquals("There should be 2 items", 2, li.length);
    });

    repeatableTest.test("Add Functionality + applier/model consistency", function () {   
        expect(7);
        var myRepeatable = basicSetup({text: "thyme"});  
        var field = $(".cst-simpleTestField", myRepeatable.container);
        var expectedModel = {myText: "oregano", _primary: true};
        
        jqUnit.assertEquals("Model is of lenth 1 initially", 1, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath).length);
        jqUnit.assertEquals("Initially, value matched model", "thyme", field.val());
        field.val("oregano").change();
        
        jqUnit.assertEquals("Before adding a row, first value is changed to 'oregano'", "oregano", field.val());
        jqUnit.assertDeepEq("After changing field to 'oregano', model should be 'oregano'", expectedModel, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath)[0]);
        myRepeatable.applier.modelChanged.addListener("*", function () {
            jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath).length);
            jqUnit.assertEquals("After adding a row, first value is still 'oregano'", "oregano", $(".cst-simpleTestField", myRepeatable.container).val());
            jqUnit.assertDeepEq("After adding a row, model for first field should be 'oregano", expectedModel, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath)[0]);
        });
        myRepeatable.locate("add").click();
        
    });

    repeatableTest.test("Add functionality when model initially empty", function () {
        expect(2);

        var myRepeatable = basicSetup({model: {}});  
        jqUnit.assertEquals("When initialized with an empty  model, model length should be 1", 1, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath).length);
        myRepeatable.applier.modelChanged.addListener("*", function () {
            jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath).length);
        });
        myRepeatable.locate("add").click();
    });
    
    repeatableTest.test("Markup driven", function () {
        expect(3);
        
        var myRepeatable = basicSetup({container: "#markupPresent", cutpoints: [{
                id: "myTextField",
                selector: ".csc-repeatable-repeatd"
            }
        ], text: "subway"});
        
        jqUnit.assertEquals("No list should be generated in the container", 1, $("ul", myRepeatable.container).length);
        jqUnit.assertEquals("No list element should be generated in the container", 1, $("ul", myRepeatable.container).length);
        jqUnit.assertEquals("No inputs should be generated in the container", 0, $("input", myRepeatable.container).length);
    });
    
    repeatableTest.test("Make repeatable with simple field", function () {
        expect(15);
        
        var model = {
            myTexts: [
                {
                    myText: "Bruges"
                }
            ]
        };

        var options = {
            model: model,
            applier: fluid.makeChangeApplier(model),
            protoTree: {
                expander: {
                    repeatID: "repeat:",
                    type: "fluid.renderer.repeat",
                    pathAs: "row",
                    controlledBy: "myTexts",
                    tree: {
                        "myTextField": "${{row}.myText}"
                    }
                }
            },
            renderOptions: {
                cutpoints: [{
                    id: "myTextField",
                    selector: ".cst-simpleTestFieldNoContainer"
                }]
            }
        };
        
        var myRepeatable = cspace.makeRepeatable(".cst-simpleTestFieldNoContainer", options);
        
        var container = myRepeatable.container;
        jqUnit.assertFalse("The container is not the element we are repeating", container.hasClass("cst-simpleTestFieldNoContainer"));
        jqUnit.assertEquals("the container is a div ", "DIV", container[0].tagName);
        
        basicMarkupGenerateTest(myRepeatable, ".cst-simpleTestFieldNoContainer", "Bruges");    
    });
    
    repeatableTest.test("Delete Functionality", function () {    
        expect(9);

        var myRepeatable = basicSetup({model: {
            myTexts: [{
                myText: "cat",
                _primary: true
            }, {
                myText: "dog",
                _primary: false
            }, {
                myText: "fish",
                _primary: false
            }]
        }});
        
        jqUnit.assertEquals("There are three items rendered", 3, $("li", myRepeatable.container).length);
        jqUnit.assertEquals("When initialized with an empty  model, model length should be 3", 3, myRepeatable.model.myTexts.length);
        jqUnit.assertTrue("Primary field should be the first", myRepeatable.model.myTexts[0]._primary);
        jqUnit.assertFalse("Primary field not be the second", myRepeatable.model.myTexts[1]._primary);
        jqUnit.assertFalse("Primary field not be the third", myRepeatable.model.myTexts[2]._primary);
        
        myRepeatable.locate("remove").eq(2).click();
        
        jqUnit.assertEquals("After clicking 'remove', model is now of length 2", 2, myRepeatable.model.myTexts.length);
        jqUnit.assertEquals("There are now 2 items rendered", 2, $("li", myRepeatable.container).length);

        jqUnit.assertTrue("Primary field should still be the first", myRepeatable.model.myTexts[0]._primary);
        jqUnit.assertFalse("Primary field not be the second", myRepeatable.model.myTexts[1]._primary);

    });
    
    repeatableTest.test("Delete Functionality + Update Primary", function () {
        expect(7);

        var myRepeatable = basicSetup({model: {
            myTexts: [{
                myText: "cat",
                _primary: false
            }, {
                myText: "dog",
                _primary: true
            }, {
                myText: "fish",
                _primary: false
            }]
        }});        
        
        jqUnit.assertTrue("Primary field has index of 1", myRepeatable.model.myTexts[1]._primary);        
        myRepeatable.locate("remove").eq(1).click();
        jqUnit.assertEquals("After clicking 'remove', model is now of length 2", 2, myRepeatable.model.myTexts.length);
        jqUnit.assertEquals("There are now 2 items rendered", 2, $("li", myRepeatable.container).length);
        jqUnit.assertTrue("Primary field now has index of 0", myRepeatable.model.myTexts[0]._primary);
        myRepeatable.locate("remove").eq(0).click();
        jqUnit.assertEquals("After clicking 'remove', model is now of length 1", 1, myRepeatable.model.myTexts.length);
        jqUnit.assertEquals("There are now 1 item rendered", 1, $("li", myRepeatable.container).length);
        jqUnit.assertTrue("Primary field now has index of 0", myRepeatable.model.myTexts[0]._primary);
    });
    
    repeatableTest.test("Update Primary", function () {
        expect(6);

        var myRepeatable = basicSetup({model: {
            myTexts: [{
                myText: "cat",
                _primary: false
            }, {
                myText: "dog",
                _primary: true
            }, {
                myText: "fish",
                _primary: false
            }]
        }});        
        
        jqUnit.assertEquals("Primary field has index of 1", true, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath)[1]._primary);
        jqUnit.assertEquals("Radio button for row with index 1 is initially selected", true, myRepeatable.locate("primary")[1].checked);        
        myRepeatable.locate("primary").eq(0).click();        
        jqUnit.assertEquals("Primary field now has index of 0", true, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath)[0]._primary);
        jqUnit.assertEquals("Radio button for row with index 0 is now selected", true, myRepeatable.locate("primary")[0].checked);
        myRepeatable.locate("primary").eq(2).click();        
        jqUnit.assertEquals("Primary field now has index of 2", true, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath)[2]._primary);
        jqUnit.assertEquals("Radio button for row with index 2 is now selected", true, myRepeatable.locate("primary")[2].checked);
    });
    
    
    // TODO: write a test which has a couple of fields in a div that is to be repeated

    
    repeatableTest.test("Init test for brief description", function () {
        expect(13);
        var myRepeatable = setupRepeatableWithBriefDesc();
        basicMarkupGenerateTest(myRepeatable, ".csc-object-identification-brief-description", "This is brief description.");

    });
    
    repeatableTest.test("CSPACE-2212/2213 Inconsistent that.model and that.options.renderOptions.model", function () {
        expect(6);

        var myRepeatable = basicSetup({model: {
            myTexts: [{
                myText: "cat",
                _primary: true
            }]
        }});        
                
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After clicking add models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow2");
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.removeListener("testAddRow2");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After deleting row 1 models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testRemoveRow1");
        myRepeatable.locate("remove").eq(1).click();
        myRepeatable.events.afterRender.removeListener("testRemoveRow1");
        
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After changing row 2 value models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow2Value");
        $(".cst-simpleTestField", myRepeatable.locate("repeat").eq(1)).val("dog");
        myRepeatable.refreshView();
        myRepeatable.events.afterRender.removeListener("testAddRow2Value");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After clicking add again models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow3");
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.removeListener("testAddRow3");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After changing row 3 value models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow3Value");
        $(".cst-simpleTestField", myRepeatable.locate("repeat").eq(2)).val("bird");
        myRepeatable.refreshView();
        myRepeatable.events.afterRender.removeListener("testAddRow3Value");
            
        myRepeatable.locate("remove").eq(2).click();
        myRepeatable.locate("remove").eq(1).click();
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After clicking add after 2 delets models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow2AfterDelete");
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.removeListener("testAddRow2AfterDelete");
    });
    
    repeatableTest.test("Make repeatable rows in table with makeRepeatable", function () {        
        var model = {
            myTexts: [
                {
                    myText: "Bruges"
                }
            ]
        };
        var options = {
            model: model,
            applier: fluid.makeChangeApplier(model),
            protoTree: {
                expander: {
                    repeatID: "repeat:",
                    type: "fluid.renderer.repeat",
                    pathAs: "row",
                    controlledBy: "myTexts",
                    tree: {
                        "myTextField": "${{row}.myText}"
                    }
                }
            },
            renderOptions: {
                cutpoints: [{
                    id: "myTextField",
                    selector: ".cst-tableTestField"
                }]
            }
        };        
        var myRepeatable = cspace.makeRepeatable(".csc-repeatable-table-row", options);        
        var container = myRepeatable.container;        
        jqUnit.assertEquals("The Table does not contain divs", 0, $("div", "table").length);
        jqUnit.assertEquals("Container should containe a table", 1, container.has("table").length);        
    });
    
    repeatableTest.test("Make repeatable rows in ul with makeRepeatable", function () {        
        var model = {
            myTexts: [
                {
                    myText: "Bruges"
                }
            ]
        };
        var options = {
            model: model,
            applier: fluid.makeChangeApplier(model),
            protoTree: {
                expander: {
                    repeatID: "repeat:",
                    type: "fluid.renderer.repeat",
                    pathAs: "row",
                    controlledBy: "myTexts",
                    tree: {
                        "myTextField": "${{row}.myText}"
                    }
                }
            },
            renderOptions: {
                cutpoints: [{
                    id: "myTextField",
                    selector: ".csc-repeatable-li-text"
                }]
            }
        };        
        var myRepeatable = cspace.makeRepeatable(".csc-repeatable-li", options);        
        var container = myRepeatable.container;        
        jqUnit.assertEquals("The ul does not contain divs", 0, $("ul", "#markupPresent").has("div").length);
        jqUnit.assertEquals("Container should containe a ul", 1, container.has("ul").length);        
    });
    
    repeatableTest.test("Prepare repeatable model with primary", function () {        
        var model = {
            myTexts: []
        };        
        var options = {
            model: model,
            applier: fluid.makeChangeApplier(model),
            protoTree: {
                expander: {
                    repeatID: "repeat:",
                    type: "fluid.renderer.repeat",
                    pathAs: "row",
                    controlledBy: "myTexts",
                    tree: {
                        "myTextField": "${{row}.myText}"
                    }
                }
            },
            renderOptions: {
                cutpoints: [{
                    id: "myTextField",
                    selector: ".csc-repeatable-li-text"
                }]
            },
            elPath: "myTexts"
        };        
        var myRepeatable = cspace.makeRepeatable(".csc-repeatable-li", options);
        jqUnit.assertTrue("Newly prepared model should have a set primary field", myRepeatable.model.myTexts[0]._primary);
    });
    
    repeatableTest.test("Can not have less than one repeatable row", function () {
        expect(6);
        var myRepeatable = basicSetup({model: {
            myTexts: [{
                myText: "cat",
                _primary: true
            }]
        }});
        var add = myRepeatable.locate("add");
        jqUnit.assertEquals("Initally the number of repeatable rows is equal to", 1, myRepeatable.locate("repeat").length);
        jqUnit.assertTrue("Delete input must me disabled for the list of size one", myRepeatable.locate("remove").eq(0).is(":disabled"));
        add.click();
        jqUnit.assertEquals("After adding a row, # of repeatable rows is equal to", 2, myRepeatable.locate("repeat").length);
        jqUnit.assertTrue("Delete input must me enabled for the list of size bigger than one", myRepeatable.locate("remove").eq(0).is(":not(:disabled)"));
        myRepeatable.locate("remove").eq(0).click();
        jqUnit.assertEquals("The number of repeatable rows should again be equal to", 1, myRepeatable.locate("repeat").length);
        jqUnit.assertTrue("Delete input must me disabled again for the list of size one", myRepeatable.locate("remove").eq(0).is(":disabled"));
    });
};

(function () {
    repeatableTester(jQuery);
}());