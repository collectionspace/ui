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

    var createTemplateRenderFunc = function (that, resources, tree, opts) {
        return function () {
            var templateNames = [];
            var i = 0;
            for (var key in resources) {
// the comparison to "callbackCalled" is a workaround for FLUID-3486
// if I better understand the issue at some point, I might find a better solution
                if (resources.hasOwnProperty(key) && key !== "callbackCalled") {
                    var template = fluid.parseTemplates(resources, [key], {});
//                    fluid.reRender(template, fluid.byId(resources[key].nodeId), tree, opts);
                    fluid.reRender(template, that.container, tree, opts);
                }
            }
            that.events.pageRendered.fire();
        };
    };
    
    var buildFullUISpec = function (that) {
        var fullUISpec = fluid.copy(that.uispec);
        
        // This makes the assumption that 'save' exists. This should be configurable.
        fullUISpec.save = {
            "selector": that.options.selectors.save,
            "validators": [],
            "decorators": [
                {type: "jQuery",
                    func: "click", 
                    args: that.save
                }
            ]
        };
        fullUISpec.saveSecondary = {
            "selector": that.options.selectors.saveSecondary,
            "validators": [],
            "decorators": [
                {type: "jQuery",
                    func: "click", 
                    args: that.save
                }
            ]
        };
        return fullUISpec;
    };
    
    var addCutpointsToList = function (list, specPart) {
        var index = list.length;
        for (var key in specPart) {
            if (specPart.hasOwnProperty(key)) {
                list[index] = {
                    id: key,
                    selector: specPart[key].selector
                };
                if (specPart[key].hasOwnProperty("repeated")) {
                    list[index].id = key + ":";
                    addCutpointsToList(list, specPart[key].repeated);
                }
                index = list.length;
            }
        }
    };

    var buildCutpointsFromSpec = function (spec) {
        var cutpoints = [];
        addCutpointsToList(cutpoints, spec);
        return cutpoints;
    };

    var buildLinkComponent = function (key, modelPart, spec, i) {
        var targetString;
        if (spec.replacements) {
            var reps = [];
            for (var prop in spec.replacements) {
                if (spec.replacements.hasOwnProperty(prop)) {
                    reps[prop] = fluid.model.getBeanValue(modelPart[i], spec.replacements[prop]);
                }
            }
// CSPACE-701
// in some cases, "objects" is used instead of "object"
// this will be fixed in 0.5, but until then, we have to fudge it
            if (reps.recordtype && reps.recordtype === "objects") {
                reps.recordtype = "object";
            }
// end of fudge for CSPACE-701
            targetString = fluid.stringTemplate(spec.href, reps);
        }
        return {
            ID: key,
            target: targetString,
            linktext: modelPart[i][key]
        };
    };

    var buildSelectComponent = function (key, el, model, spec, strings) {
        var optList = fluid.copy(spec.options);
        var optNames = fluid.copy(spec["options-text"]);
        var val = fluid.model.getBeanValue(model, el);
        if (spec.hasOwnProperty("default")) {
            var defaultIndex = parseInt(spec["default"]);
            optNames[defaultIndex] += strings.defaultTermIndicator;
            if (!val || val === "") {
                fluid.model.setBeanValue(model, el, optList[defaultIndex]);
            }
        } else {
            optList.splice(0, 0, "none");
            optNames.splice(0, 0, strings.noDefaultInvitation);
            if (!val || val === "") {
                fluid.model.setBeanValue(model, el, optList[0]);
            }
        }

        return {
            ID: key,
            selection: {valuebinding: el},
            optionlist: optList,
            optionnames: optNames
        };
    };

    var addRepeatedItemsToComponentTree = function (children, name, specPart, model, el, strings) {
        var index = children.length;
        var modelPart = fluid.model.getBeanValue(model, el);
        for (var i = 0; i < modelPart.length; i++) {
            children[index] = {
                ID: name + ":",
                children: []
            };
            var j = 0;
            for (var key in specPart) {
                if (specPart.hasOwnProperty(key)) {
                    var spec = specPart[key];
                    var newEl = (el ? el + "." + i + "." + key : key);
                    if (spec.hasOwnProperty("type") && spec.type === "link") {
                        children[index].children[j] = buildLinkComponent(key, modelPart, spec, i);
                    } else if (spec.hasOwnProperty("options")) {
                        children[index].children[j] = buildSelectComponent(key, newEl, model, spec, strings);
                    } else {
                        children[index].children[j] = {
                            ID: key,
                            valuebinding: newEl
                        };
                    }
					if (spec.decorators && spec.decorators.length > 0) {
                        children[index].children[j].decorators = spec.decorators;
                        children[index].children[j].decorators = fluid.transform(children[index].children[j].decorators, function (value, ind) {
                            if (value.func === "cspace.numberPatternChooser") {
                                value.options = value.options || {};
                                value.options.baseUrl = that.options.dataContext.baseUrl();
                                value.options.applier = that.applier;
                            }
                            return value;
                        });
                    }
                    j++;
                }
            }
            index++;
        }
    };
    
    var buildComponentTreeChildren = function (specPart, that, el) {
        var children = [];
        var index = 0;
        for (var key in specPart) {
            if (specPart.hasOwnProperty(key)) {
                var elPath = (el ? fluid.model.composePath(el, key) : key);
                if (specPart[key].hasOwnProperty("repeated")) {
                    // repeated items need to be filled in based on the data, not the schema
                    // the schema defines the fields for each row, but the data must be 
                    // examined to fill in each row
                    addRepeatedItemsToComponentTree(children, key, specPart[key].repeated, that.model/*[key]*/, elPath, that.options.strings);
                } else {
                    if (specPart[key].hasOwnProperty("options")) {
                        children = children.concat(buildSelectComponent(key, key, that.model, specPart[key], that.options.strings));
                    } else {
                        children[index] = {
                            ID: key,
                            valuebinding: elPath
                        };
                    }
                    if (specPart[key].decorators && specPart[key].decorators.length > 0) {
                        children[index].decorators = specPart[key].decorators;
                        children[index].decorators = fluid.transform(children[index].decorators, function (value, ind) {
                            if (value.func === "cspace.numberPatternChooser") {
                                value.options = value.options || {};
                                value.options.baseUrl = that.options.dataContext.baseUrl();
                                value.options.applier = that.applier;
                            }
                            return value;
                        });
                    }
                }
                index = children.length;
            }
        }            
        return children;
    };

    var buildRelatedRecordsTree = function (that){
        
    };
    var buildRelatedRecordsCutpoints = function (that) {
        
    };

    cspace.renderer = {
        buildComponentTree: function (spec, that) {
            var tree = {children: buildComponentTreeChildren(spec, that)};
            return tree;
        },

        renderPage: function (that) {
            var fullUISpec = buildFullUISpec(that);
            var renderOptions = {
                model: that.model,
//                debugMode: true,
                autoBind: true,
                applier: that.options.applier
            };
            var cutpoints = buildCutpointsFromSpec(fullUISpec);            
            var tree = cspace.renderer.buildComponentTree(fullUISpec, that);
            var resources = {};
            for (var key in that.options.templates) {
                if (that.options.templates.hasOwnProperty(key)) {
                    var templ = that.options.templates[key];
                    resources[key] = {
                        href: templ.url,
                        cutpoints: cutpoints
                    };
                }
            }
            renderOptions.cutpoints = cutpoints;
            fluid.selfRender(that.container, tree, renderOptions);
            that.events.pageRendered.fire();

        },
        
        renderRelatedRecords: function (that) {
            var tree = buildRelatedRecordsTree(that);
            var cutpoints = buildRelatedRecordsCutpoints(that);
            fluid.selfRender(that.locate("relatedRecords"), tree, {cutpoints: cutpoints});
        },

        createCutpoints: function (spec) {
            var cutpoints = [];
            addCutpointsToList(cutpoints, spec);
            return cutpoints;
        }
    };

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
        }

    };

})(jQuery, fluid_1_2);
