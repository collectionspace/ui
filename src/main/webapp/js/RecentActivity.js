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

    getRenderTemplates = function (that) {
        var resourceSpecs = {
            alist: {
                resourceKey: "alist",
                resourceText: $("#form")[0].innerHTML,
                href: "."
            }
        };
            var cutPoints = [
                {
                    id: "list",
                    selector: that.options.selectors.activityList
                }
            ];
        return fluid.parseTemplates(resourceSpecs, ["alist"], {cutpoints: cutPoints});
    };

    buildComponentTreeForSelect = function (id, model) {
        var tree = {children: [
                    {
                        ID: id,
                        selection: {
                            value: model[0]
                        },
                        optionlist: {
                            value: model
                        },
                        optionnames: {
                            value: model
                        }
                    }
                ]};
        return tree;
    };
    
    bindEventHandlers = function (that) {
        that.events.afterFetchObjectsSuccess.addListener(function (activityList) {
            that.model = activityList.items;

            var cutPoints = [
                {
                    id: "list",
                    selector: that.options.selectors.activityList
                }
            ];
            var tree = buildComponentTreeForSelect("list", that.model);
            that.renderTemplates = fluid.selfRender(that.locate("listContainer"), tree, {cutpoints: cutPoints, debugMode: true});

            that.refreshView();
        });
        that.events.afterFetchObjectsError.addListener(function (xhr, msg, error) {
            // TODO: decide on a better response to error
            console.log("Error fetching activity list: "+error);
        });
        
    };
    
    setupRecentActivity = function (that) {
        that.objectDAO = fluid.initSubcomponent(that, "dao", [fluid.COMPONENT_OPTIONS]);
        bindEventHandlers(that);
        that.objectDAO.fetchObjects(that.events.afterFetchObjectsSuccess.fire, that.events.afterFetchObjectsError.fire);
            var cutPoints = [
                {
                    id: "list",
                    selector: that.options.selectors.activityList
                }
            ];
    };
    
    cspace.recentActivity = function (container, options) {
        var that = fluid.initView("cspace.recentActivity", container, options);
        that.model = {};
        
        that.updateModel = function (newModel, source) {
            that.model = newModel.items;
            that.refreshView();
        };
        
        that.refreshView = function () {
            console.log("list: "+that.model);
            var cutPoints = [
                {
                    id: "list",
                    selector: that.options.selectors.activityList
                }
            ];
            var tree = buildComponentTreeForSelect("list", that.model);
            fluid.reRender(that.renderTemplates, that.locate("listContainer"), tree, {cutpoints: cutPoints, debugMode: true});
        };
        
        setupRecentActivity(that);
        
        return that;
    };
    
    fluid.defaults ("cspace.recentActivity", {
        events: {
            afterFetchObjectsSuccess: null,
            afterFetchObjectsError: null
        },
        dao: {
            type: "cspace.collectionObjectDAO"
        },
        selectors: {
            listContainer: ".csc-recent-activity",
            activityList: ".csc-recent-activity-list",
        }
    });
})(jQuery, fluid_1_1);
