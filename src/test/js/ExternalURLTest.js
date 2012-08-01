/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, expect*/
"use strict";

var externalURLTester = function ($) {
    
    var datePickerTest = new jqUnit.TestCase("ExternalURL Tests", function () {
        cspace.util.isTest = true;
    });
    
    var checkURLValidity = function (testPair, input, button, externalURL) {
        var url = testPair[0],
            validURL = testPair[1],
            errorClass = externalURL.options.styles.error;
        
        input.val(url);
        input.change();
        
        jqUnit.assertEquals("Link button has a proper url set for " + url, (validURL || url !== "") ? url : "#", button.attr("href"));
        jqUnit.assertNotEquals("Input has a proper class for " + url, validURL, input.hasClass(errorClass));
        jqUnit.assertNotEquals("Link button has a proper class for " + url, validURL, button.hasClass(errorClass));
    };
    
    datePickerTest.test("Initialization", function () {
        expect(4);
        
        var inputSelector = ".csc-input",
            externalURL = cspace.externalURL(inputSelector, {
                messageBar: cspace.messageBar("body")
            }),
            input = $(inputSelector),
            selectors = externalURL.options.selectors,
            button = $(selectors.externalURLButton);
        
        jqUnit.assertNotUndefined("ExternalURL component should not be undefined", externalURL);
        jqUnit.assertEquals("Input has a proper class", true, input.hasClass(selectors.externalURL.slice(1)));
        jqUnit.assertNotUndefined("There is a link button beside the input with a proper class", button);
        jqUnit.assertEquals("Link button does not have address yet", "#", button.attr("href"));
        
        var urls;
        // Check valid URLs
        urls = [
            [ "http://jsonlint.com/", true ],
            [ "http://jsonlint.com", true ],
            [ "", true ],
            [ "http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url", true ],
            [ "http://www.cbc.ca/", true ]
        ];
        
        fluid.each(urls, function (url) {
            checkURLValidity(url, input, button, externalURL);
        });
        
        // Check invalid URLs
        urls = [
            [ "hp://jsonlint.com/", false ],
            [ "http://jsonlint..com", false ],
            [ "-", false ],
            [ "htt/#!@#\"/stackov&^%&%^*flow.com//////3809401/what-is-a-good-regular-expression-to-match-a-url", false ],
            [ "http://www1.cbc.ca/", false ]
        ];
        
        fluid.each(urls, function (url) {
            checkURLValidity(url, input, button, externalURL);
        });
        
        // Check a mash of invalid and valid URLs
        
    });
};

(function () {
    externalURLTester(jQuery);
}());