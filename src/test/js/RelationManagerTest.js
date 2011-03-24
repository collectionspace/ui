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
  
    var baseCSID = "123456798";
    // TODO: figure out if the two models (posted and saved) should be normalized.
    var newRelations = [{
        source: {
            csid: "123456798"
        },
        target: {
            csid: "987.654",
            recordtype: "cataloging"
        },
        type: "affects",
        "one-way": true
    }, {
        source: {
            csid: "123456798"
        },
        target: {
            csid: "741.852",
            recordtype: "cataloging"
        },
        type: "affects",
        "one-way": true
    }];
    var expectedRelations = [{
        "csid": "987.654",
        "relationshiptype": "affects",
        "recordtype": "cataloging"
    }, {
        "csid": "741.852",
        "relationshiptype": "affects",
        "recordtype": "cataloging"
    }];
    
    var relationManagerTest = new jqUnit.TestCase("RelationManager Tests");
    
    var createRelationManager = function (model, opts, inApplier, permissions) {
        var applier = inApplier || fluid.makeChangeApplier(model);
        var defaultOpts = {
            applier: applier,
            model: model,
            addRelations: cspace.relationManager.provideLocalAddRelations
        };
        fluid.merge(null, defaultOpts, opts);
        var testEnv = cspace.tests.testEnvironment({permissions: permissions});
        var relationManager = fluid.withEnvironment(testEnv.environment, function() { 
            return cspace.relationManager("#main", defaultOpts);
        });
        if (opts && opts.stopTests) {
            stop();
        }
        return relationManager;
    };
    

    cspace.tests.testRelationInit = function (anyPerms) {
        relationManagerTest.test("Initialization: user permissions " + anyPerms, function() { 
            var relationManager = createRelationManager({}, {primary: "cataloging", related: "cataloging"});
            var addVisible = anyPerms;
            jqUnit.assertValue("Relation Manager's data context initialized", relationManager.dataContext);
            jqUnit.assertDeepEq("Related record is properly initalized", "cataloging", relationManager.options.related);
            jqUnit.assertTrue("Add button is visible: " + addVisible, relationManager.locate("addButton").is(":visible"));
        }, anyPerms? undefined : {});
    };
    cspace.tests.testRelationInit(true);
    cspace.tests.testRelationInit(false);
    
    var relationDialogSetup = function (callback, primary, related, model, permissions) {
        var manager = createRelationManager(model || {}, {
            primary: primary,
            related: related,
            stopTests: true
        }, null, permissions);
        callback(manager);
    };
    
    relationManagerTest.test("Add Relation Dialog when the object is not saved", function () {
        relationDialogSetup(function (relationManager) {
            jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
            relationManager.locate("addButton").click();
            jqUnit.notVisible("Search to Relate Dialog is invisible if the record is not saved", $(".ui-dialog"));
            jqUnit.isVisible("Error message is visible", relationManager.options.messageBar.container);
            jqUnit.assertEquals("Object should be saved first", relationManager.options.strings.pleaseSaveFirst, relationManager.options.messageBar.locate("message").text());
            start();
        }, "cataloging", "cataloging");
    });
    
    relationManagerTest.test("Add Relation Dialog, for specific record type", function () {
        relationDialogSetup(function (relationManager) {
            relationManager.options.applier.requestChange("csid", "123456798");
            jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
            relationManager.locate("addButton").click();
            jqUnit.notVisible("Error message is invisible", relationManager.options.messageBar.container);
            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.dialogNode);
            jqUnit.assertEquals("Dialog should have correct primary record type", "cataloging", 
                 relationManager.searchToRelateDialog.options.primary);
            jqUnit.assertTrue("Record-type drop-down is not visible (search should be limited to 'loanin' records)", 
                 relationManager.searchToRelateDialog.search.mainSearch.locate("recordTypeSelect").is(":disabled"));
            jqUnit.assertEquals("Dialog is set up to search for correct related record type", "loanin", 
                 relationManager.searchToRelateDialog.search.mainSearch.locate("recordTypeSelect").val());
            relationManager.searchToRelateDialog.close();
            start();
        }, "cataloging", "loanin", {}, {loanin: ["read", "update"], cataloging: ["update"]});
    });
    
    relationManagerTest.test("Add Relation Dialog, for all procedural records (using 'procedures' option)", function () {
        relationDialogSetup(function (relationManager) {
            relationManager.options.applier.requestChange("csid", "123456798");
            jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
            relationManager.locate("addButton").click();
            jqUnit.notVisible("Error message is invisible", relationManager.options.messageBar.container);
            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.dialogNode);
            jqUnit.assertEquals("Dialog should have correct primary record type", "cataloging", relationManager.searchToRelateDialog.options.primary);
            jqUnit.isVisible("Record-type drop-down is visible", relationManager.searchToRelateDialog.locate("recordType"));
            relationManager.searchToRelateDialog.close();
            jqUnit.notVisible("Search to Relate Dialog is invisible after close", $(".ui-dialog"));
            start();
        }, "cataloging", "procedures");
    });
    
    relationManagerTest.test("Add Relation Dialog, search for particular procedural record type", function () {
        var testRelatedRecordType = "movement";
        var relationManager;
        var afterSetupListener = function(searchDialog) {
            relationManager.options.applier.requestChange("csid", "123456798");
            jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
            relationManager.locate("addButton").click();
            jqUnit.notVisible("Error message is invisible", relationManager.options.messageBar.container);
            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.searchToRelateDialog.container);
            jqUnit.isVisible("Record-type drop-down is visible", relationManager.searchToRelateDialog.search.mainSearch.locate("recordTypeSelect"));
            
            relationManager.searchToRelateDialog.search.mainSearch.locate("recordTypeSelect").val(testRelatedRecordType);
            searchDialog.search.mainSearch.locate("searchButton").click();

        };
        relationManager = createRelationManager({}, {
            primary: "cataloging", 
            related: "procedures",
            components: {
                searchToRelateDialog: {
                    options: {
                        listeners: {
                            afterSetup: function (searchDialog) {
                                setTimeout(function() { afterSetupListener(searchDialog);}, 1);
                            }

                        },
                        components: {
                        search: {
                            options: {
                                listeners: {
                                    onSearch: function () {
                                        jqUnit.assertEquals("Search should be searching for the correct related record type", testRelatedRecordType, relationManager.searchToRelateDialog.search.model.searchModel.recordType);
                                        relationManager.searchToRelateDialog.close();
                                        start();
                                    }
                                }
                            }
                        }
                        }
                    }
                }
            }
        });
        stop();
    });
    
    relationManagerTest.test("Add relations", function () {
        var relationManager = createRelationManager({
                csid: baseCSID,
                relations: {}
            }, {primary: "cataloging", related: "cataloging"});
        jqUnit.assertDeepEq("The object has no relations initially", {}, relationManager.model.relations);
        relationManager.addRelations({items: newRelations});
        jqUnit.assertDeepEq("The object has new relations", expectedRelations, relationManager.model.relations.cataloging);
    });
    
    relationManagerTest.test("Add relations to none (through search to relate dialog)", function () {
        expect(4);
        var model = {
            csid: baseCSID,
            relations: {}
        };
        var applier = fluid.makeChangeApplier(model);
        var relationManager;
        applier.modelChanged.addListener("relations", function (model, oldModel, changeRequest) {
            jqUnit.assertDeepEq("Listener oldModel parameter should be right", {}, oldModel.relations);
            jqUnit.assertDeepEq("Listener model paramter should be right", expectedRelations, model.relations.cataloging);
            jqUnit.assertDeepEq("The model has been updated with the new relations.", expectedRelations, relationManager.model.relations.cataloging);
            start();
        });
        relationManager = createRelationManager(model, {primary: "cataloging", related: "cataloging", stopTests: true}, applier);
        jqUnit.assertDeepEq("The object has no relations initially", {}, relationManager.model.relations);
        relationManager.addRelations({items: newRelations});
    });
    
    relationManagerTest.test("Fire create new record event", function () {
        expect(3);
        var model = {
            csid: baseCSID,
            relations: {}
        };
        relationDialogSetup(function (relationManager) {
            jqUnit.assertDeepEq("The object has no relations initially", {}, relationManager.model.relations);
            relationManager.locate("addButton").click();
            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.searchToRelateDialog.container);
            relationManager.searchToRelateDialog.events.onCreateNewRecord.addListener(function () {
                jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                start();
            });
            $(relationManager.searchToRelateDialog.options.selectors.createNewButton).click();
        }, "cataloging", "acquisition", model, {acquisition: ["update"], cataloging: "update"});
    });
    
})(jQuery, fluid);