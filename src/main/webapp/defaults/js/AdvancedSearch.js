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

    // Component that is responsible for advanced search functionality,
    fluid.defaults("cspace.advancedSearch", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        produceTree: "cspace.advancedSearch.produceTree",
        components: {
            // Subcomponent that lets users select an appopriate record
            // based on their permissions.
            recordTypeSelector: {
                type: "cspace.util.recordTypeSelector",
                options: {
                    related: ["cataloging", "procedures", "vocabularies"],
                    dom: "{advancedSearch}.dom",
                    componentID: "recordTypeSelect",
                    selector: "recordTypeSelect",
                    permission: "{advancedSearch}.options.permission"
                }
            },
            // Subcomponent that lets users select different vocabs for
            // authority records.
            vocabSelector: {
                type: "cspace.advancedSearch.vocabSelector",
                container: "{cspace.advancedSearch}.dom.vocab",
                createOnEvent: "afterRender",
                options: {
                    events: {
                        recordTypeChanged: "{cspace.advancedSearch}.events.recordTypeChanged"
                    },
                    model: "{cspace.advancedSearch}.model",
                    applier: "{cspace.advancedSearch}.applier"
                }
            },
            // Component that does all configuration fetching for advanced
            // search renderable components.
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
            // Local storage that is used to maintain recent search results.
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
            afterSearch: null,
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
        selectorsToIgnore: ["vocab"],
        selectors: {
            vocab: ".csc-advancedSearch-vocabSelectorContainer",
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
            // Advanced search template resource location.
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
            updateSearchHistory: "cspace.advancedSearch.updateSearchHistory"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        finalInitFunction: "cspace.advancedSearch.finalInit",
        postInitFunction: "cspace.advancedSearch.postInit",
        preInitFunction: "cspace.advancedSearch.preInit"
    });
    
    cspace.advancedSearch.toggle = function (toggleControls, event) {
        toggleControls(false);
        event.fire();
    };

    // Transform search model into the one consistent with the app layer.
    var transformSearchModel = function (keywordModel, rules) {
        return fluid.model.transformWithRules(fluid.copy(keywordModel), rules);
    };

    // Build search model and fire search event.
    cspace.advancedSearch.search = function (searchEvent, keywordModel, fieldsModel) {
        var searchModel = {};
        var rules = {
            "recordType": "recordType",
            "keywords": "keywords",
            "vocab": "vocab"
        };
        if (fieldsModel) {
            rules.operation = "operation";
            searchModel.fields = fluid.copy(fieldsModel);
        }
        fluid.merge(null, searchModel, transformSearchModel(keywordModel, rules));
        searchEvent.fire(searchModel)
    };

    // Initialize (clear if already exists) a search fields subcomponent based on
    // configuration from : app layer, previously saved searches.
    cspace.advancedSearch.initSearchFields = function (that, instantiator, options) {
        if (that.searchFields) {
            instantiator.clearComponent(that, ["searchFields"]);
        }
        that.options.searchFields = that.options.searchFields || {};
        var defaultModel = fluid.copy(that.options.defaultFieldsModel);
        delete that.options.defaultFieldsModel;
        var model = defaultModel || cspace.util.getBeanValue({}, options.recordType, options.uischema);
        var applier = fluid.makeChangeApplier(model, {thin: true});
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
            // Initialize default search fields once all configuration
            // is fetched.
            afterFetch: function (options) {
                that.initSearchFields(options);
            },
            // Listener that is fired when the record type is changed.
            recordTypeChanged: function () {
                that.locate("searchFields").hide();
            },
            // Show search fields once they are rendered.
            afterSearchFieldsInit: function () {
                that.locate("searchFields").show();
            },
            // Hide search attributes to display search results.
            onSearch: function (searchModel) {
                that.toggleControls(true);
            },
            // Save search to local storage.
            afterSearch: function (searchModel) {
                that.updateSearchHistory(searchModel);
            }
        });
    };
    
    cspace.advancedSearch.postInit = function (that) {
        // Fire record type changed event once the dropdown is updated.
        that.applier.modelChanged.addListener("recordType", function () {
            that.events.recordTypeChanged.fire(that.model.recordType);
        });
    };
    
    cspace.advancedSearch.finalInit = function (that) {
        // Toggle various advanced search steps.
        that.toggleControls = function (hideSteps, hideToggle) {
            if (typeof(hideToggle) === "undefined") {
                hideToggle = !hideSteps;
            }
            
            that.locate("step1").add(that.locate("step2"))[hideSteps ? "hide" : "show"]();
            that.locate("toggle")[hideToggle ? "hide" : "show"]();
        };
        // Render advanced search.
        that.refreshView();
    };

    // Advanced search default protoTree.
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
        tree.recordTypeSelect.decorators = tree.recordTypeSelect.decorators ?
            tree.recordTypeSelect.decorators.concat([{"addClass": "{styles}.recordTypeSelect"}]) : [{"addClass": "{styles}.recordTypeSelect"}];
        return tree;
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.advancedSearch");
    
    cspace.advancedSearch.buildAndOrNames = function (messageBase) {
        return fluid.transform(["or", "and"], function (value) {
            return messageBase["advancedSearch-" + value];
        });
    };

    // Component responsible for render vocab selection tool in advanced search.
    fluid.defaults("cspace.advancedSearch.vocabSelector", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            selectVocab: ".csc-advancedSearch-selectVocab",
            selectVocabLabel: ".csc-advancedSearch-selectVocabLabel"
        },
        mergePolicy: {
            vocab: "nomerge"
        },
        vocab: "{vocab}",
        events: {
            recordTypeChanged: null
        },
        renderOnInit: true,
        parentBundle: "{globalBundle}",
        strings: {},
        listeners: {
            recordTypeChanged: "{cspace.advancedSearch.vocabSelector}.recordTypeChangedHandler",
            prepareModelForRender: "{cspace.advancedSearch.vocabSelector}.prepareModelForRenderHandler",
            afterRender: "{cspace.advancedSearch.vocabSelector}.afterRenderHandler"
        },
        styles: {
            selectVocab: "cs-advancedSearch-selectVocab",
            selectVocabLabel: "cs-advancedSearch-selectVocabLabel"
        },
        preInitFunction: "cspace.advancedSearch.vocabSelector.preInit",
        protoTree: {
            expander: {
                type: "fluid.renderer.condition",
                condition: "${vocabs}",
                trueTree: {
                    selectVocab: {
                        decorators: [{type: "jQuery", func: "hide"}, {"addClass": "{styles}.selectVocab"}],
                        selection: "${vocab}",
                        optionlist: "${vocabs}",
                        optionnames: "${vocabNames}"
                    },
                    selectVocabLabel: {
                        messagekey: "selectVocabLabel",
                        decorators: [{type: "jQuery", func: "hide"}, {"addClass": "{styles}.selectVocabLabel"}]
                    }
                }
            }
        },
        animationOpts: {
            time: 300,
            easing: "linear"
        }
    });

    cspace.advancedSearch.vocabSelector.preInit = function (that) {
        // Update vocab selector when record type is changed.
        that.recordTypeChangedHandler = function () {
            that.refreshView();
        };

        // Fixup vocab selector's model.
        that.prepareModelForRenderHandler = function () {
            var vocab = that.options.vocab,
                applier = that.applier,
                model = that.model,
                vocabsExist;
            if (!model.recordType || !vocab.hasVocabs(model.recordType)) {
                that.applier.requestChange("vocabs", undefined);
                return;
            }
            vocabsExist = vocab.authority[model.recordType].vocabs;
            if (!vocabsExist) {
                that.applier.requestChange("vocabs", undefined);
                return;
            }
            var vocabs = vocab.authority[model.recordType].order.vocabs,
                vocabNames = [];
            fluid.each(vocabs, function (vocab) {
                vocabNames.push(that.options.parentBundle.resolve("vocab-" + vocab));
            });
            if (vocabs.length > 1) {
                vocabs = ["all"].concat(vocabs);
                vocabNames = [that.options.parentBundle.resolve("vocab-all")].concat(vocabNames);
            }
            applier.requestChange("vocabs", vocabs);
            applier.requestChange("vocabNames", vocabNames);
            if (!that.model.vocab) {
                applier.requestChange("vocab", vocabs[0]);
            }
        };
        // Animate vocab selector.
        that.afterRenderHandler = function () {
            if (that.model.vocabs) {
                that.locate("selectVocab")
                    .add(that.locate("selectVocabLabel"))
                    .show(that.options.animationOpts.time, that.options.animationOpts.easing);
            }
        };
    };

    // A component that renders search fields.
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
            uispec: "noexpand",
            schema: "nomerge"
        },
        renderOnInit: true,
        rendererFnOptions: {
            cutpointGenerator: "cspace.advancedSearch.searchFields.cutPointGenerator"
        },
        rendererOptions: {
            instantiator: "{instantiator}",
            parentComponent: "{searchFields}",
            autoBind: true
        },
        strings: {},
        preInitFunction: "cspace.advancedSearch.searchFields.preInit",
        parentBundle: "{globalBundle}",
        latestDate: "updatedAtEnd"
    });

    cspace.advancedSearch.searchFields.preInit = function (that) {
        // CSPACE-5476: Fixing the issue with the server not being able to handle inslusivity with dates
        // on advanced search. Doing it on the client for the latest date.
        that.applier.guards.addListener(that.options.latestDate, function (model, changeRequest) {
            changeRequest.value =
                Date.parse(changeRequest.value).addDays(1).toString("yyyy-MM-dd");
        });
    };

    cspace.advancedSearch.searchFields.produceTree = function (that) {
        return that.options.uispec;
    };
    
    cspace.advancedSearch.searchFields.cutPointGenerator = function (selectors, options) {
        return cspace.renderUtils.cutpointsFromUISpec(options.uispec);
    };

    // A component that is responsible for fetching all configuration:
    // uispec, uischema, template.
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
        // Fetch all configuration, fire afterFetch event when done.
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