/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, jqMock, cspace, fluid, start, stop, ok, expect*/
"use strict";

(function () {
    // jqMock requires jqUnit.ok to exist
    jqUnit.ok = ok;

    var testModel = {
        fields: {
            field1: "foo",
            field2: "bar"
        }
    };
    var testOpts = {
        baseUrl: "http://some.museum.com",
        recordType: "aRecordType"
    };

    /*
     * Utility to call qUnit's start() only once all tests have executed
     * TODO: this seems generally useful and we should push it up to jqunit
     */
    var done = 0; 
    var startIfDone = function (numTests) {
        if (++done === numTests) {
            done = 0;
            start();
        }
    };

    var dataContextTest = new jqUnit.TestCase("DataContext Tests", function () {
        cspace.util.isTest = true;
    });
    
    dataContextTest.test("Create ajax parameters", function () {
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        // Don't know how jqMock checks functions, so just check the other parameters for now
        var expectedAjaxParams = {
            url: "http://some.museum.com/aRecordType/",
            data: JSON.stringify(testModel),
            type: "POST",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams));
        testOpts.model = testModel;
        var dc = cspace.dataContext(testOpts);
        dc.create();
        ajaxMock.verify();
        ajaxMock.restore();
    });    

    dataContextTest.test("Update ajax parameters", function () {
        testModel.csid = 42;
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "http://some.museum.com/aRecordType/42",
            data: JSON.stringify(testModel),
            type: "PUT",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams));
        testOpts.model = testModel;
        var dc = cspace.dataContext(testOpts);
        dc.update();
        ajaxMock.verify();
        ajaxMock.restore();
    });    

    dataContextTest.test("Update event firing", function () {
        expect(2);
                
        var testUpdateOpts = {
            baseUrl: "test-data",
            recordType: "cataloging",
            fileExtension: ".json",
            listeners: {
                afterUpdate: function (data) {
                    ok(true, "Success function should be called after successful update");
                    startIfDone(2);
                },
                afterSave: function (data) {
                    ok(true, "afterSave function should be called after successful update");
                    startIfDone(2);
                },
                onError: function (operation, message) {
                    ok(false, "Error function shouldn't be called after successful update"+message);
                    start();
                }
            }
        };
        testUpdateOpts.model = {csid: "12345"};
        var dc = cspace.dataContext(testUpdateOpts);
        dc.update();
        stop();
    });

    dataContextTest.test("Fetch ajax parameters", function () {
        testModel.csid = undefined;
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "http://some.museum.com/aRecordType/77",
            type: "GET",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams));
        testOpts.model = testModel;
        var dc = cspace.dataContext(testOpts);
        dc.fetch(77);
        ajaxMock.verify();
        ajaxMock.restore();
    });    

    dataContextTest.test("Fetch error handling", function () {
        var testEmptyModel = {};
        var testFetchOpts = {
            baseUrl: "foo",
            recordType: "bar"
        };
        var fetchSuccess = function (data) {
            ok(false, "Success function shouldn't be called after failed fetch");
            start();
        };
        var fetchError = function (operation, message) {
            jqUnit.assertEquals("Operation", "fetch", operation);
            start();
        };
        testFetchOpts.model = testEmptyModel;
        var dc = cspace.dataContext(testFetchOpts);
        dc.events.afterFetch.addListener(fetchSuccess);
        dc.events.onError.addListener(fetchError);
        stop();
        dc.fetch("blah");
    });

    dataContextTest.test("Fetch data", function () {
        expect(5);
        var testModel = {
            objectTitle: "old title"
        };
        var testFetchOpts = {
            baseUrl: "test-data",
            recordType: "cataloging",
            fileExtension: ".json", 
            listeners: {
                afterFetch: function (data) {
                    jqUnit.assertEquals("The data has the accessionNumber we expected.", "1984.068.0335b", data.accessionNumber);
                    jqUnit.assertEquals("The data has the objectTitle we expected.", "Catalogs. Wyanoak Publishing Company.", data.objectTitle);
                    startIfDone(2);
                }, 
                modelChanged: function (newModel, oldModel, source) {
                    jqUnit.assertEquals("The new model has the accessionNumber we expected.", "1984.068.0335b", newModel.accessionNumber);
                    jqUnit.assertEquals("The new model has the objectTitle we expected.", "Catalogs. Wyanoak Publishing Company.", newModel.objectTitle);
                    jqUnit.assertEquals("The old model has the objectTitle we expected.", "old title", oldModel.objectTitle);
                    startIfDone(2);
                },
                afterSave: function (data) {
                    ok(false, "No afterSave event should be fired when fetching");
                    start();
                },
                onError: function (operation, message) {
                    ok(false, "No error should occur for a fetch against valid data: operation=" + operation + ", message=" + message);
                    start();
                }
            }
        };
        testFetchOpts.model = testModel;
        var dc = cspace.dataContext(testFetchOpts);
        dc.fetch("1984.068.0335b");
        stop();
    });

    dataContextTest.test("Add new relations ajax parameters", function () {
        var testRelations = {
            items: [
                {
                    source: {csid: testModel.csid},
                    target: {csid: "987.654"},
                    type: "affects",
                    "one-way": true
                },
                {
                    source: {csid: testModel.csid},
                    target: {csid: "741.852"},
                    type: "affects",
                    "one-way": true
                }
            ]
        };
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "http://some.museum.com/relationships/",
            data: JSON.stringify(testRelations),
            type: "POST",
            dataType: "json"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams));
        
        testOpts.model = testModel;
        var dc = cspace.dataContext(testOpts);
        dc.addRelations(testRelations);
        ajaxMock.verify();
        ajaxMock.restore();
    });

    dataContextTest.test("Remove ajax call", function () {
        testModel.csid = "741.852-963";        
        var ajaxMock = new jqMock.Mock(jQuery, "ajax");
        var expectedAjaxParams = {
            url: "http://some.museum.com/aRecordType/" + testModel.csid,
            type: "DELETE"
        };
        ajaxMock.modify().args(jqMock.is.objectThatIncludes(expectedAjaxParams));
        testOpts.model = testModel;
        var dc = cspace.dataContext(testOpts);
        dc.remove(testModel.csid);

        ajaxMock.verify();
        ajaxMock.restore();
    });
}());

