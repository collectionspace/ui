/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.searchBox");
    
    fluid.defaults("cspace.searchBox", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: [{
            namespace: "preInit",
            listener: "cspace.searchBox.preInit"
        }],
        finalInitFunction: "cspace.searchBox.finalInit",
        mergePolicy: {
            model: "preserve"
        },
        selectors: {                // Set of selectors that the component is interested in rendering.
            recordTypeSelect: ".csc-searchBox-selectRecordType",
            recordTypeSelectLabel: ".csc-searchBox-selectRecordTypeLabel",
            searchQuery: ".csc-searchBox-query",
            searchButton: ".csc-searchBox-button",
            advancedSearch: ".csc-searchBox-advancedSearch",
            selectVocab: ".csc-searchBox-selectVocab",
            selectVocabLabel: ".csc-searchBox-selectVocabLabel"
        },
        styles: {                   // Set of styles that the component will be adding onto selectors.
            searchBox: "cs-searchBox",
            recordTypeSelect: "cs-searchBox-selectRecordType",
            recordTypeSelectLabel: "cs-searchBox-selectRecordTypeLabel",
            searchQuery: "cs-searchBox-query",
            searchButton: "cs-searchBox-button",
            advancedSearch: "cs-searchBox-advancedSearch",
            selectVocab: "cs-searchBox-selectVocab",
            selectVocabLabel: "cs-searchBox-selectVocabLabel"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        model: {
            messagekeys: {}
        },                  // A default data model object.
        produceTree: "cspace.searchBox.produceTree", // direct method expected by interim impl of initRendererComponent
        rendererOptions: {
            autoBind: true
        },
        components: {
            globalNavigator: "{globalNavigator}",
            vocab: "{vocab}",
            recordTypeSelector: {
                type: "cspace.util.recordTypeSelector",
                options: {
                    related: "{searchBox}.options.related",
                    dom: "{searchBox}.dom",
                    componentID: "recordTypeSelect",
                    selector: "recordTypeSelect",
                    permission: "{searchBox}.options.permission"
                }
            }
        },
        invokers: {
            navigateToSearch: "cspace.searchBox.navigateToSearch"
        },
        selfRender: false,          // An options that indicates whether the component needs to render on initialization.
        searchUrl: "findedit.html?recordtype=%recordtype&keywords=%keywords",   // Search page's url template.
        resources: {                // A set of resources that will get resolved and fetched at some point during initialization.
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SearchBoxTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        listeners: {
            afterRender: "{cspace.searchBox}.afterRenderHandler",
            prepareModelForRender: "{cspace.searchBox}.prepareModelForRenderHandler"
        },
        urls: cspace.componentUrlBuilder({
            advancedSearchURL: "%webapp/html/advancedsearch.html"
        }),
        enableAdvancedSearch: true,
        animationOpts: {
            time: 300,
            easing: "linear"
        }
    });
    
    cspace.searchBox.finalInit = function (that) {
        that.subTree = that.recordTypeSelector.produceComponent();
        if (that.subTree.recordTypeSelect) {
            if (!that.model.recordType) {
                that.applier.requestChange("recordType", that.subTree.recordTypeSelect.selection);
            }
            that.subTree.recordTypeSelect.selection = "${recordType}";
        }

        that.applier.modelChanged.addListener("recordType", function () {
            that.refreshView();
            if (that.model.vocabs) {
                that.locate("selectVocab")
                    .add(that.locate("selectVocabLabel"))
                    .show(that.options.animationOpts.time, that.options.animationOpts.easing);
            }
        });

        if (that.options.selfRender) {
            that.refreshView();
        }
    };

    var lookupNames = function (applier, messageBase, list, key, prefix) {
        applier.requestChange(key, []);
        fluid.each(list, function (value, index) {
            applier.requestChange(fluid.model.composeSegments(key, index),
                cspace.util.lookupMessage(messageBase, prefix + "-" + value));
        });
    };

    cspace.searchBox.preInit = function (that) {
        that.afterRenderHandler = function () {
            // Bind a click event on search button to trigger searchBox's navigateToSearch
            that.locate("searchButton").click(that.navigateToSearch);
            that.locate("searchQuery").keypress(function (e) {
                if (cspace.util.keyCode(e) === $.ui.keyCode.ENTER) {
                    that.navigateToSearch();
                }
            });
        };
        that.prepareModelForRenderHandler = function () {
            var vocab = that.vocab,
                applier = that.applier,
                model = that.model,
                vocabsExist;
            if (!model.recordType) {
                return;
            }
            if (!vocab.hasVocabs(model.recordType)) {
                that.applier.requestChange("vocabs", undefined);
                return;
            }
            vocabsExist = vocab.authority[model.recordType].vocabs;
            if (!vocabsExist) {
                that.applier.requestChange("vocabs", undefined);
                return;
            }
            var vocabs = [];
            fluid.each(vocabsExist, function (vocab) {
                vocabs.push(vocab);
            });
            applier.requestChange("vocabs", vocabs);
            applier.requestChange("vocabSelection", vocabs[0]);
            lookupNames(applier, that.options.parentBundle.messageBase, model.vocabs, "vocabNames", "vocab");
        };
    };

    cspace.searchBox.preInitSearch = function (that) {
        cspace.util.preInitMergeListeners(that.options, {
            afterSearch: function (searchModel) {
                that.updateSearchHistory(searchModel);
            }
        });
    };
    
    // A public function that is called as searchBox's navigateToSearch method and redirects to
    // the search results page.    
    cspace.searchBox.navigateToSearch = function (that) {
        that.globalNavigator.events.onPerformNavigation.fire(function () {
            var url = fluid.stringTemplate(that.options.searchUrl, {
                recordtype: that.locate("recordTypeSelect").val(),
                keywords: that.locate("searchQuery").val() || ""
            });
            window.location = url;
        });
    };
    
    // A public function that is called as searchBox's treeBuilder method and builds a component tree.
    cspace.searchBox.produceTree = function (that) {
        var tree = {
            searchButton: {
                messagekey: "searchBox-searchButtonText"
            },
            searchQuery: {},
            expander: [{
                type: "fluid.renderer.condition",
                condition: "${messagekeys.recordTypeSelectLabel}",
                trueTree: {
                    recordTypeSelectLabel: {
                        messagekey: "${messagekeys.recordTypeSelectLabel}"
                    }
                }
            }, {
                type: "fluid.renderer.condition",
                condition: "${vocabs}",
                trueTree: {
                    selectVocab: {
                        decorators: {
                            type: "jQuery",
                            func: "hide"
                        },
                        selection: "${vocabSelection}",
                        optionlist: "${vocabs}",
                        optionnames: "${vocabNames}"
                    },
                    expander: {
                        type: "fluid.renderer.condition",
                        condition: "${messagekeys.selectVocabLabel}",
                        trueTree: {
                            selectVocabLabel: {
                                messagekey: "${messagekeys.selectVocabLabel}",
                                decorators: {
                                    type: "jQuery",
                                    func: "hide"
                                }
                            }
                        }
                    }
                }
            }]
        };
        
        fluid.merge(null, tree, that.subTree);
        
        fluid.each(tree, function (child, key) {
            var decorator = {
                type: "addClass",
                classes: that.options.styles[key]
            };
            child.decorators = child.decorators ? child.decorators.concat([decorator]) : [decorator];
        });

        if (!that.options.enableAdvancedSearch) {
            return tree;
        }
        tree.advancedSearch = {
            decorators: {"addClass": "{styles}.advancedSearch"},
            target: that.options.urls.advancedSearchURL,
            linktext: {
                messagekey: "searchBox-advancedSearchText"
            }
        };
        return tree;
    };
    
    // This function executes on file load and starts the fetch process of component's template.
    fluid.fetchResources.primeCacheFromResources("cspace.searchBox");
    
})(jQuery, fluid);