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
        var testBar;
        var options = {
                listeners: {
                    afterRender: function () {
                        start();
                    }
                },
                templateURL: "../../main/webapp/html/TitleBarTemplate.html"
            };
        
        var mySetup = function () {
            stop();
            testBar = cspace.titleBar("#insert-title-bar-here", options);
        };

        var tests = jqUnit.testCase("TitleBar Tests", mySetup);
        
        // this tests a modal dialog - it might have to remain last in the file
        tests.test("Creation", function () {
            jqUnit.isVisible("Title bar should be visible", $(".title-bar"));
        });
    });
    
})(jQuery);
