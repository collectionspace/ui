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
    
    var bareRepeatableTest = new jqUnit.TestCase("Repeatable Tests", function () {
        cspace.util.isTest = true;
    });
    
    var repeatableTest = cspace.tests.testEnvironment({testCase: bareRepeatableTest});
    
    var basicSetup = function (options) {
        options = options || {};
        var container = options.container || "#simpleFieldContainer";
        var model = options.model || {
            myTexts: [
                {
                    myText: options.text || "",
                    _primary: true
                }
            ]
        };

        return cspace.repeatable(container, {
                model: model,
                elPath: "myTexts",
                applier: fluid.makeChangeApplier(model),
                repeatTree: {
                    "myTextField": "${{row}.myText}"
                },
                selectors: fluid.merge(null, {
                    myTextField: ".cst-simpleTestField"
                }, options.selectors)
            }
        ).repeatableImpl;        
    };

    // TODO: This is related to testing cspace brief description
    //       When the Repeatable component moves to Infusion this part of the test file will likely remain in the cspace code base.
    var setupRepeatableWithBriefDesc = function () {
        if (!briefDescUISpec) {
            jQuery.ajax({
                async: false,
                url: "../uispecs/cataloging.json",
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
                url: "../data/cataloging/1984.068.0335b.json",
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
            repeatTree : briefDescUISpec.options.repeatTree.expander.tree,
            elPath: briefDescUISpec.options.elPath
        };

        bareRepeatableTest.fetchTemplate("../../main/webapp/defaults/html/pages/CatalogingTemplate.html", ".csc-object-identification-brief-description");
        return cspace.makeRepeatable(".csc-object-identification-brief-description", opts).repeatableImpl;
    };
    
    var basicMarkupGenerateTest = function (repeatable, repeatEl, text) {
        var container = repeatable.container;
        var selectors = repeatable.options.selectors;
        function getClass(name) {
            return selectors[name].substr(1);
        }
        function getStyle(name) {
            return repeatable.options.styles[name];
        }
        // 13 asserts
        
        var ul = $("ul", container);
        jqUnit.exists("The ul has been generated inside container", ul);
       
        var li = $("li", ul);
        jqUnit.exists("The li has been generated inside the ul", li);
        jqUnit.assertTrue("The li has the repeat selector", li.hasClass(getClass("repeat")));
        
        var field = $(repeatEl, li);
        jqUnit.exists("The field has been placed inside the li", field);
        jqUnit.assertFalse("The field no longer has the repeat selector", field.hasClass(getClass("repeat")));
        jqUnit.assertEquals("The original model was rendered ", text, field.val());
        jqUnit.exists("The delete has been generated inside the li", $(selectors["delete"], li));
        
        var primary = $(selectors.primary, li);
        jqUnit.exists("The primary has been generated inside the li", primary);
        jqUnit.assertTrue("primary has the default selector on it", primary.hasClass(getClass("primary")));
        jqUnit.assertTrue("primary has the styling selector on it", primary.hasClass(getStyle("primary")));

        var addButton = $(selectors.add, container);
        jqUnit.exists("The add button has been generated inside container", addButton);
        jqUnit.assertEquals("The text of the add button is correct", repeatable.options.parentBundle.resolve("repeatable-add"), addButton.val());
        jqUnit.notExists("The add button is not in the ul", $(selectors.add, ul));
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
            selectors: {
                myTextField: ".cst-tableTestField"
            },
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
            selectors: {
                myTextField: ".cst-tableTestField"
            },
            text: "circle"
        });
    }; 

    var basicMarkupGenTableTest = function (tableId, elName) {
        expect(3);
        var headerRow = $(tableId + " " + fluid.defaults("cspace.repeatableImpl").selectors.headerRow);
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
        var headerRow = $("#tableContainerTheadMultipleTrTd " + fluid.defaults("cspace.repeatableImpl").selectors.headerRow);
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
        var headerRow = $("#tableContainerTheadTrTh " + fluid.defaults("cspace.repeatableImpl").selectors.headerRow);
        //clear the contents of the TR:
        headerRow.empty();
        var previousHeaderColumnCount = $("td", headerRow).length;
        var myRepeatable = tableSetup("#tableContainerTheadTrTh");
    
        var colHeaders = $("td", headerRow);
        jqUnit.assertEquals("The table header row should have no columns added ", previousHeaderColumnCount, colHeaders.length);
    });
    
    repeatableTest.test("Markup Generation For Table Headers: no header present", function () {
        expect(2);
        
        var headerRow = $("#tableContainerNoHeader " + fluid.defaults("cspace.repeatableImpl").selectors.headerRow);
        jqUnit.assertEquals("Before testing, there should be nothing with the header row selector", 0, headerRow.length);
        var myRepeatable = tableSetup("#tableContainerNoHeader");
        jqUnit.assertEquals("After initializing, there should still be nothing with the header row selector", 0, headerRow.length);
    });
    
    repeatableTest.test("Multi rows in the model", function () {     
        expect(4);
        var myRepeatable = basicSetup({model: {
                myTexts: [
                    {
                        myText: "cat",
                        _primary: true
                    },
                    {
                        myText: "dog",
                        _primary: false
                    },
                    {
                        myText: "fish",
                        _primary: false
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
        
        jqUnit.assertEquals("Model is of length 1 initially", 1, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath).length);
        myRepeatable.locate("add").click();
        jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath).length);

        var li = $("li", myRepeatable.container);
        jqUnit.assertEquals("There should be 2 items", 2, li.length);
    });

    repeatableTest.test("Add Functionality + applier/model consistency", function () {   
        expect(7);
        var myRepeatable = basicSetup({text: "thyme"});  
        var field = $(".cst-simpleTestField", myRepeatable.container);
        var expectedModel = {myText: "oregano", _primary: true};
        
        jqUnit.assertEquals("Model is of lenth 1 initially", 1, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath).length);
        jqUnit.assertEquals("Initially, value matched model", "thyme", field.val());
        field.val("oregano").change();
        
        jqUnit.assertEquals("Before adding a row, first value is changed to 'oregano'", "oregano", field.val());
        jqUnit.assertDeepEq("After changing field to 'oregano', model should be 'oregano'", expectedModel, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath)[0]);
        myRepeatable.applier.modelChanged.addListener("*", function () {
            jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath).length);
            jqUnit.assertEquals("After adding a row, first value is still 'oregano'", "oregano", $(".cst-simpleTestField", myRepeatable.container).val());
            jqUnit.assertDeepEq("After adding a row, model for first field should be 'oregano", expectedModel, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath)[0]);
        });
        myRepeatable.locate("add").click();
        
    });

    repeatableTest.test("Add functionality when model initially empty", function () {
        expect(2);

        var myRepeatable = basicSetup({model: {}});  
        jqUnit.assertEquals("When initialized with an empty  model, model length should be 1", 1, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath).length);
        myRepeatable.applier.modelChanged.addListener("*", function () {
            jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath).length);
        });
        myRepeatable.locate("add").click();
    });
    
    repeatableTest.test("Markup driven", function () {
        expect(3);
        
        var myRepeatable = basicSetup({container: "#markupPresent", selectors: {
            myTextField: ".csc-repeatable-repeatd"
        }, text: "subway"});
        
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
            repeatTree: {
                myTextField: "${{row}.myText}"
            },
            selectors: {
                myTextField: ".cst-simpleTestFieldNoContainer"
            },
            elPath: "myTexts"
        };
        
        var myRepeatable = cspace.makeRepeatable(".cst-simpleTestFieldNoContainer", options).repeatableImpl;
        
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
        
        myRepeatable.locate("delete").eq(2).click();
        
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
        myRepeatable.locate("delete").eq(1).click();
        jqUnit.assertEquals("After clicking 'remove', model is now of length 2", 2, myRepeatable.model.myTexts.length);
        jqUnit.assertEquals("There are now 2 items rendered", 2, $("li", myRepeatable.container).length);
        jqUnit.assertTrue("Primary field now has index of 0", myRepeatable.model.myTexts[0]._primary);
        myRepeatable.locate("delete").eq(0).click();
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
        
        jqUnit.assertEquals("Primary field has index of 1", true, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath)[1]._primary);
        jqUnit.assertEquals("Radio button for row with index 1 is initially selected", true, myRepeatable.locate("primary")[1].checked);        
        myRepeatable.locate("primary").eq(0).click();        
        jqUnit.assertEquals("Primary field now has index of 0", true, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath)[0]._primary);
        jqUnit.assertEquals("Radio button for row with index 0 is now selected", true, myRepeatable.locate("primary")[0].checked);
        myRepeatable.locate("primary").eq(2).click();        
        jqUnit.assertEquals("Primary field now has index of 2", true, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.fullPath)[2]._primary);
        jqUnit.assertEquals("Radio button for row with index 2 is now selected", true, myRepeatable.locate("primary")[2].checked);
    });
    
    
    // TODO: write a test which has a couple of fields in a div that is to be repeated

    
    repeatableTest.test("Init test for brief description", function () {
        expect(13);
        var myRepeatable = setupRepeatableWithBriefDesc();
        basicMarkupGenerateTest(myRepeatable, ".csc-object-identification-brief-description", "This is brief description.");

    });
    
    repeatableTest.test("CSPACE-2212/2213 Inconsistent that.model and that.options.rendererOptions.model", function () {
        expect(6);

        var myRepeatable = basicSetup({model: {
            myTexts: [{
                myText: "cat",
                _primary: true
            }]
        }});        
                
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After clicking add models should be the same",
                myRepeatable.model, myRepeatable.options.rendererOptions.applier.model);
        }, "testAddRow2");
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.removeListener("testAddRow2");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After deleting row 1 models should be the same",
                myRepeatable.model, myRepeatable.options.rendererOptions.applier.model);
        }, "testRemoveRow1");
        myRepeatable.locate("delete").eq(1).click();
        myRepeatable.events.afterRender.removeListener("testRemoveRow1");
        
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After changing row 2 value models should be the same",
                myRepeatable.model, myRepeatable.options.rendererOptions.applier.model);
        }, "testAddRow2Value");
        $(".cst-simpleTestField", myRepeatable.locate("repeat").eq(1)).val("dog");
        myRepeatable.refreshView();
        myRepeatable.events.afterRender.removeListener("testAddRow2Value");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After clicking add again models should be the same",
                myRepeatable.model, myRepeatable.options.rendererOptions.applier.model);
        }, "testAddRow3");
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.removeListener("testAddRow3");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After changing row 3 value models should be the same",
                myRepeatable.model, myRepeatable.options.rendererOptions.applier.model);
        }, "testAddRow3Value");
        $(".cst-simpleTestField", myRepeatable.locate("repeat").eq(2)).val("bird");
        myRepeatable.refreshView();
        myRepeatable.events.afterRender.removeListener("testAddRow3Value");
            
        myRepeatable.locate("delete").eq(2).click();
        myRepeatable.locate("delete").eq(1).click();
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertDeepEq("After clicking add after 2 delets models should be the same",
                myRepeatable.model, myRepeatable.options.rendererOptions.applier.model);
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
            elPath: "myTexts",
            model: model,
            applier: fluid.makeChangeApplier(model),
            repeatTree: {
                "myTextField": "${{row}.myText}"
            },
            selectors: {
                myTextField: ".cst-tableTestField"
            }
        };        
        var myRepeatable = cspace.makeRepeatable(".csc-repeatable-table-row", options).repeatableImpl;        
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
            elPath: "myTexts",
            model: model,
            applier: fluid.makeChangeApplier(model),
            repeatTree: {
                "myTextField": "${{row}.myText}"
            },
            selectors: {
                myTextField: ".csc-repeatable-li-text"
            }
        };        
        var myRepeatable = cspace.makeRepeatable(".csc-repeatable-li", options).repeatableImpl;        
        var container = myRepeatable.container;        
        jqUnit.assertEquals("The ul does not contain divs", 0, $("ul", "#markupPresent").has("div").length);
        jqUnit.assertEquals("Container should containe a ul", 1, container.has("ul").length);        
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
        jqUnit.assertTrue("Delete input must me disabled for the list of size one", myRepeatable.locate("delete").eq(0).is(":disabled"));
        add.click();
        jqUnit.assertEquals("After adding a row, # of repeatable rows is equal to", 2, myRepeatable.locate("repeat").length);
        jqUnit.assertTrue("Delete input must me enabled for the list of size bigger than one", myRepeatable.locate("delete").eq(0).is(":not(:disabled)"));
        myRepeatable.locate("delete").eq(0).click();
        jqUnit.assertEquals("The number of repeatable rows should again be equal to", 1, myRepeatable.locate("repeat").length);
        jqUnit.assertTrue("Delete input must me disabled again for the list of size one", myRepeatable.locate("delete").eq(0).is(":disabled"));
    });
    
    fluid.defaults("cspace.tests.repeatableParent", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        model: {
            myTexts: []
        },
        renderOnInit: true,
        selectors: {
            ".csc-repeatable-li-text": ".csc-repeatable-li-text"
        },
        protoTree: {
            ".csc-repeatable-li-text": {
                decorators: [{
                    func: "cspace.makeRepeatable",
                    type: "fluid",
                    options: {
                        elPath: "myTexts",
                        repeatTree: {
                            expander: {
                                tree: {
                                    ".csc-repeatable-li-text": "${{row}.myText}"
                                },
                                type: "fluid.noexpand"
                            }
                        }
                    }
                }]
            }
        }
    });
    
    fluid.demands("cspace.makeRepeatable", ["cspace.tests.repeatableParent", "cspace.test"], {
        container: "{arguments}.0",
        mergeAllOptions: [{
            applier: "{repeatableParent}.applier",
            model: "{repeatableParent}.model"
        }, "{arguments}.1"]
    });
    
    repeatableTest.test("Prepare repeatable model with primary", function () {
        expect(2);
        var repeatableParent = cspace.tests.repeatableParent("#repeatableCon");
        jqUnit.assertTrue("Newly prepared main model should have a set primary field", repeatableParent.model.myTexts[0]._primary);
        var myRepeatable = repeatableParent["**-renderer-csc-repeatable-li-text-0"];
        jqUnit.assertTrue("Newly prepared model should have a set primary field", myRepeatable.model.myTexts[0]._primary);
    });
    
    fluid.defaults("cspace.tests.repeatableAutoCompleteParent", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        model: {
            myTexts: []
        },
        renderOnInit: true,
        selectors: {
            ".csc-repeatableAC-li-text": ".csc-repeatableAC-li-text"
        },
        protoTree: {
            ".csc-repeatableAC-li-text": {
                decorators: [{
                    func: "cspace.makeRepeatable",
                    type: "fluid",
                    options: {
                        elPath: "myTexts",
                        repeatTree: {
                            expander: {
                                tree: {
                                    ".csc-repeatableAC-li-text": {
                                        decorators: [
                                            {
                                                func: "cspace.autocomplete",
                                                type: "fluid",
                                                options: {
                                                    queryUrl: "../../../tenant/core/cataloging/autocomplete/owner",
                                                    vocabUrl: "../../../tenant/core/cataloging/source-vocab/owner"
                                                }
                                            }
                                        ],
                                        value: "${{row}.myText}"
                                    }
                                },
                                type: "fluid.noexpand"
                            }
                        }
                    }
                }]
            }
        }
    });
    
    fluid.demands("cspace.makeRepeatable", ["cspace.tests.repeatableAutoCompleteParent", "cspace.test"], {
        container: "{arguments}.0",
        mergeAllOptions: [{
            applier: "{repeatableAutoCompleteParent}.applier",
            model: "{repeatableAutoCompleteParent}.model"
        }, "{arguments}.1"]
    });
    
    repeatableTest.test("Repeatable Autocomplete initializes", function () {
        var repeatableAutoCompleteParent = cspace.tests.repeatableAutoCompleteParent("#repeatableAutoCompleteCon");
        jqUnit.assertValue("Repeatable should initialize without an error", repeatableAutoCompleteParent);
    });
    
    fluid.defaults("cspace.tests.repeatableGrandParent", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        model: {
            myTexts: []
        },
        renderOnInit: true,
        selectors: {
            ".csc-repeatable-group": ".csc-repeatable-group"
        },
        protoTree: {
            ".csc-repeatable-group": {
                decorators: [{
                    func: "cspace.makeRepeatable",
                    type: "fluid",
                    options: {
                        elPath: "myTexts",
                        repeatTree: {
                            expander: {
                                tree: {
                                    ".csc-repeatable-li-text": "${{row}.myText}",
                                    ".csc-nested-repeatable-li-text": {
                                        decorators: [{
                                            func: "cspace.makeRepeatable",
                                            type: "fluid",
                                            options: {
                                                root: "{row}",
                                                elPath: "myNestedTexts",
                                                repeatTree: {
                                                    expander: {
                                                        type: "fluid.noexpand",
                                                        tree: {
                                                            ".csc-nested-repeatable-li-text": "${{row}.myNestedTexts}"
                                                        }
                                                    }
                                                }
                                            }
                                        }]
                                    }
                                },
                                type: "fluid.noexpand"
                            }
                        }
                    }
                }]
            }
        }
    });
    
    fluid.demands("cspace.makeRepeatable", ["cspace.tests.repeatableGrandParent", "cspace.test"], {
        container: "{arguments}.0",
        mergeAllOptions: [{
            applier: "{repeatableGrandParent}.applier",
            model: "{repeatableGrandParent}.model",
            recordType: "test",
            schema: {
                test: {
                    type: "object",
                    properties: {
                        myTexts: {
                            items: {
                                type: "object",
                                properties: {
                                    _primary: {
                                        type: "boolean",
                                        "default": true
                                    },
                                    myText: {
                                        type: "string"
                                    },
                                    myNestedTexts: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                myNestedText: {
                                                    type: "string"
                                                },
                                                _primary: {
                                                    type: "boolean",
                                                    "default": true
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            type: "array"
                        }
                    }
                }
            }
        }, "{arguments}.1"]
    });
    
    repeatableTest.test("Nested Repeatable", function () {
        expect(68);
        var repeatableGrandParent = cspace.tests.repeatableGrandParent("#repeatableGrandParent");
        var repeatable = repeatableGrandParent["**-renderer-csc-repeatable-group-0"].repeatableImpl;
        var nested1 = repeatable["**-renderer-repeat::csc-nested-repeatable-li-text-2"].repeatableImpl;
        jqUnit.assertTrue("Newly prepared main model should have a set primary field", repeatableGrandParent.model.myTexts[0]._primary);
        jqUnit.assertTrue("Newly prepared main model should have a set primary field for nested", repeatableGrandParent.model.myTexts[0].myNestedTexts[0]._primary);
        jqUnit.assertEquals("Repeatable and main models should be the same object", repeatableGrandParent.model, repeatable.model);
        jqUnit.assertEquals("Repeatable and nested repeatble models should be the same object", nested1.model, repeatable.model);
        jqUnit.assertTrue("Delete for repeatable should be disabled", repeatable.locate("delete").is(":disabled"));
        jqUnit.assertTrue("Delete for nested repeatable should be disabled", nested1.locate("delete").is(":disabled"));

        basicMarkupGenerateTest(repeatable, ".csc-repeatable-group", "");
        basicMarkupGenerateTest(nested1, ".csc-nested-repeatable-li-text", "");
        
        repeatable.locate("add").click();
        nested1 = repeatable["**-renderer-repeat::csc-nested-repeatable-li-text-2"].repeatableImpl;
        var nested2 = repeatable["**-renderer-repeat:1:csc-nested-repeatable-li-text-4"].repeatableImpl;
        
        basicMarkupGenerateTest(nested2, ".csc-nested-repeatable-li-text", "");
        jqUnit.assertEquals("Size of repeatable should be 2", 2, repeatableGrandParent.model.myTexts.length);
        jqUnit.assertTrue("Delete for repeatable should not be disabled", repeatable.locate("delete").is(":not(disabled)"));
        jqUnit.assertTrue("Delete for nested 1 repeatable should be disabled", nested1.locate("delete").is(":disabled"));
        jqUnit.assertTrue("Delete for nested 2 repeatable should be disabled", nested2.locate("delete").is(":disabled"));
        
        nested1.locate("add").click();
        jqUnit.assertTrue("Delete for nested 1 repeatable should not be disabled", nested1.locate("delete").is(":not(disabled)"));
        jqUnit.assertEquals("Size of repeatable should still be 2", 2, repeatableGrandParent.model.myTexts.length);
        jqUnit.assertEquals("Size of nested repeatable should be 2", 2, repeatableGrandParent.model.myTexts[0].myNestedTexts.length);
        
        repeatable.locate("delete").eq(1).click();
        nested1 = repeatable["**-renderer-repeat::csc-nested-repeatable-li-text-2"].repeatableImpl;
        
        jqUnit.assertEquals("Size of repeatable should now be 1", 1, repeatableGrandParent.model.myTexts.length);
        jqUnit.assertEquals("Size of nested repeatable should be 2", 2, repeatableGrandParent.model.myTexts[0].myNestedTexts.length);
        jqUnit.assertTrue("Delete for repeatable should be disabled", repeatable.locate("delete").is(":disabled"));
        jqUnit.assertTrue("Delete for nested 1 repeatable should not be disabled", nested1.locate("delete").is(":not(disabled)"));
        
        $(".csc-repeatable-li-text", repeatable.container).val("TEST").change();
        jqUnit.assertEquals("Repeatable value should be", "TEST", repeatableGrandParent.model.myTexts[0].myText);
        $(".csc-nested-repeatable-li-text", nested1.container).eq(1).val("NESTED TEST").change();
        jqUnit.assertEquals("Nested Repeatable value should be", "NESTED TEST", repeatableGrandParent.model.myTexts[0].myNestedTexts[1].myNestedTexts);
        jqUnit.assertTrue("Primary should be true", repeatableGrandParent.model.myTexts[0].myNestedTexts[0]._primary);
        nested1.locate("primary").eq(1).click();
        jqUnit.assertFalse("Now primary should be false", repeatableGrandParent.model.myTexts[0].myNestedTexts[0]._primary);
        jqUnit.assertTrue("Second primary should be true", repeatableGrandParent.model.myTexts[0].myNestedTexts[1]._primary);
        
        repeatable.locate("add").click();
        nested1 = repeatable["**-renderer-repeat::csc-nested-repeatable-li-text-2"].repeatableImpl;
        nested2 = repeatable["**-renderer-repeat:1:csc-nested-repeatable-li-text-4"].repeatableImpl;
        
        jqUnit.assertEquals("Repeatable value should still be", "TEST", repeatableGrandParent.model.myTexts[0].myText);
        jqUnit.assertEquals("Nested Repeatable value should still be", "NESTED TEST", repeatableGrandParent.model.myTexts[0].myNestedTexts[1].myNestedTexts);
        jqUnit.assertFalse("Now primary should still be false", repeatableGrandParent.model.myTexts[0].myNestedTexts[0]._primary);
        jqUnit.assertTrue("Second primary should still be true", repeatableGrandParent.model.myTexts[0].myNestedTexts[1]._primary);
        
        nested2.locate("add").click();
        jqUnit.assertEquals("Size of repeatable should now be ", 2, repeatableGrandParent.model.myTexts.length);
        jqUnit.assertEquals("Size of nested 2 repeatable should be ", 2, repeatableGrandParent.model.myTexts[1].myNestedTexts.length);
        
        $(".csc-nested-repeatable-li-text", nested2.container).eq(0).val("NESTED 2 TEST").change();
        jqUnit.assertEquals("Nested Repeatable value should be", "NESTED 2 TEST", repeatableGrandParent.model.myTexts[1].myNestedTexts[0].myNestedTexts);
    });
};

(function () {
    repeatableTester(jQuery);
}());
