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

    var repeatableTest = new jqUnit.TestCase("Repeatable Tests");
    
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
                    "myTextField": "${myTexts.0.myText}"
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
                url: "../../main/webapp/html/uispecs/objects/uispec.json",
                dataType: "json",
                success: function (data) {
                    briefDescUISpec = data.recordEditor[".csc-object-identification-brief-description"].decorators[0];
                },
                error: function (xhr, textStatus, error) {
                    fluid.log("Unable to load object uispec for testing");
                }
            }); 
        }
        
        if (!briefDescModel) {
            jQuery.ajax({
                async: false,
                url: "../../main/webapp/html/data/objects/1984.068.0335b.json",
                dataType: "json",
                success: function (data) {
                    briefDescModel = data;
                },
                error: function (xhr, textStatus, error) {
                    fluid.log("Unable to load object data for testing");
                }
            });
            
        }

        var model = {}, options = {};
        fluid.model.copyModel(model, briefDescModel);

        var opts = {
            model : model,
            applier : fluid.makeChangeApplier(model),
            renderOptions : {
                cutpoints: cspace.renderUtils.cutpointsFromUISpec(briefDescUISpec.options.protoTree)
            }
        };

        jQuery.extend(true, options, briefDescUISpec.options, opts); 

        repeatableTest.fetchTemplate("../../main/webapp/html/ObjectEntryTemplate.html", ".csc-object-identification-brief-description");
        return cspace.makeRepeatable(".csc-object-identification-brief-description", options);
    };
    
    var basicMarkupGenerateTest = function (container, repeatEl, text) {
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
        jqUnit.assertEquals("The text of the add button is correct", "+ Field", addButton.val());
        jqUnit.notExists("The add button is not in the ul", $(".csc-repeatable-add", ul));        
    };
    
    repeatableTest.test("Markup Generation for Basic Component", function () {
        expect(13);
        var myRepeatable = basicSetup({text: "blue"});
        
        basicMarkupGenerateTest(myRepeatable.container, ".cst-simpleTestField", "blue");
    });
   
    repeatableTest.test("Markup Generation For a Table", function () {
        expect(7);
        var myRepeatable = basicSetup({
            container: "#tableContainer", 
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
        jqUnit.exists("The delete has been generated inside the table row", $(".csc-repeatable-delete", tr));
        jqUnit.exists("The primary has been generated inside the table row", $(".csc-repeatable-primary", tr));
        jqUnit.assertEquals("The original model was rendered ", "circle", $(".cst-tableTestField", tr).val());
    
        var addButton = $(".csc-repeatable-add", container);
        jqUnit.exists("The add button has been generated inside container", addButton);
        var table = $("table", container);
        jqUnit.notExists("The add button is not in the table", $(".csc-repeatable-add", table));
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
        var field = $(".cst-simpleTestField");
        var expectedModel = {myText: "oregano"};
        
        jqUnit.assertEquals("Model is of lenth 1 initially", 1, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath).length);
        jqUnit.assertEquals("Initially, value matched model", "thyme", field.val());
        field.val("oregano").change();
        
        jqUnit.assertEquals("Before adding a row, first value is changed to 'oregano'", "oregano", $(".cst-simpleTestField").val());
        jqUnit.assertDeepEq("After changing field to 'oregano', model should be 'oregano", expectedModel, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath)[0]);
        myRepeatable.applier.modelChanged.addListener("*", function () {
            jqUnit.assertEquals("After clicking 'add', model is now of length 2", 2, fluid.model.getBeanValue(myRepeatable.model, myRepeatable.options.elPath).length);
            jqUnit.assertEquals("After adding a row, first value is still 'oregano'", "oregano", field.val());
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
                "myTextField": "${myTexts.0.myText}"
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
        
        basicMarkupGenerateTest(container, ".cst-simpleTestFieldNoContainer", "Bruges");    
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
        basicMarkupGenerateTest(myRepeatable.container, ".csc-object-identification-brief-description", "This is brief description.");

    });
    
    repeatableTest.test("CSPACE-2212/2213 Inconsistent that.model and that.options.renderOptions.model", function () {
        expect(7);

        var myRepeatable = basicSetup({model: {
            myTexts: [{
                myText: "cat",
                _primary: true
            }]
        }});     
        
        jqUnit.assertEquals("The model and the model in the render options are the same object", myRepeatable.model, myRepeatable.options.renderOptions.model);

        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertEquals("After clicking add models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow2");
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.removeListener("testAddRow2");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertEquals("After deleting row 1 models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testRemoveRow1");
        myRepeatable.locate("remove").eq(1).click();
        myRepeatable.events.afterRender.removeListener("testRemoveRow1");
        
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertEquals("After changing row 2 value models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow2Value");
        $(".cst-simpleTestField", myRepeatable.locate("repeat").eq(1)).val("dog");
        myRepeatable.refreshView();
        myRepeatable.events.afterRender.removeListener("testAddRow2Value");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertEquals("After clicking add again models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow3");
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.removeListener("testAddRow3");
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertEquals("After changing row 3 value models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow3Value");
        $(".cst-simpleTestField", myRepeatable.locate("repeat").eq(2)).val("bird");
        myRepeatable.refreshView();
        myRepeatable.events.afterRender.removeListener("testAddRow3Value");
            
        myRepeatable.locate("remove").eq(2).click();
        myRepeatable.locate("remove").eq(1).click();
        
        myRepeatable.events.afterRender.addListener(function () {
            jqUnit.assertEquals("After clicking add after 2 delets models should be the same",
                myRepeatable.model, myRepeatable.options.renderOptions.model);
        }, "testAddRow2AfterDelete");
        myRepeatable.locate("add").click();
        myRepeatable.events.afterRender.removeListener("testAddRow2AfterDelete");
    });

};

(function () {
    repeatableTester(jQuery);
}());