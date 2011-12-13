/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.advancedSearch", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        produceTree: "cspace.advancedSearch.produceTree",
        components: {
            recordTypeSelector: {
                type: "cspace.util.recordTypeSelector",
                options: {
                    related: "all",
                    dom: "{advancedSearch}.dom",
                    componentID: "recordTypeSelect",
                    selector: "recordTypeSelect",
                    permission: "{advancedSearch}.options.permission"
                }
            },
            fetcher: {
                type: "cspace.advancedSearch.fetcher",
                options: {
                    events: {
                        fetchOn: "{advancedSearch}.events.recordTypeChanged",
                        afterFetch: "{advancedSearch}.events.afterFetch"
                    }
                },
                priority: "first"
            },
            searchHistoryStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "searchHistory"
                }
            }
        },
        events: {
            recordTypeChanged: null,
            afterFetch: null,
            afterSearchFieldsInit: null,
            onSearch: null,
            afterToggle: null
        },
        model: {
            andOrList: ["or", "and"], 
            andOrNames: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.advancedSearch.buildAndOrNames",
                    args: "{globalBundle}.messageBase"
                } 
            },
            operation: "or",
            keywords: ""
        },
        permission: "list",
        selectors: {
            toggle: ".csc-advancedSearch-toggle",
            advancedSearch: ".csc-advancedSearch-template",
            step1: ".csc-advancedSearch-step1",
            step1Header: ".csc-advancedSearch-step1-header",
            step1Label: ".csc-advancedSearch-step1-label",
            step1Name: ".csc-advancedSearch-step1-name",
            recordTypeSelect: ".csc-advancedSearch-selectRecordType",
            step2: ".csc-advancedSearch-step2",
            step2Header: ".csc-advancedSearch-step2-header",
            step2Label: ".csc-advancedSearch-step2-label",
            step2Name: ".csc-advancedSearch-step2-name",
            query: ".csc-advancedSearch-query",
            searchButton: ".csc-advancedSearch-searchButton",
            step2SubHeader1: ".csc-advancedSearch-step2-subheader1",
            step2SubHeader1Label : ".csc-advancedSearch-step2-subheader1-label",
            step2SubHeader1Note : ".csc-advancedSearch-step2-subheader1-note",
            step2SubHeader2: ".csc-advancedSearch-step2-subheader2",
            step2SubHeader2Label : ".csc-advancedSearch-step2-subheader2-label",
            step2SubHeader2Note1 : ".csc-advancedSearch-step2-subheader2-note1",
            step2SubHeader2AndOr : ".csc-advancedSearch-step2-subheader2-andOr",
            step2SubHeader2Note2 : ".csc-advancedSearch-step2-subheader2-note2",
            searchFields : ".csc-advancedSearch-searchFields"
        },
        styles: {
            toggle: "cs-advancedSearch-toggle",
            advancedSearch: "cs-advancedSearch-template",
            step1: "cs-advancedSearch-step1",
            step1Header: "cs-advancedSearch-step1-header",
            step1Label: "cs-advancedSearch-step1-label",
            step1Name: "cs-advancedSearch-step1-name",
            recordTypeSelect: "cs-advancedSearch-selectRecordType",
            step2: "cs-advancedSearch-step2",
            step2Header: "cs-advancedSearch-step2-header",
            step2Label: "cs-advancedSearch-step2-label",
            step2Name: "cs-advancedSearch-step2-name",
            query: "cs-advancedSearch-query",
            searchButton: "cs-advancedSearch-searchButton",
            step2SubHeader1: "cs-advancedSearch-step2-subheader1",
            step2SubHeader1Label : "cs-advancedSearch-step2-subheader1-label",
            step2SubHeader1Note : "cs-advancedSearch-step2-subheader1-note",
            step2SubHeader2: "cs-advancedSearch-step2-subheader2",
            step2SubHeader2Label : "cs-advancedSearch-step2-subheader2-label",
            step2SubHeader2Note1 : "cs-advancedSearch-step2-subheader2-note1",
            step2SubHeader2AndOr : "cs-advancedSearch-step2-subheader2-andOr",
            step2SubHeader2Note2 : "cs-advancedSearch-step2-subheader2-note2",
            searchFields : "cs-advancedSearch-searchFields"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/AdvancedSearchTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        invokers: {
            initSearchFields: {
                funcName: "cspace.advancedSearch.initSearchFields",
                args: ["{advancedSearch}", "{instantiator}", "{arguments}.0"]
            },
            search: {
                funcName: "cspace.advancedSearch.search",
                args: ["{advancedSearch}.events.onSearch", "{advancedSearch}.model", "{searchFields}.model"]
            },
            toggle: {
                funcName: "cspace.advancedSearch.toggle",
                args: ["{advancedSearch}.toggleControls", "{advancedSearch}.events.afterToggle"]
            },
            updateSearchHistory: {
                funcName: "cspace.advancedSearch.updateSearchHistory",
                args: ["{advancedSearch}.searchHistoryStorage", "{arguments}.0"]
            }
        },
        strings: {},
        parentBundle: "{globalBundle}",
        finalInitFunction: "cspace.advancedSearch.finalInit",
        postInitFunction: "cspace.advancedSearch.postInit",
        preInitFunction: "cspace.advancedSearch.preInit"
    });
    
    cspace.advancedSearch.updateSearchHistory = function (storage, searchModel) {
        var history = storage.get();
        if (!history) {
            storage.set([searchModel]);
            return;
        }
        history = [searchModel].concat(fluid.makeArray(history));
        storage.set(history.slice(0, 5));
    };
    
    cspace.advancedSearch.toggle = function (toggleControls, event) {
        toggleControls(false);
        event.fire();
    };
    
    var transformSearchModel = function (keywordModel, rules) {
        return fluid.model.transformWithRules(fluid.copy(keywordModel), rules);
    };
    
    cspace.advancedSearch.search = function (searchEvent, keywordModel, fieldsModel) {
        var searchModel = {};
        var rules = {
            "recordType": "recordType",
            "keywords": "keywords"
        };
        if (fieldsModel) {
            rules.operation = "operation";
            searchModel.fields = fluid.copy(fieldsModel);
        }
        fluid.merge(null, searchModel, transformSearchModel(keywordModel, rules));
        searchEvent.fire(searchModel)
    };
    
    cspace.advancedSearch.initSearchFields = function (that, instantiator, options) {
        if (that.searchFields) {
            instantiator.clearComponent(that, ["searchFields"]);
        }
        that.options.searchFields = that.options.searchFields || {};
        var defaultModel = fluid.copy(that.options.defaultFieldsModel);
        delete that.options.defaultFieldsModel;
        var model = defaultModel || cspace.util.getBeanValue({}, options.recordType, options.uischema);
        var applier = fluid.makeChangeApplier(model);
        that.options.searchFields = {
            model: model, 
            applier: applier,
            schema: options.uischema
        };
        that.options.components.searchFields = {
            type: "cspace.advancedSearch.searchFields",
            container: "{advancedSearch}.dom.searchFields",
            options: {
                uispec: options.uispec,
                applier: "{advancedSearch}.options.searchFields.applier",
                model: "{advancedSearch}.options.searchFields.model",
                recordType: options.recordType,
                resources: {
                    template: options.template
                }
            }
        };
        fluid.initDependent(that, "searchFields", instantiator);
        that.events.afterSearchFieldsInit.fire();
    };
    
    cspace.advancedSearch.preInit = function (that) {
        cspace.util.preInitMergeListeners(that.options, {
            afterFetch: function (options) {
                that.initSearchFields(options);
            },
            recordTypeChanged: function () {
                that.locate("searchFields").hide();
            },
            afterSearchFieldsInit: function () {
                that.locate("searchFields").show();
            },
            onSearch: function (searchModel) {
                that.toggleControls(true);
                that.updateSearchHistory(searchModel);
            }
        });
    };
    
    cspace.advancedSearch.postInit = function (that) {
        that.applier.modelChanged.addListener("recordType", function () {
            that.events.recordTypeChanged.fire(that.model.recordType);
        });
    };
    
    cspace.advancedSearch.finalInit = function (that) {
        that.toggleControls = function (hideSteps) {
            that.locate("step1").add(that.locate("step2"))[hideSteps ? "hide" : "show"]();
            that.locate("toggle")[hideSteps ? "show" : "hide"]();
        };
        that.refreshView();
    };
    
    cspace.advancedSearch.produceTree = function (that) {
        var tree = {
            advancedSearch: {decorators: {"addClass": "{styles}.advancedSearch"}},
            step2SubHeader1: {decorators: {"addClass": "{styles}.step2SubHeader1"}},
            step2SubHeader2: {decorators: {"addClass": "{styles}.step2SubHeader2"}},
            step1: {decorators: {"addClass": "{styles}.step1"}},
            step1Header: {decorators: {"addClass": "{styles}.step1Header"}},
            step1Label: {
                decorators: {"addClass": "{styles}.step1Label"}, 
                messagekey: "advancedSearch-step1Label"
            },
            step1Name: {
                decorators: {"addClass": "{styles}.step1Name"}, 
                messagekey: "advancedSearch-step1Name"
            },
            step2: {decorators: {"addClass": "{styles}.step2"}},
            step2Header: {decorators: {"addClass": "{styles}.step2Header"}},
            step2Label: {
                decorators: {"addClass": "{styles}.step2Label"}, 
                messagekey: "advancedSearch-step2Label"
            },
            step2Name: {
                decorators: {"addClass": "{styles}.step2Name"}, 
                messagekey: "advancedSearch-step2Name"
            },
            step2SubHeader1Label: {
                decorators: {"addClass": "{styles}.step2SubHeader1Label"}, 
                messagekey: "advancedSearch-step2SubHeader1Label"
            },
            step2SubHeader1Note: {
                decorators: {"addClass": "{styles}.step2SubHeader1Note"}, 
                messagekey: "advancedSearch-step2SubHeader1Note"
            },            
            step2SubHeader2Label: {
                decorators: {"addClass": "{styles}.step2SubHeader2Label"}, 
                messagekey: "advancedSearch-step2SubHeader2Label"
            },
            step2SubHeader2Note1: {
                decorators: {"addClass": "{styles}.step2SubHeader2Note1"}, 
                messagekey: "advancedSearch-step2SubHeader2Note1"
            },            
            step2SubHeader2Note2: {
                decorators: {"addClass": "{styles}.step2SubHeader2Note2"}, 
                messagekey: "advancedSearch-step2SubHeader2Note2"
            },    
            step2SubHeader2AndOr: {
                optionnames: "${andOrNames}",
                optionlist: "${andOrList}",
                selection: "${operation}",
                decorators: {"addClass": "{styles}.step2SubHeader2AndOr"}
            },
            query: {
                value: "${keywords}",
                decorators: {"addClass": "{styles}.query"}
            },
            searchButton: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        value: that.options.parentBundle.messageBase["advancedSearch-searchButton"]                        
                    }
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.search
                }, {
                    addClass: "{styles}.searchButton"
                }]
            },
            toggle: {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        value: that.options.parentBundle.messageBase["advancedSearch-toggle"]                        
                    }
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.toggle
                }, {
                    addClass: "{styles}.toggle"
                }]
            },
            searchFields: {decorators: {addClass: "{styles}.searchFields"}}
        };
        tree = $.extend(tree, that.recordTypeSelector.produceComponent());
        // TODO: This is a hack, recordTypeSelector's selection can't be bound.
        if (!that.model.recordType) {
            that.applier.requestChange("recordType", tree.recordTypeSelect.selection);
        }
        tree.recordTypeSelect.selection = "${recordType}";
        tree.recordTypeSelect.decorators = {"addClass": "{styles}.recordTypeSelect"};
        return tree;
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.advancedSearch");
    
    cspace.advancedSearch.buildAndOrNames = function (messageBase) {
        return fluid.transform(["or", "and"], function (value) {
            return messageBase["advancedSearch-" + value];
        });
    };
    
    fluid.defaults("cspace.advancedSearch.searchFields", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        produceTree: "cspace.advancedSearch.searchFields.produceTree",
        mergePolicy: {
            model: "preserve",
            applier: "nomerge",
            "rendererOptions.instantiator": "nomerge",
            "rendererOptions.parentComponent": "nomerge",
            "rendererFnOptions.uispec": "uispec",
            "rendererOptions.applier": "applier",
            uispec: "nomerge noexpand",
            schema: "normerge"
        },
        renderOnInit: true,
        rendererFnOptions: {
            cutpointGenerator: "cspace.advancedSearch.searchFields.cutPointGenerator"
        },
        rendererOptions: {
            instantiator: "{instantiator}",
            parentComponent: "{searchFields}"
        },
        strings: {},
        parentBundle: "{globalBundle}"
    });

    cspace.advancedSearch.searchFields.produceTree = function (that) {
        return that.options.uispec;
    };
    
    cspace.advancedSearch.searchFields.cutPointGenerator = function (selectors, options) {
        return cspace.renderUtils.cutpointsFromUISpec(options.uispec);
    };
    
    fluid.defaults("cspace.advancedSearch.fetcher", {
        gradeNames: ["autoInit", "fluid.eventedComponent"],
        preInitFunction: "cspace.advancedSearch.fetcher.preInit",
        resourceSpec: {
            template: {
                href: cspace.componentUrlBuilder("%webapp/html/components/SearchFieldsTemplate-%recordType.html"),
                options: {
                    dataType: "html",
                    forceCache: true
                }
            },
            uispec: {
                href: cspace.componentUrlBuilder("%tenant/%tname/%recordType-search/uispec"),
                options: {
                    dataType: "json",
                    forceCache: true
                }
            },
            uischema: {
                href: cspace.componentUrlBuilder("%tenant/%tname/%recordType-search/uischema"),
                options: {
                    dataType: "json",
                    forceCache: true
                }
            }
        },
        events: {
            afterFetch: null
        },
        invokers: {
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: "cspace.util.lookupMessage"
        }
    });
    
    cspace.advancedSearch.fetcher.preInit = function (that) {
        that.fetch = function (recordType) {
            var resourceSpec = fluid.copy(that.options.resourceSpec);
            fluid.each(resourceSpec, function (spec) {
                spec.href = fluid.stringTemplate(spec.href, {recordType: recordType});
                spec.options.error = cspace.util.provideErrorCallback(that, spec.href, "errorFetching");
                spec.options.success = function (data) {
                    if (!data) {
                        that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                            url: spec.href
                        }));
                        return;
                    }
                    if (data.isError === true) {
                        fluid.each(data.messages, function (message) {
                            that.displayErrorMessage(message);
                        });
                        return;
                    }
                };
            });
            fluid.fetchResources(resourceSpec, function () {
                that.events.afterFetch.fire({
                    template: resourceSpec.template,
                    uispec: resourceSpec.uispec.resourceText,
                    uischema: resourceSpec.uischema.resourceText,
                    recordType: recordType
                });
            });
        };
        
        that.options.listeners = {
            fetchOn: that.fetch
        };
    };
    
})(jQuery, fluid);