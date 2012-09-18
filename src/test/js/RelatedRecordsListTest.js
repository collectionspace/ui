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

    cspace.relatedRecordsList.testFinalInit = function (that) {
        that.events.afterSetup.fire(that);
    };

    var bareRelatedRecordsListTest = new jqUnit.TestCase("RelatedRecordsList Tests", function () {
            bareRelatedRecordsListTest.fetchTemplate("../../main/webapp/defaults/html/components/SidebarTemplate.html", ".csc-right-sidebar");
        }, function () {
            $(".ui-dialog").detach();
        }),
        relatedRecordsListTest = cspace.tests.testEnvironment({testCase: bareRelatedRecordsListTest}),
        createRelatedRecordsList = function (model, primary, related, opts, inApplier) {
            var applier = inApplier || fluid.makeChangeApplier(model),
                defaultOpts = {
                    related: related,
                    primary: primary,
                    model: model,
                    applier: applier
                },
                glModel = {
                    csid: "123456789"
                },
                glApplier = fluid.makeChangeApplier(model);
            fluid.merge(null, defaultOpts, opts);
            relatedRecordsListTest.globalModel.attachModel({
                primaryModel: {
                    model: glModel,
                    applier: glApplier
                }
            });
            var relatedRecordsList = cspace.relatedRecordsList(".csc-related-record", defaultOpts);
        },
        configureSTRDialog = function (handler, primary, related) {
            var opts = {
                listeners: {
                    afterSetup: handler
                },
                events: {
                    afterSetup: null
                },
                finalInitFunction: "cspace.relatedRecordsList.testFinalInit"
            };
            createRelatedRecordsList({}, primary, related, opts);
        },
        basicConfigureTest = function (options) {
            configureSTRDialog(function (relatedRecordsList) {
                var sel = options.sel,
                    condition = options.condition,
                    relationManager = relatedRecordsList.relationManager,
                    searchToRelateDialog = relationManager.searchToRelateDialog,
                    uiDialog = $(".ui-dialog");
                relationManager.locate("addButton").click();
                jqUnit.isVisible("Search to relate Dialog is visible after click", uiDialog);
                jqUnit.assertEquals("Record-type drop-down is " + sel + " - " + condition, 
                    condition, searchToRelateDialog.search.mainSearch.locate("recordTypeSelect").is(sel));
                searchToRelateDialog.close();
                jqUnit.notVisible("Search to relate Dialog is invisible after close", uiDialog);
                start();
            }, "cataloging", options.related);
        },
        testScenarios = {
            "Configure SearchToRelate Dialog for cataloging": {
                sel: ":disabled",
                condition: true,
                related: "cataloging"
            },
            "Configure SearchToRelate Dialog for all procedure types (using 'procedures' configuration)": {
                sel: ":disabled",
                condition: false,
                related: "procedures"
            }
        };

    $.each(testScenarios, function(message, testScenario) {
        relatedRecordsListTest.asyncTest(message, function () {
            basicConfigureTest(testScenario);
        });
    });
};

jQuery(document).ready(function () {
    rrlTester(jQuery);
});