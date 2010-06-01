/*
Copyright 2009 - 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/
"use strict";

var fluid = fluid || {};
fluid.engage = fluid.engage || {};

(function ($) {

    /*******************************
     * Renderer Utilities          *
     * --------------------------- *
     * depends on fluidRenderer.js *
     *******************************/
 
    fluid.engage.renderUtils = fluid.engage.renderUtils || {};

    fluid.engage.renderUtils.createRendererFunction = function (container, selectors, options) {
        options = options || {};
        container = $(container);
        var source = options.templateSource ? options.templateSource: {node: container};
        var rendererOptions = options.rendererOptions || {};
        var templates = null;
    
        return function (tree) {
            var cutpointFn = options.cutpointGenerator || "fluid.engage.renderUtils.selectorsToCutpoints";
            rendererOptions.cutpoints = rendererOptions.cutpoints || fluid.invokeGlobalFunction(cutpointFn, [selectors, options]);
        
            if (templates) {
                fluid.reRender(templates, container, tree, rendererOptions);
            } else {
                templates = fluid.render(source, container, tree, rendererOptions);
            }
        };
    };

    fluid.engage.renderUtils.removeSelectors = function (selectors, selectorsToIgnore) {
        if (selectorsToIgnore) {
            $.each(selectorsToIgnore, function (index, selectorToIgnore) {
                delete selectors[selectorToIgnore];
            });
        }
        return selectors;
    };

    fluid.engage.renderUtils.markRepeated = function (selector, repeatingSelectors) {
        if (repeatingSelectors) {
            $.each(repeatingSelectors, function (index, repeatingSelector) {
                if (selector === repeatingSelector) {
                    selector = selector + ":";
                }
            });
        }
        return selector;
    };

    fluid.engage.renderUtils.selectorsToCutpoints = function (selectors, options) {
        var cutpoints = [];
        options = options || {};
        selectors = fluid.copy(selectors); // Make a copy before potentially destructively changing someone's selectors.
    
        if (options.selectorsToIgnore) {
            selectors = fluid.engage.renderUtils.removeSelectors(selectors, options.selectorsToIgnore);
        }
    
        for (var selector in selectors) {
            cutpoints.push({
                id: fluid.engage.renderUtils.markRepeated(selector, options.repeatingSelectors),
                selector: selectors[selector]
            });
        }
    
        return cutpoints;
    };

    /** A special "shallow copy" operation suitable for nondestructively
     * merging trees of components. jQuery.extend in shallow mode will 
     * neglect null valued properties.
     */
    fluid.renderer.mergeComponents = function (target, source) {
        for (var key in source) {
            target[key] = source[key];
        }
        return target;
    };

    /** Create a "protoComponent expander" with the supplied set of options.
     * The returned value will be a function which accepts a "protoComponent tree"
     * as argument, and returns a "fully expanded" tree suitable for supplying
     * directly to the renderer.
     * A "protoComponent tree" is similar to the "dehydrated form" accepted by
     * the historical renderer - only
     * i) The input format is unambiguous - this expander will NOT accept hydrated
     * components in the {ID: "myId, myfield: "myvalue"} form - but ONLY in
     * the dehydrated {myID: {myfield: myvalue}} form.
     * ii) This expander has considerably greater power to expand condensed trees.
     * In particular, an "EL style" option can be supplied which will expand bare
     * strings found as values in the tree into UIBound components by a configurable
     * strategy. Supported values for "ELstyle" are a) "ALL" - every string will be
     * interpreted as an EL reference and assigned to the "valuebinding" member of
     * the UIBound, or b) any single character, which if it appears as the first
     * character of the string, will mark it out as an EL reference - otherwise it
     * will be considered a literal value, or c) the value "${}" which will be
     * recognised bracketing any other EL expression.
     * 
     * This expander will be upgraded in the future to support even more powerful
     * forms of expansion, including model-directed expansion such as selection and
     * repetition.
     */

    fluid.renderer.makeProtoExpander = function (options) {
        var ELstyle = options.ELstyle;
        var IDescape = options.IDescape || "\\";
        function extractEL(string) {
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
        }
        
        function expandStringEntry(proto, string) {
            var EL = options.ELstyle ? extractEL(string): null;
            if (EL) {
                proto.valuebinding = EL;
            }
            else {
                proto.value = string;
            }
        }
    
        var expandMembers = function (proto, container, pusher) {
            for (var key in proto) {
                var entry = proto[key];
                var comp;
                if (key === "decorators") {
                    container.decorators = entry; 
                    continue;
                }
                if (key.charAt(0) === IDescape) {
                    key = key.substring(1);
                }
                if (entry && entry.children) {
                    if (key.indexOf(":") === -1) {
                        key = key + ":";
                    }
                    var children = entry.children;
                    for (var i = 0; i < children.length; ++ i) {
                        comp = expandChildren(children[i]);
                        pusher(comp, key);
                    }
                }
                else {
                    if (typeof(entry) === "string" || !fluid.isPrimitive(entry)) {
                        comp = fluid.freshContainer(entry);
                        expandComponent(comp, entry);
                        pusher(comp, key);
                    }
                    else if (entry !== undefined) {
                        pusher(entry, key);
                    }
                }
            }
        };
        
        var expandChildren = function (proto) { // proto is a container
            var childlist = [];
            var togo = {children: childlist};
            var childPusher = function (comp, key) {
                comp.ID = key;
                childlist.push(comp);
            };
            expandMembers(proto, togo, childPusher);
            return togo;  
        };
        
        function expandComponent(comp, entry) {
            function memberPusher(component, key) {
                comp[key] = component;
            }
            
            if (typeof(entry) === "string") {
                expandStringEntry(comp, entry);
            } else {
                expandMembers(entry, comp, memberPusher);
            }
        }

        return expandChildren;
    };
})(jQuery);
