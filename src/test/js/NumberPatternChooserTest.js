/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, jqUnit, cspace*/

(function ($) {
    
    var model = {
            "list": ["val1", "val2", "val3"],
            "samples": ["sample1", "sample2", "sample3"],
            "names": ["name1", "name2", "name3"]
    };
    
    var testOpts = {
        model: model,
        templateUrl: "../../main/webapp/defaults/html/components/NumberPatternChooser.html",
        baseUrl: "../data"
    };

    
    var numberPatternChooserTest = new jqUnit.TestCase("NumberPatternChooser Tests", function () {
        cspace.util.isTest = true;
    });

    numberPatternChooserTest.test("Creation", function () {
        var numberPatternChooser;
        testOpts.listeners = {
            afterRender: function () {
                jqUnit.isVisible("Number pattern chooser button should be visible", $(".csc-numberPatternChooser-button"));
                start();
            }
        };
        
        numberPatternChooser = cspace.numberPatternChooser(".info-value", testOpts);
        stop();
    });

})(jQuery);