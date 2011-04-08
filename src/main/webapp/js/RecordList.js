/*
Copyright 2009-2010 University of Toronto, 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("RecordList.js loaded");
    
    var bindEvents = function (that) {
        that.events.onSelect.addListener(function () {
            that.select();
        });
        
        fluid.activatable(that.locate("row"), function (event) {
            var rows = that.locate("row");
            rows.removeClass(that.options.styles.selected);
            that.locate("newRow").hide();
            var row = $(event.target);
            row.addClass(that.options.styles.selected);
            that.applier.requestChange("selectonIndex", rows.index(row));
            that.events.onSelect.fire();
        });
        fluid.selectable(that.container, {
            selectableElements: that.locate("row"),
            onLeaveContainer: function () {
                that.locate("row").removeClass(that.options.styles.selected);
            },
            noBubbleListeners: false,
            selectablesTabindex: ""
        });
        
        that.locate("row").click(function () {
            $(that.options.selectors["row"]).removeClass(that.options.styles.selected);
            var rows = that.locate("row");
            that.locate("newRow").hide();
            var row = $(this);
            row.addClass(that.options.styles.selected);
            that.applier.requestChange("selectonIndex", rows.index(row));
            that.events.onSelect.fire();
        });
        
        that.handleNewRow = function (action) {
            that.locate("newRow")[action]();
            that.locate("row").removeClass(that.options.styles.selected);
        };
    };
    
    cspace.recordList = function (container, options) {
        var that = fluid.initRendererComponent("cspace.recordList", container, options);
        fluid.initDependents(that);
        that.applier.requestChange("columns", that.options.columns);
        that.applier.requestChange("sorted", []);
        that.applier.requestChange("names", that.options.names || that.options.columns);
        that.refreshView = function () {
            that.verifyColumnOrder();
            that.renderer.refreshView();
            bindEvents(that);
            that.events.afterRender.fire();
        };
        
        that.refreshView();
        
        return that;
    };

    cspace.recordList.verifyColumnOrder = function (that) {
        fluid.each(that.model[that.options.elPaths.items], function (item, index) {
            var sortedItem = [];
            fluid.each(that.model.columns, function (column) {
                sortedItem.push(item[column]);
            });
            that.applier.requestChange("sorted" + "." + index, sortedItem);
        });
    };
    
    cspace.recordList.assertItems = function (options) {
        return options.items && options.items.length > 0;
    };
    
    cspace.recordList.calculateRecordListSize = function (model, elPath) {
        var list = fluid.get(model, elPath);
        return list && list.length > 0 ? list.length : 0;
    };
    
    cspace.recordList.produceTree = function (that) {
        return {
            recordList: {
                decorators: {
                    type: "addClass",
                    classes: that.options.styles.recordList
                }
            },
            newRow: {
                messagekey: "newRow",
                decorators: [{
                    type: "addClass",
                    classes: that.options.styles.hidden
                }, {
                    type: "addClass",
                    classes: that.options.styles.newRow
                }]
            },
            expander: [{
                type: "fluid.renderer.condition",
                condition: that.options.showTitle,
                trueTree: {
                    titleRow: {
                        decorators: {
                            type: "addClass",
                            classes: that.options.styles.titleRow
                        }
                    },
                    expander: {
                        repeatID: "titleColumn",
                        type: "fluid.renderer.repeat",
                        pathAs: "titleColumn",
                        controlledBy: "names",
                        tree: {
                            titleColumnValue: {
                                messagekey: "${{titleColumn}}",
                                decorators: [{
                                    type: "addClass",
                                    classes: that.options.styles.titleColumnValue
                                }, {
                                    type: "addClass",
                                    classes: that.options.styles.column + that.options.columns.length.toString()
                                }]
                            }
                        }
                    }
                }
            }, {
                type: "fluid.renderer.condition",
                condition: {
                    funcName: "cspace.recordList.assertItems",
                    args: {
                        items: "${" + that.options.elPaths.items + "}"
                    }
                },
                trueTree: {
                    expander: [{
                        repeatID: "row",
                        type: "fluid.renderer.repeat",
                        pathAs: "row",
                        valueAs: "rowValue",
                        controlledBy: "sorted",
                        tree: {
                            expander: {
                                repeatID: "column",
                                type: "fluid.renderer.repeat",
                                pathAs: "column",
                                valueAs: "columnValue",
                                controlledBy: "{row}",
                                tree: {
                                    columnValue: {
                                        value: "${{column}}",
                                        decorators: [{
                                            type: "addClass",
                                            classes: that.options.styles.column + that.options.columns.length.toString()
                                        }, {
                                            type: "addClass",
                                            classes: that.options.styles.columnValue
                                        }]
                                    }
                                }
                            }
                        }
                    }, {
                        type: "fluid.renderer.condition",
                        condition: that.options.showNumberOfItems,
                        trueTree: {
                            numberOfItems: {
                                messagekey: "numberOfItems",
                                args: {
                                    numberOfItems: that.calculateRecordListSize()
                                },
                                decorators: {
                                    type: "addClass",
                                    classes: that.options.styles.numberOfItems
                                }
                            }
                        }
                    }]
                },
                falseTree: {
                    nothingYet: {
                        messagekey: "nothingYet",
                        decorators: {
                            type: "addClass",
                            classes: that.options.styles.nothingYet
                        }
                    }
                }
            }]
        };
    };
    
    cspace.recordList.selectNavigate = function (model, options, url) {
        var record = model[options.elPaths.items][model.selectonIndex];
        if (!record) {
            return;
        }
        options.globalNavigator.events.onPerformNavigation.fire(function () {
            window.location = fluid.stringTemplate(url, {
                recordType: record.recordtype,
                csid: record.csid
            });
        });
    };
    
    cspace.recordList.selectFromList = function (model, options, dataContext) {
        var record = model[options.elPaths.items][model.selectonIndex];
        if (!record) {
            return;
        }
        options.globalNavigator.events.onPerformNavigation.fire(function () {
            dataContext.fetch(record.csid);
        });
    };
    
    fluid.defaults("cspace.recordList", {
        mergePolicy: {
            "rendererOptions.applier": "applier"
        },
        rendererOptions: {
            autoBind: true
        },
        invokers: {
            select: "select",
            verifyColumnOrder: {
                funcName: "cspace.recordList.verifyColumnOrder",
                args: "{recordList}"
            },
            calculateRecordListSize: {
                funcName: "cspace.recordList.calculateRecordListSize",
                args: ["{recordList}.model", "{recordList}.options.elPaths.items"]
            }
        },
        model: {
            selectonIndex: -1
        },
        events: {
            onSelect: null,
            afterRender: null
        },
        showTitle: true,
        showNumberOfItems: true,
        gradeNames: ["fluid.IoCRendererComponent"],
        selectors: {
            newRow: ".csc-recordList-new",
            recordList: ".csc-recordList",
            titleRow: ".csc-recordList-title-row",
            titleColumn: ".csc-recordList-title-column",
            titleColumnValue: ".csc-recordList-title-columnValue",
            numberOfItems: ".csc-recordList-num-items",
            nothingYet: ".csc-recordList-no-items",
            row: ".csc-recordList-row",
            column: ".csc-recordList-column",
            columnValue: ".csc-recordList-columnValue"
        },
        repeatingSelectors: ["column", "row", "titleColumn"],
        strings: {
            nothingYet: "No related records yet",
            newRow: "New Record",
            numberOfItems: "%numberOfItems"
        },
        styles: {
            hidden: "hidden",
            newRow: "cs-recordList-new",
            recordList: "cs-recordList",
            titleRow: "cs-recordList-title-row",
            numberOfItems: "cs-recordList-num-items",
            nothingYet: "cs-recordList-no-items",
            columnValue: "cs-recordList-columnValue",
            titleColumnValue: "cs-recordList-title-columnValue",
            column: "cs-recordList-column",
            column1: "cs-recordList-column1",
            column2: "cs-recordList-column2",
            column3: "cs-recordList-column3",
            column4: "cs-recordList-column4",
            selected: "cs-selected"
        },
        parentBundle: "{globalBundle}",
        globalNavigator: "{globalNavigator}",
        produceTree: cspace.recordList.produceTree,
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RecordListTemplate.html"
            })
        },
        urls: cspace.componentUrlBuilder({
            navigate: "%webapp/%recordType.html?csid=%csid",
            navigateLocal: "%webapp/html/record.html?recordtype=%recordType&csid=%csid"
        })
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.recordList");

})(jQuery, fluid);
