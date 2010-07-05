/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/
"use strict";

var searchToRelateDialogTester = function () {
    var baseModel = {
        csid: "123.456.789",
        relations: []
    };
    
    var searchToRelateDialogTest = new jqUnit.TestCase("SearchToRelateDialog Tests", function () {
        cspace.util.isTest = true;
    });
    
    searchToRelateDialogTest.test("Create new record event", function () {
        expect(1);
        var testModel = {};
        fluid.model.copyModel(testModel, baseModel);
        var applier = fluid.makeChangeApplier(testModel);
        var searchToRelateDialog;
        
        var dlgOpts = {
            templates: {
                dialog: "../../main/webapp/html/searchToRelate.html"
            },
            listeners: {
                onCreateNewRecord: function () {
                    jqUnit.assertTrue("Search to relate dialog fires onCreateNewRecord when clicked create", true);
                    start();
                },
                afterRender: function () {
                    searchToRelateDialog.dlg.dialog("open");
                    searchToRelateDialog.locate("createNewButton", searchToRelateDialog.dlg).click();
                }
            }
        };
        
        searchToRelateDialog = cspace.searchToRelateDialog("#dialog-container", applier, dlgOpts);
        stop();
    });
};


(function () {
    searchToRelateDialogTester();
}());

