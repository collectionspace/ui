/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, same*/

var testData = {
    objects: [
        {objectTitle: "test title 1", accessionNumber: "12.34.56", lastEdit: "2009-03-23"},
        {objectTitle: "test title 2", accessionNumber: "12-3456", lastEdit: "2009-06-11"},
        {objectTitle: "test title 3", accessionNumber: "123.4-56", lastEdit: "2008-12-06"}
    ],
    procedures: [
        {entryNumber: "entry 1", type: "intake", description: "description 1", lastEdit: "2008-12-12", creationDate: "2008-12-06"},
        {entryNumber: "entry 2", type: "aquisition", description: "description 2", lastEdit: "2008-12-13", creationDate: "2008-12-07"},
        {entryNumber: "entry 3", type: "intake", description: "description 3", lastEdit: "2008-12-14", creationDate: "2008-12-08"},
        {entryNumber: "entry 4", type: "aquisition", description: "description 4", lastEdit: "2008-12-15", creationDate: "2008-12-09"}
    ],
    repeatedItems: {
        item1: "item 1",
        repeatedItems: [
            {rItem1: "rItem 1a", rItem2: "rItem 1b"},
            {rItem1: "rItem 2a", rItem2: "rItem 2b"},
            {rItem1: "rItem 3a", rItem2: "rItem 3b"}
        ],
        itme2: "item 2"
    }
};

