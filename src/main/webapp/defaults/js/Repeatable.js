/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.log("Repeatable.js loaded");

    var getDefaultsNames = function (componentName) {
        var names = [];
        fluid.each(fluid.defaults(componentName), function (def, name) {
            names.push(name);
        });
        return names;
    };

    var isListOrTable = function (elem) {
        return $(elem).is("ul, ol, table");
    };

    // Generate repeatableImpl container.
    var getRepeatbleImplContainer = function (container, options) {
        container.addClass(options.repeatableClasses.repeatable);
        if (container.is("tr") || container.is("li")) {
            container = fluid.findAncestor(container, isListOrTable);
            container = $(container);
            $("thead tr", container).addClass(options.repeatableClasses.headerRow);
        }
        container.wrap("<div />");
        return container.parent("div");
    };

    // Used to pass options for high level component wrappers down to its subcomponents.
    var propagateOptions = function (that, subcomponentNickName) {
        var defNames = getDefaultsNames(that.typeName);
        fluid.each(that.options, function (option, name) {
            if ($.inArray(name, defNames) < 0) {
                that.options.components[subcomponentNickName].options[name] = 
                    fluid.model.composeSegments("{" + that.nickName + "}", "options", name);
            }
        });
        // No need to pass listeners down since we apply event boiling
        delete that.options.components[subcomponentNickName].options.listeners;
        // Event boiling
        that.options.components[subcomponentNickName].options.events = 
                that.options.components[subcomponentNickName].options.events || {};
        fluid.each(that.options.events, function (val, event) {
            that.options.components[subcomponentNickName].options.events[event] = 
                fluid.model.composeSegments("{" + that.nickName + "}", "events", event);
        });
    };

    fluid.defaults("cspace.repeatable", {
        gradeNames: "fluid.viewComponent",
        components: {
            repeatableImpl: {
                type: "cspace.repeatableImpl",
                container: "{repeatable}.container",
                options: {}
            }
        },
        events: {
            afterDelete: null,
            afterAdd: null,
            afterUpdatePrimary: null,
            onRefreshView: null
        }
    });

    fluid.defaults("cspace.makeRepeatable", {
        gradeNames: "fluid.viewComponent",
        mergePolicy: {
            schema: "nomerge"
        },
        repeatableClasses: {
            expander: {
                type: "fluid.deferredInvokeCall",
                func: "cspace.repeatableImpl.expandSelectors",
                args: [{
                    repeatable: "csc-repeatable-repeat",
                    headerRow: "csc-repeatable-headerRow"
                }, "{makeRepeatable}.id"]
            }
        },
        components: {
            repeatableImpl: {
                type: "cspace.repeatableImpl",
                container: "{makeRepeatable}.repeatableImplContainer",
                options: {}
            }
        },
        events: {
            afterDelete: null,
            afterAdd: null,
            afterUpdatePrimary: null,
            onRefreshView: null
        }
    });

    function returnRepeatable(that) {
        propagateOptions(that, "repeatableImpl");
        fluid.initDependents(that);
        return that;
    }

    cspace.repeatable = function (container, options) {
        var that = fluid.initView("cspace.repeatable", container, options);
        return returnRepeatable(that);
    };

    cspace.makeRepeatable = function (container, options) {
        var that = fluid.initView("cspace.makeRepeatable", container, options);
        that.repeatableImplContainer = getRepeatbleImplContainer(that.container, that.options);
        return returnRepeatable(that);
    };

    fluid.defaults("cspace.repeatableImpl", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        mergePolicy: {
            schema: "nomerge",
            repeatTree: "preserve",
            "rendererFnOptions.repeatTree": "repeatTree",
            "rendererOptions.instantiator": "nomerge",
            "rendererOptions.parentComponent": "nomerge",
            "rendererOptions.applier": "applier"
        },
        root: "",
        selectors: {
            add: ".csc-repeatable-add",
            "delete": ".csc-repeatable-delete",
            primary: ".csc-repeatable-primary",
            repeat: ".csc-repeatable-repeat",
            headerRow: ".csc-repeatable-headerRow"
        },
        repeatingSelectors: ["repeat"],
        selectorsToIgnore: ["headerRow"],
        styles: {
            add: "cs-repeatable-add",
            repeatable: "cs-repeatable",
            repeat: "cs-repeatable-repeat",
            clearfix: "clearfix",
            "delete": "cs-repeatable-delete",
            primary: "cs-repeatable-primary",
            content: "cs-repeatable-content",
            withSubgroup: "cs-repeatable-withSubgroup",
            repeatableGroup: "cs-repeatable-group"
        },
        preInitFunction: [{
            namespace: "preInitGenerateMethods",
            listener: "cspace.repeatableImpl.preInitGenerateMethods"
        }, {
            namespace: "preInitPrepareModel",
            listener: "cspace.repeatableImpl.preInitPrepareModel"
        }, {
            namespace: "preInitMergeProtoTree",
            listener: "cspace.repeatableImpl.preInitMergeProtoTree"
        }],
        postInitFunction: "cspace.repeatableImpl.postInitGenerateMarkup",
        finalInitFunction: [{
            namespace: "finalInitRender",
            listener: "cspace.repeatableImpl.finalInitRender"
        }, {
            namespace: "finalInitBindEvents",
            listener: "cspace.repeatableImpl.finalInitBindEvents"
        }, {
            namespace: "finalInitStyle",
            listener: "cspace.repeatableImpl.finalInitStyle"
        }],
        markup: {
            addControl:     "<input type='button' />",
            deleteControl:  "<input type='button' value='' />",
            primaryControl: "<input type='radio' />"
        },
        protoTree: {
            expander: [{
                type: "fluid.renderer.condition",
                condition: "{repeatableImpl}.optins.disableAdd",
                falseTree: {
                    add: {
                        messagekey: "repeatable-add",
                        decorators: [{"addClass": "{styles}.add"}]
                    }
                }
            }, {
                repeatID: "repeat",
                tree: {
                    "delete": {
                        decorators: [{"addClass": "{styles}.delete"}]
                    },
                    primary: {
                        decorators: [{"addClass": "{styles}.primary"}]
                    }
                },
                type: "fluid.renderer.repeat",
                pathAs: "row",
                controlledBy: ""
            }]
        },
        rendererOptions: {
            instantiator: "{instantiator}",
            parentComponent: "{repeatableImpl}"
        },
        rendererFnOptions: {
            cutpointGenerator: "cspace.repeatableImpl.cutpointGenerator"
        },
        hidePrimary: false,
        disablePrimary: false,
        disableAdd: false,
        disableDelete: false,
        parentBundle: "{globalBundle}",
        strings: {},
        recordType: "",
        invokers: {
            refreshView: {
                funcName: "cspace.repeatableImpl.refreshView",
                args: "{repeatableImpl}"
            },
            processDeleteInput: {
                funcName: "cspace.repeatableImpl.processDeleteInput",
                args: ["{repeatableImpl}.dom.delete", "{repeatableImpl}.fetchModel"]
            },
            setupPrimary: {
                funcName: "cspace.repeatableImpl.setupPrimary",
                args: ["{repeatableImpl}.dom.primary", "{repeatableImpl}.fetchModel"]
            },
            requestChange: {
                funcName: "cspace.repeatableImpl.requestChange",
                args: [
                    "{repeatableImpl}.options", 
                    "{repeatableImpl}.applier", 
                    "{repeatableImpl}.fetchModel", 
                    "{arguments}.0", 
                    "{arguments}.1"
                ]
            },
            deleteHandler: {
                funcName: "cspace.repeatableImpl.deleteHandler",
                args: ["{repeatableImpl}", "{arguments}.0.currentTarget", "{repeatableImpl}.events.afterDelete"]
            },
            addHandler: {
                funcName: "cspace.repeatableImpl.updateAndRefresh",
                args: ["{repeatableImpl}", "{repeatableImpl}.addRow", "{repeatableImpl}.events.afterAdd", true]
            },
            primaryHandler: {
                funcName: "cspace.repeatableImpl.updateAndRefreshIndex",
                args: [
                    "{repeatableImpl}", 
                    "{repeatableImpl}.updatePrimary", 
                    "{arguments}.0.currentTarget", 
                    "{repeatableImpl}.events.afterUpdatePrimary", 
                    false, 
                    "primary"
                ]
            }
        }
    });
    
    var hasRepeatableSubgroup = function (components) {
        var repeatableTypes = [
            "cspace.makeRepeatable",
            "cspace.repeatable",
            "cspace.repeatableImpl"
        ];
        return fluid.find(components, function (component) {
            if ($.inArray(component.type, repeatableTypes) > -1) {
                return true;
            }
        });
    };

    var isGroup = function (tree) {
        var index = 0;
        return fluid.find(tree, function (leaf) {
            if (index > 1) {
                return true;
            }
            ++index;
        });
    };

    cspace.repeatableImpl.finalInitStyle = function (that) {
        if (hasRepeatableSubgroup(that.options.components)) {
            that.container.addClass(that.options.styles.withSubgroup);
        }
        if (isGroup(that.options.repeatTree)) {
            that.container.addClass(that.options.styles.repeatableGroup);
        }
    };

    cspace.repeatableImpl.expandSelectors = function (selectors, id) {
        return fluid.transform(selectors, function (selector) {
            return selector.concat("-", id);
        });
    };

    cspace.repeatableImpl.finalInitBindEvents = function (that) {
        fluid.each(["add", "delete", "primary"], function (selector) {
            that.container.delegate(that.options.selectors[selector], "click", that[selector + "Handler"]);
        });
        fluid.each(["Delete", "Add"], function (event) {
            that.events["after" + event].addListener(function () {
                that.processDeleteInput();
            });
        });
    };
    
    cspace.repeatableImpl.deleteHandler = function (that, target, event) {
        if (that.fetchModel().length < 2) {
            return false;
        }
        cspace.repeatableImpl.updateAndRefreshIndex(that, that.deleteRow, target, event, true, "delete");
    };
    
    cspace.repeatableImpl.updateAndRefreshIndex = function (that, callback, target, event, render, selector) {
        var index = that.locate(selector).index(target);
        cspace.repeatableImpl.updateAndRefresh(that, callback, event, render, index);
    };
    
    cspace.repeatableImpl.updateAndRefresh = function (that, callback, event, render, index) {
        that.requestChange(callback, index);
        if (render) {
            that.events.onRefreshView.fire();
            that.refreshView();
        }
        event.fire();
    };
    
    cspace.repeatableImpl.cutpointGenerator = function (selectors, options) {
        var cutpoints = options.cutpoints || fluid.renderer.selectorsToCutpoints(selectors, options) || [];
        return cutpoints.concat(cspace.renderUtils.cutpointsFromUISpec(options.repeatTree));
    };;
    
    cspace.repeatableImpl.preInitMergeProtoTree = function (that) {
        fluid.merge(null, that.options.protoTree.expander[1].tree, that.options.repeatTree);
        that.options.protoTree.expander[1].controlledBy = that.options.fullPath;
    };
    
    cspace.repeatableImpl.getSchema = function (globalSchema, recordType) {
        var schema = {};
        schema[recordType] = globalSchema[recordType];
        return schema;
    };
    
    cspace.repeatableImpl.requestChange = function (options, applier, fetchModel, callback, index) {
        applier.requestChange(options.fullPath, 
            callback(fetchModel(), index, options.fullPath, options.schema, options.recordType));
    };

    cspace.repeatableImpl.setupPrimary = function (radioButtons, fetchModel) {
        fluid.each(fetchModel(), function (field, index) {
            radioButtons[index].checked = field._primary || false;
        });
    };
    
    cspace.repeatableImpl.processDeleteInput = function (inputs, fetchModel) {
        inputs.eq(0).prop("disabled", fetchModel().length <= 1);
    };
    
    cspace.repeatableImpl.refreshView = function (that) {
        that.events.onRefreshView.fire();
        that.renderer.refreshView();
        that.setupPrimary();
    };
    
    cspace.repeatableImpl.finalInitRender = function (that) {
        that.events.onRefreshView.fire();
        that.renderer.refreshView();
        that.setupPrimary();
        that.processDeleteInput();
    };
        
    cspace.repeatableImpl.preInitGenerateMethods = function (that) {
        // This is a full path to repeatable sub-model.
        that.options.fullPath = cspace.util.composeSegments(that.options.root, that.options.elPath);
        
        that.getBaseRow = function () {
            var baseRow = {};
            if (that.options.schema) {
                baseRow = cspace.util.getBeanValue(baseRow,
                    // NOTE: Currently one of the constraints of JSON schema is that we interpret default value for 
                    // "items" as a default value for the first element in the array. So if we want to extract a default
                    // value we always need to change the index to 0.
                    fluid.model.composeSegments(that.options.recordType, that.options.fullPath.replace(/\.\d\./gi, ".0."), 0), 
                    that.options.schema) || baseRow;
            }
            // Make new row's primary by default = 0. Currently UISCHEMA set's default value as true.
            baseRow._primary = false;
            return baseRow;
        };
        that.addRow = function (fields) {
            fields = fluid.makeArray(fields);
            fields.push(that.getBaseRow());
            return fields;
        };
        that.updatePrimary = function (fields, index) {
            fluid.transform(fields, function (field, idx) {
                field._primary = (index === idx) ? true : false;
            });
            return fields;
        };   
        that.deleteRow = function (fields, index) {
            if (fields[index]._primary === true) {
                var sucIndex = index === 0 ? 1 : index - 1;
                fields[sucIndex]._primary = true;
            }
            fields.splice(index, 1);
            return fields;
        };
        that.fetchModel = function (model) {
            return fluid.get(model || that.model, that.options.fullPath);
        };
    };

    cspace.repeatableImpl.preInitPrepareModel = function (that) {
        var list = fluid.copy(fluid.get(that.model, that.options.fullPath));
        if (list && list.length > 1) {
            return;
        }
        if (list && list.length > 0 && list[0]._primary) {
            return;
        }
        list = list && list.length > 0 ? list : that.addRow(list);
        if (!that.options.disablePrimary) {
            fluid.merge(null, list[0], {
                _primary: true
            });
        }
        // Here we do a silent model update. Since repeatable is asynchronous we do not want changeRequest trigger modelChanged simply because it is loading 
        // of initial data into the repeatable for RecordEditor
        // Important!!  ->  Implementation should use source tracking when it is available in a newer version of Infusion
        that.applier.fireChangeRequest({
            path: that.options.fullPath,
            type: "ADD",
            value: list,
            silent: true
        });
    };
    
    cspace.repeatableImpl.postInitGenerateMarkup = function (that) {
        function getClass(name) {
            return that.options.selectors[name].substr(1);
        }
        function getStyle(name) {
            return that.options.styles[name];
        }
        
        var node = that.locate("repeat");
        if (!node.is("tr, li")) {
            node = node.removeClass(getClass("repeat"))
                       .addClass(getStyle("content"))
                       .wrap($("<ul></ul>").addClass(getStyle("repeatable")))
                       .wrap($("<li/>").addClass(getClass("repeat"))
                                       .addClass(getStyle("clearfix"))
                                       .addClass(getStyle("repeat"))
                                       .css("display", "block"))
                       .parent("li");
        }
    
        if (that.locate("add").length === 0 && !that.options.disableAdd) {
            that.container.prepend($(that.options.markup.addControl).addClass(getClass("add")));
        }
        if (that.locate("primary").length === 0) {
            var primary = $(that.options.markup.primaryControl).addClass(getClass("primary"))
                                                               .attr("name", "primary-" + that.options.fullPath)
                                                               .prop("disabled", that.options.disablePrimary)
                                                               .css("display", that.options.hidePrimary ? "none" : "block");
            node.prepend(primary);
        }
        if (that.locate("delete").length === 0 && !that.options.disableDelete) {
            var remove = $(that.options.markup.deleteControl).addClass(getClass("delete"));
            node.append(remove);
        }
                
        if (!node.is("tr")) {
            return;
        }
        primary.wrap("<td/>");
        remove.wrap("<td/>");
        var headerRow = that.locate("headerRow");
        if (headerRow.length < 1) {
            return;
        }
        var headerCols = headerRow.children();
        if (headerCols.length < 1) {
            return;
        }
        var newCol = $(headerCols[0]).clone().empty();
        headerRow.prepend(newCol.clone());
        headerRow.append(newCol);
    };

})(jQuery, fluid);