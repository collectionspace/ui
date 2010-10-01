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
    
    var relationManager;
    var applier;
    
    var baseCSID = "123456798";
    // TODO: figure out if the two models (posted and saved) should be normalized.
    var newRelations = [{
        source: {
            csid: "123456798"
        },
        target: {
            csid: "987.654",
            recordtype: "objects"
        },
        type: "affects",
        "one-way": true
    }, {
        source: {
            csid: "123456798"
        },
        target: {
            csid: "741.852",
            recordtype: "objects"
        },
        type: "affects",
        "one-way": true
    }];
    var expectedRelations = [{
        "csid": "987.654",
        "relationshiptype": "affects",
        "recordtype": "objects"
    }, {
        "csid": "741.852",
        "relationshiptype": "affects",
        "recordtype": "objects"
    }];
    
    var relationManagerTest = new jqUnit.TestCase("RelationManager Tests", function () {
        cspace.util.isTest = true;
    }, function () {
        $(".ui-dialog").detach();
    });
    
    var createRelationManager = function (model, primary, related, opts, inApplier) {
        applier = inApplier || fluid.makeChangeApplier(model);
        var defaultOpts = {
            applier: applier,
            model: model,
            primary: primary,
            related: related,
            components: {
                searchToRelateDialog: {
                    options: {
                        templates: {
                            dialog: "../../main/webapp/html/searchToRelate.html"
                        }
                    }
                }
            },
            addRelations: cspace.relationManager.provideLocalAddRelations
        };
        fluid.merge(null, defaultOpts, opts);
        relationManager = cspace.relationManager("#main", defaultOpts);
        if (opts && opts.stopTests) {
            stop();
        }
    };
    
    relationManagerTest.test("Initialization", function () {
        createRelationManager({}, "objects", "objects");
        jqUnit.assertValue("Relation Manager's data context initialized", relationManager.options.dataContext);
        jqUnit.assertDeepEq("Applier is properly initalized", applier, relationManager.options.applier);
        jqUnit.assertDeepEq("Applier is properly initalized", "objects", relationManager.options.related);
    });
    
    var relationDialogSetup = function (callback, primery, related, model) {
        createRelationManager(model || {}, primery, related, {
            stopTests: true,
            components: {
                searchToRelateDialog: {
                    options: {
                        listeners: {
                            afterRender: callback
                        }
                    }
                }
            }
        });
    };
    
    relationManagerTest.test("Add Relation Dialog when the object is not saved", function () {
        relationDialogSetup(function () {
            jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
            relationManager.locate("addButton").click();
            jqUnit.notVisible("Search to Relate Dialog is invisible if the record is not saved", $(".ui-dialog"));
            var message = relationManager.locate("feedbackMessage");
            jqUnit.isVisible("Error message is visible", message);
            jqUnit.assertEquals("Object should be saved first", relationManager.options.strings.pleaseSaveFirst, message.text());
            start();
        }, "objects", "objects");
    });
    
    relationManagerTest.test("Add Relation Dialog, for specific record type", function () {
        relationDialogSetup(function () {
            relationManager.options.applier.requestChange("csid", "123456798");
            jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
            relationManager.locate("addButton").click();
            var message = relationManager.locate("feedbackMessage");
            jqUnit.notVisible("Error message is invisible", message);
            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.searchToRelateDialog.dlg);
            jqUnit.assertEquals("Dialog should have correct primary record type", "objects", relationManager.searchToRelateDialog.options.primary);
            jqUnit.notVisible("Record-type drop-down is not visible (search should be limited to 'loanin' records)", relationManager.searchToRelateDialog.options.selectors.recordTypeSelector);
            jqUnit.assertEquals("Dialog is set up to search for correct related record type", "loanin", $(relationManager.searchToRelateDialog.search.options.selectors.recordType).val());
            relationManager.searchToRelateDialog.dlg.dialog("close");
            start();
        }, "objects", "loanin");
    });
    
    relationManagerTest.test("Add Relation Dialog, for all procedural records (using 'procedures' option)", function () {
        relationDialogSetup(function () {
            relationManager.options.applier.requestChange("csid", "123456798");
            jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
            relationManager.locate("addButton").click();
            var message = relationManager.locate("feedbackMessage");
            jqUnit.notVisible("Error message is invisible", message);
            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.searchToRelateDialog.dlg);
            jqUnit.assertEquals("Dialog should have correct primary record type", "objects", relationManager.searchToRelateDialog.options.primary);
            jqUnit.isVisible("Record-type drop-down is visible", relationManager.searchToRelateDialog.options.selectors.recordTypeSelector);
            relationManager.searchToRelateDialog.dlg.dialog("close");
            jqUnit.notVisible("Search to Relate Dialog is invisible after close", $(".ui-dialog"));
            start();
        }, "objects", "procedures");
    });
    
    relationManagerTest.test("Add Relation Dialog, search for particular procedural record type", function () {
        var testRelatedRecordType = "loanin";
        createRelationManager({}, "objects", "procedures", {
            stopTests: true,
            components: {
                searchToRelateDialog: {
                    options: {
                        listeners: {
                            afterRender: function () {
                                relationManager.options.applier.requestChange("csid", "123456798");
                                jqUnit.notVisible("Search to Relate Dialog is invisible initially", $(".ui-dialog"));
                                relationManager.locate("addButton").click();
                                var message = relationManager.locate("feedbackMessage");
                                jqUnit.notVisible("Error message is invisible", message);
                                jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.searchToRelateDialog.dlg);
                                jqUnit.isVisible("Record-type drop-down is visible", relationManager.searchToRelateDialog.options.selectors.recordTypeSelector);
                                $(relationManager.searchToRelateDialog.options.selectors.recordTypeSelector).val(testRelatedRecordType);
                                $(relationManager.searchToRelateDialog.search.options.selectors.searchButton).click();
                            }
                        },
                        search: {
                            options: {
                                listeners: {
                                    onSearch: function () {
                                        jqUnit.assertEquals("Search should be searching for the correct related record type", testRelatedRecordType, relationManager.searchToRelateDialog.search.model.searchModel.recordType);
                                        relationManager.searchToRelateDialog.dlg.dialog("close");
                                        start();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    });
    
    relationManagerTest.test("Add relations", function () {
        createRelationManager({
                csid: baseCSID,
                relations: {}
            }, "objects", "objects");
        jqUnit.assertDeepEq("The object has no relations initially", {}, relationManager.model.relations);
        relationManager.addRelations({items: newRelations});
        jqUnit.assertDeepEq("The object has new relations", expectedRelations, relationManager.model.relations.objects);
    });
    
    relationManagerTest.test("Add relations to none (through search to relate dialog)", function () {
        expect(4);
        var model = {
            csid: baseCSID,
            relations: {}
        };
        applier = fluid.makeChangeApplier(model);
        applier.modelChanged.addListener("relations", function (model, oldModel, changeRequest) {
            jqUnit.assertDeepEq("Listener oldModel paramter should be right", {}, oldModel.relations);
            jqUnit.assertDeepEq("Listener model paramter should be right", expectedRelations, model.relations.objects);
            jqUnit.assertDeepEq("The model has been updated with the new relations.", expectedRelations, relationManager.model.relations.objects);
            start();
        });
        createRelationManager(model, "objects", "objects", {stopTests: true}, applier);
        jqUnit.assertDeepEq("The object has no relations initially", {}, relationManager.model.relations);
        relationManager.addRelations({items: newRelations});
    });
    
    relationManagerTest.test("Fire create new record event", function () {
        expect(3);
        var model = {
            csid: baseCSID,
            relations: {}
        };
        relationDialogSetup(function () {
            jqUnit.assertDeepEq("The object has no relations initially", {}, relationManager.model.relations);
            relationManager.locate("addButton").click();
            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.searchToRelateDialog.dlg);
            relationManager.searchToRelateDialog.events.onCreateNewRecord.addListener(function () {
                jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                start();
            });
            $(relationManager.searchToRelateDialog.options.selectors.createNewButton).click();
        }, "objects", "acquisition", model);
    });
    
})(jQuery, fluid);