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
		jqUnit.assertEquals("URL should point to the object schema URL.", "http://myserver.org/objects/schema/", url);
	});
	
	objectDAOTest.test("fileSystemURLFactory", function () {
		var baseUrl = "./";
		var factory = cspace.collectionObjectDAO.createFileSystemURLFactory(resourceUrls);
		
		var url = factory(baseUrl, resourceUrls.objects, "12345");
		jqUnit.assertEquals("URL should reference an object-specific JSON file.", "./objects/12345.json", url);
		
		url = factory(baseUrl, resourceUrls.objects);
		jqUnit.assertEquals("URL should point to the all objects JSON file.", "./objects/objects.json", url);
		
		url = factory(baseUrl, resourceUrls.schema);
		jqUnit.assertEquals("URL should point to the object schema JSON file.", "./objects/schema/schema.json", url);
	});

	var fetchObjectSchemaTestFunc = function (data, textStatus) {
		objectDAOTest.test("fetchObjectSchema", function () {
			jqUnit.assertNotNull("Shema object should not be null", data);
			jqUnit.assertNotUndefined("Schema has an objectTitle field", data.objectTitle);
			jqUnit.assertNotUndefined("Schema has a description field", data.description);
		});
	};
    
	var dao = cspace.collectionObjectDAO({baseUrl: "./test-data/"});
	dao.fetchObjectSchema(fetchObjectSchemaTestFunc, fetchObjectSchemaTestFunc);
}());