var testUISpecs = {
    findEditObjects: {
        spec: {
            objectTitle: {
                selector: "#object-title .info-value",
                validators: [],
                "decorators": []
            },
            accessionNumber: {
                selector: "#accession-number .info-value",
                validators: [],
                "decorators": []
            },
            lastEdit: {
                selector: "#last-edit .info-value",
                validators: [],
                "decorators": []
            }
        }
    },
    findEditProcedures: {
        spec: {
            entryNumber: {
                selector: "#entry-number .info-value",
                validators: [],
                "decorators": []
            },
            type: {
                selector: "#type .info-value",
                validators: [],
                "decorators": []
            },
            description: {
                selector: "#description .info-value",
                validators: [],
                "decorators": []
            },
            lastEdit: {
                selector: "#last-edit .info-value",
                validators: [],
                "decorators": []
            }
        }
    },
    relatedObjects: {
        spec: {
            objectTitle: {
                selector: "#object-title .info-value",
                validators: [],
                "decorators": []
            },
            accessionNumber: {
                selector: "#accession-number .info-value",
                validators: [],
                "decorators": []
            }
        }
    },
    relatedProcedures: {
        spec: {
            entryNumber: {
                selector: "#entry-number .info-value",
                validators: [],
                "decorators": []
            },
            type: {
                selector: "#type .info-value",
                validators: [],
                "decorators": []
            },
            creationDate: {
                selector: "#creation-date .info-value",
                validators: [],
                decorators: []
            }
        }
    },
    repeatedItems: {
        spec: {
            item1: {
                selector: ".foo"
            },
            repeatedItems: {    // "repeatedItems" is a keyword
                selector: "tr",
                items: {        // "items" is a keyword required inside "repeatedItems"
                    rItem1: {
                        selector: ".bah"
                    },
                    rItem2: {
                        selector: "#bat"
                    }
                }
            },
            item2: {
                selector: "#bar"
            }
        }
    }
};
var testComponentTrees = {
    repeatedItems: {
        children: [
            {ID: "item1",
             valuebinding: "item1"},
            {ID: "repeatedItems:",
             children: [{ID: "rItem1", valuebinding: "repeatedItems.0.rItem1"},
                        {ID: "rItem2", valuebinding: "repeatedItems.0.rItem2"}]},
            {ID: "repeatedItems:",
             children: [{ID: "rItem1", valuebinding: "repeatedItems.1.rItem1"},
                        {ID: "rItem2", valuebinding: "repeatedItems.1.rItem2"}]},
            {ID: "repeatedItems:",
             children: [{ID: "rItem1", valuebinding: "repeatedItems.2.rItem1"},
                        {ID: "rItem2", valuebinding: "repeatedItems.2.rItem2"}]},
            {ID: "item2",
             valuebinding: "item2"}
        ]
    },
    findEditObjects: {
        children: [
            {ID: "row:", children: [{ID: "objectTitle", value: "test title 1"},
                                    {ID: "accessionNumber", value: "12.34.56"},
                                    {ID: "lastEdit", value: "2009-03-23"}]},
            {ID: "row:", children: [{ID: "objectTitle", value: "test title 2"},
                                    {ID: "accessionNumber", value: "12-3456"},
                                    {ID: "lastEdit", value: "2009-06-11"}]},
            {ID: "row:", children: [{ID: "objectTitle", value: "test title 3"},
                                    {ID: "accessionNumber", value: "123.4-56"},
                                    {ID: "lastEdit", value: "2008-12-06"}]}
        ]
    },
    findEditProcedures: {
        children: [
            {ID: "row:", children: [{ID: "entryNumber", value: "entry 1"},
                                    {ID: "type", value: "intake"},
                                    {ID: "description", value: "description 1"},
                                    {ID: "lastEdit", value: "2008-12-12"}]},
            {ID: "row:", children: [{ID: "entryNumber", value: "entry 2"},
                                    {ID: "type", value: "aquisition"},
                                    {ID: "description", value: "description 2"},
                                    {ID: "lastEdit", value: "2008-12-13"}]},
            {ID: "row:", children: [{ID: "entryNumber", value: "entry 3"},
                                    {ID: "type", value: "intake"},
                                    {ID: "description", value: "description 3"},
                                    {ID: "lastEdit", value: "2008-12-14"}]},
            {ID: "row:", children: [{ID: "entryNumber", value: "entry 4"},
                                    {ID: "type", value: "aquisition"},
                                    {ID: "description", value: "description 4"},
                                    {ID: "lastEdit", value: "2008-12-15"}]}
        ]
    },
    relatedObjects: {
        children: [
            {ID: "row:", children: [{ID: "objectTitle", value: "test title 1"},
                                    {ID: "accessionNumber", value: "12.34.56"}]},
            {ID: "row:", children: [{ID: "objectTitle", value: "test title 2"},
                                    {ID: "accessionNumber", value: "12-3456"}]},
            {ID: "row:", children: [{ID: "objectTitle", value: "test title 3"},
                                    {ID: "accessionNumber", value: "123.4-56"}]}
        ]
    },
    relatedProcedures: {
        children: [
            {ID: "row:", children: [{ID: "entryNumber", value: "entry 1"},
                                    {ID: "type", value: "intake"},
                                    {ID: "creationDate", value: "2008-12-06"}]},
            {ID: "row:", children: [{ID: "entryNumber", value: "entry 2"},
                                    {ID: "type", value: "aquisition"},
                                    {ID: "creationDate", value: "2008-12-07"}]},
            {ID: "row:", children: [{ID: "entryNumber", value: "entry 3"},
                                    {ID: "type", value: "intake"},
                                    {ID: "creationDate", value: "2008-12-08"}]},
            {ID: "row:", children: [{ID: "entryNumber", value: "entry 4"},
                                    {ID: "type", value: "aquisition"},
                                    {ID: "creationDate", value: "2008-12-09"}]}
        ]
    }
};

var testCutpoints = {
    findEditObjects: [{id: "objectTitle", selector: "#object-title .info-value"},
                      {id: "accessionNumber", selector: "#accession-number .info-value"},
                      {id: "lastEdit", selector: "#last-edit .info-value"}],
    findEditProcedures: [{selector: "#entry-number .info-value", id: "entryNumber"},
                         {selector: "#type .info-value", id: "type"},
                         {selector: "#description .info-value", id: "description"},
                         {selector: "#last-edit .info-value", id: "lastEdit"}],
    relatedObjects: [{id: "objectTitle", selector: "#object-title .info-value"},
                     {id: "accessionNumber", selector: "#accession-number .info-value"}],
    relatedProcedures: [{selector: "#entry-number .info-value", id: "entryNumber"},
                        {selector: "#type .info-value", id: "type"},
                        {selector: "#creation-date .info-value", id: "creationDate"}],
    repeatedItems: [{selector: ".foo", id: "item1"},
                    {selector: "tr", id: "repeatedItems"},
                    {selector: ".bah", id: "rItem1"},
                    {selector: "#bat", id: "rItem2"},
                    {selector: "#bar", id: "item2"}]
};
