/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

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
        delete cspace.addDialogInst;
        $(".ui-dialog").detach();
    });
    
    var createRelationManager = function (model, opts, inApplier) {
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
        relationManager = cspace.relationManager("#main", "objects", applier, defaultOpts);
        stop();
    };
    
    relationManagerTest.test("Initialization", function () {
        createRelationManager({}, {
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            jqUnit.assertValue("Search to relate dialog initialized", cspace.addDialogInst);
                            jqUnit.assertValue("Relation Manager's data context initialized", relationManager.dataContext);
                            jqUnit.assertDeepEq("Applier is properly initalized", applier, relationManager.applier);
                            jqUnit.assertDeepEq("Applier is properly initalized", "objects", relationManager.recordType);
                            start();
                        }
                    }
                }
            }
        });
    });
    
    relationManagerTest.test("Add Relation Dialog when the object is not saved", function () {
        createRelationManager({}, {
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            jqUnit.notVisible("Add Relation Dialog is initially invisible", cspace.addDialogInst.dlg);
                            relationManager.locate("addButton").click();
                            jqUnit.notVisible("Add Relation Dialog is invisible becuase the object is not saved", cspace.addDialogInst.dlg);
                            var message = relationManager.locate("feedbackMessage");
                            jqUnit.isVisible("Error message is visible", message);
                            jqUnit.assertEquals("Object should be saved first", relationManager.options.strings.pleaseSaveFirst, message.text());
                            start();
                        }
                    }
                }
            }
        });
    });
    
    relationManagerTest.test("Add Relation Dialog", function () {
        createRelationManager({}, {
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            relationManager.applier.requestChange("csid", "123456798");
                            jqUnit.notVisible("Add Relation Dialog is initially invisible", cspace.addDialogInst.dlg);
                            relationManager.locate("addButton").click();
                            var message = relationManager.locate("feedbackMessage");
                            jqUnit.notVisible("Error message is invisible", message);
                            jqUnit.isVisible("Add Relation Dialog is visible", cspace.addDialogInst.dlg);
                            cspace.addDialogInst.dlg.dialog("close");
                            start();
                        }
                    }
                }
            }
        });        
    });
    
    relationManagerTest.test("Add relations", function () {
        createRelationManager({
                csid: baseCSID,
                relations: []
            }, {
                searchToRelateDialog: {
                    options: {
                        listeners: {
                            afterRender: function () {
                                jqUnit.assertDeepEq("The object has no relations initially", [], relationManager.applier.model.relations);
                                relationManager.addRelations({items: newRelations});
                                jqUnit.assertDeepEq("The object has new relations", expectedRelations, relationManager.applier.model.relations.objects);
                                start();
                            }
                        }
                    }
                }
            }
        );        
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
        });
        createRelationManager(applier.model, {
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            jqUnit.assertDeepEq("The object has no relations initially", [], relationManager.applier.model.relations);
                            relationManager.addRelations({items: newRelations});
                            start();
                        }
                    }
                }
            }
        }, applier);
    });
    
    relationManagerTest.test("Fire create new record event", function () {
        expect(1);
        var model = {
            csid: baseCSID,
            relations: []
        };
        applier = fluid.makeChangeApplier(model);
        createRelationManager(model, {
            listeners: function () {
                jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                start();
            },
            searchToRelateDialog: {
                options: {
                    listeners: {
                        afterRender: function () {
                            jqUnit.assertDeepEq("The object has no relations initially", [], relationManager.applier.model.relations);
                            relationManager.locate("addButton").click();
                            cspace.addDialogInst.locate("createNewButton", cspace.addDialogInst.dlg).click();
                            start();
                        }
                    }
                }
            }
        }, applier);
    });
    
})(jQuery, fluid);