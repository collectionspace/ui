/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, same*/

var recentActivityTester = function () {

    var testData = {
        items: ["Select from the list below...", "12345", "1984.068.0335b", "1984.068.0338"],
        selected: ""
    };
    var recentActivityTest = new jqUnit.TestCase("RecentActivity Tests");
    
    recentActivityTest.test("Fetch parameters", function () {
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedParams = {
            url: "./test-data//objects/objects.json",
            type: "GET",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedParams));
        var opts = {
            dataContext: {
                type: "cspace.resourceMapperDataContext",
                options: {
                    baseUrl: "./test-data/",
                    modelToResourceMap: {
                        "*": "/objects/objects"
                    },
                    replacements: {}
                }
            }
        };
        var testRA = cspace.recentActivity(".recently-created-container", opts);
        ajaxMock.verify();
        ajaxMock.restore();
	});

};


(function () {
    recentActivityTester();
}());


