/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_1*/

var cspace = cspace || {};

(function ($, fluid) {

    var testData = [
        {"label": "Apple", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Peach)'Peach'"},
        {"label": "Pear", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Pear)'Pear'"},
        {"label": "Banana", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Banana)'Banana'"},
        {"label": "Berry", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Banana)'Banana'"},
        {"label": "Apricot", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Apricot)'Apricot'"},
        {"label": "Peach", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Peach)'Peach'"}
    ];

    var setupAutocomplete = function (that) {
        var opts = that.options;

        if (cspace.util.isLocal()) {
            opts.data = testData;
        }
        else if (that.options.url) {
            opts.url = that.options.url;
        }
        else if (that.options.data) {
            opts.data = that.options.data;
        }

        var input = that.container;
        var autoCompleteInput = $("<input/>");
        autoCompleteInput.insertAfter(input);
        input.hide();

        autoCompleteInput.autocomplete(opts).autocomplete("result", function (e, item) {
            input.val(item.urn);
            input.change();
        });
    };


    cspace.jqueryAutocompleteFormatItem = function (item, i, total) {
        return item.label;
    };

    cspace.jqueryAutocompleteFormatMatch = function (item, i, total) {
        return item.label;
    };

    cspace.jqueryAutocompleteFormatResult = function (item) {
        return item.label;
    };

	cspace.autocomplete = function (container, options) {
        var that = fluid.initView("cspace.autocomplete", container, options);

        setupAutocomplete(that);

        return that;
    };
    
    fluid.defaults("cspace.autocomplete", {
        minChars: 0,
        matchContains: true,
        mustMatch: true,
        autoFill: false,

        formatItem: cspace.jqueryAutocompleteFormatItem,
        formatMatch: cspace.jqueryAutocompleteFormatMatch,
        formatResult: cspace.jqueryAutocompleteFormatResult
        
    });

})(jQuery, fluid_1_1);
