/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jqUnit, jQuery, cspace, fluid, start, stop, ok, expect*/
"use strict";

cspace.test = cspace.test || {};

var searchBoxTester = function ($) {
    
    var container = "#main";
    var schema = {
        "recordlist": {
            "default": ["person", "intake", "loanin", "loanout", "acquisition", "organization", "cataloging", "movement"],
            "type": "array"
        }
    };
    var permissions = {
        "users": ["create", "read", "update", "delete", "list"],
        "person": [],
        "location": ["create", "read", "update", "delete", "list"],
        "idgenerators": ["create", "read", "update", "delete", "list"],
        "loanin": ["create", "read", "update", "delete", "list"],
        "userrole": ["create", "read", "update", "delete", "list"],
        "loanout": ["create", "read", "update", "delete", "list"],
        "contact": ["create", "read", "update", "delete", "list"],
        "id": ["create", "read", "update", "delete", "list"],
        "acquisition": ["create", "read", "update", "delete", "list"],
        "organization": ["create", "read", "update", "delete", "list"],
        "locations": ["create", "read", "update", "delete", "list"],
        "movement": ["create", "read", "update", "delete", "list"],
        "role": ["create", "read", "update", "delete", "list"],
        "dimensions": ["create", "read", "update", "delete", "list"],
        "authorization/roles/accountroles": ["create", "read", "update", "delete", "list"],
        "cataloging": ["create", "read", "update", "delete", "list"],
        "objectexit": ["create", "read", "update", "delete", "list"],
        "vocabularyitems": ["create", "read", "update", "delete", "list"],
        "reports": ["create", "read", "update", "delete", "list"],
        "intake": ["create", "read", "update", "delete", "list"],
        "permrole": ["create", "read", "update", "delete", "list"],
        "organizations": ["create", "read", "update", "delete", "list"],
        "permission": ["create", "read", "update", "delete", "list"],
        "persons": ["create", "read", "update", "delete", "list"],
        "relations": ["create", "read", "update", "delete", "list"],
        "authorization/permissions/permroles": ["create", "read", "update", "delete", "list"],
        "vocab": ["create", "read", "update", "delete", "list"],
        "notes": ["create", "read", "update", "delete", "list"]
    };
    
    fluid.demands("cspace.searchBox", "cspace.test", [container, fluid.COMPONENT_OPTIONS]);
    
    var searchBoxTest = new jqUnit.TestCase("SearchBox Tests");
    
    var setupSearchBox = function (options) {
        options = options || {};
        fluid.merge(null, options, {
            permissions: permissions,
            schema: schema
        });
        return fluid.invoke("cspace.searchBox", [options]);
    };
    
    searchBoxTest.test("Init and render", function () {
        var searchBox = setupSearchBox();
        searchBox.refreshView();
        jqUnit.assertEquals("SearchBox dropdown\'s number of recordTypes is equal to", 7, $("option", searchBox.locate("recordTypeSelect")).length);
        jqUnit.assertEquals("Label is ", "", searchBox.locate("recordTypeSelectLabel").text());
    });
    
    searchBoxTest.test("Init and render with Label", function () {
        var searchBox = setupSearchBox({
            strings: {
                recordTypeSelectLabel: "Record Type"
            }
        });
        searchBox.refreshView();
        jqUnit.assertEquals("Label is ", "Record Type", searchBox.locate("recordTypeSelectLabel").text());
    });
};

(function () {
    searchBoxTester(jQuery);
}());