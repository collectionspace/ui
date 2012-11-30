/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
 */

/*global jqUnit, jQuery, cspace:true, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var sidebarTester = function ($) {
    var container = "#main";

    var setupSidebar = function (options) {
        return cspace.sidebar(container, options);
    };

    var bareSidebarTest = new jqUnit.TestCase("Sidebar Tests");
    
    //test both permissions and cataloging are showing
    var sidebarTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: cspace.tests.sampleUserPerms
    });
        
    sidebarTest.asyncTest("RelatedRecordsList: all rendered", function () {
        var sidebar = setupSidebar(),
            globalModel = sidebarTest.globalModel,
            model = {},
            applier = fluid.makeChangeApplier(model),
            modelSpec = {
                primaryModel: {
                    model: model,
                    applier: applier
                }
            };
        globalModel.attachModel(modelSpec);
        globalModel.applier.requestChange("primaryModel.csid", "aa643807-e1d1-4ca2-9f9b");
        var templateCss = ".csc-relatedRecord-template";
        jqUnit.assertNotEquals("Related Cataloging shown", 0, $(templateCss, sidebar.locate("relatedCataloging")).length);
        jqUnit.assertNotEquals("Related Procedures shown", 0, $(templateCss, sidebar.locate("relatedProcedures")).length);
    });

    //returns full permissions except for those specified in the array noperm,
    //which will not have any permissions
    var getLimitedPermissions = function(noperm) {
        var returnPerms = {};
        fluid.model.copyModel(returnPerms, cspace.tests.fullPerms);
        fluid.each(noperm, function(val) {
            returnPerms[val] = [];
        });
        return returnPerms;
    };

    //test not rendering cataloging
    var noCatalogingSidebarTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: getLimitedPermissions(["cataloging", "loanout"])
    });
    
    cspace.tests.displayErrorMessage = function (message) {
        console.log(message);
    };

    noCatalogingSidebarTest.test("RelatedRecordsList: cataloging not rendering", function () {
        var sidebar = setupSidebar();
        var templateCss = ".csc-relatedRecord-template";
        jqUnit.assertEquals("Related Cataloging hidden", 0, $(templateCss, sidebar.locate("relatedCataloging")).length);
        jqUnit.assertNotEquals("Related Procedures shown", 0, $(templateCss, sidebar.locate("relatedProcedures")).length);
    });

    //test not rendering procedures
    var noProceduresSidebarTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: getLimitedPermissions(["intake", "loanin", "loanout", "conditioncheck", "acquisition", "movement", "objectexit", "media"])
    });

    noProceduresSidebarTest.test("RelatedRecordsList: procedures not rendering", function () {
        var sidebar = setupSidebar();
        var templateCss = ".csc-relatedRecord-template";
        jqUnit.assertNotEquals("Related Cataloging shown", 0, $(templateCss, sidebar.locate("relatedCataloging")).length);
        jqUnit.assertEquals("Related Procedures hidden", 0, $(templateCss, sidebar.locate("relatedProcedures")).length);
    });
    
    //test non-linking cataloging (no read permissions)
    var noReadCatalogingAndPersonSidebarTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: (function () {
            var returnPerms = {};
            fluid.model.copyModel(returnPerms, cspace.tests.fullPerms);
            returnPerms["cataloging"] = ["create", "update", "delete", "list"];
            returnPerms["person"] = ["create", "update", "delete", "list"];
            return returnPerms;
        })()
    });
    
    noReadCatalogingAndPersonSidebarTest.test("RelatedRecordsList: cataloging not linking when no read permissions", function () {
        var sidebar = setupSidebar();
        var rowCss = ".csc-recordList-row";
        var disabledClass = "cs-disabled";
        jqUnit.assertTrue("Related Cataloging disabled", $(rowCss, sidebar.locate("relatedCataloging")).hasClass(disabledClass));
        jqUnit.assertFalse("Related Procedures not disabled", $(rowCss, sidebar.locate("relatedProcedures")).hasClass(disabledClass));
        jqUnit.assertEquals("Related Procedures not disabled", 4, $("."+disabledClass, sidebar.locate("termsUsed")).length);

    });

    var mediaSnapshotTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: cspace.tests.sampleUserPerms
    });

    mediaSnapshotTest.test("Media Snapshot test", function () {
        var sidebar = setupSidebar();
        var mediumImage = ".csc-sidebar-mediumImage";
        jqUnit.assertTrue("Media snapshot", $(mediumImage, sidebar.locate("media")).length > 0);
        jqUnit.assertTrue("Media snapshot has source", ($(mediumImage).attr("src") !== 'undefined'));
        jqUnit.assertTrue("Media snapshot has appropriate derivative", (/Medium/.test($(mediumImage).attr("src"))));
        sidebar.options.recordApplier.requestChange("relations.media.0.summarylist.imgThumb", "../data/images/2Thumbnail.jpeg");
        jqUnit.assertTrue("Media snapshot updates dynamically when related media is added", 
            (($(mediumImage).attr("src") !== 'undefined') && (/2Medium/.test($(mediumImage).attr("src")))));
    });
};

jQuery(document).ready(function () {
    sidebarTester(jQuery);
});