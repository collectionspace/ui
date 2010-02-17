/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

var cspace = cspace || {};

(function ($, fluid) {

    var replaceIndex = function (comp, oldInd, newInd) {
        for (var key in comp) {
            if (comp.hasOwnProperty(key)) {
                var val = comp[key];
                if ((typeof(val) === "string") && (val.indexOf("${") !== -1)) {
                    comp[key] = val.replace(oldInd+"", newInd+"");
                } else if (typeof(val) === "object") {
                    replaceIndex(val, oldInd, newInd);
                }
            }
        }
    };

    var findValueBinding = function (comp) {
        for (var key in comp) {
            if (comp.hasOwnProperty(key)) {
                var val = comp[key];
                if ((typeof(val) === "string") && (val.indexOf("${") !== -1)) {
                    return val.substring(val.indexOf("${")+2, val.indexOf("0")-1);
                }
                if (typeof(val) === "object") {
                    return findValueBinding(val);
                }
            }
        }
    };

    var fixSelections = function (comp) {
        if (comp.selection) {
            for (var j = 0; j < comp.optionlist.length; j++) {
                comp.optionlist[j] = comp.optionlist[j].value;
                comp.optionnames[j] = comp.optionnames[j].value;
            }
        } else if (comp.children) {
            for (var i = 0; i < comp.children.length; i++) {
                fixSelections(comp.children[i]);
            }
        }
    };

    var extractEL = function (string) {
        if (ELstyle === "ALL") {
            return string;
        }
        else if (ELstyle.length === 1) {
            if (string.charAt(0) === ELstyle) {
                return string.substring(1);
            }
        }
        else if (ELstyle === "${}") {
            var i1 = string.indexOf("${");
            var i2 = string.indexOf("}");
            if (i1 === 0 && i2 !== -1) {
                return string.substring(2, i2);
            }
        }
    };

    var replaceWithValues = function (string, model) {
        var b = string.indexOf("${");
        var e = string.indexOf("}");
        while (b !== -1) {
            var el = string.slice(b+2,e);
            string = string.replace("${"+el+"}", fluid.model.getBeanValue(model, el));
            b = string.indexOf("${");
            e = string.indexOf("}");
        }
        return string;
    };

    cspace.renderUtils = {

        // TODO: These protoTree processing functions should be combined so that all processing
        // can be done in one pass
        addDecoratorOptionsToProtoTree: function (protoTree, that) {
            for (var key in protoTree) {
                if (protoTree.hasOwnProperty(key)) {
                    var entry = protoTree[key];
                    if (entry.decorators) {
                        for (var i = 0; i < entry.decorators.length; i++) {
                            var dec = entry.decorators[i];
                            if (fluid.getGlobalValue(dec.func + ".getDecoratorOptions")) {
                                $.extend(true, dec.options, fluid.invokeGlobalFunction(dec.func + ".getDecoratorOptions", [that]));
                            }
                        }
                    }
                }
            }
        },
        
        multiplyRows: function (protoTree, model) {
            for (var key in protoTree) {
                if (protoTree.hasOwnProperty(key)) {
                    if (key.indexOf(":") !== -1) {
                        var row = protoTree[key].children[0];
                        var elPath = findValueBinding(row);
                        var dataCount = fluid.model.getBeanValue(model, elPath).length;
                        if (dataCount === 0) {
                            protoTree[key].children = [];
                        } else {
                            for (var i = 1; i <= dataCount-1; i++) {
                                protoTree[key].children[i] = {};
                                fluid.model.copyModel(protoTree[key].children[i], protoTree[key].children[0]);
                                replaceIndex(protoTree[key].children[i], 0, i);
                            }
                        }
                    }
                }
            }
        },
    
        buildSelectorsFromUISpec: function (uispec, selectors) {
            for (var key in uispec) {
                if (uispec.hasOwnProperty(key)) {
                    selectors[key] = (key.indexOf(":") === key.length-1 ? key.substring(0, key.length-1) : key);
                }
                if (uispec[key].children) {
                    for (var i = 0; i < uispec[key].children.length; i++) {
                        cspace.renderUtils.buildSelectorsFromUISpec(uispec[key].children[i], selectors);
                    }
                }
            }
        },
    
        // the protoExpander doesn't yet handle selections, so the tree it creates needs some adjustment
        fixSelectionsInTree: function (tree) {
            for (var i = 0; i < tree.children.length; i++) {
                fixSelections(tree.children[i]);
            }
        },
        
        // TODO: Note that this assumes absolutely NO binding to the data model
        constructLinks: function (protoTree, model) {
            for (var key in protoTree) {
                if (protoTree.hasOwnProperty(key)) {
                    var entry = protoTree[key];
                    if (entry.target) {
                        entry.target = replaceWithValues(entry.target, model);
                        entry.linktext = replaceWithValues(entry.linktext, model);
                    } else if (entry.children) {
                        for (var i = 0; i < entry.children.length; i++) {
                            cspace.renderUtils.constructLinks(entry.children[i], model);
                        }
                    } else if (typeof(entry) === "object") {
                        cspace.renderUtils.constructLinks(entry, model);
                    }
                }
            }
        },

        buildProtoTree: function (uispec, that) {
            var protoTree = {};
            fluid.model.copyModel(protoTree, uispec);

            for (var key in protoTree) {
                if (protoTree.hasOwnProperty(key)) {
                    var entry = protoTree[key];

                    // add decorator options from that
                    if (entry.decorators) {
                        for (var i = 0; i < entry.decorators.length; i++) {
                            var dec = entry.decorators[i];
                            if (fluid.getGlobalValue(dec.func + ".getDecoratorOptions")) {
                                $.extend(true, dec.options, fluid.invokeGlobalFunction(dec.func + ".getDecoratorOptions", [that]));
                            }
                        }
                    }

                    // multiply template rows based on model
                    if (key.indexOf(":") !== -1) {
                        var row = entry.children[0];
                        var elPath = findValueBinding(row);
                        var dataCount = fluid.model.getBeanValue(that.model, elPath).length;
                        if (dataCount === 0) {
                            entry.children = [];
                        } else {
                            for (var i = 1; i <= dataCount-1; i++) {
                                entry.children[i] = {};
                                fluid.model.copyModel(entry.children[i], entry.children[0]);
                                replaceIndex(entry.children[i], 0, i);
                            }
                        }
                    }

                    // build static links (assumes no data binding for link elements!)
                    if ((typeof(entry) === "object") && !entry.decorators) {
                        cspace.renderUtils.constructLinks(entry, that.model);
                    }
                }
            }

            return protoTree;
        }

    };

})(jQuery, fluid_1_2);
