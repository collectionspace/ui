/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/

var searchToRelateDialogTester = function () {
    // jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;
    /*
     * Utility to call qUnit's start() only once all tests have executed
     */
    var done = 0;
    var startIfDone = function (numTests) {
        if (++done === numTests) {
            done = 0;
            start();
        }
    };
    
    var baseCSID = "123.456.789";
    var baseModel = {
        csid: "123.456.789",
        relations: []
    };

    var testRelations = {
        items: [{
            source: { csid: baseCSID },
            target: { csid: "987.654" },
            type: "affects",
            "one-way": true
        }, {
            source: { csid: baseCSID },
            target: { csid: "741.852" },
            type: "affects",
            "one-way": true
        }]
    };
    
    var searchToRelateDialogTest = new jqUnit.TestCase("SearchToRelateDialog Tests");
    
    searchToRelateDialogTest.test("Add relations to none", function () {
        var testModel = {};
        fluid.model.copyModel(testModel, baseModel);
        var applier = fluid.makeChangeApplier(testModel);
        var expectedRelations = [{
            "csid": "987.654",
            "relationshiptype": "affects"
        }, {
            "csid": "741.852",
            "relationshiptype": "affects"
        }];

        applier.modelChanged.addListener("relations", function (model, oldModel, changeRequest) {
            jqUnit.assertDeepEq("Listener oldModel paramter should be right", baseModel.relations, oldModel.relations);
            jqUnit.assertDeepEq("Listener model paramter should be right", expectedRelations, model.relations);
            jqUnit.assertDeepEq("The model has been updated with the new relations.", expectedRelations, testModel.relations);
            start();
        });
        var dlgOpts = {
            currentCSID: baseCSID,
            dataContext: cspace.dataContext(applier.model),
            applier: applier,
            templates: {
                dialog: "test-data/template1.html"
            }
        };
        var dlg = cspace.searchToRelateDialog("#dialog-container", applier, dlgOpts);
        dlg.updateRelations(testRelations);
    });

    searchToRelateDialogTest.test("Add relations to existing relations", function () {
        var testModel = {};
        fluid.model.copyModel(testModel, baseModel);
        var existingRelation = {
            "csid": "963.852",
            "relationshiptype": "affects"
        };
        testModel.relations[0] = existingRelation;
        var applier = fluid.makeChangeApplier(testModel);
        var expectedRelations = [
            existingRelation,
            {
                "csid": "987.654",
                "relationshiptype": "affects"
            }, {
                "csid": "741.852",
                "relationshiptype": "affects"
            }
        ];

        applier.modelChanged.addListener("relations", function (model, oldModel, changeRequest) {
            jqUnit.assertDeepEq("Listener oldModel paramter should be right", [existingRelation], oldModel.relations);
            jqUnit.assertDeepEq("Listener model paramter should be right", expectedRelations, model.relations);
            jqUnit.assertDeepEq("The model has been updated with the new relations.", expectedRelations, testModel.relations);
            start();
        });
        var dlgOpts = {
            currentCSID: baseCSID,
            dataContext: cspace.dataContext(applier.model),
            applier: applier,
            templates: {
                dialog: "test-data/template1.html"
            }
        };
        var dlg = cspace.searchToRelateDialog("#dialog-container", applier, dlgOpts);
        dlg.updateRelations(testRelations);
    });
};


(function () {
    searchToRelateDialogTester();
}());

