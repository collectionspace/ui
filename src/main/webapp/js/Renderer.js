/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_1*/

var cspace = cspace || {};

(function ($, fluid) {

    var createTemplateRenderFunc = function (that, resources, model, opts) {
        return function () {
            var templateNames = [];
            var i = 0;
            for (var key in resources) {
                if (resources.hasOwnProperty(key)) {
                    var template = fluid.parseTemplates(resources, [key], {});
                    fluid.reRender(template, fluid.byId(resources[key].nodeId), model, opts);
                }
            }
            that.events.pageRendered.fire();
        };
    };
    
    var buildFullUISpec = function (that) {
        var fullUISpec = fluid.copy(that.spec);
        
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

    var addRepeatedItemsToComponentTree = function (children, name, specPart, modelPart, el) {
        var index = children.length;
        for (var i = 0; i < modelPart.length; i++) {
            children[index] = {
                ID: name + ":",
                children: []
            };
            var j = 0;
            for (var key in specPart) {
                if (specPart.hasOwnProperty(key)) {
                    children[index].children[j] = {
                        ID: key,
                        valuebinding: (el ? el + "." + i + "." + key : key)
                    };
                    j++;
                }
            }
            index++;
        }
    };
    
    var buildComponentTreeChildren = function (specPart, modelPart, el) {
        var children = [];
        var index = 0;
        for (var key in specPart) {
            if (specPart.hasOwnProperty(key)) {
                var elPath = (el ? fluid.model.composePath(el, key) : key);
                if (specPart[key].hasOwnProperty("repeated")) {
                    // repeated items need to be filled in based on the data, not the schema
                    // the schema defines the fields for each row, but the data must be 
                    // examined to fill in each row
                    addRepeatedItemsToComponentTree(children, key, specPart[key].repeated, modelPart[key], elPath);
                } else {
                    children[index] = {
                        ID: key,
                        valuebinding: elPath
                    };
                }                    
                index = children.length;
            }
        }            
        return children;
    };

    cspace.renderer = {
        buildComponentTree: function (spec, model) {
            var tree = {children: buildComponentTreeChildren(spec, model)};
            return tree;
        },

        renderPage: function (that) {
            var fullUISpec = buildFullUISpec(that);
            var renderOptions = {
                model: that.model,
//                debugMode: true,
                autoBind: true
            };
            var cutpoints = buildCutpointsFromSpec(fullUISpec);            
            var model = cspace.renderer.buildComponentTree(fullUISpec, that.model);
            var resources = {};
            for (var key in that.options.templates) {
                if (that.options.templates.hasOwnProperty(key)) {
                    var templ = that.options.templates[key];
                    resources[key] = {
                        href: templ.url,
                        nodeId: templ.id,
                        cutpoints: cutpoints
                    };
                }
            }
            fluid.fetchResources(resources,
                createTemplateRenderFunc(that, resources, model, renderOptions));
        },
        
        createCutpoints: function (spec) {
            var cutpoints = [];
            addCutpointsToList(cutpoints, spec);
            return cutpoints;
        }
    };

})(jQuery, fluid_1_1);
