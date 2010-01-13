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

    var parseLabelFromUrn = function (urn) {
        return urn.slice(urn.indexOf("'") + 1, urn.length - 1);
    };

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
            if (item) {
                if (cspace.util.isLocal()) {
                    input.val(item.urn);
                } else {
                    input.val(JSON.parse(item[0]).urn);
                }
                input.change();
            }
        });

        if (input.val()) {
            var val = input.val();
            autoCompleteInput.val(parseLabelFromUrn(val).replace("+", " "));
        }
    };


    cspace.jqueryAutocompleteFormatItem = function (item, i, total) {
        if (cspace.util.isLocal()) {
            return item.label;
        } else {
            var obj = JSON.parse(item[0]);
            return obj.label;
        }
    };

    cspace.jqueryAutocompleteFormatMatch = function (item, i, total) {
        if (cspace.util.isLocal()) {
            return item.label;
        } else {
            var obj = JSON.parse(item[0]);
            return parseLabelFromUrn(obj.urn);
        }
    };

    cspace.jqueryAutocompleteFormatResult = function (item) {
        if (cspace.util.isLocal()) {
            return item.label;
        } else {
            var obj = JSON.parse(item[0]);
            return obj.label;
        }
    };

	cspace.autocomplete = function (container, options) {
        var that = fluid.initView("cspace.autocomplete", container, options);

        setupAutocomplete(that);

        return that;
    };
    
    fluid.defaults("cspace.autocomplete", {
        minChars: 3,
        matchContains: true,
        mustMatch: true,
        autoFill: false,
        highlight: false,

        formatItem: cspace.jqueryAutocompleteFormatItem,
        formatMatch: cspace.jqueryAutocompleteFormatMatch,
        formatResult: cspace.jqueryAutocompleteFormatResult
        
    });

})(jQuery, fluid_1_1);
