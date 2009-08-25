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
        "*": "/objects"
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
