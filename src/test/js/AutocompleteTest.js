/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace jqUnit jQuery start stop*/
"use strict";

(function ($) {
    var bareAutocompleteTests = new jqUnit.TestCase("Autocomplete Tests");
    
    var autocompleteTests = cspace.tests.testEnvironment({testCase: bareAutocompleteTests});
    
    var popDefs = fluid.defaults("cspace.autocomplete.popup");
    
    function assertMatchCount(message, count, autocomplete) {
        var matches = $(popDefs.selectors.matchItem, autocomplete.popupElement);
        jqUnit.assertEquals(message, count, matches.length);
    }
    
    function assertCloseVisible(autocomplete, state) {
        jqUnit.assertEquals("Close button visibility: " + state, state, autocomplete.closeButton.button.is(":visible"));
    }
    
    function clickCloseButton(autocomplete) {
        autocomplete.closeButton.button.click();
    }
    
    function pressEscKey(autocomplete) {
        autocomplete.popup.container.trigger({type: "keydown", keyCode: $.ui.keyCode.ESCAPE});
        autocomplete.popup.container.trigger({type: "keyup", keyCode: $.ui.keyCode.ESCAPE});
    }
    
    var openAndCloseInteraction = function (container, closeFunc) {
        expect(10);
        var autocomplete = cspace.autocomplete(container);
        jqUnit.assertValue("Constructed", autocomplete);
        var input = autocomplete.autocompleteInput;
        jqUnit.assertValue("Found input", input);
        autocomplete.autocomplete.events.onSearch.addListener(function(newValue, permitted) {
            jqUnit.assertEquals("Search performed", "top", newValue);
            jqUnit.assertTrue("Results loading indicator", input.hasClass(autocomplete.autocomplete.options.styles.loadingStyle));
        });
        autocomplete.autocomplete.events.onSearchDone.addListener(function() {
            assertMatchCount("\"top\" results count in markup", 13, autocomplete);
            assertCloseVisible(autocomplete, true);
            closeFunc(autocomplete);
            assertCloseVisible(autocomplete, false);
            assertMatchCount("Dialog now empty", 0, autocomplete);
            jqUnit.assertEquals("Field emptied", "", input.val());
            start();
        });
        jqUnit.assertTrue("Close button initially hidden", autocomplete.closeButton.button.is(":hidden"));
        input.keydown();
        input.val("top");
        stop();
    };

    function submitTest(name, func) {
        autocompleteTests.test(name + " new markup", function () {            
            func("#autocomplete1");
        });
        autocompleteTests.test(name + " old markup", function () {            
            func("#autocomplete2");
        });
    }

    function makeArgumentedTest(testFunc, argFunc) {
        return function(container) {
            testFunc(container, argFunc);
        };
    }

    submitTest("Open and close interaction with close button", makeArgumentedTest(openAndCloseInteraction, clickCloseButton));
    submitTest("Open and close interaction with Escape key", makeArgumentedTest(openAndCloseInteraction, pressEscKey));

    function clickMatch(autocomplete) {
        var popup = autocomplete.popup;
        popup.dom.locate("matchItemContent").click();
    }
    
    function enterMatch(autocomplete) {
        autocomplete.popup.dom.locate("matchItemContent").trigger({type: "keydown", keyCode: $.ui.keyCode.ENTER});
    }

    var chooseMatchInteraction = function (container, chooseFunc) {
        expect(6);
        var autocomplete = cspace.autocomplete(container);
        var input = autocomplete.autocompleteInput;
        autocomplete.autocomplete.events.onSearchDone.addListener(function() {
            assertMatchCount("\"Utopia\" results count in markup", 1, autocomplete);
            assertCloseVisible(autocomplete, true);
            chooseFunc(autocomplete);
            assertCloseVisible(autocomplete, false);
            var match = autocomplete.model.matches[0];
            jqUnit.assertEquals("Visible field value", match.label, input.val());
            jqUnit.assertEquals("Hidden field value", match.urn, autocomplete.hiddenInput.val());
            assertMatchCount("Dialog now empty", 0, autocomplete);
            start();
        });

        input.keydown();
        input.val("Utopia");
        stop();
    };
    
    submitTest("Choose match interaction with mouse item click", makeArgumentedTest(chooseMatchInteraction, clickMatch));
    submitTest("Choose match interaction with ENTER key", makeArgumentedTest(chooseMatchInteraction, enterMatch));
    
    var focusBlurable = function (autocomplete) {
        autocomplete.autocompleteInput.blur();
        $("#blurable").focus();
    };
    
    var focusMatch = function (autocomplete) {
        var popup = autocomplete.popup;
        popup.dom.locate("matchItemContent").focus();        
    };
    
    var assertPopupOpen = function (autocomplete, state) {
        jqUnit.assertEquals("Popup open: " + state, state, autocomplete.popup.container.html() !== "");
    };
    
    var assertInputFocused = function (autocomplete, state) {
        jqUnit.assertEquals("Input focus: " + state, state, document.activeElement === autocomplete.autocompleteInput[0]);
    };
    
    var assertInput = function (autocomplete, value) {
        jqUnit.assertEquals("Input", value, autocomplete.autocompleteInput.val());
    };
    
    function clickAuthority(autocomplete) {
        var popup = autocomplete.popup;
        popup.dom.locate("authorityItem").eq(0).click();        
    }
    
    var gdInteraction = function (container, focusFunc, popupOpen, inputFocus, originalValue) {
        expect(6);
        var autocomplete = cspace.autocomplete(container);
        var input = autocomplete.autocompleteInput;
        autocomplete.autocomplete.events.onSearchDone.addListener(function() {
            assertPopupOpen(autocomplete, true);
            assertInputFocused(autocomplete, true);
            // this OUTER wait is necessary between operation of the input field and applying a blur in order
            // to evade the "proleptic blur" functionality required to evade out-of-order event sequencing on IE 
            setTimeout(function() {
                focusFunc(autocomplete);
                // NOTE: Waiting for 200ms that are equivalent to the timeout insidet the dead man's blur, 
                // in order to verify that the handler fired or was prevented with exclusion. 
                setTimeout(function () {
                    assertPopupOpen(autocomplete, popupOpen);
                    assertInputFocused(autocomplete, inputFocus);
                    assertInput(autocomplete, originalValue);
                    jqUnit.assertEquals("Model is consistent", autocomplete.model.term, originalValue);
                    start();
                }, 200);
            }, 150);
        });
        input.keydown();
        input.val("Utopia");
        input.focus();
        stop();
    };
    
    var gdInteractionClick = function (container, focusFunc) {
        gdInteraction(container, focusFunc, false, true, "Utopia");
    };
    
    var gdInteractionBlur = function (container, focusFunc) {
        gdInteraction(container, focusFunc, false, false, "");
    };
    
    var gdInteractionExclude = function (container, focusFunc) {
        gdInteraction(container, focusFunc, true, false, "Utopia");
    };
    
    submitTest("Test Global Dismissal interaction when click", makeArgumentedTest(gdInteractionClick, clickAuthority));
    submitTest("Test Global Dismissal interaction when blur should fire", makeArgumentedTest(gdInteractionBlur, focusBlurable));
    submitTest("Test Global Dismissal interaction with exclusion", makeArgumentedTest(gdInteractionExclude, focusMatch));
    
})(jQuery);