/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global fluid, jQuery, jqUnit, cspace, start, stop, expect*/
"use strict";

(function ($, fluid) {

    var baseCSID = "123456798",
        relationManagerTest = new jqUnit.TestCase("RelationManager Tests"),
        createRelationManager = function (options, permissions) {
            var model = {},
                applier = fluid.makeChangeApplier(model),
                defaultOpts = {
                    applier: applier,
                    model: model
                };

            fluid.merge({
                model: "preserve",
                applier: "nomerge"
            }, defaultOpts, options);

            var testEnv = cspace.tests.testEnvironment({permissions: permissions}),
                relationManager = fluid.withEnvironment(testEnv.environment, function() {
                    return cspace.relationManager("#main", defaultOpts);
                });
            return relationManager;
        },
        relationDialogSetup = function (options) {
            var csid = (options.hasPrimaryCSID) ? baseCSID : undefined,
                manager = createRelationManager({
                    primary: options.primary,
                    related: options.related,
                    primaryCSID: csid
                }, options.permissions);
            options.callback(manager);
        };

    cspace.tests.testRelationInit = function (anyPerms) {
        relationManagerTest.test("Initialization: user permissions " + anyPerms, function() {
            var recordType = "cataloging",
                relationManager = createRelationManager({
                    primary: recordType,
                    related: recordType
                }),
                addVisible = anyPerms;
            jqUnit.assertDeepEq("Related record is properly initalized", recordType, relationManager.options.related);
            jqUnit.assertTrue("Add button is visible: " + addVisible, relationManager.locate("addButton").is(":visible"));
        }, anyPerms ? undefined : {});
    };
    cspace.tests.testRelationInit(true);
    cspace.tests.testRelationInit(false);

    var testScenarios = {
        "Add Relation Dialog when the object is not saved": {
            callback: function (relationManager) {
                var messageBar = relationManager.messageBar,
                    uiDialog = $(".ui-dialog");
                jqUnit.notVisible("Search to Relate Dialog is invisible initially", uiDialog);
                relationManager.locate("addButton").click();
                jqUnit.notVisible("Search to Relate Dialog is invisible if the record is not saved", uiDialog);
                jqUnit.isVisible("Error message is visible", messageBar.container);
                jqUnit.assertEquals("Object should be saved first", relationManager.options.parentBundle.resolve("relationManager-pleaseSaveFirst"), messageBar.locate("message").text());
                start();
            },
            primary: "cataloging",
            related: "cataloging"
        },
        "Add Relation Dialog, for specific record type": {
            callback: function (relationManager) {
                var searchToRelateDialog = relationManager.searchToRelateDialog,
                    recordTypeSelect = searchToRelateDialog.search.mainSearch.locate("recordTypeSelect");
                jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
                relationManager.locate("addButton").click();
                jqUnit.notVisible("Error message is invisible", relationManager.messageBar.container);
                jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.dialogNode);
                jqUnit.assertEquals("Dialog should have correct primary record type", "cataloging", searchToRelateDialog.options.primary);
                jqUnit.assertTrue("Record-type drop-down is not visible (search should be limited to 'loanin' records)", recordTypeSelect.is(":disabled"));
                jqUnit.assertEquals("Dialog is set up to search for correct related record type", "loanin", recordTypeSelect.val());
                searchToRelateDialog.close();
                start();
            },
            primary: "cataloging",
            related: "loanin",
            permissions: {
                loanin: ["read", "update", "create"],
                cataloging: ["update", "create"]
            },
            hasPrimaryCSID: true
        },
        "Add Relation Dialog, for all procedural records (using 'procedures' option)": {
            callback: function (relationManager) {
                var searchToRelateDialog = relationManager.searchToRelateDialog,
                    uiDialog = $(".ui-dialog");
                jqUnit.notVisible("Search to Relate Dialog is invisible initially", uiDialog);
                relationManager.locate("addButton").click();
                jqUnit.notVisible("Error message is invisible", relationManager.messageBar.container);
                jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.dialogNode);
                jqUnit.assertEquals("Dialog should have correct primary record type", "cataloging", searchToRelateDialog.options.primary);
                jqUnit.isVisible("Record-type drop-down is visible", searchToRelateDialog.locate("recordType"));
                searchToRelateDialog.close();
                jqUnit.notVisible("Search to Relate Dialog is invisible after close", uiDialog);
                start();
            },
            primary: "cataloging",
            related: "procedures",
            hasPrimaryCSID: true
        },
        "Fire create new record event": {
            callback: function (relationManager) {
                var searchToRelateDialog = relationManager.searchToRelateDialog;
                jqUnit.assertUndefined("The object has no relations initially", relationManager.model.relations);
                relationManager.locate("addButton").click();
                jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", searchToRelateDialog.container);
                searchToRelateDialog.events.onCreateNewRecord.addListener(function () {
                    jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                    start();
                });
                searchToRelateDialog.locate("createNewButton").click();
            },
            primary: "cataloging",
            related: "loanin",
            permissions: {
                loanin: ["read", "update", "create"],
                cataloging: ["update", "create"]
            },
            hasPrimaryCSID: true
        }
    };

    $.each(testScenarios, function(message, testScenario) {
        relationManagerTest.asyncTest(message, function () {
            relationDialogSetup(testScenario);
        });
    });
})(jQuery, fluid);