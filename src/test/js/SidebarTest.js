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

var createNewTester = function ($) {
    var container = "#main";
    var sampleOptions = {
        uispec:{
            relatedProcedures:{
                ".csc-recordList-row:":{
                    children:[{
                        ".csc-related-summary":"${items.0.summary}",
                        ".csc-related-number":{
                            linktext:"${items.0.number}",
                            target:"${items.0.recordtype}.html?csid=${items.0.csid}"
                        },
                        ".csc-related-recordtype":"${items.0.recordtype}"
                    }]
                }
            },
            termsUsed:{
                ".csc-recordList-row:":{
                    children:[{
                        ".csc-related-number":{
                            linktext:"${items.0.number}",
                            target:"${items.0.recordtype}.html?csid=${items.0.csid}"
                        },
                        ".csc-related-field":"${items.0.sourceFieldName}",
                        ".csc-related-recordtype":"${items.0.recordtype}"
                    }]
                }
            },
            relatedCataloging:{
                ".csc-recordList-row:":{
                    children:[{
                        ".csc-related-summary":"${items.0.summary}",
                        ".csc-related-number":{
                            linktext:"${items.0.number}",
                            target:"${items.0.recordtype}.html?csid=${items.0.csid}"
                        }
                    }]
                }
            }
        }
    };

    var setupSidebar = function (options) {
        options.recordModel = options.recordModel || {
            "relations": {
                "cataloging": [
                    {
                        "summary": "Stamp albums. Famous stars series stamp album.",
                        "csid": "1984.068.0338",
                        "number": "1984.068.0338",
                        "relid": "19ba9f30-75c3-41c8-b3e6",
                        "relationshiptype": "affects",
                        "recordtype": "cataloging"
                    },
                    {
                        "summary": "Souvenir books. Molly O' Play Book.",
                        "csid": "2005.018.1383",
                        "number": "2005.018.1383",
                        "relid": "e8d20612-e1f5-4e90-bc36",
                        "relationshiptype": "affects",
                        "recordtype": "cataloging"
                    }
                ],
                "movement": [
                    {
                        "summary": "Front Porch",
                        "csid": "112.442.1",
                        "number": "112.442.1",
                        "relid": "19ba9f30-abcd-fede-abcd",
                        "relationshiptype": "affects",
                        "recordtype": "movement"
                    }
                ]
            },
            "termsUsed": [
                {
                    "sourceFieldName": "collectionobjects_common:inscriber",
                    "number": "Margaret Brodie",
                    "csid": "c0fd9987-7625-4b5f-bbac",
                    "recordtype": "person" 
                },
                {
                    "sourceFieldName": "collectionobjects_common:contentOrganization",
                    "number": "Hardie & Co.",
                    "csid": "c0fd9987-7625-4b5f-foo",
                    "recordtype": "organization" 
                },
                {
                    "sourceFieldName": "collectionobjects_common:inscriptionDescriptionInscriber",
                    "number": "Ann Young",
                    "csid": "48c74123-e547-4ff1-81d2",
                    "recordtype": "person" 
                },
                {
                    "sourceFieldName": "collectionobjects_common:contentPeople",
                    "number": "Margaret Brodie",
                    "csid": "c0fd9987-7625-4b5f-bbac",
                    "recordtype": "person" 
                },
                {
                    "sourceFieldName": "collectionobjects_common:ContentPerson",
                    "number": "Ann Young",
                    "csid": "48c74123-e547-4ff1-81d2",
                    "recordtype": "person" 
                } 
            ]
        };
        options.recordApplier = fluid.makeChangeApplier(options.recordModel);
        return cspace.sidebar(container, options);
    };

    var bareSidebarTest = new jqUnit.TestCase("Sidebar Tests");
    
    //test both permissions and cataloging are showing
    var sidebarTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: cspace.tests.sampleUserPerms
    });
        
    sidebarTest.test("RelatedRecordsList: all rendered", function () {
        var sidebar = setupSidebar(sampleOptions);
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

    noCatalogingSidebarTest.test("RelatedRecordsList: cataloging not rendering", function () {
        var sidebar = setupSidebar(sampleOptions);
        var templateCss = ".csc-relatedRecord-template";
        jqUnit.assertEquals("Related Cataloging hidden", 0, $(templateCss, sidebar.locate("relatedCataloging")).length);
        jqUnit.assertNotEquals("Related Procedures shown", 0, $(templateCss, sidebar.locate("relatedProcedures")).length);
    });

    //test not rendering procedures
    var noProceduresSidebarTest = cspace.tests.testEnvironment({
        testCase: bareSidebarTest,
        permissions: getLimitedPermissions(cspace.recordTypes.procedures)
    });

    noProceduresSidebarTest.test("RelatedRecordsList: procedures not rendering", function () {
        var sidebar = setupSidebar(sampleOptions);
        var templateCss = ".csc-relatedRecord-template";
        jqUnit.assertNotEquals("Related Cataloging shown", 0, $(templateCss, sidebar.locate("relatedCataloging")).length);
        jqUnit.assertEquals("Related Procedures hidden", 0, $(templateCss, sidebar.locate("relatedProcedures")).length);
    });
};

(function () {
    createNewTester(jQuery);
}());