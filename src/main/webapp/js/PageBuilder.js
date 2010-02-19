/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2, cspace*/

cspace = cspace || {};

(function ($, fluid) {

    var injectElementsOfType = function (container, elementType, elements) {
        if (!elements || elements.length < 1) {
            return;
        }

        var elementsOfType = $(elementType, container);
        var repeat = elementsOfType.length === 0 ? function (idx, element) {
            container.append(element);
        } : function (idx, element) {
            var lastEl = $(elementType + ":last", container);
            lastEl.after(element);
        };

        $.each(elements, repeat);
    };
    
    var inject = function (docString, selector, container) {
        if (!docString || docString === "") {
            return;
        }

//        var headTag = docString.match(/<head(.|\s)*?\/head>/gi)[0];
        var bodyTag = docString.match(/<body(.|\s)*?\/body>/gi);
        if (bodyTag) {
            bodyTag = bodyTag[0];
        } else {
            bodyTag = docString;
        }
// Currently, parsing the link and script tags is not working quite properly, so
// for now, forego that process: assume the target HTML has everything you'd need
//        var linkTags = [].concat(headTag.match(/<link(.|\s)*?\/>/gi)).concat(headTag.match(/<link(.|\s)*?\/link>/gi)),
//            scriptTags = headTag.match(/<script(.|\s)*?\/script>/gi);

//        var head = $("head");
//        injectElementsOfType(head, "link", linkTags);
//        injectElementsOfType(head, "script", scriptTags);

        var templateContainer = $("<div></div>").html(bodyTag);
        var templateContent = $(selector, templateContainer);
        container.append($(selector, templateContainer)); 
    };
    
    var expandOptions = function (pageBuilder, args) {
        if (args.length !== 2) {
            return;
        }
        var options = args[1];
        for (var opt in options) {
            if (options.hasOwnProperty(opt)) {
                var val = options[opt];
                if ((typeof(val) === "string") && (val.indexOf("{pageBuilder}") === 0)) {
                    options[opt] = fluid.model.getBeanValue(pageBuilder, val.substring(14, val.length));
                }
            }
        }
    };

    var invokeDependencies = function (that) {
        that.components = [];
        for (var region in that.dependencies) {
            if (that.dependencies.hasOwnProperty(region)) {
                var dep = that.dependencies[region];
                expandOptions(that, dep.args);
                that.components[region] = fluid.invokeGlobalFunction(dep.funcName, dep.args);
            }
        }
    };

    var setUpModel = function (that) {
        return function (data, textStatus) {
            that.model.fields = that.model.fields || {};
            that.model.relations = that.model.relations || [];
            that.model.termsUsed = that.model.termsUsed || [];
            that.model.csid = that.model.csid || null;

            that.applier = fluid.makeChangeApplier(that.model);
            
            invokeDependencies(that);
        };
    };

    var setUpPageBuilder = function (that) {
        fluid.model.copyModel(that.uispec, cspace.pageBuilder.uispec);
        fluid.clear(cspace.pageBuilder.uispec);

        that.model = {};
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model, fluid.COMPONENT_OPTIONS]);
        that.dataContext.events.afterFetch.addListener(setUpModel(that));
        that.dataContext.events.onError.addListener(function (operation, textStatus) {
            console.log("Error trying to " + operation + ": " + textStatus);
        });
        
        if (that.options.csid) {
            that.dataContext.fetch(that.options.csid);
        } else {
            setUpModel(that)({});
        }
    };

    var assembleHTML = function (that) {
        fluid.fetchResources(that.options.pageSpec, function (resourceSpecs) {
            for (var regionName in resourceSpecs) {
                if (resourceSpecs.hasOwnProperty(regionName) && (regionName !== "callbackCalled")) {
                    var region = resourceSpecs[regionName];
                    inject(region.resourceText, region.templateSelector, $(region.targetSelector));
                }
                
            }
            if (!that.options.htmlOnly) {
                setUpPageBuilder(that);                
            }
        });

    };

    cspace.pageBuilder = function (dependencies, options) {
        var that = {
            dependencies: dependencies,
            uispec: {}
        };

        if (options && options.container) {
            // not sure exactly what to do here, or what condition to check to decide to do it
            that = fluid.initView("cspace.pageBuilder", options.container, options);
        } else {
            fluid.mergeComponentOptions(that, "cspace.pageBuilder", options);
        }

        if (options && options.pageSpec) {
            assembleHTML(that);
        } else {
            setUpPageBuilder(that);
        }
    };

    fluid.defaults("cspace.pageBuilder", {
        dataContext: {
            type: "cspace.dataContext"
        },
        
        htmlOnly: false
    });
})(jQuery, fluid_1_2);
