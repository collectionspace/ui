/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, same*/

var dataContextTester = function () {
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
        flatObjectModel: {
            modelToResourceMap: {
                "*": "/objects/%collObjId",
                "spec": "/objects/schema/schema",
                "procedures": "/objects/%collObjId/procedures",
                "procedure": "/objects/%collObjId/procedures/%procId"
            },
            replacements: {
                "collObjId": "resourceId",
                "procId": "procedureId"
            }
        },
        flatIntakeModel: {
            modelToResourceMap: {
                "*": "/intake/%id",
                "objects": "/intake/%id/objects"
            },
            replacements: {
                "id": "resourceId"
            }
        },
        nestedModel: {
            modelToResourceMap: {
                "collectionObject": "/objects/%collObjId",
                "collectionObject.spec": "/objects/schema/schema",
                "collectionObject.procedures": "/objects/%collObjId/procedures",
                "collectionObject.procedure": "/objects/%collObjId/procedures/%procId"
            },
            replacements: {
                "collObjId": "collectionObject.resourceId",
                "procId": "collectionObject.procedures.resourceId"
            }
        }
    };

    var makeUrlFactoryOptions = function (mapperOpts) {
    	return {
            baseUrl: "./test-data",
            includeResourceExtension: true,
            resourceMapper: {
                type: "cspace.dataContext.staticResourceMapper",
                options: mapperOpts
            }
        };
    };
    var makeDataContextOptions = function (mapperOpts) {
        return {
            urlFactory: {
                type: "cspace.dataContext.urlFactory",
                options: makeUrlFactoryOptions(mapperOpts)
            }
        };
    };

    var setupEventListeners = function (context, afterFetch, modelChanged, onError) {
        context.events.afterFetch.addListener(afterFetch);
        context.events.modelChanged.addListener(modelChanged);
        context.events.onError.addListener(onError);
    };

    /*
     * Utility to call qUnit's start() only once all tests have executed
     */
    var done = 0; 
    var startIfDone = function (numTests) {
        if (++done === numTests) {
            done = 0;
            start();
        }
    };

    var dataContextTest = new jqUnit.TestCase("DataContext Tests");
    
    dataContextTest.test("staticResourceMapper: no options", function () {
        var opts = {};
        var testMapper = cspace.dataContext.staticResourceMapper(opts);
        var result = testMapper.map(models.flatCollectionObject, "collectionObject");
		jqUnit.assertEquals("Mapping collectionObject", "", result);
	});

    dataContextTest.test("staticResourceMapper: Object model", function () {
        var testMapper = cspace.dataContext.staticResourceMapper(mapperOptions.flatObjectModel);
        var result;
        
        result = testMapper.map(models.flatCollectionObject, "*");
		jqUnit.assertEquals("Mapping * (the whole model)", "/objects/12345", result);
        result = testMapper.map(models.flatCollectionObject, "procedures");
		jqUnit.assertEquals("Mapping procedures", "/objects/12345/procedures", result);
	});

    dataContextTest.test("staticResourceMapper: Intake model", function () {
        var testMapper = cspace.dataContext.staticResourceMapper(mapperOptions.flatIntakeModel);
        var result;
        
        result = testMapper.map(models.flatIntake);
		jqUnit.assertEquals("Mapping an unspecified model path (same as *)", "/intake/2468", result);
        result = testMapper.map(models.flatIntake, "objects");
		jqUnit.assertEquals("Mapping objects", "/intake/2468/objects", result);
	});
    
    dataContextTest.test("staticResourceMapper: Nested model", function () {
        var testModel = fluid.copy(models.nestedModel);

        var testMapper = cspace.dataContext.staticResourceMapper(mapperOptions.nestedModel);
        var result;
        
        result = testMapper.map(testModel, "collectionObject");
		jqUnit.assertEquals("Mapping collectionObject", "/objects/12345", result);
        result = testMapper.map(testModel, "collectionObject.procedures");
		jqUnit.assertEquals("Mapping collectionObject.procedures", "/objects/12345/procedures", result);
    });

    dataContextTest.test("urlFactory, baseUrl", function () {
        var opts = {
            protocol: "sms://",
            baseUrl: "somesite.com/",
            includeResourceExtension: false
        };
        var testFactory = cspace.dataContext.urlFactory(opts);

        var url = testFactory.urlForModelPath("collectionObject", models.flatCollectionObject);
        jqUnit.assertEquals("No options", "sms://somesite.com/", url);
    });

    dataContextTest.test("urlFactory, nested model", function () {
        var opts = {
            resourceMapper: {
                type: "cspace.dataContext.staticResourceMapper",
                options: mapperOptions.nestedModel
            },
            protocol: "file://",
            baseUrl: "somesite.com",
            includeResourceExtension: false
        };
        var testFactory = cspace.dataContext.urlFactory(opts);
        var url = testFactory.urlForModelPath("collectionObject", models.nestedModel);
        jqUnit.assertEquals("Url for object", "file://somesite.com/objects/12345", url);
        url = testFactory.urlForModelPath("collectionObject.procedures", models.nestedModel);
        jqUnit.assertEquals("Url for related procedures", "file://somesite.com/objects/12345/procedures", url);
    });
    
    dataContextTest.test("Fetch valid data (flat model)", function () {
        var testModel = {};
        var testFetchSuccess = function (modelPath, data) {
            jqUnit.assertEquals("The data that was fetched is the the data we expected to get (accessionNumber).", "1984.068.0335b", data.accessionNumber);
            jqUnit.assertEquals("The data that was fetched is the the data we expected to get (objectTitle) is the data we expected to get.", "Catalogs. Wyanoak Publishing Company.", data.objectTitle);
            startIfDone(2);
        };
        var testUpdateSuccess = function (newModel, oldModel, source) {
            jqUnit.assertEquals("The data that was fetched was placed at the correct spot in the model.", testModel, newModel);
            startIfDone(2);
        };
        var errorInTest = function (type, modelPath, message) {
            ok(false, "Data should have been returned for a fetch against valid data: " + message);
            startIfDone(1);
        };
        var testContext = cspace.dataContext(testModel, makeDataContextOptions(mapperOptions.flatObjectModel));
        setupEventListeners(testContext, testFetchSuccess, testUpdateSuccess, errorInTest);
        stop();
        testContext.fetch("*", {
            resourceId: "1984.068.0335b"
        });
    });
        
    dataContextTest.test("Fetch valid data (nested model)", function () {
        var testModel = {};
        var testFetchSuccess = function (modelPath, data) {
            jqUnit.assertEquals("The data that was fetched is the the data we expected to get (accessionNumber).", "1984.068.0335b", data.accessionNumber);
            jqUnit.assertEquals("The data that was fetched is the the data we expected to get (objectTitle) is the data we expected to get.", "Catalogs. Wyanoak Publishing Company.", data.objectTitle);
            startIfDone(2);
        };
        var testUpdateSuccess = function (newModel, oldModel, source) {
            jqUnit.assertEquals("The data that was fetched was placed at the correct spot in the model.", testModel, newModel);
            startIfDone(2);
        };
        var errorInTest = function (type, modelPath, message) {
            ok(false, "Data should have been returned for a fetch against valid data: " + message);
            startIfDone(1);
        };
        var testContext = cspace.dataContext(testModel, makeDataContextOptions(mapperOptions.nestedModel));
        setupEventListeners(testContext, testFetchSuccess, testUpdateSuccess, errorInTest);
        stop();
        testContext.fetch("collectionObject", {
            resourceId: "1984.068.0335b"
        });
    });
        

    dataContextTest.test("Fetch ui spec", function () {
        var testModel = {};
        var testFetchSuccess = function (modelPath, data) {
            jqUnit.assertDeepEq("The spec that was fetched is the the data we expected to get (objectTitle.selector).", "#object-title .info-value", data.objectTitle.selector);
            same(data.description.validators, [], "The spec that was fetched is the the data we expected to get (description.validators) is the data we expected to get.");
            startIfDone(2);
        };
        var testUpdateSuccess = function (newModel, oldModel, source) {
            jqUnit.assertDeepEq("The spec was fetched and placed at the correct spot in the model.", testModel, newModel);
            startIfDone(2);
        };
        var errorInTest = function (type, modelPath, message) {
            ok(false, "Data should have been returned for a fetch against ui spec: " + message);
            startIfDone(1);
        };
        var testContext = cspace.dataContext(testModel, makeDataContextOptions(mapperOptions.flatObjectModel));
        setupEventListeners(testContext, testFetchSuccess, testUpdateSuccess, errorInTest);
        stop();
        testContext.fetch("spec");
    });

    dataContextTest.test("resourceMapperDataContext", function () {
        var testOptions = mapperOptions.flatObjectModel;
        testOptions.baseUrl = "ftp://somewhere";
        var testContext = cspace.resourceMapperDataContext(models.flatCollectionObject, testOptions);
        jqUnit.assertDeepEq("Resulting mapper should have correct map", mapperOptions.flatObjectModel.modelToResourceMap, testContext.urlFactory.resourceMapper.modelToResourceMap);
        jqUnit.assertDeepEq("Resulting mapper should have correct replacements", mapperOptions.flatObjectModel.replacements, testContext.urlFactory.resourceMapper.replacements);
        jqUnit.assertDeepEq("Resulting urlFactory should have specified baseUrl", "ftp://somewhere", testContext.urlFactory.options.baseUrl);
        jqUnit.assertDeepEq("Resulting urlFactory should have default dataType", "json", testContext.urlFactory.options.dataType);
        
    });
    
    dataContextTest.test("update: params to jQuery.ajax()", function () {
        var testOptions = mapperOptions.flatObjectModel;
        testOptions.csid = "12345";
        var testContext = cspace.dataContext(models.flatCollectionObject, makeDataContextOptions(testOptions));

        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        
        // Don't know how jqMock checks functions, so just check the other parameters for now
        var expectedAjaxParamsForFullModel = {
            url: "./test-data/objects/12345.json",
            data: JSON.stringify(models.flatCollectionObject),
            type: "PUT",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParamsForFullModel));
        
        testContext.update("*");

        ajaxMock.verify();
        ajaxMock.restore();
    });

    dataContextTest.test("create: params to jQuery.ajax()", function () {
        var testOptions = mapperOptions.flatObjectModel;
        testOptions.csid = "allNewId";
        var testModel = models.flatCollectionObject;
        testModel.resourceId = "allNewId";
        var testContext = cspace.dataContext(testModel, makeDataContextOptions(testOptions));

        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        
        // Don't know how jqMock checks functions, so just check the other parameters for now
        var expectedAjaxParamsForFullModel = {
            url: "./test-data/objects/allNewId.json",
            data: JSON.stringify(models.flatCollectionObject),
            type: "POST",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParamsForFullModel));
        
        testContext.create("*");

        ajaxMock.verify();
        ajaxMock.restore();
    });
    
    dataContextTest.test("testUrlFactory", function () {
        var tuf = cspace.dataContext.testUrlFactory();
        var result = tuf.urlForModelPath("*", {});
        jqUnit.assertEquals("Default URL for \"*\"", "./files.json", result);

        tuf = cspace.dataContext.testUrlFactory({
            resourceMapper: {
                type: "cspace.dataContext.staticResourceMapper",
                options: {
                	modelToResourceMap: {
                        "*": "data/collection-object/%collObjId",
                        "spec": "schemas/collection-object/schema"
                    },
                    replacements: {
                        "collObjId": "csid"
                    }
                }
            }
        });
        result = tuf.urlForModelPath("spec", {});
        jqUnit.assertEquals("Object URL for \"spec\"", "./schemas/collection-object/schema.json", result);
        result = tuf.urlForModelPath("*", {csid: "12345"});
        jqUnit.assertEquals("Object URL for \"*\"", "./data/collection-object/12345.json", result);

        tuf = cspace.dataContext.testUrlFactory({
            resourceMapper: {
                type: "cspace.dataContext.staticResourceMapper",
                options: {
                	modelToResourceMap: {
                        "*": "data/intake/%id",
                        "spec": "schemas/intake/schema"
                    },
                    replacements: {
                        "id": "csid"
                    }
                }
            }
        });
        result = tuf.urlForModelPath("spec", {});
        jqUnit.assertEquals("Object URL for \"spec\"", "./schemas/intake/schema.json", result);
        result = tuf.urlForModelPath("*", {csid: "54321"});
        jqUnit.assertEquals("Object URL for \"*\"", "./data/intake/54321.json", result);
    });
};

(function () {
    dataContextTester();
}());

