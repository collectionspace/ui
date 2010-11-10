var testSpec =  {
    "spec": {
        "records": {
            "selector": ".csc-record-list-row",
            "repeated": {
                "objectTitle": {
                    "selector": ".csc-object-title",
                    "validators": [],
                    "decorators": []
                },
                "accessionNumber": {
                    "selector": ".csc-accession-number",
                    "validators": [],
                    "decorators": []
                },
                "lastEdit": {
                    "selector": ".csc-last-edit",
                    "validators": [],
                    "decorators": []
                }
            }
        }
    },
    "modelToResourceMap": {
        "*": "/cataloging"
    }
};
var testModel = {
    records: [{
        objectTitle: "test title 1",
        accessionNumber: "12.34.56",
        lastEdit: "2009-03-23"
    }, {
        objectTitle: "test title 2",
        accessionNumber: "12-3456",
        lastEdit: "2009-06-11"
    }, {
        objectTitle: "test title 3",
        accessionNumber: "123.4-56",
        lastEdit: "2008-12-06"
    }]
};
var testTree = {
    children: [
        {ID: "records:", children: [{ID: "objectTitle", valuebinding: "records.0.objectTitle"},
                                    {ID: "accessionNumber", valuebinding: "records.0.accessionNumber"},
                                    {ID: "lastEdit", valuebinding: "records.0.lastEdit"}]},
        {ID: "records:", children: [{ID: "objectTitle", valuebinding: "records.1.objectTitle"},
                                    {ID: "accessionNumber", valuebinding: "records.1.accessionNumber"},
                                    {ID: "lastEdit", valuebinding: "records.1.lastEdit"}]},
        {ID: "records:", children: [{ID: "objectTitle", valuebinding: "records.2.objectTitle"},
                                    {ID: "accessionNumber", valuebinding: "records.2.accessionNumber"},
                                    {ID: "lastEdit", valuebinding: "records.2.lastEdit"}]}
    ]
};
var testCutpoints = [
    {selector: ".csc-record-list-row", id: "records:"},
    {selector: ".csc-object-title", id: "objectTitle"},
    {selector: ".csc-accession-number", id: "accessionNumber"},
    {selector: ".csc-last-edit", id: "lastEdit"}
];


// Test data for the Term List pull-downs:
// construct a component tree that has nothing but the select in it

// Case 1: Term list has a default, model is empty
var defaultEmptyModel = {
    spec: {
        "spec": {
            "entryMethod": {
                "selector": ".csc-intake-entry-method",
                "options": ["in-person", "post", "found-on-doorstep"],
                "options-text": ["In person", "Post", "Found on doorstep"],
                "default": "1",
                "validators": [],
                "decorators": []
            }
        },
        "modelToResourceMap": {
            "*": "/intake"
        }
    },
    tree: {
        children: [
            {ID: "entryMethod",
             selection: {valuebinding: "entryMethod"},
             optionlist: ["in-person", "post", "found-on-doorstep"],
             optionnames: ["In person", "Post (default)", "Found on doorstep"]}
        ]
    },
    model: {
        entryMethod: ""
    }
};

// Case 2: Term list has no default, model is empty
var noDefaultEmptyModel = {
    spec: {
        "spec": {
            "entryReason": {
                "selector": ".csc-intake-entry-reason",
                "options": ["enquiry", "commission", "loan"],
                "options-text": ["Enquiry", "Commission", "Loan"],
                "validators": [],
                "decorators": []
            }
        },
        "modelToResourceMap": {
            "*": "/intake"
        }
    },
    tree: {
        children: [
            {ID: "entryReason",
             selection: {valuebinding: "entryReason"},
             optionlist: ["none", "enquiry", "commission", "loan"],
             optionnames: ["-- Select an item from the list --", "Enquiry", "Commission", "Loan"]}
        ]
    },
    model: {
        entryReason: ""
    }
};

// Case 3: Term list has a default, model already has a value
var defaultWithModel = {
    spec: {
        "spec": {
            "entryMethod": {
                "selector": ".csc-intake-entry-method",
                "options": ["in-person", "post", "found-on-doorstep"],
                "options-text": ["In person", "Post", "Found on doorstep"],
                "default": "1",
                "validators": [],
                "decorators": []
            }
        },
        "modelToResourceMap": {
            "*": "/intake"
        }
    },
    tree: {
        children: [
            {ID: "entryMethod",
             selection: {valuebinding: "entryMethod"},
             optionlist: ["in-person", "post", "found-on-doorstep"],
             optionnames: ["In person", "Post (default)", "Found on doorstep"]}
        ]
    },
    model: {
        entryMethod: "found-on-doorstep"
    }
};

// Case 4: Term list has no default, model is not empty
var noDefaultWithModel = {
    spec: {
        "spec": {
            "entryReason": {
                "selector": ".csc-intake-entry-reason",
                "options": ["enquiry", "commission", "loan"],
                "options-text": ["Enquiry", "Commission", "Loan"],
                "validators": [],
                "decorators": []
            }
        },
        "modelToResourceMap": {
            "*": "/intake"
        }
    },
    tree: {
        children: [
            {ID: "entryReason",
             selection: {valuebinding: "entryReason"},
             optionlist: ["none", "enquiry", "commission", "loan"],
             optionnames: ["-- Select an item from the list --", "Enquiry", "Commission", "Loan"]}
        ]
    },
    model: {
        entryReason: "commission"
    }
};

var repeatedTermLists = {
    spec: {
        spec: {
            entryReasons: {
                selector: ".csc-intake-entry-reason-row",
                repeated: {
                    "entryReason": {
                        "selector": ".csc-intake-entry-reason",
                        "options": ["enquiry", "commission", "loan"],
                        "options-text": ["Enquiry", "Commission", "Loan"],
                        "validators": [],
                        "decorators": []
                    }
                }
            }
        },
        "modelToResourceMap": {
            "*": "/intake"
        }
    },
    tree: {
        children: [
            {ID: "entryReasons:",
             children: [
                {ID: "entryReason",
                 selection: {valuebinding: "entryReasons.0.entryReason"},
                 optionlist: ["none", "enquiry", "commission", "loan"],
                 optionnames: ["-- Select an item from the list --", "Enquiry", "Commission", "Loan"]}
             ]},
            {ID: "entryReasons:",
             children: [
                {ID: "entryReason",
                 selection: {valuebinding: "entryReasons.1.entryReason"},
                 optionlist: ["none", "enquiry", "commission", "loan"],
                 optionnames: ["-- Select an item from the list --", "Enquiry", "Commission", "Loan"]}
             ]}
        ]
    },
    model: {
        "entryReasons": [
            {"entryReason": "enquiry"},
            {"entryReason": "loan"}
        ]
    }
};
