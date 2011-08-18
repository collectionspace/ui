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
    
    fluid.defaults("cspace.searchTools", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        mergePolicy: {
            "rendererOptions.instantiator": "nomerge",
            "rendererOptions.parentComponent": "nomerge"
        },
        rendererOptions: {
            instantiator: "{instantiator}",
            parentComponent: "{searchTools}"
        },
        protoTree: {
            searchTools: {decorators: {"addClass": "{styles}.searchTools"}},
            title: {
                decorators: {"addClass": "{styles}.title"}, 
                messagekey: "searchTools-title"
            },
            expander: {
                repeatID: "blocks",
                type: "fluid.renderer.repeat",
                pathAs: "block",
                valueAs: "blockValue",
                controlledBy: "blocks",
                tree: {
                    block: {
                        decorators: {
                            type: "fluid",
                            func: "cspace.searchTools.block",
                            options: {
                                model: {
                                    elPath: "{blockValue}"
                                }
                            }
                        }
                    }
                }
            }
        },
        selectors: {
            searchTools: ".csc-searchTools-template",
            title: ".csc-searchTools-title",
            blocks: ".csc-searchTools-blocks",
            block: ".csc-searchTools-block"
        },
        repeatingSelectors: ["blocks"],
        styles: {
            searchTools: "cs-searchTools-template",
            title: "cs-searchTools-title",
            block: "cs-searchTools-block"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SearchToolsTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        model: {
            blocks: ["searchHistory", "savedSearches"]
        },
        events: {
            renderOn: null,
            currentSearchUpdated: null
        },
        preInitFunction: "cspace.searchTools.preInit",
        strings: {},
        parentBundle: "{globalBundle}",
        renderOnInit: true
    });
    
    cspace.searchTools.preInit = function (that) {
        cspace.util.preInitMergeListeners(that.options, {
            renderOn: function () {
                that.refreshView();
            }
        });
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.searchTools");
    
    fluid.defaults("cspace.searchTools.block", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        preInitFunction: "cspace.searchTools.block.preInit",
        finalInitFunction: "cspace.searchTools.block.finalInit",
        produceTree: "cspace.searchTools.block.produceTree",
        model: {
            strings: {
                title: "searchToolsBlock-%block-title",
                noItems: "searchToolsBlock-%block-noItems"
            }
        },
        selectors: {
            searchToolsBlock: ".csc-searchToolsBlock",
            title: ".csc-searchToolsBlock-title",
            item: ".csc-searchToolsBlock-item",
            noItems: ".csc-searchToolsBlock-noItems"
        },
        repeatingSelectors: ["item"],
        styles: {
            searchToolsBlock: "cs-searchToolsBlock",
            title: "cs-searchToolsBlock-title",
            item: "cs-searchToolsBlock-item",
            noItems: "cs-searchToolsBlock-noItems"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/SearchToolsBlockTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        components: {
            localStorage: {
                type: "cspace.util.localStorageDataSource",
                options: {
                    elPath: "{block}.model.elPath"
                }
            },
        },
        invokers: {
            updateCurrentSearch: {
                funcName: "cspace.searchTools.block.updateCurrentSearch",
                args: ["{arguments}.0", "{block}.dom", "{block}.localStorage", "{block}.events.currentSearchUpdated"]
            }
        },
        strings: {},
        parentBundle: "{globalBundle}",
        events: {
            currentSearchUpdated: null
        }
    });
    
    cspace.searchTools.block.updateCurrentSearch = function (event, dom, storage, currentSearchUpdated) {
        var searches = storage.get();
        if (!searches) {
            return;
        }
        currentSearchUpdated.fire(searches[dom.locate("item").index($(event.target))]);
    };
    
    cspace.searchTools.block.produceTree = function (that) {
        return {
            searchToolsBlock: {decorators: {"addClass": "{styles}.searchToolsBlock"}},
            title: {
                decorators: {"addClass": "{styles}.title"}, 
                messagekey: "${strings.title}"
            },
            expander: [{
                repeatID: "item",
                type: "fluid.renderer.repeat",
                pathAs: "item",
                controlledBy: "items",
                tree: {
                    decorators: [{"addClass": "{styles}.item"}, {
                        type: "jQuery",
                        func: "click",
                        args: that.updateCurrentSearch
                    }],
                    target: "#",
                    linktext: "${{item}.str}"
                }
            }, {
                type: "fluid.renderer.condition",
                condition: {
                    funcName: "cspace.searchTools.block.assertItems",
                    args: {
                        items: "${items}"
                    }
                },
                trueTree: {
                    noItems: {
                        decorators: {"addClass": "{styles}.noItems"}, 
                        messagekey: "${strings.noItems}"
                    }
                }
            }]
        };
    };
    
    cspace.searchTools.block.assertItems = function (options) {
        return options.items.length < 1;
    };
    
    cspace.searchTools.block.preInit = function (that) {
        cspace.util.preInitMergeListeners(that.options, {
            prepareModelForRender: function (model, applier, that) {
                fluid.each(model.strings, function (string, key) {
                    applier.requestChange(fluid.model.composeSegments("strings", key), fluid.stringTemplate(string, {block: model.elPath}));
                });
                var items = fluid.makeArray(that.localStorage.get());
                fluid.each(items, function (item, index) {
                    items[index] = {
                        str: JSON.stringify(item),
                        value: item
                    };
                });
                applier.requestChange("items", items);
            }
        });
    };
    
    cspace.searchTools.block.finalInit = function (that) {
        that.refreshView();
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.searchTools.block");
    
})(jQuery, fluid);