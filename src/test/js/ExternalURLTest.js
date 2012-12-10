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

    var bareExternalURLTest = new jqUnit.TestCase("ExternalURL Tests");
    
    var externalURLTest = cspace.tests.testEnvironment({
        testCase: bareExternalURLTest
    });
    
    // Function to loop through all available testOptions of type {url : ifItIsValid} and see that component reacts accordingly
    var checkURLValidity = function (urls, input, button, externalURL) {
        var url, validURL,
            errorClass = externalURL.options.styles.error;
        
        fluid.each(urls, function (testPair) {
            url = $.trim(testPair[0]);
            validURL = testPair[1];
            
            input.val(url);
            input.change();
            
            jqUnit.assertEquals("Link button has a proper url set for " + url, (validURL && url !== "") ? url : "#", button.attr("href"));
            jqUnit.assertNotEquals("Input has a proper class for " + url, validURL, input.hasClass(errorClass));
            jqUnit.assertNotEquals("Link button has a proper class for " + url, validURL, button.hasClass(errorClass));
        });
    };
    
    // Function to test proper styling of a freshly created component and check for URL validation
    var initAndURLCheck = function (externalURL, selectors, button, input) {
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
            [ "http://jsonlint..com", false ],
            [ "-", false ],
            [ "htt/#!@#\"/stackov&^%&%^*flow.com//////3809401/what-is-a-good-regular-expression-to-match-a-url", false ],
            [ "http://www1.cbc.ca/", true ],
            [ "http://upload.wikimedia.org/wikipedia/en/7/78/Trollface.svg", true],
            [ "http://upload.wikimedia.org/wikipedia/en/thumb/7/78/Trollface.svg/200px-Trollface.svg.png", true],
            [ "http://www.nasa.gov/images/content/674789main_pia16021-full_full.jpg", true],
            [ "http://www.nasa.gov/images/content/674789main_pia16021-full_full.jpg            ", true]
        ];
        
        expect(4 + urls.length * 3);
        checkURLValidity(urls, input, button, externalURL);
    };
    
    // Function to check UI elements and component if it was created with readOnly flag
    var readOnlyCheck = function (externalURL, selectors, button, input) {
        var defaultURL = "some.url";
        
        button.prop("href", defaultURL);
        
        jqUnit.assertEquals("Link button has URL ", defaultURL, button.attr("href"));
        jqUnit.assertEquals("Input is disabled", "disabled", input.attr("disabled"));
        
        input.val("some.other.url");
        input.change();
        jqUnit.assertEquals("Link button has URL", defaultURL, button.attr("href"));
    };
    
    // Function to create ExternalURL, variables which link to the related UI elements. Then call testFunction
    var setupAndTest = function (extraOptions, testFunction) {
        var inputSelector = ".csc-input",
            externalURL = cspace.externalURL(inputSelector, $.extend(true, {}, extraOptions)),
            input = $(inputSelector),
            selectors = externalURL.options.selectors,
            button = $(selectors.externalURLButton);
        
        testFunction(externalURL, selectors, button, input);
    };
    
    // TESTING PART ->
    
    externalURLTest.test("Initialization", function () {
        // IMPROVE REGEX to parse such fail urls like
        // http://jsonlint..com or http://www1.cbc.ca/
        setupAndTest({}, initAndURLCheck);
    });
    
    externalURLTest.test("Read only", function () {
        expect(3);
        setupAndTest({
            readOnly: true
        }, readOnlyCheck);   
    });
};

(function () {
    externalURLTester(jQuery);
}());