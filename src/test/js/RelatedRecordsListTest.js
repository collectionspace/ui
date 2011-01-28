/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, jqUnit, cspace*/
"use strict";

var rrlTester = function ($) {
    
    var testModel = {
        csid: "123456789",
        relations: [{
            summary: "Stamp albums. Famous stars series stamp album.",
            csid: "1984.068.0338",
            number: "1984.068.0338",
            relid: "19ba9f30-75c3-41c8-b3e6",
            relationshiptype: "affects",
            recordtype: "cataloging"
        }, {
            summary: "Souvenir books. Molly O' Play Book.",
            csid: "2005.018.1383",
            number: "2005.018.1383",
            relid: "e8d20612-e1f5-4e90-bc36",
            relationshiptype: "affects",
            recordtype: "cataloging"
        }]
    };

    var uispec;
    $.ajax({
        async: false,
        data: "json",
        url: "../../main/webapp/html/uispecs/cataloging.json",
        success: function (data) {
            data = JSON.parse(data);
            uispec = data.sidebar;
        }
    });
    
    var bareRelatedRecordsListTest = new jqUnit.TestCase("RelatedRecordsList Tests", function () {
        bareRelatedRecordsListTest.fetchTemplate("../../main/webapp/html/SidebarTemplate.html", ".csc-right-sidebar");
    }, function () {
        $(".ui-dialog").detach();
    });
    
    var relatedRecordsListTest = cspace.tests.testEnvironment({testCase: bareRelatedRecordsListTest});
    
    var createRelatedRecordsList = function (model, primary, related, opts, inApplier) {
        var applier = inApplier || fluid.makeChangeApplier(model);
        var defaultOpts = {
            related: related,
            primary: primary,
            model: model,
            applier: applier,
            uispec: uispec.relatedCataloging
        };
        fluid.merge(null, defaultOpts, opts);
        var relatedRecordsList = cspace.relatedRecordsList(".csc-related-record", defaultOpts);
    };
    
    var configureSTRDialog = function (handler, primary, related) {
        var opts = {
            listeners: {
                afterSetup: handler
            }
        };
        createRelatedRecordsList(testModel, primary, related, opts);
        stop();
    };
    
    var basicConfigureTest = function (sel, condition, related) {
        configureSTRDialog(function (relatedRecordsList) {
            relatedRecordsList.relationManager.locate("addButton").click();
            jqUnit.isVisible("Search to relate Dialog is visible after click", $(".ui-dialog"));
            jqUnit.assertEquals("Record-type drop-down is " +sel + " - " + condition, 
                condition, relatedRecordsList.relationManager.searchToRelateDialog.locate("recordType").is(sel));
            relatedRecordsList.relationManager.searchToRelateDialog.close();
            jqUnit.notVisible("Search to relate Dialog is invisible after close", $(".ui-dialog"));
            start();
        }, "cataloging", related);
    };

    relatedRecordsListTest.test("Configure SearchToRelate Dialog for cataloging", function () {
        //expect drop down to be disabled since cataloging is the only record type in this category
        basicConfigureTest(":disabled", true, "cataloging");
    });

    relatedRecordsListTest.test("Configure SearchToRelate Dialog for all procedure types (using 'procedures' configuration)", function () {
        basicConfigureTest(":disabled", false, "procedures");
    });
};

jQuery(document).ready(function () {
    rrlTester(jQuery);
});