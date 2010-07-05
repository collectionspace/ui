/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, jqUnit, cspace*/
"use strict";

(function ($) {
    
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
    
    relatedRecordsListTest.test("Open SearchToRelate Dialog after adding a relation", function () {
        var relManagerOpts = {
            searchToRelateDialog: {
                options: {
                    templates: {
                        dialog: "../../main/webapp/html/searchToRelate.html"
                    }
                }
            }
        };
        var model = {
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
        var applier = fluid.makeChangeApplier(model);
        var opts = {
            recordType: "objects",
            primaryRecordType: "objects",
            uispec: uispec.relatedObjects,
            relationManager: {
                options: {
                    searchToRelateDialog: {
                        options: {
                            templates: {
                                dialog: "../../main/webapp/html/searchToRelate.html"
                            },
                            listeners: {
                                afterRender: function () {
                                    jqUnit.notVisible("Search to relate Dialog is invisible initially", $(".ui-dialog"));
                                    relatedRecordsList.relationManager.locate("addButton").click();
                                    jqUnit.isVisible("Search to relate Dialog is visible after click", $(".ui-dialog"));
                                    cspace.addDialogInst.dlg.dialog("close");
                                    relatedRecordsList.recordList.refreshView();
                                    jqUnit.notVisible("Search to relate Dialog is invisible after initial close", $(".ui-dialog"));
                                    relatedRecordsList.relationManager.locate("addButton").click();
                                    jqUnit.isVisible("Search to relate Dialog is visible after second click", $(".ui-dialog"));                                    
                                    start();
                                }
                            }
                        }
                    }
                }
            }
        };
        relatedRecordsList = cspace.relatedRecordsList(".csc-related-objects", applier, opts);
        stop();
    });
    
})(jQuery);