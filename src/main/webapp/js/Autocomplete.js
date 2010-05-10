/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/

cspace = cspace || {};

(function ($, fluid) {

    var parseLabelFromUrn = function (string) {
        if (string.substring(0, 4) === "urn:") {
            return string.slice(string.indexOf("'") + 1, string.length - 1).replace("+", " ");
        } else {
            return string;
        }
    };

    var postNewTerm = function (term, url, callback) {
        $.ajax({
            url: "../../chain" + url,
            dataType: "json",
            type: "POST",
            data: JSON.stringify({fields: {displayName: term}}),
            success: function (data) {
                callback(data.urn);
            },
            error: function () {
                fluid.fail("error posting new term");
            }
        });
    };

    var updateTerm = function (value) {
        cspace.autocomplete.addConfirmDlg.field.val(value);
        cspace.autocomplete.addConfirmDlg.field.change();
        cspace.autocomplete.addConfirmDlg.hide();
    };
    
    var clearNewTerm = function () {
        cspace.autocomplete.addConfirmDlg.fieldToClear.val("");
        cspace.autocomplete.addConfirmDlg.hide();
    };

    var showConfirmation = function (newTerm, field, domBinder, vocabUrl) {
        $("ul.ui-autocomplete", field.parent()).hide();
        domBinder.locate("newTerm", cspace.autocomplete.addConfirmDlg).text(newTerm);

        var autocompleteInput = $(".ui-autocomplete-input", field.parent());
        cspace.autocomplete.addConfirmDlg.newDisplayName = newTerm;
        cspace.autocomplete.addConfirmDlg.field = field;
        cspace.autocomplete.addConfirmDlg.fieldToClear = autocompleteInput;
        cspace.autocomplete.addConfirmDlg.vocabUrl = vocabUrl;

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

                cspace.autocomplete.addConfirmDlg.newDisplayName = "";

                that.locate("clearButton", cspace.autocomplete.addConfirmDlg).click(clearNewTerm);
                that.locate("addButton", cspace.autocomplete.addConfirmDlg).click(function () { 
                    that.options.termSaverFn(cspace.autocomplete.addConfirmDlg.newDisplayName, updateTerm);
                });
                that.events.afterRenderConfirmation.fire();
            });
        }
    };

    var makeAutocompleteCallback = function (that) {
        return function (request, callback) {
            $.ajax({
                url: that.options.queryUrl + "?q=" + request.term,
                dataType: "text",
                success: function (data) {
                    var dataArray;
                    if (data === "") {
                        showConfirmation(request.term, that.hiddenInput, that.dom, that.options.vocabUrl);
                    } else {
                        cspace.autocomplete.addConfirmDlg.hide();
                        var newdata = "[" + data.replace(/}\s*{/g, "},{") + "]";
                        dataArray = JSON.parse(newdata);
                        callback(dataArray);
                    }
                },
                error: function () {
                    if (cspace.util.isLocal()) {
                        if (request.term === "all") {
                            cspace.autocomplete.addConfirmDlg.hide();
                            
                            // TODO: We should pull this testdata out of here
                            var testdata = ["Fred Allen", "Phyllis Allen", "Karen Allen", "Rex Allen"];
                            callback(testdata);
                        } else {
                            showConfirmation(request.term, that.hiddenInput, that.dom, that.options.vocabUrl);
                        }
                    }
                }
            });
        };
    };

    var setupAutocomplete = function (that) {
        that.hiddenInput = $("input", that.container.parent());
        var autoCompleteInput = $("<input/>");
        autoCompleteInput.insertAfter(that.hiddenInput);
        that.hiddenInput.hide();

        var opts = {
            minLength: that.options.minChars,
            delay: that.options.delay,
            source: makeAutocompleteCallback(that),
            select: function (event, ui) {
                that.hiddenInput.val(ui.item.urn);
                that.hiddenInput.change();
            }
        };
        autoCompleteInput.autocomplete(opts).autocomplete();

        if (that.hiddenInput.val()) {
            var val = that.hiddenInput.val();
            autoCompleteInput.val(parseLabelFromUrn(val));
        }

    };

	cspace.autocomplete = function (container, options) {
        var that = fluid.initView("cspace.autocomplete", container, options);

        setupAutocomplete(that);
        setUpConfirmation(that);
        return that;
    };

    cspace.autocomplete.ajaxTermSaver = function (term, callback) {
        if (cspace.util.isLocal()) {
            cspace.autocomplete.addConfirmDlg.hide();
            return;
        }
        $.ajax({
            url: cspace.autocomplete.addConfirmDlg.vocabUrl,
            dataType: "json",
            type: "GET",
            success: function (data) {
                postNewTerm(term, data.url, callback);
            },
            error: function () {
                fluid.fail("error getting new term url");
            }
        });
    };
    
    fluid.defaults("cspace.autocomplete", {
        selectors: {
            newTerm: ".csc-autocomplete-newTerm",
            clearButton: ".csc-autcomplete-addClear",
            addButton: ".csc-autcomplete-addConfirm"
        },
        events: {
            afterRenderConfirmation: null
        }, 
        termSaverFn: cspace.autocomplete.ajaxTermSaver,
        minChars: 3,
        delay: 500,

        addConfirmationTemplate: "../html/AutocompleteAddConfirmation.html"
    });
})(jQuery, fluid);
