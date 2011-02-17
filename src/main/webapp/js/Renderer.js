/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/

(function ($, fluid) {
    fluid.log("Renderer.js loaded");

    var replaceIndex = function (comp, oldInd, newInd) {
        var re = new RegExp(oldInd, "g");
        for (var key in comp) {
            if (comp.hasOwnProperty(key)) {
                var val = comp[key];
                if ((typeof(val) === "string") && (val.indexOf("${") !== -1)) {
                    comp[key] = val.replace(re, newInd + "");
                } else if (typeof(val) === "object") {
                    replaceIndex(val, oldInd, newInd);
                }
            }
        }
    };

    var getElPathOfArray = function (binding) {
        return binding.substring(binding.indexOf("${") + 2, binding.indexOf("0") - 1);
    };

    var findValueBinding = function (comp) {
        if (typeof(comp) === "string") {
            return getElPathOfArray(comp);
        } 
        for (var key in comp) {
            if (comp.hasOwnProperty(key)) {
                var val = comp[key];
                if ((typeof(val) === "string") && (val.indexOf("${") !== -1)) {
                    return getElPathOfArray(val);
                }
                if (typeof(val) === "object" && typeof(val.length) !== "number") {
                    return findValueBinding(val);
                }
            }
        }
    };

    var replaceWithValues = function (string, model) {
        var b = string.indexOf("${");
        var e = string.indexOf("}");
        while (b !== -1) {
            var el = string.slice(b + 2, e);
            string = string.replace("${" + el + "}", fluid.model.getBeanValue(model, el));
            b = string.indexOf("${");
            e = string.indexOf("}");
        }
        return string;
    };

    // TODO: Note that this assumes absolutely NO binding to the data model
    var constructLinks = function (protoTree, model) {
        for (var key in protoTree) {
            if (protoTree.hasOwnProperty(key)) {
                if (key === "linktext" || key === "target") {
                    protoTree.target = replaceWithValues(protoTree.target, model);
                    protoTree.linktext = replaceWithValues(protoTree.linktext, model);
                } else {
                    var entry = protoTree[key];
                    if (entry.target) {
                        entry.target = replaceWithValues(entry.target, model);
                        entry.linktext = replaceWithValues(entry.linktext, model);
                    } else if (entry.children) {
                        for (var i = 0; i < entry.children.length; i++) {
                            constructLinks(entry.children[i], model);
                        }
                    } else if (typeof(entry) === "object") {
                        constructLinks(entry, model);
                    }
                }
            }
        }
    };
    
    var extractExpanderSelectors = function (selectors, expander) {
        var keys = {
            "fluid.renderer.selection.inputs": ["rowID", "inputID", "labelID"],
            "fluid.renderer.repeat": ["repeatID"]
        };
        
        var keyArray = keys[expander.type];
        if (!keyArray) {
            return;
        }
        
        for (var index in keyArray) {
            var selector = expander[keyArray[index]];
            var columnIndex = selector.lastIndexOf(":");
            selectors[selector] = columnIndex === selector.length - 1 ? selector.substring(0, columnIndex) : selector;
        }
    };
    
    var correctDoubleValueBinding = function (tree) {
        return fluid.transform(tree, function (value, key) {
            if (fluid.isPrimitive(value)) {
                return value;
            }
            else if (value.valuebinding && value.valuebinding.charAt(0) === "$") {
                // TODO: We decided to forbid this "double reference" phenomenon but it is enshrined in the UISpec
                value.value = value.valuebinding;
                delete value.valuebinding;
                return value;
            }
            else {
                return correctDoubleValueBinding(value);
            }
        });
    };
    
    cspace.renderUtils = {
        
        cutpointsFromUISpec: function (uispec) {
            var selectors = {};
            cspace.renderUtils.buildSelectorsFromUISpec(uispec, selectors);
            return fluid.renderer.selectorsToCutpoints(selectors, {});            
        },
        
        // TODO: need to make expander's API to be consistent with all expanders in the future.
        // TODO: this signature is currently broken because of the requirement to access "that" in any "extendDecoratorOptions"
        // encountered. This should be corrected once we have a replacement involving "component grading" etc.
        expander: function (uispec, that) {
            var expander = fluid.renderer.makeProtoExpander({ELstyle: "${}", model: that.model});
            var protoTree = cspace.renderUtils.buildProtoTree(uispec, that);
            // TODO: Both correctDoubleValueBinding(protoTree) and expander(protoTree) corrupt the model and the applier in 
            // decorator options for repeatable and thus repeatable has a different model and applier.
            protoTree = correctDoubleValueBinding(protoTree);
            var tree = expander(protoTree);
            return tree;
        },

        buildSelectorsFromUISpec: function (uispec, selectors) {
            for (var key in uispec) {
                if (!uispec.hasOwnProperty(key)) {
                    continue;
                }
                if (key === "expander") {
                    var expanders = fluid.makeArray(uispec[key]);
                    fluid.each(expanders, function (expander) {
                        fluid.each(["tree", "trueTree", "falseTree"], function (tree) {
                            if (!expander[tree]) {return;}
                            extractExpanderSelectors(selectors, expander);
                            cspace.renderUtils.buildSelectorsFromUISpec(expander[tree], selectors);
                        });
                    });
                    continue;
                }
                selectors[key] = (key.indexOf(":") === key.length - 1 ? key.substring(0, key.length - 1) : key);                                
                if (uispec[key].children) {
                    for (var i = 0; i < uispec[key].children.length; i++) {
                        cspace.renderUtils.buildSelectorsFromUISpec(uispec[key].children[i], selectors);
                    }
                }
            }
        },

        buildProtoTree: function (uispec, that) {
            var protoTree = {};
            fluid.model.copyModel(protoTree, uispec);

            for (var key in protoTree) {
                var entry = protoTree[key];
                
                // add decorator options from that
                if (entry.decorators) {
                    for (var i = 0; i < entry.decorators.length; i++) {
                        var dec = entry.decorators[i];
                        if (fluid.getGlobalValue(dec.func + ".extendDecoratorOptions")) {
                            dec.options = dec.options || {};
                            fluid.invokeGlobalFunction(dec.func + ".extendDecoratorOptions", [dec.options, that]);
                            if (dec.options.protoTree) { // TODO: consistent model required for this
                                dec.options.protoTree = {
                                    expander: {
                                        type: "fluid.expander.noexpand",
                                        tree: dec.options.protoTree
                                    }
                                };
                            }
                        }
                    }
                }

                // multiply template rows based on model
                if (key.indexOf(":") !== -1) {
                    var row = entry.children[0];
                    var elPath;
                    for (var subkey in row) {
                        elPath = findValueBinding(row[subkey]);
                        if (elPath) {
                            break;
                        }
                    }
                    var data = fluid.model.getBeanValue(that.model, elPath);
                    if (!data) {
                        fluid.model.setBeanValue(that.model, elPath, []);
                    }
                    else {
                        for (var j = 1; j < data.length; j++) {
                            entry.children[j] = {};
                            fluid.model.copyModel(entry.children[j], entry.children[0]);
                            replaceIndex(entry.children[j], 0, j);
                        }
                    }
                }

                // build static links (assumes no data binding for link elements!)
                if ((typeof(entry) === "object") && !entry.decorators) {
                    constructLinks(entry, that.model);
                }
            }

            return protoTree;
        }

    };

})(jQuery, fluid);
