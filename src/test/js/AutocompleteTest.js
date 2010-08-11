/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace jqUnit jQuery start stop*/
"use strict";

(function () {

    var myAutocomplete;
    var autocompleteTests = new jqUnit.TestCase("Autocomplete Tests", function () {
        cspace.util.isTest = true;        
    }, function () {
        delete cspace.autocomplete.addConfirmDlg;
        jQuery(".cs-autocomplete-addConfirmation").detach();
    });
    
    var setupAutocomplete = function (container, opts) {
        var options = opts || {
            addConfirmationTemplate: "../../main/webapp/html/AutocompleteAddConfirmation.html",
            termSaverFn: function (term, callback) {
                callback(term + "Urn");
            },
            listeners: {
                afterRenderConfirmation: function () {
                    // TODO: This test knows too much.
                    //       This is not an ideal way to setup the add confirm dialog. 
                    //       Instead, we need to take a good look at the Autocomplete API and likely we
                    //       require a public setup function for the add confirm dialog.
                    cspace.autocomplete.addConfirmDlg.field = myAutocomplete.hiddenInput;
                    cspace.autocomplete.addConfirmDlg.newDisplayName = "myTerm";
                    myAutocomplete.locate("addButton", cspace.autocomplete.addConfirmDlg).click();
                    jqUnit.assertEquals("There is only one hidden input (CSPACE-2625)", 1, myAutocomplete.hiddenInput.length); 
                    jqUnit.assertEquals("The hidden input is set with the urn", "myTermUrn", myAutocomplete.hiddenInput.val()); 
                    start();
                }
            }
        };
        
        myAutocomplete = cspace.autocomplete(container, options);    
        stop();
    };

    autocompleteTests.test("Save new term new markup", function () {            
        setupAutocomplete("#autocomplete1");
    });
    
    autocompleteTests.test("Save new term old markup", function () {            
        setupAutocomplete("#autocomplete2");
    });
    
}());