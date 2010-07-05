/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace jqUnit start stop*/

(function () {

    var autocompleteTests = new jqUnit.TestCase("Autocomplete Tests", function () {
        cspace.util.isTest = true;
    });

    autocompleteTests.test("Save new term", function () {
        var myAutocomplete;
        var opts = {
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
                    jqUnit.assertEquals("The hidden input is set with the urn", "myTermUrn", myAutocomplete.hiddenInput.val()); 
                    start();
                }
            }
        };
            
        myAutocomplete = cspace.autocomplete("#autocomplete", opts);    
        stop();
    });    
    
}());
