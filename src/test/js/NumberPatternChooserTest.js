/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, jqUnit, cspace*/

(function ($) {
    
    $(document).ready(function () {
        var chooser;
        var model = {
		    "list": ["val1", "val2", "val3"],
			"samples": ["sample1", "sample2", "sample3"],
			"names": ["name1", "name2", "name3"]
        };
        var options = {
                listeners: {
                    afterRender: function () {
                        start();
                    }
                },
                model: model,
                templateUrl: "../../main/webapp/html/NumberPatternChooser.html"
            };

        var mySetup = function () {
            stop();
            chooser = cspace.numberPatternChooser(".info-value", options);
        };

        var numberPatternChooserTest = new jqUnit.TestCase("NumberPatternChooser Tests", mySetup);

	    numberPatternChooserTest.test("Construction", function () {
            jqUnit.isVisible("Number pattern chooser button should be visible", $(".csc-numberPatternChooser-button"));
	    });
    });
})(jQuery);