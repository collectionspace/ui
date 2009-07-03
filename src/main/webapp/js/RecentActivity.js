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

    buildComponentTreeForSelect = function (id, model) {
        var tree = {children: [
                    {
                        ID: id,
                        selection: {
                            value: model.selected
                        },
                        optionlist: {
                            value: model.items
                        },
                        optionnames: {
                            value: model.items
                        },
                        decorators: [{
                            type: "jQuery",
                            func: "change",
                            args: function () {
                                // in this context, "this" is the select pull-down itself
                                // This is Extremely temporary
                                document.location = "./objectentry.html?objectId="+this.value;
                            }
                        }]
                    }
                ]};
        return tree;
    };
     
    stripSchemaFromList = function (list) {
        var newList = [];
        var j=0;
        for (var i=0; i<list.length;i++) {
            if (list[i] !== "schema") {
                newList[j++] = list[i];
            }
        }
        return newList;
    };
    
    bindEventHandlers = function (that) {
        that.events.afterFetchObjectsSuccess.addListener(function (activityList) {
            // TEMPORARY: Currently, the demo doesn't properly separate the schema from the data
            // files - they're in the same folder, so the schema shows up in the list.
            that.model.items = stripSchemaFromList(activityList.items);
            that.model.selected = that.model.items[0];

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
        that.model = {
            items: [],
            selected: ""
        };
        
        that.updateModel = function (newModel, source) {
            that.model.items = stripSchemaFromList(newModel.items);
            that.refreshView();
        };
        
        that.refreshView = function () {
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
            viewButton: ".csc-view-button"
        }
    });
})(jQuery, fluid_1_1);
