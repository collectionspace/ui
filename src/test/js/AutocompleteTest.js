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
    var bareAutocompleteTests = new jqUnit.TestCase("Autocomplete Tests"),
    
        autocompleteTests = cspace.tests.testEnvironment({
            testCase: bareAutocompleteTests
        }),
    
        popDefs = fluid.defaults("cspace.autocomplete.popup"),
    
        assertMatchCount = function (message, count, autocomplete) {
            var matchCount = $(popDefs.selectors.matchItem, autocomplete.popupElement).length;
            jqUnit.assertEquals(message, count, matchCount);
        },
    
        assertCloseVisible = function (autocomplete, state) {
            jqUnit.assertEquals("Close button visibility: " + state, state, autocomplete.closeButton.button.is(":visible"));
        },
    
        clickCloseButton = function (autocomplete) {
            autocomplete.closeButton.button.click();
        },
    
        pressEscKey = function (autocomplete) {
            var container = autocomplete.popup.container,
                escapeKey = $.ui.keyCode.ESCAPE;
            $.each(["keydown", "keyup"], function (index, value) {
                container.trigger({
                    type: value,
                    keyCode: escapeKey
                });
            });
        },
    
        openAndCloseInteraction = function(container, closeFunc) {
            expect(10);
            var autocomplete = cspace.autocomplete(container),
                input = autocomplete.autocompleteInput,
                events = autocomplete.autocomplete.events;
            jqUnit.assertValue("Constructed", autocomplete);
            jqUnit.assertValue("Found input", input);
            events.onSearch.addListener(function(newValue, permitted) {
                jqUnit.assertEquals("Search performed", "top", newValue);
                jqUnit.assertTrue("Results loading indicator", input.hasClass(autocomplete.autocomplete.options.styles.loadingStyle));
            });
            events.onSearchDone.addListener(function() {
                assertMatchCount("\"top\" results count in markup", 14, autocomplete);
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
        },

        clickMatch = function (autocomplete) {
            autocomplete.popup.dom.locate("matchItemContent").click();
        },
    
        enterMatch = function (autocomplete) {
            autocomplete.popup.dom.locate("matchItemContent").trigger({type: "keydown", keyCode: $.ui.keyCode.ENTER});
        },

        chooseMatchInteraction = function (container, chooseFunc) {
            expect(6);
            var autocomplete = cspace.autocomplete(container),
                input = autocomplete.autocompleteInput;
            autocomplete.autocomplete.events.onSearchDone.addListener(function() {
                assertMatchCount("\"Utopia\" results count in markup", 1, autocomplete);
                assertCloseVisible(autocomplete, true);
                chooseFunc(autocomplete);
                assertCloseVisible(autocomplete, false);
                var match = autocomplete.model.matches[0],
                    matchDisplayName = match.displayName,
                    matchUrn = match.urn;
                jqUnit.assertEquals("Visible field value", matchDisplayName, input.val());
                jqUnit.assertEquals("Hidden field value", matchUrn, autocomplete.hiddenInput.val());
                assertMatchCount("Dialog now empty", 0, autocomplete);
                start();
            });
    
            input.keydown();
            input.val("Utopia");
            stop();
        },
    
        clickDisabledMatch = function (autocomplete) {
            autocomplete.popup.dom.locate("matchItemContent")[1].click();
        },
    
        focusMatch = function (autocomplete) {
            autocomplete.popup.dom.locate("matchItemContent").focus();
        },

        chooseMatchInteractionDisabled = function (container, chooseFunc) {
            expect(6);
            var autocomplete = cspace.autocomplete(container),
                input = autocomplete.autocompleteInput;
            autocomplete.autocomplete.events.onSearchDone.addListener(function() {
                assertMatchCount("\"Plummer\" results count in markup", 5, autocomplete);
                assertCloseVisible(autocomplete, true);
                chooseFunc(autocomplete);
                assertCloseVisible(autocomplete, true);
                var match = autocomplete.model.matches[1],
                    matchDisplayName = match.displayName,
                    matchUrn = match.urn;
                jqUnit.assertNotEquals("Visible field value not equal to the one which was clicked", matchDisplayName, input.val());
                jqUnit.assertEquals("Hidden field value is empty", "", autocomplete.hiddenInput.val());
                assertMatchCount("Dialog is still open with its options", 5, autocomplete);
                autocomplete.closeButton.button.click();
                start();
            });
    
            input.keydown();
            input.val("Plummer");
            stop();
        },
    
        focusBlurable = function (autocomplete) {
            autocomplete.autocompleteInput.blur();
            $("#blurable").focus();
        },
    
        assertPopupOpen = function (autocomplete, state) {
            jqUnit.assertEquals("Popup open: " + state, state, autocomplete.popup.container.html() !== "");
        },
    
        assertInputFocused = function (autocomplete, state) {
            jqUnit.assertEquals("Input focus: " + state, state, document.activeElement === autocomplete.autocompleteInput[0]);
        },
    
        assertInput = function (autocomplete, value) {
            jqUnit.assertEquals("Input", value, autocomplete.autocompleteInput.val());
        },
    
        clickAuthority = function (autocomplete) {
            autocomplete.popup.dom.locate("authorityItem").eq(0).click();
        },
    
        gdInteraction = function (container, focusFunc, popupOpen, inputFocus, originalValue) {
            expect(6);
            var autocomplete = cspace.autocomplete(container),
                input = autocomplete.autocompleteInput;
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
        },
    
        gdInteractionClick = function (container, focusFunc) {
            gdInteraction(container, focusFunc, false, true, "Utopia");
        },
    
        gdInteractionBlur = function (container, focusFunc) {
            gdInteraction(container, focusFunc, false, false, "");
        },
    
        gdInteractionExclude = function (container, focusFunc) {
            gdInteraction(container, focusFunc, true, false, "Utopia");
        },
        
        newTermNameNotPresent = function(container, closeFunc) {
            expect(1);
            var autocomplete = cspace.autocomplete(container),
                input = autocomplete.autocompleteInput,
                events = autocomplete.autocomplete.events;
            events.onSearchDone.addListener(function() {
                var addTermTo = autocomplete.popup.dom.locate("addTermTo");
                jqUnit.assertEquals("addTerm line has text only", "Add \"top\" to:", addTermTo.html());
                closeFunc(autocomplete);
                start();
            });
            input.keydown();
            input.val("top");
            stop();
        },
        
        newTermNamePresent = function(container, closeFunc) {
            expect(2);
            fluid.staticEnvironment.cspaceTestEnv = fluid.typeTag("cspace.autocompleteTests");
            
            var autocomplete = cspace.autocomplete(container),
                input = autocomplete.autocompleteInput,
                events = autocomplete.autocomplete.events;
            events.onSearchDone.addListener(function() {
                var newTermName = autocomplete.popup.dom.locate("newTermName");
                jqUnit.assertEquals("newTermName is present", 1, newTermName.length);
                jqUnit.assertEquals("newTermName has a proper name set", "top", newTermName[0].value);
                closeFunc(autocomplete);
                delete fluid.staticEnvironment.cspaceTestEnv;
                start();
            });
            input.keydown();
            input.val("top");
            stop();
        },
    
        makeArgumentedTest = function (testFunc, argFunc) {
            return function(container) {
                testFunc(container, argFunc);
            };
        },
        
        submitTest = function (name, func) {
            $.each({
                "#autocomplete1": " new markup",
                "#autocomplete2": " old markup"
            }, function (autocompleteID, message) {
                autocompleteTests.test(name + message, function () {
                    func(autocompleteID);
                });
            });
        },
        
        testScenario = {
            "Input newTerm is NOT present in autocomplete by default": {
                testFunc: newTermNameNotPresent,
                argFunc: clickCloseButton
            },
            "Input newTerm is present in autocomplete by default": {
                testFunc: newTermNamePresent,
                argFunc: clickCloseButton
            },
            "Open and close interaction with close button": {
                testFunc: openAndCloseInteraction,
                argFunc: clickCloseButton
            },
            "Open and close interaction with Escape key": {
                testFunc: openAndCloseInteraction,
                argFunc: pressEscKey
            },
            "Choose match interaction with mouse item click": {
                testFunc: chooseMatchInteraction,
                argFunc: clickMatch
            },
            "Choose match interaction with ENTER key": {
                testFunc: chooseMatchInteraction,
                argFunc: enterMatch
            },
            "Choose match interaction with mouse item click for disabled NP item": {
                testFunc: chooseMatchInteractionDisabled,
                argFunc: clickDisabledMatch
            },
            "Test Global Dismissal interaction when click": {
                testFunc: gdInteractionClick,
                argFunc: clickAuthority
            },
            "Test Global Dismissal interaction when blur should fire": {
                testFunc: gdInteractionBlur,
                argFunc: focusBlurable
            },
            "Test Global Dismissal interaction with exclusion": {
                testFunc: gdInteractionExclude,
                argFunc: focusMatch
            }
        };
    
    $.each(testScenario, function(message, args){
        submitTest(message, makeArgumentedTest(args.testFunc, args.argFunc));
    });
    
})(jQuery);