/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, jqUnit, cspace*/
"use strict";

(function ($) {
    
    var relManagerOpts = {
        searchToRelateDialog: {
            options: {
                templates: {
                    dialog: "../../main/webapp/html/searchToRelate.html"
                }
            }
        }
    };
    var testModel = {
        csid: "123456789",
        relations: [{
            summary: "Stamp albums. Famous stars series stamp album.",
            csid: "1984.068.0338",
            number: "1984.068.0338",
            relid: "19ba9f30-75c3-41c8-b3e6",
            relationshiptype: "affects",
            recordtype: "objects"
        }, {
            summary: "Souvenir books. Molly O' Play Book.",
            csid: "2005.018.1383",
            number: "2005.018.1383",
            relid: "e8d20612-e1f5-4e90-bc36",
            relationshiptype: "affects",
            recordtype: "objects"
        }]
    };

    var relatedRecordsList;    
    var uispec;
    $.ajax({
        async: false,
        data: "json",
        url: "../../main/webapp/html/uispecs/objects/uispec.json",
        success: function (data) {
            data = JSON.parse(data);
            uispec = data.sidebar;
        }
    });
    
    var relatedRecordsListTest = new jqUnit.TestCase("RelatedRecordsList Tests", function () {
        cspace.util.isTest = true;
        relatedRecordsListTest.fetchTemplate("../../main/webapp/html/right-sidebar.html", ".csc-right-sidebar");
    });
    
    var createRelatedRecordsList = function (model, primaryRecordType, relatedRecordType, opts, inApplier) {
        applier = inApplier || fluid.makeChangeApplier(model);
        var defaultOpts = {
            uispec: uispec.relatedObjects,
            relationManager: {
                options: {
                    searchToRelateDialog: {
                        options: {
                            templates: {
                                dialog: "../../main/webapp/html/searchToRelate.html"
                            }
                        }
                    }
                }
            }
        };
        $.extend(true, defaultOpts, opts);
        relatedRecordsList = cspace.relatedRecordsList(".csc-related-objects", primaryRecordType, relatedRecordType, applier, defaultOpts);
    };

    relatedRecordsListTest.test("Configure SearchToRelate Dialog with correct target record type (loanout)", function () {
        var opts = {
            relationManager: {
                options: {
                    searchToRelateDialog: {
                        options: {
                            listeners: {
                                afterRender: function () {
                                    jqUnit.isVisible("Search to relate Dialog is visible after click", $(".ui-dialog"));
                                    jqUnit.notVisible("Record-type drop-down is not visible (search should be limited to loanout)", relatedRecordsList.relationManager.addDialog.options.selectors.recordTypeSelector);
                                    relatedRecordsList.relationManager.addDialog.dlg.dialog("close");
                                    relatedRecordsList.recordList.refreshView();
                                    jqUnit.assertFalse("Search to relate Dialog doesn't exist after close", relatedRecordsList.relationManager.addDialog);
                                    start();
                                }
                            }
                        }
                    }
                }
            }
        };
        createRelatedRecordsList(testModel, "objects", "loanout", opts);
        jqUnit.assertFalse("Search to relate Dialog initially doesn't exist", relatedRecordsList.relationManager.addDialog);
        relatedRecordsList.relationManager.locate("addButton").click();
        stop();
    });

    relatedRecordsListTest.test("Configure SearchToRelate Dialog for all procedure types (using 'procedures' configuration)", function () {
        var opts = {
            relationManager: {
                options: {
                    searchToRelateDialog: {
                        options: {
                            listeners: {
                                afterRender: function () {
                                    jqUnit.isVisible("Search to relate Dialog is visible after click", $(".ui-dialog"));
                                    jqUnit.isVisible("Record-type drop-down is visible", relatedRecordsList.relationManager.addDialog.options.selectors.recordTypeSelector);
                                    relatedRecordsList.relationManager.addDialog.dlg.dialog("close");
                                    relatedRecordsList.recordList.refreshView();
                                    jqUnit.assertFalse("Search to relate Dialog doesn't exist after close", relatedRecordsList.relationManager.addDialog);
                                    start();
                                }
                            }
                        }
                    }
                }
            }
        };
        createRelatedRecordsList(testModel, "objects", "procedures", opts);
        jqUnit.assertFalse("Search to relate Dialog initially doesn't exist", relatedRecordsList.relationManager.addDialog);
        relatedRecordsList.relationManager.locate("addButton").click();
        stop();
    });

    relatedRecordsListTest.test("Configure SearchToRelate Dialog for all procedure types (using auto configuration)", function () {
        var opts = {
            relationManager: {
                options: {
                    searchToRelateDialog: {
                        options: {
                            listeners: {
                                afterRender: function () {
                                    jqUnit.isVisible("Search to relate Dialog is visible after click", $(".ui-dialog"));
                                    jqUnit.isVisible("Record-type drop-down is visible", relatedRecordsList.relationManager.addDialog.options.selectors.recordTypeSelector);
                                    relatedRecordsList.relationManager.addDialog.dlg.dialog("close");
                                    relatedRecordsList.recordList.refreshView();
                                    jqUnit.assertFalse("Search to relate Dialog doesn't exist after close", relatedRecordsList.relationManager.addDialog);
                                    start();
                                }
                            }
                        }
                    }
                }
            }
        };
        createRelatedRecordsList(testModel, "objects", null, opts);
        jqUnit.assertFalse("Search to relate Dialog initially doesn't exist", relatedRecordsList.relationManager.addDialog);
        relatedRecordsList.relationManager.locate("addButton").click();
        stop();
    });
})(jQuery);