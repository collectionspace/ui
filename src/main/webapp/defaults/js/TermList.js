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
            termListImpl: {
                type: "cspace.termList.impl",
                container: "{termList}.termListImplContainer",
                options: {
                    selectors: {
                        termList: "{termList}.termListSelector"
                    },
                    optionnames: "{termList}.optionnames",
                    optionlist: "{termList}.optionlist",
                    elPath: "{termList}.options.elPath",
                    root: "{termList}.options.root",
                    model: "{termList}.model",
                    applier: "{termList}.applier",
                    readOnly: "{termList}.options.readOnly", 
                    events: {
                        afterRender: "{termList}.events.afterRender"
                    }
                },
                createOnEvent: "afterFetch"
            },
            termListSource: {
                type: "cspace.termList.termListSource"
            }
        },
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        },
        urls: {
            termList: "%tenant/%tenantname/%recordType/termList/%termListType"
        },
        events: {
            afterFetch: null,
            afterRender: null
        },
        readOnly: false,
        postInitFunction: "cspace.termList.postInit",
        finalInitFunction: "cspace.termList.finalInit"
    });

    cspace.termList.finalInit = function (that) {
        that.termListSource.get({
            recordType: that.options.recordType,
            termListType: that.options.termListType
        }, function (data) {
            if (!data) {
                that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                    url: that.termListSource.options.url
                }));
                return;
            }
            if (data.isError === true) {
                fluid.each(data.messages, function (message) {
                    that.displayErrorMessage(message);
                });
                return;
            }
            that.optionnames = data.optionnames;
            that.optionlist = data.optionlist;
            that.events.afterFetch.fire();
        }, cspace.util.provideErrorCallback(that, that.termListSource.options.url, "errorFetching"));
    };

    cspace.termList.postInit = function (that) {
        that.termListImplContainer = that.container.parent();
        that.termListSelector = "." + that.container.attr("class").split(" ").join(".");
    };

    fluid.defaults("cspace.termList.impl", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            termList: ".csc-termList"
        },
        mergePolicy: {
            "rendererOptions.applier": "applier"
        },
        renderOnInit: true,
        root: "",
        produceTree: "cspace.termList.impl.produceTree"
    });

    cspace.termList.impl.produceTree = function (that) {
        var fullPath = fluid.model.composeSegments.apply(null, that.options.root ? [that.options.root, that.options.elPath] : [that.options.elPath]);
        if (that.options.readOnly) {
            var val = that.options.optionnames[$.inArray(fluid.get(that.model, fullPath), that.options.optionlist)];
            return {
                termList: {
                    decorators: {
                        type: "jQuery",
                        func: "prop",
                        args: {
                            disabled: true
                        }
                    },
                    value: val
                }
            };
        }
        return {
            termList: {
                optionlist: that.options.optionlist,
                optionnames: that.options.optionnames,
                selection: "${" + fullPath + "}"
            }
        };
    };

    fluid.defaults("cspace.termList.testTermListSource", {
        url: "%test/data/termlist/auth.json"
    });
    cspace.termList.testTermListSource = cspace.URLDataSource;

})(fluid);