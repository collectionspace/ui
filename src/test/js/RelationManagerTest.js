/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global fluid, jQuery, jqUnit, cspace*/
"use strict";

(function ($, fluid) {
    
    var relationManager;
    var applier;
    
    var baseCSID = "123456798";
    var relations = [];
    // TODO: figure out if the two models (posted and saved) should be normalized.
    var newRelations = [{
        source: {
            csid: "123456798"
        },
        target: {
            csid: "987.654"
        },
        type: "affects",
        "one-way": true
    }, {
        source: {
            csid: "123456798"
        },
        target: {
            csid: "741.852"
        },
        type: "affects",
        "one-way": true
    }];
    var expectedRelations = [{
        "csid": "987.654",
        "relationshiptype": "affects"
    }, {
        "csid": "741.852",
        "relationshiptype": "affects"
    }];
    
    var relationManagerTest = new jqUnit.TestCase("RelationManager Tests", function () {
        var model = {};
        applier = fluid.makeChangeApplier(model);
        relationManager = cspace.relationManager("#main", "objects", applier, {
            searchToRelateDialog: {
                options: {
                    templates: {
                        dialog: "../../main/webapp/html/searchToRelate.html"
                    }
                }
            }
        });
    });
    
    relationManagerTest.test("Initialization", function () {
        jqUnit.assertValue("Search to relate dialog initialized", cspace.addDialogInst);
        jqUnit.assertValue("Relation Manager's data context initialized", relationManager.dataContext);
        jqUnit.assertDeepEq("Applier is properly initalized", applier, relationManager.applier);
        jqUnit.assertDeepEq("Applier is properly initalized", "objects", relationManager.recordType);
    });
    
    relationManagerTest.test("Add Relation Dialog when the object is not saved", function () {
        jqUnit.notVisible("Add Relation Dialog is initially invisible", cspace.addDialogInst.dlg);
        relationManager.locate("addButton").click();
        jqUnit.notVisible("Add Relation Dialog is invisible becuase the object is not saved", cspace.addDialogInst.dlg);
        var message = relationManager.locate("feedbackMessage");
        jqUnit.isVisible("Error message is visible", message);
        jqUnit.assertEquals("Object should be saved first", relationManager.options.strings.pleaseSaveFirst, message.text());
    });
    
    relationManagerTest.test("Add Relation Dialog", function () {
        relationManager.applier.requestChange("csid", "123456798");
        jqUnit.notVisible("Add Relation Dialog is initially invisible", cspace.addDialogInst.dlg);
        relationManager.locate("addButton").click();
        var message = relationManager.locate("feedbackMessage");
        jqUnit.notVisible("Error message is invisible", message);
        jqUnit.isVisible("Add Relation Dialog is visible", cspace.addDialogInst.dlg);
        cspace.addDialogInst.dlg.dialog("close");
    });
    
    var setupRelationManager = function (baseCSID, relations) {
        relationManager.applier.requestChange("csid", baseCSID);
        relationManager.applier.requestChange("relations", relations);
    };
    
    relationManagerTest.test("Add relations", function () {
        setupRelationManager(baseCSID, relations);
        jqUnit.assertEquals("The object has no relations initially", relations, relationManager.applier.model.relations);
        relationManager.addRelations({items: newRelations});
        jqUnit.assertDeepEq("The object has new relations", expectedRelations, relationManager.applier.model.relations);
    });
    
    relationManagerTest.test("Add relations to none (through search to relate dialog)", function () {
        expect(4);
        setupRelationManager(baseCSID, relations);
        jqUnit.assertEquals("The object has no relations initially", relations, relationManager.applier.model.relations);
        applier.modelChanged.addListener("relations", function (model, oldModel, changeRequest) {
            jqUnit.assertDeepEq("Listener oldModel paramter should be right", [], oldModel.relations);
            jqUnit.assertDeepEq("Listener model paramter should be right", expectedRelations, model.relations);
            jqUnit.assertDeepEq("The model has been updated with the new relations.", expectedRelations, relationManager.applier.model.relations);
        });
        cspace.addDialogInst.events.afterRender.addListener(function () {
            relationManager.locate("addButton").click();
            cspace.addDialogInst.search.locate("searchButton").click();            
            cspace.addDialogInst.locate("addButton", cspace.addDialogInst.dlg).click();
        });
//        var dlgOpts = {
//            currentCSID: baseCSID,
//            dataContext: relationManager.dataContext,
//            applier: relationManager.applier,
//            templates: {
//                dialog: "test-data/template1.html"
//            }
//        };
//        var dlg = cspace.searchToRelateDialog("#dialog-container", applier, dlgOpts);
//        dlg.updateRelations(newRelations);
//        dlg.locate("addButton", dlg.dlg).click();
//        $(".csc-relate-button").click();
    });

//    relationManagerTest.test("Add relations to existing relations", function () {
//        var testModel = {};
//        fluid.model.copyModel(testModel, baseModel);
//        var existingRelation = {
//            "csid": "963.852",
//            "relationshiptype": "affects"
//        };
//        testModel.relations[0] = existingRelation;
//        var applier = fluid.makeChangeApplier(testModel);
//        var expectedRelations = [
//            existingRelation,
//            {
//                "csid": "987.654",
//                "relationshiptype": "affects"
//            }, {
//                "csid": "741.852",
//                "relationshiptype": "affects"
//            }
//        ];
//
//        applier.modelChanged.addListener("relations", function (model, oldModel, changeRequest) {
//            jqUnit.assertDeepEq("Listener oldModel paramter should be right", [existingRelation], oldModel.relations);
//            jqUnit.assertDeepEq("Listener model paramter should be right", expectedRelations, model.relations);
//            jqUnit.assertDeepEq("The model has been updated with the new relations.", expectedRelations, testModel.relations);
//            start();
//        });
//        var dlgOpts = {
//            currentCSID: baseCSID,
//            dataContext: cspace.dataContext(applier.model),
//            applier: applier,
//            templates: {
//                dialog: "test-data/template1.html"
//            }
//        };
//        var dlg = cspace.searchToRelateDialog("#dialog-container", applier, dlgOpts);
//        dlg.updateRelations(testRelations);
//    });
    
})(jQuery, fluid);