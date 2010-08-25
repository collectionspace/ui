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
    
    var relationManagerTest = new jqUnit.TestCase("RelationManager Tests", null, function () {
        cspace.util.isTest = true;
        $(".ui-dialog").detach();
    });
    
    var createRelationManager = function (model, primaryRecordType, relatedRecordType, opts, inApplier) {
        applier = inApplier || fluid.makeChangeApplier(model);
        var defaultOpts = {
            searchToRelateDialog: {
                options: {
                    templates: {
                        dialog: "../../main/webapp/html/searchToRelate.html"
                    }
                }
            }
        };        
        $.extend(true, defaultOpts, opts);
        relationManager = cspace.relationManager("#main", primaryRecordType, relatedRecordType, applier, defaultOpts);
        if (opts && opts.stopTests) {
            stop();
        }
    };
    
    relationManagerTest.test("Initialization", function () {
        createRelationManager({}, "objects", "objects");
        jqUnit.assertValue("Relation Manager's data context initialized", relationManager.dataContext);
        jqUnit.assertDeepEq("Applier is properly initalized", applier, relationManager.applier);
        jqUnit.assertDeepEq("Applier is properly initalized", "objects", relationManager.relatedRecordType);
    });
    
    relationManagerTest.test("Add Relation Dialog when the object is not saved", function () {
        createRelationManager({}, "objects", "objects");
        jqUnit.assertFalse("Add Relation Dialog initially doesn't exist", relationManager.addDialog);
        relationManager.locate("addButton").click();
        jqUnit.assertFalse("Add Relation Dialog isn't created because record isn't saved", relationManager.addDialog);
        var message = relationManager.locate("feedbackMessage");
        jqUnit.isVisible("Error message is visible", message);
        jqUnit.assertEquals("Object should be saved first", relationManager.options.strings.pleaseSaveFirst, message.text());
    });
    
    relationManagerTest.test("Add Relation Dialog, for specific record type", function () {
        createRelationManager({}, "objects", "loanin", {
            stopTests: true,
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            var message = relationManager.locate("feedbackMessage");
                            jqUnit.notVisible("Error message is invisible", message);
                            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.addDialog.dlg);
                            jqUnit.assertEquals("Dialog should have correct primary record type", "objects", relationManager.addDialog.primaryRecordType);
                            jqUnit.notVisible("Record-type drop-down is not visible (search should be limited to 'loanin' records)", relationManager.addDialog.options.selectors.recordTypeSelector);
                            jqUnit.assertEquals("Dialog is set up to search for correct related record type", "loanin", $(relationManager.addDialog.search.options.selectors.recordType).val());
                            relationManager.addDialog.dlg.dialog("close");
                            start();
                        }
                    }
                }
            }
        });        
        relationManager.applier.requestChange("csid", "123456798");
        jqUnit.assertFalse("Add Relation Dialog initially doesn't exist", relationManager.addDialog);
        relationManager.locate("addButton").click();
    });
    
    relationManagerTest.test("Add Relation Dialog, for all procedural records (using 'procedures' option)", function () {
        createRelationManager({}, "objects", "procedures", {
            stopTests: true,
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            var message = relationManager.locate("feedbackMessage");
                            jqUnit.notVisible("Error message is invisible", message);
                            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.addDialog.dlg);
                            jqUnit.assertEquals("Dialog should have correct primary record type", "objects", relationManager.addDialog.primaryRecordType);
                            jqUnit.isVisible("Record-type drop-down is visible", relationManager.addDialog.options.selectors.recordTypeSelector);
                            relationManager.addDialog.dlg.dialog("close");
                            jqUnit.assertFalse("After closing dialog, Add Relation Dialog doesn't exist anymore", relationManager.addDialog);
                            start();
                        }
                    }
                }
            }
        });        
        relationManager.applier.requestChange("csid", "123456798");
        jqUnit.assertFalse("Add Relation Dialog initially doesn't exist", relationManager.addDialog);
        relationManager.locate("addButton").click();
    });
    
    relationManagerTest.test("Add Relation Dialog, for all procedural records (using default config option)", function () {
        createRelationManager({}, "objects", null, {
            stopTests: true,
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            var message = relationManager.locate("feedbackMessage");
                            jqUnit.notVisible("Error message is invisible", message);
                            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.addDialog.dlg);
                            jqUnit.assertEquals("Dialog should have correct primary record type", "objects", relationManager.addDialog.primaryRecordType);
                            jqUnit.isVisible("Record-type drop-down is visible", relationManager.addDialog.options.selectors.recordTypeSelector);
                            relationManager.addDialog.dlg.dialog("close");
                            jqUnit.assertFalse("After closing dialog, Add Relation Dialog doesn't exist anymore", relationManager.addDialog);
                            start();
                        }
                    }
                }
            }
        });        
        relationManager.applier.requestChange("csid", "123456798");
        jqUnit.assertFalse("Add Relation Dialog initially doesn't exist", relationManager.addDialog);
        relationManager.locate("addButton").click();
    });
    
    relationManagerTest.test("Add Relation Dialog, search for particular procedural record type", function () {
        var testRelatedRecordType = "loanin";
        createRelationManager({}, "objects", null, {
            stopTests: true,
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            var message = relationManager.locate("feedbackMessage");
                            jqUnit.notVisible("Error message is invisible", message);
                            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.addDialog.dlg);
                            jqUnit.assertEquals("Dialog should have correct primary record type", "objects", relationManager.addDialog.primaryRecordType);
                            jqUnit.isVisible("Record-type drop-down is visible", relationManager.addDialog.options.selectors.recordTypeSelector);
                            $(relationManager.addDialog.options.selectors.recordTypeSelector).val(testRelatedRecordType);
                            $(relationManager.addDialog.search.options.selectors.searchButton).click();
                        }
                    },
                    search: {
                        options: {
                            listeners: {
                                onSearch: function () {
                                    jqUnit.assertEquals("Search should be searching for the correct related record type", testRelatedRecordType, relationManager.addDialog.search.model.searchModel.recordType);
                                    relationManager.addDialog.dlg.dialog("close");
                                    start();
                                }
                            }
                        }
                    }
                }
            }
        });        
        relationManager.applier.requestChange("csid", "123456798");
        jqUnit.assertFalse("Add Relation Dialog initially doesn't exist", relationManager.addDialog);
        relationManager.locate("addButton").click();
    });
    
    relationManagerTest.test("Add relations", function () {
        createRelationManager({
                csid: baseCSID,
                relations: []
            }, "objects", "objects");
        jqUnit.assertDeepEq("The object has no relations initially", [], relationManager.applier.model.relations);
        relationManager.addRelations({items: newRelations});
        jqUnit.assertDeepEq("The object has new relations", expectedRelations, relationManager.applier.model.relations.objects);
    });
    
    relationManagerTest.test("Add relations to none (through search to relate dialog)", function () {
        expect(4);
        var model = {
            csid: baseCSID,
            relations: []
        };
        applier = fluid.makeChangeApplier(model);
        applier.modelChanged.addListener("relations", function (model, oldModel, changeRequest) {
            jqUnit.assertDeepEq("Listener oldModel paramter should be right", [], oldModel.relations);
            jqUnit.assertDeepEq("Listener model paramter should be right", expectedRelations, model.relations.objects);
            jqUnit.assertDeepEq("The model has been updated with the new relations.", expectedRelations, relationManager.applier.model.relations.objects);
            start();
        });
        createRelationManager(applier.model, "objects", "objects", {stopTests: true}, applier);
        jqUnit.assertDeepEq("The object has no relations initially", [], relationManager.applier.model.relations);
        relationManager.addRelations({items: newRelations});
    });
    
    relationManagerTest.test("Fire create new record event", function () {
        expect(3);
        var model = {
            csid: baseCSID,
            relations: []
        };
        createRelationManager(model, "objects", "acquisition", {
            stopTests: true,
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            jqUnit.isVisible("After clicking Add, Add Relation Dialog is visible", relationManager.addDialog.dlg);
                            relationManager.addDialog.events.onCreateNewRecord.addListener(function () {
                                jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                                start();
                            });
                            $(relationManager.addDialog.options.selectors.createNewButton).click();
                        }
                    }
                }
            }
        });
        jqUnit.assertDeepEq("The object has no relations initially", [], relationManager.applier.model.relations);
        relationManager.locate("addButton").click();
    });
    
})(jQuery, fluid);