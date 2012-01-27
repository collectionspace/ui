/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0.
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var rtTester = function ($) {

    var container = "#main";

    var bareRecordTraverserTest = new jqUnit.TestCase("recordTraverser Tests");

    var recordTraverserTest = cspace.tests.testEnvironment({testCase: bareRecordTraverserTest});
    
    var setupRecordTraverser = function (options) {
        return cspace.recordTraverser(container, options);
    };

    recordTraverserTest.test("Creation with no Loco Storage", function () {
        var rt = setupRecordTraverser();
        
        jqUnit.assertNoValue("Record Traverser found nothing in the local storage", rt.model.recordsData);
        
        jqUnit.assertEquals("Record Traverser did not render anything", 0, rt.locate("linkNext").length);
        jqUnit.assertEquals("Record Traverser did not render anything", 0, rt.locate("linkPrevious").length);
        jqUnit.assertEquals("Record Traverser did not render anything", 0, rt.locate("linkCurrent").length);
    });
    
    recordTraverserTest.test("Creation with no Loco Storage", function () {
        var rt = setupRecordTraverser();
        
        jqUnit.assertNoValue("Record Traverser found nothing in the local storage", rt.model.recordsData);
    });
};

jQuery(document).ready(function () {
    rtTester(jQuery);
});