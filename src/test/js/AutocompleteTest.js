/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace jqUnit jQuery start stop*/
"use strict";

fluid.demands("cspace.specBuilderImpl", "cspace.test", {
    spec: {
        async: false
    }
});

(function ($) {
    var autocompleteTests = new jqUnit.TestCase("Autocomplete Tests");
    
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
    }
    
    var openAndCloseInteraction = function (container, closeFunc) {
        expect(10);
        var autocomplete = cspace.autocomplete(container);
        jqUnit.assertValue("Constructed", autocomplete);
        var input = autocomplete.autocompleteInput;
        jqUnit.assertValue("Found input", input);
        autocomplete.autocomplete.events.onSearch.addListener(function(newValue, permitted) {
            jqUnit.assertEquals("Search performed", "all", newValue);
            jqUnit.assertTrue("Results loading indicator", input.hasClass(autocomplete.autocomplete.options.styles.loadingStyle));
        });
        autocomplete.autocomplete.events.onSearchDone.addListener(function() {
            assertMatchCount("\"all\" results count in markup", 11, autocomplete);
            assertCloseVisible(autocomplete, true);
            closeFunc(autocomplete);
            assertCloseVisible(autocomplete, false);
            assertMatchCount("Dialog now empty", 0, autocomplete);
            jqUnit.assertEquals("Field emptied", "", input.val());
            start();
        });
        jqUnit.assertTrue("Close button initially hidden", autocomplete.closeButton.button.is(":hidden"));
        input.keydown();
        input.val("all");
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
        popup.dom.locate("matchItem").click();        
    }
    
    function enterMatch(autocomplete) {
        autocomplete.popup.dom.locate("matchItem").trigger({type: "keydown", keyCode: $.ui.keyCode.ENTER});
    }

    var chooseMatchInteraction = function (container, chooseFunc) {
        expect(6);
        var autocomplete = cspace.autocomplete(container);
        var input = autocomplete.autocompleteInput;
        autocomplete.autocomplete.events.onSearchDone.addListener(function() {
            assertMatchCount("\"karen\" results count in markup", 1, autocomplete);
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
        input.val("karen");
        stop();
    };
    
    submitTest("Choose match interaction with mouse item click", makeArgumentedTest(chooseMatchInteraction, clickMatch));
    submitTest("Choose match interaction with ENTER key", makeArgumentedTest(chooseMatchInteraction, enterMatch));
    
})(jQuery);