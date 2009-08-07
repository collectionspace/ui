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

    buildComponentTreeForSelect = function (that, id) {
        var tree = {children: [
                    {
                        ID: id,
                        selection: {
                            value: that.model.selected
                        },
                        optionlist: {
                            value: that.model.items
                        },
                        optionnames: {
                            value: that.model.items
                        },
                        decorators: [{
                            type: "event",
                            event: "onchange",
                            handler: function () {
                                that.model.selected = this.value;
                                that.events.modelChanged.fire(that.model);
                            }
                        }]
                    }
                ]};
        return tree;
    };
     
    // TODO: This is a temporary function, in use only for the 1.0 demo. It takes care of some
    // glitches, worflow issues and other things that either need to be fixed, or addressed in a better way.
    convertItemsToSelectionList = function (list) {
        var newList = ["Select from the list below..."];
        var j=1;
        for (var i=0; i<list.length;i++) {
            if (list[i] !== "schema") {
                newList[j++] = list[i];
            }
        }
        return newList;
    };
    
    bindEventHandlers = function (that) {
        that.dataContext.events.modelChanged.addListener(function (newModel, oldModel, source) {
            fluid.model.copyModel(that.model.items, convertItemsToSelectionList(newModel.items));
            that.refreshView();
        });
    };
    
    setupRecentActivity = function (that) {
        that.dataContext = fluid.initSubcomponent(that, "dataContext", [that.model.items, fluid.COMPONENT_OPTIONS]);
        bindEventHandlers(that);
        var cutPoints = [
            {
                id: "list",
                selector: that.options.selectors.activityList
            }
        ];
        var tree = buildComponentTreeForSelect(that, "list");
        that.renderTemplates = fluid.selfRender(that.locate("listContainer"), tree, {cutpoints: cutPoints, debugMode: true});
        that.dataContext.fetch("*", {});
    };
    
    cspace.recentActivity = function (container, options) {
        var that = fluid.initView("cspace.recentActivity", container, options);
        that.model = {
            items: convertItemsToSelectionList([]),
            selected: ""
        };
        
        that.updateModel = function (newModel, source) {
            if (!newModel) {
                that.dataContext.fetch("*", {});
                return;
            }
            that.model.items = convertItemsToSelectionList(newModel.items);
            that.model.selection = that.model.items[0];
            that.refreshView();
        };
        
        that.refreshView = function () {
            var cutPoints = [
                {
                    id: "list",
                    selector: that.options.selectors.activityList
                }
            ];
            var tree = buildComponentTreeForSelect(that, "list");
            fluid.reRender(that.renderTemplates, that.locate("listContainer"), tree, {cutpoints: cutPoints, debugMode: true});
        };
        
        setupRecentActivity(that);
        
        return that;
    };
    
    fluid.defaults ("cspace.recentActivity", {
        events: {
            modelChanged: null
        },
        dataContext: {
            type: "cspace.resourceMapperDataContext"
        },
        selectors: {
            listContainer: ".csc-recent-activity",
            activityList: ".csc-recent-activity-list",
            viewButton: ".csc-view-button"
        }
    });
})(jQuery, fluid_1_1);
