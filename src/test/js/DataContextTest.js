/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, cspace*/

(function () {
	var dataContextTest = new jqUnit.TestCase("DataContext Tests");
    
    var models = {
        flatCollectionObject: {
            resourceId: "12345",
            objectTitle: "Test Title",
            accessionNumber: "2009.07.15-A",
            description: "Test description",
            objectName: "Test Name",
            distinguishingFeatures: "test features",
            numberOfObjects: "42",
            responsibleDepartment: "test department",
            comments: "test comments",
            dateAssociation: "old",
            datePeriod: "Cenozoic",
            dateText: "63 million years BP"
        },
        
        flatIntake: {
            resourceId: "2468",
            entryNumber: "98765",
            entryDate: "2009.07.15",
            numberOfObjects: "7",
            entryNote: "test note",
            description: "test description",
            donor: "Tenzin Gyatso",
            insurer: "Pema Dorje",
            valuationAmount: "priceless"
        }
    };
    models.nestedModel = {
        collectionObject: models.flatCollectionObject,
        procedures: [models.flatIntake]
    };

    var mapperOptions = {
        modelToResourceMap: {
            "collectionObject": "/objects/%id",
            "collectionObject.procedures": "/objects/%id/procedures"
        },
        replacements: {
            "id": "collectionObject.resourceId"
        }
    };
    
    dataContextTest.test("staticResourceMapper: no options", function () {
        var opts = {};
        var testMapper = cspace.dataContext.staticResourceMapper(opts);
        var result = testMapper.map(models.flatCollectionObject, "collectionObject");
		jqUnit.assertEquals("Mapping collectionObject", "", result);
	});

    dataContextTest.test("staticResourceMapper: Object model", function () {
        var opts = {
            modelToResourceMap: {
                "*": "/objects/%id",
                "procedures": "/objects/%id/procedures"
            },
            replacements: {
                "id": "resourceId"
            }
        };
        var testMapper = cspace.dataContext.staticResourceMapper(opts);
        var result;
        
        result = testMapper.map(models.flatCollectionObject, "*");
		jqUnit.assertEquals("Mapping * (the whole model)", "/objects/12345", result);
        result = testMapper.map(models.flatCollectionObject, "procedures");
		jqUnit.assertEquals("Mapping procedures", "/objects/12345/procedures", result);
	});

    dataContextTest.test("staticResourceMapper: Intake model", function () {
        var opts = {
            modelToResourceMap: {
                "*": "/intake/%id",
                "objects": "/intake/%id/objects"
            },
            replacements: {
                "id": "resourceId"
            }
        };
        var testMapper = cspace.dataContext.staticResourceMapper(opts);
        var result;
        
        result = testMapper.map(models.flatIntake);
		jqUnit.assertEquals("Mapping an unspecified model path (same as *)", "/intake/2468", result);
        result = testMapper.map(models.flatIntake, "objects");
		jqUnit.assertEquals("Mapping objects", "/intake/2468/objects", result);
	});
    
    dataContextTest.test("Nested model", function () {
        var model = models.nestedModel;

        var testMapper = cspace.dataContext.staticResourceMapper(mapperOptions);
        var result;
        
        result = testMapper.map(model, "collectionObject");
		jqUnit.assertEquals("Mapping collectionObject", "/objects/12345", result);
        result = testMapper.map(model, "collectionObject.procedures");
		jqUnit.assertEquals("Mapping collectionObject.procedures", "/objects/12345/procedures", result);
    });
    
    dataContextTest.test("urlFactory, only baseUrl", function () {
        var opts = {
            baseUrl: "somesite.com"
        };
        var testFactory = cspace.dataContext.urlFactory(opts);

        var url = testFactory.urlForModelPath("collectionObject", models.flatCollectionObject);
        jqUnit.assertEquals("No options", "file://somesite.com", url);
    });

    dataContextTest.test("urlFactory, protocol", function () {
        var opts = {
            baseUrl: "somesite.com",
            protocol: "sms://"
        };
        var testFactory = cspace.dataContext.urlFactory(opts);

        var url = testFactory.urlForModelPath("*", models.flatCollectionObject);
        jqUnit.assertEquals("No options", "sms://somesite.com", url);
    });

    dataContextTest.test("urlFactory, object model", function () {
        var opts = {
            resourceMapper: {
                type: "cspace.dataContext.staticResourceMapper",
                options: mapperOptions
            },
            baseUrl: "somesite.com"
        };
        var testFactory = cspace.dataContext.urlFactory(opts);

        var url = testFactory.urlForModelPath("collectionObject", models.nestedModel);
        jqUnit.assertEquals("Url for object", "file://somesite.com/objects/12345", url);
        url = testFactory.urlForModelPath("collectionObject.procedures", models.nestedModel);
        jqUnit.assertEquals("Url for related procedures", "file://somesite.com/objects/12345/procedures", url);
    });
}());