/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var searchBoxTester = function ($) {
    
    var container = ".termList";
    
    var bareTermListTest = new jqUnit.TestCase("TermList Tests");
    
    var termListTest = cspace.tests.testEnvironment({
        testCase: bareTermListTest
    });
    
    var setupTermList = function (callback, options) {
        options = fluid.merge(null, options || {}, {
            listeners: {
                afterRender: function (termListImpl) {
                    callback(termList, termListImpl);
                    start();
                }
            }
        });
        var termList = cspace.termList(container, options);
        return termList;
    };
    
    termListTest.asyncTest("Init and render", function () {
        setupTermList(function (termList, termListImpl) {
            jqUnit.assertValue("Term list was created", termList);
            jqUnit.assertValue("Term list impl was created", termListImpl);
        });
    });
    
    termListTest.asyncTest("Options Propagation", function () {
        var elPath = "test";
        setupTermList(function (termList, termListImpl) {
            jqUnit.assertEquals("Size of optionlist", 3, termListImpl.options.optionlist.length);
            jqUnit.assertEquals("Size of optionnames", 3, termListImpl.options.optionnames.length);
            jqUnit.assertEquals("Size of optionlist", termList.optionlist.length, termListImpl.options.optionlist.length);
            jqUnit.assertEquals("Size of optionnames", termList.optionnames.length, termListImpl.options.optionnames.length);
            jqUnit.assertEquals("El Path should be", elPath, termListImpl.options.elPath);
            jqUnit.assertEquals("Root should be", "", termListImpl.options.root);
        }, {
            elPath: elPath
        });
    });
    
    termListTest.asyncTest("Autobinding", function () {
        var elPath = "test";
        setupTermList(function (termList, termListImpl) {
            jqUnit.assertNoValue("Current selection", termListImpl.model[elPath]);
            jqUnit.assertNoValue("Current selection", termList.model[elPath]);
            termListImpl.locate("termList").val(termListImpl.options.optionlist[1]).change();
            jqUnit.assertValue("Current selection", termListImpl.model[elPath]);
            jqUnit.assertValue("Current selection", termList.model[elPath]);
        }, {
            elPath: elPath
        });
    });
};

(function () {
    searchBoxTester(jQuery);
}());