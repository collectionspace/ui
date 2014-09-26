/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/

cspace = cspace || {};

(function (fluid) {

    "use strict";

    fluid.defaults("cspace.termList", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            // Main implementation of the Term List
            termListImpl: {
                type: "cspace.termList.impl",
                container: "{termList}.termListImplContainer",
                options: {
                    selectors: {
                        termList: "{termList}.termListSelector"
                    },
                    optionnames: "{termList}.optionnames",
                    optionlist: "{termList}.optionlist",
                    activestatus: "{termList}.activestatus",
                    elPath: "{termList}.options.elPath",
                    root: "{termList}.options.root",
                    model: "{termList}.model",
                    applier: "{termList}.applier",
                    listeners: {
                        ready: "{termList}.events.ready.fire"
                    }
                },
                createOnEvent: "afterFetch"
            },
            termListSource: {
                type: "cspace.termList.termListSource"
            }
        },
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage"
        },
        parentBundle: "{globalBundle}",
        // URL to grab terms
        urls: {
            termList: "%tenant/%tname/%recordType/termList/%termListType"
        },
        events: {
            afterFetch: null,
            ready: null
        },
        styles: {
            termList: "cs-termList"
        },
        postInitFunction: "cspace.termList.postInit",
        finalInitFunction: "cspace.termList.finalInit"
    });

    cspace.termList.finalInit = function (that) {
        var directModel = {
            recordType: that.options.recordType,
            termListType: that.options.termListType
        }, termListUrl = that.termListSource.resolveUrl(directModel);
        // Get the list of elements for the termList
        that.termListSource.get(directModel, function (data) {
            // BAMPFA-271: It's possible the termList will have been removed from
            // the page by the time this callback happens. This happens when a 
            // termList appears on advanced search, and the Return to search link
            // is used to return to a search. In that case, the form is initially
            // loaded with a termList, which is immediately removed to be replaced
            // with a form corresponding to the saved search. So we need
            // to test if this termList is still "alive" before doing anything.
            // To do this, use jquery to test if the field is still in the DOM.

            if (jQuery.contains(document, that.container[0])) {
                // If there is no data
                if (!data) {
                    that.displayErrorMessage(fluid.stringTemplate(that.options.parentBundle.resolve("emptyResponse"), {
                        url: termListUrl
                    }));
                    return;
                }
                // If there is an error during fetching
                if (data.isError === true) {
                    fluid.each(data.messages, function (message) {
                        that.displayErrorMessage(message);
                    });
                    return;
                }
                that.optionnames = data.optionnames;
                that.optionlist = data.optionlist;
                that.activestatus = data.activestatus;
                that.events.afterFetch.fire();
            }
        }, cspace.util.provideErrorCallback(that, termListUrl, "errorFetching"));
    };

    cspace.termList.postInit = function (that) {
        // Apply all the appropriate classes for the elements
        that.container.wrap($("<div />").addClass(that.options.styles.termList));
        that.termListImplContainer = that.container.parent();
        that.termListSelector = "." + that.container.attr("class").split(" ").join(".");
    };

    // Main core options of the termList component
    fluid.defaults("cspace.termList.impl", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            termList: ".csc-termList"
        },
        mergePolicy: {
            "rendererOptions.applier": "applier"
        },
        events: {
            ready: null
        },
        renderOnInit: true,
        root: "",
        produceTree: "cspace.termList.impl.produceTree",
        finalInitFunction: "cspace.termList.impl.finalInit"
    });
    
    cspace.termList.impl.finalInit = function (that) {
        // Disabe the rows if they are not active
        if (that.options.activestatus) {
            fluid.each($("option", that.locate("termList")), function (option, index) {
                var stat = that.options.activestatus[index];
                // http://issues.collectionspace.org/browse/CSPACE-4782: If status is "",
                // UI will not disable the option in dropdown (as per JIRA).
                $(option).prop("disabled", stat && stat !== "active")
            });
        }
        that.events.ready.fire(that);
    };

    // HTML markup generation based on the retreived data
    cspace.termList.impl.produceTree = function (that) {
        return {
            termList: {
                optionlist: that.options.optionlist,
                optionnames: that.options.optionnames,
                selection: "${" + cspace.util.composeSegments(that.options.root, that.options.elPath) + "}"
            }
        };
    };

    fluid.defaults("cspace.termList.testTermListSource", {
        url: "%test/data/termlist/auth.json"
    });
    cspace.termList.testTermListSource = cspace.URLDataSource;

})(fluid);