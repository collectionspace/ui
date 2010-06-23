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
        // 11 asserts
        
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
        jqUnit.exists("The primary has been generated inside the li", $(".csc-repeatable-primary", li));

        var addButton = $(".csc-repeatable-add", container);
        jqUnit.exists("The add button has been generated inside container", addButton);
        jqUnit.assertEquals("The text of the add button is correct", "+ Field", addButton.val());
        jqUnit.notExists("The add button is not in the ul", $(".csc-repeatable-add", ul));        
    };
    
    repeatableTest.test("Markup Generation for Basic Component", function () {
        expect(11);
        var myRepeatable = basicSetup({text: "blue"});
        
        basicMarkupGenerateTest(myRepeatable.container, ".cst-simpleTestField", "blue");
    });
   
    repeatableTest.test("Markup Generation For a Table", function () {
        expect(7);
        var myRepeatable = basicSetup({
            container: "#tableContainer", 
            cutpoints: [{
                id: "myTextField",
                selector: ".csc-repeatable-repeat input"
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
        expect(13);
        
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

    
    // TODO: write a test which has a couple of fields in a div that is to be repeated

    
    repeatableTest.test("Init test for brief description", function () {
        expect(11);
        var myRepeatable = setupRepeatableWithBriefDesc();
        basicMarkupGenerateTest(myRepeatable.container, ".csc-object-identification-brief-description", "This is brief description.");

    });
};

(function () {
    repeatableTester(jQuery);
}());