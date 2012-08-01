/*
Copyright Museum of Moving Image 2012

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
    
    var checkURLValidity = function (urls, input, button, externalURL) {
        var url, validURL,
            errorClass = externalURL.options.styles.error;
        
        fluid.each(urls, function (testPair) {
            url = testPair[0];
            validURL = testPair[1];
            
            input.val(url);
            input.change();
            
            jqUnit.assertEquals("Link button has a proper url set for " + url, (validURL && url !== "") ? url : "#", button.attr("href"));
            jqUnit.assertNotEquals("Input has a proper class for " + url, validURL, input.hasClass(errorClass));
            jqUnit.assertNotEquals("Link button has a proper class for " + url, validURL, button.hasClass(errorClass));
        });
    };
    
    datePickerTest.test("Initialization", function () {
        // IMPROVE REGEX to parse such fail urls like
        // http://jsonlint..com or http://www1.cbc.ca/
        
        expect(28);
        
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
        
        // Check valid URLs
        var urls = [
            [ "http://jsonlint.com/", true ],
            [ "http://jsonlint.com", true ],
            [ "", true ],
            [ "http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url", true ],
            [ "http://www.cbc.ca/", true ],
            [ "hp://jsonlint.com/", false ],
           // [ "http://jsonlint..com", false ], NEED TO FIND A BETTER URL PARSER
            [ "-", false ],
            [ "htt/#!@#\"/stackov&^%&%^*flow.com//////3809401/what-is-a-good-regular-expression-to-match-a-url", false ],
           // [ "http://www1.cbc.ca/", false ] NEED TO FIND A BETTER URL PARSER
        ];
        
        checkURLValidity(urls, input, button, externalURL);
    });
};

(function () {
    externalURLTester(jQuery);
}());