/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

cspace = cspace || {};

(function ($, fluid) {

    var testData = [
        {"label": "Apple pie", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Apple pie)'Apple+pie'"},
        {"label": "Pear", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Pear)'Pear'"},
        {"label": "Banana", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Banana)'Banana'"},
        {"label": "Berry", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Berry)'Berry'"},
        {"label": "Apricot", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Apricot)'Apricot'"},
        {"label": "Peach cobbler", "urn": "urn:cspace:org.collectionspace.demo:orgauthority:name(Demo Org Authority):organization:name(Peach cobbler)'Peach+cobbler'"}
    ];

    var parseLabelFromUrn = function (string) {
        if (string.substring(0, 4) === "urn:") {
            return string.slice(string.indexOf("'") + 1, string.length - 1).replace("+", " ");
        } else {
            return string;
        }
    };

    var postNewTerm = function () {
        return function (data) {
            $.ajax({
                url: "../../chain" + data.url,
                dataType: "json",
                type: "POST",
                data: JSON.stringify({fields: {displayName: cspace.autocomplete.addConfirmDlg.newDisplayName}}),
                success: function (data) {
                    cspace.autocomplete.addConfirmDlg.hide();
                    // TODO: this needs to be set to the URN, not the displayName
                    cspace.autocomplete.addConfirmDlg.field.val(cspace.autocomplete.addConfirmDlg.newDisplayName);
                    cspace.autocomplete.addConfirmDlg.field.change();
                },
                error: function () {
                    console.log("error posting new term");
                }
            });
        };
    };

    var addNewTerm = function () {
        return function () {
            if (cspace.util.isLocal()) {
                cspace.autocomplete.addConfirmDlg.hide();
                return;
            }
            $.ajax({
                url: cspace.autocomplete.addConfirmDlg.vocabUrl,
                dataType: "json",
                type: "GET",
                success: postNewTerm(),
                error: function () {
                    console.log("error getting new term url");
                }
            });
        };
    };

    var clearNewTerm = function (input) {
        return function () {
            cspace.autocomplete.addConfirmDlg.fieldToClear.val("");
            cspace.autocomplete.addConfirmDlg.hide();
        };
    };

    var showConfirmation = function (newTerm, field, domBinder) {
        domBinder.locate("newTerm", cspace.autocomplete.addConfirmDlg).text(newTerm);
        cspace.autocomplete.addConfirmDlg.newDisplayName = newTerm;
        cspace.autocomplete.addConfirmDlg.field = field;
        var autocompleteInput = $(".ui-autocomplete-input", field.parent());
        cspace.autocomplete.addConfirmDlg.fieldToClear = autocompleteInput;
        autocompleteInput.after(cspace.autocomplete.addConfirmDlg);
        cspace.autocomplete.addConfirmDlg.show();
    };

    var setUpConfirmation = function (that) {
        if (!cspace.autocomplete.addConfirmDlg) {
            cspace.autocomplete.addConfirmDlg = "temp"; // to ensure that only one is created
            var resources = {
                addConfirm: {
                    href: that.options.addConfirmationTemplate
                }
            };
            
            fluid.fetchResources(resources, function () {
                cspace.autocomplete.addConfirmDlg = $(resources.addConfirm.resourceText, that.container[0].ownerDocument);
                cspace.autocomplete.addConfirmDlg.hide();

                cspace.autocomplete.addConfirmDlg.vocabUrl = that.options.vocabUrl;
                cspace.autocomplete.addConfirmDlg.newDisplayName = "";

                that.locate("clearButton", cspace.autocomplete.addConfirmDlg).click(clearNewTerm());
                that.locate("addButton", cspace.autocomplete.addConfirmDlg).click(addNewTerm());
            });
        }
    };

    /*
     * request: object with a single property called "term", which refers to the value currently in the text input.
     * callback: expects a single argument to contain the data to suggest to the user.
     *           This data should be filtered based on the provided term, and can be in any of the formats described 
     *            for simple local data (String-Array or Object-Array with label/value/both properties).
     */
    var makeAutocompleteCallback = function (that) {
        return function(request, callback){
            $.ajax({
                url: that.options.queryUrl + "?q=" + request.term,
                dataType: "text",
                success: function(data){
                    var dataArray;
                    if (data === "") {
                            showConfirmation(request.term, that.container, that.dom);
                    } else {
                        cspace.autocomplete.addConfirmDlg.hide();
                        var newdata = "[" + data.replace(/}\s*{/g, "},{") + "]";
                        dataArray = JSON.parse(newdata);
                        callback(dataArray);
                    }
                },
                error: function(){
                    if (cspace.util.isLocal()) {
                        if (request.term === "all") {
                            testdata = ["Fred Allen", "Phyllis Allen", "Karen Allen", "Rex Allen"];
                            callback(testdata);
                        } else {
                            showConfirmation(request.term, that.container, that.dom);
                        }
                    }
                }
            });
        };
    };

    var setupAutocomplete = function (that) {
        var opts = that.options;

        if (cspace.util.isLocal()) {
            opts.data = testData;
            opts.queryUrl = null;
        }
        else if (that.options.url) {
            opts.url = that.options.queryUrl;
        }
        else if (that.options.data) {
            opts.data = that.options.data;
        }

        var input = that.container;
        var autoCompleteInput = $("<input/>");
        autoCompleteInput.insertAfter(input);
        input.hide();

        var jqacopts = {
            minLength: that.options.minChars,
            delay: that.options.delay,
            source: makeAutocompleteCallback(that),
            select: function(event, ui) {
                input.val(ui.item.urn);
                input.change();
            }
        };
        autoCompleteInput.autocomplete(jqacopts).autocomplete(
     /*   "result", function (e, item) {
            if (item) {
                if (cspace.util.isLocal()) {
                    input.val(item.urn);
                } else {
                    input.val(JSON.parse(item[0]).urn);
                }
                input.change();
            }
        } */
        );

        if (input.val()) {
            var val = input.val();
            autoCompleteInput.val(parseLabelFromUrn(val));
        }

        autoCompleteInput.blur(function () {
            var storedVal = input.val();
            var typedVal = autoCompleteInput.val();
            if (typedVal !== parseLabelFromUrn(storedVal)) {
                input.val(typedVal);
                input.change();
            }
        });
        setUpConfirmation(that);
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
        selectors: {
            newTerm: ".csc-autocomplete-newTerm",
            clearButton: ".csc-autcomplete-addClear",
            addButton: ".csc-autcomplete-addConfirm"
        },

        minChars: 3,
        delay: 500,
        matchContains: true,
// MustMatch true results in sending the result back to the server again. This
// ends up not matching (because it's two words, I think) and so clearing the field.
// Setting mustMatch to false prevents this, but still seems to require a match, which is odd.
// If it turns out that the match-forcing is not working, this is where to start investigating.
        mustMatch: false,
        autoFill: false,
        highlight: false,

        addConfirmationTemplate: "../html/AutocompleteAddConfirmation.html",
        
        formatItem: cspace.jqueryAutocompleteFormatItem,
        formatMatch: cspace.jqueryAutocompleteFormatMatch,
        formatResult: cspace.jqueryAutocompleteFormatResult
        
        
    });

})(jQuery, fluid_1_2);
