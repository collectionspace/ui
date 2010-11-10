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

    var relatedRecordsList;    
    var uispec;
    $.ajax({
        async: false,
        data: "json",
        url: "../../main/webapp/html/uispecs/cataloging/uispec.json",
        success: function (data) {
            data = JSON.parse(data);
            uispec = data.sidebar;
        }
    });
    
    var relatedRecordsListTest = new jqUnit.TestCase("RelatedRecordsList Tests", function () {
        cspace.util.isTest = true;
        relatedRecordsListTest.fetchTemplate("../../main/webapp/html/right-sidebar.html", ".csc-right-sidebar");
    }, function () {
        $(".ui-dialog").detach();
    });
    
    var createRelatedRecordsList = function (model, primary, related, opts, inApplier) {
        applier = inApplier || fluid.makeChangeApplier(model);
        var defaultOpts = {
            related: related,
            primary: primary,
            model: model,
            applier: applier,
            uispec: uispec.relatedCataloging,
            components: {
                relationManager: {
                    options: {
                        components: {
                            searchToRelateDialog: {
                                options: {
                                    templates: {
                                        dialog: "../../main/webapp/html/searchToRelate.html"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        fluid.merge(null, defaultOpts, opts);
        relatedRecordsList = cspace.relatedRecordsList(".csc-related-cataloging", defaultOpts);
    };
    
    var configureSTRDialog = function (handler, primary, related) {
        var opts = {
            components: {
                relationManager: {
                    options: {
                        components: {
                            searchToRelateDialog: {
                                options: {
                                    listeners: {
                                        afterRender: handler
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        createRelatedRecordsList(testModel, primary, related, opts);
        stop();
    };
    
    var basicConfigureTest = function (visibility, related) {
        configureSTRDialog(function () {
            relatedRecordsList.relationManager.locate("addButton").click();
            jqUnit.isVisible("Search to relate Dialog is visible after click", $(".ui-dialog"));
            jqUnit[visibility]("Record-type drop-down is " + visibility + " (search should be limited to loanout)", relatedRecordsList.relationManager.searchToRelateDialog.options.selectors.recordTypeSelector);
            relatedRecordsList.relationManager.searchToRelateDialog.dlg.dialog("close");
            jqUnit.notVisible("Search to relate Dialog is invisible after close", $(".ui-dialog"));
            start();
        }, "cataloging", related);
    };

    relatedRecordsListTest.test("Configure SearchToRelate Dialog with correct target record type (loanout)", function () {
        basicConfigureTest("notVisible", "loanout");
    });

    relatedRecordsListTest.test("Configure SearchToRelate Dialog for all procedure types (using 'procedures' configuration)", function () {
        basicConfigureTest("isVisible", "procedures");
    });
})(jQuery);