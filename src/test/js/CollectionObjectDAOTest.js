/*global jqUnit, cspace*/
(function () {
	var resourceUrls = {
		objects: "objects/",
		schema: "objects/schema/"
	};
	
	var objectDAOTest = new jqUnit.TestCase("Collection Object DAO Tests");
	
	objectDAOTest.test("serverUrlFactory", function () {
		var baseUrl = "http://myserver.org/";
		var url = cspace.collectionObjectDAO.serverURLFactory(baseUrl, resourceUrls.objects, "12345");
		jqUnit.assertEquals("URL should reference an object-specific URL.", "http://myserver.org/objects/12345", url);
		
		url = cspace.collectionObjectDAO.serverURLFactory(baseUrl, resourceUrls.objects);
		jqUnit.assertEquals("URL should point to the all objects URL.", "http://myserver.org/objects/", url);
		
		url = cspace.collectionObjectDAO.serverURLFactory(baseUrl, resourceUrls.schema);
		jqUnit.assertEquals("URL should point to the object spec URL.", "http://myserver.org/objects/schema/", url);
	});
	
	objectDAOTest.test("fileSystemURLFactory", function () {
		var baseUrl = "./";
		var factory = cspace.collectionObjectDAO.createFileSystemURLFactory(resourceUrls);
		
		var url = factory(baseUrl, resourceUrls.objects, "12345");
		jqUnit.assertEquals("URL should reference an object-specific JSON file.", "./objects/12345.json", url);
		
		url = factory(baseUrl, resourceUrls.objects);
		jqUnit.assertEquals("URL should point to the all objects JSON file.", "./objects/objects.json", url);
		
		url = factory(baseUrl, resourceUrls.schema);
		jqUnit.assertEquals("URL should point to the object spec JSON file.", "./objects/schema/schema.json", url);
	});

	var fetchObjectSpecTestFunc = function (data, textStatus) {
		objectDAOTest.test("fetchObjectSpec", function () {
            jqUnit.assertFalse("Result should not be an XMLHttpRequest", (data instanceof XMLHttpRequest));
			jqUnit.assertNotNull("Shema object should not be null", data);
			jqUnit.assertNotUndefined("Spec has an objectTitle field", data.objectTitle);
			jqUnit.assertNotUndefined("Spec has a description field", data.description);
		});
	};
    
    var fetchObjectForIdTestFunc = function (data, textStatus) {
        objectDAOTest.test("fetchObjectForId", function () {
            jqUnit.assertFalse("Result should not be an XMLHttpRequest", (data instanceof XMLHttpRequest));
            jqUnit.assertTrue("Object should exist", !!data);
            jqUnit.assertEquals("Object should have correct ID", "1984.068.0338", data.accessionNumber);
        });
    };
    
	var dao1 = cspace.collectionObjectDAO({baseUrl: "./test-data/"});
	dao1.fetchObjectSpec(fetchObjectSpecTestFunc, fetchObjectSpecTestFunc);
    
	var dao2 = cspace.collectionObjectDAO({
        baseUrl: "./test-data/",
        resources: {
            objects: "objects/",    // CSPACE-256: This option is only set until this issue is resolved
            schema: "objects/mmi-schema/"
        }
    });
	dao2.fetchObjectForId("1984.068.0338", fetchObjectForIdTestFunc, fetchObjectForIdTestFunc);
}());
