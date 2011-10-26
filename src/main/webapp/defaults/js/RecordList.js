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

    fluid.defaults("cspace.recordList", {
		preInitFunction: "cspace.recordList.preInit",
		finalInitFunction: "cspace.recordList.finalInit",
        mergePolicy: {
            "rendererOptions.applier": "applier"
        },
        rendererOptions: {
            autoBind: true
        },
        invokers: {
            bindEvents: {
                funcName: "cspace.recordList.bindEvents",
                args: ["{recordList}"]
            },
            lookupMessage: "cspace.util.lookupMessage",
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
            selectonIndex: -1,
            messagekeys: {
                nothingYet: "recordList-nothingYet",
                newRow: "recordList-newRow"
            }
        },
        events: {
            onSelect: null
        },
        showTitle: true,
        showNumberOfItems: true,
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
            newRow: ".csc-recordList-new",
            recordList: ".csc-recordList",
            titleRow: ".csc-recordList-title-row",
            titleColumn: ".csc-recordList-title-column",
            numberOfItems: ".csc-recordList-num-items",
            nothingYet: ".csc-recordList-no-items",
            row: ".csc-recordList-row",
            column: ".csc-recordList-column",
            deleteRelation: ".csc-recordList-deleteRelation",
            thumbnail: ".csc-recordList-thumbnail"
        },
        repeatingSelectors: ["row", "titleColumn", "column"],
        strings: {
            numberOfItems: "%numberOfItems"
        },
        styles: {
            hidden: "hidden",
            newRow: "cs-recordList-new",
            recordList: "cs-recordList",
            titleRow: "cs-recordList-title-row",
            numberOfItems: "cs-recordList-num-items",
            nothingYet: "cs-recordList-no-items",
            titleColumn: "cs-recordList-title-column",
            column: "cs-recordList-column",
            column1: "cs-recordList-column1",
            column2: "cs-recordList-column2",
            column3: "cs-recordList-column3",
            column4: "cs-recordList-column4",
            selected: "cs-selected",
            disabled: "cs-disabled"
        },
        parentBundle: "{globalBundle}",
        globalNavigator: "{globalNavigator}",
        produceTree: "cspace.recordList.produceTree",
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RecordListTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        urls: cspace.componentUrlBuilder({
            navigate: "%webapp/html/%recordType.html?csid=%csid",
            navigateLocal: "%webapp/html/record.html?recordtype=%recordType&csid=%csid"
        })
    });

    fluid.fetchResources.primeCacheFromResources("cspace.recordList");
    
    cspace.recordList.bindEvents = function (that) {
    
        function styleAndActivate (row, rows) {
            that.locate("newRow").hide();
            row.addClass(that.options.styles.selected);
            that.applier.requestChange("selectonIndex", rows.index(row));
            that.events.onSelect.fire();
        }
    
        fluid.activatable(that.locate("row"), function (event) {
            var rows = that.locate("row");
            rows.removeClass(that.options.styles.selected);
            styleAndActivate($(event.target), rows);
            return false;
        });
        
        fluid.selectable(that.container, {
            selectableElements: that.locate("row"),
            onLeaveContainer: function () {
                that.locate("row").removeClass(that.options.styles.selected);
            }
        });
        that.container.fluid("tabbable");

        that.locate("row").click(function () {
            $(that.options.selectors["row"]).removeClass(that.options.styles.selected);
            styleAndActivate($(this), that.locate("row"));
        });
    };

    
    cspace.recordList.finalInit = function (that) {
    	that.applier.requestChange("columns", that.options.columns);
        that.applier.requestChange("sorted", []);
        that.applier.requestChange("names", that.options.names || that.options.columns);
        
        that.handleNewRow = function (action) {
            that.locate("newRow")[action]();
            that.locate("row").removeClass(that.options.styles.selected);
        };
        
        that.refreshView = function () {
            that.verifyColumnOrder();
            that.renderer.refreshView();
        };

        that.refreshView();
    };
    
    cspace.recordList.preInit = function (that) {
        that.options.listeners = that.options.listeners || {};
        that.options.listeners.onSelect = function () {
            that.select();
        };
        that.options.listeners.afterRender = function () {
        	that.bindEvents();
        };
    };
    
    cspace.recordList.verifyColumnOrder = function (that) {
        that.applier.requestChange("sorted", []);
        fluid.each(fluid.get(that.model, that.options.elPaths.items), function (item, index) {
            var sortedItem = [];
            fluid.each(that.model.columns, function (column) {
                sortedItem.push(fluid.get(item, column));
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
                messagekey: "${messagekeys.newRow}",
                args: [
                    that.lookupMessage(that.options.recordType)
                ],
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
                            expander: [{
                                repeatID: "column",
                                type: "fluid.renderer.repeat",
                                pathAs: "column",
                                valueAs: "columnValue",
                                controlledBy: "{row}",
                                tree: {
                                    value: "${{column}}",
                                    decorators: [{
                                        type: "fluid",
                                        func: "cspace.recordList.rowStyler",
                                        options: {
                                            row: "${{row}}"
                                        }
                                    }]
                                }
                            }]
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
                    }, {
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
                                    messagekey: "${{titleColumn}}",
                                    args: {
                                        recordType: that.lookupMessage(that.options.recordType)
                                    },
                                    decorators: [{
                                        type: "addClass",
                                        classes: that.options.styles.titleColumn
                                    }, {
                                        type: "addClass",
                                        classes: that.options.styles["column" + that.options.columns.length.toString()]
                                    }]
                                }
                            }
                        }
                    }]
                },
                falseTree: {
                    nothingYet: {
                        messagekey: "${messagekeys.nothingYet}",
                        decorators: {
                            type: "addClass",
                            classes: that.options.styles.nothingYet
                        }
                    }
                }
            }]
        };
    };
    
    fluid.defaults("cspace.recordList.rowStyler", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "cspace.recordList.rowStyler.finalInitFunction",
        styles: {
            disabled: "cs-disabled"
        }
    });
    
    cspace.recordList.rowStyler.finalInitFunction = function (that) {
        that.container.addClass(that.options.styles["column" + that.model.columns.length.toString()])
                      .addClass(that.options.styles.column);
        var segs = fluid.model.parseEL(that.options.row);
        if (!cspace.permissions.resolve({
            permission: "read",
            target: that.model[that.options.elPath][segs[segs.length - 1]].recordtype,
            resolver: that.options.permissionsResolver
        })) {
            that.container.parent().addClass(that.options.styles.disabled);
        }
    };
    
    fluid.defaults("cspace.recordList.thumbRenderer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "cspace.recordList.thumbRenderer.finalInitFunction",
        strings: {},
        parentBundle: "{globalBundle}",
        styles: {
            thumbnail: "cs-recordList-thumbnail"
        },
        urls: cspace.componentUrlBuilder({
            icnMedia: "%webapp/images/icnMedia.png"
        })
    });
    
    cspace.recordList.thumbRenderer.finalInitFunction = function (that) {
        var segs = fluid.model.parseEL(that.options.row);
        var item = that.model[that.options.elPath][segs[segs.length - 1]];
        that.container.attr("src", item.summarylist.imgThumb || that.options.urls.icnMedia)
            .attr("alt", that.options.parentBundle.resolve("recordList-thumbnail"))
            .addClass(that.options.styles.thumbnail);
    };
    
    cspace.recordList.produceTreeTabs = function (that) {
        var tree = cspace.recordList.produceTree(that);
        tree.expander[0].trueTree.expander[0].tree.expander.push({
            type: "fluid.renderer.condition",
            condition: that.options.showDeleteButton,
            trueTree: {
                deleteRelation: {
                    decorators: [{
                        type: "addClass",
                        classes: that.options.styles.deleteRelation
                    }, {
                        type: "attrs",
                        attributes: {
                            alt: that.lookupMessage("tab-list-deleteRelation") 
                        }
                    }, {
                        type: "jQuery",
                        func: "click",
                        args: that.deleteRelation
                    }]
                }
            }
        });
        return tree;
    };
    
    cspace.recordList.produceTreeMediaTabs = function (that) {
        var tree = cspace.recordList.produceTreeTabs(that);
        tree.expander[0].trueTree.expander[0].tree.thumbnail = {
            decorators: {
                type: "fluid",
                func: "cspace.recordList.thumbRenderer",
                options: {
                    row: "{row}"
                }
            }
        };
        return tree;
    };
    
    cspace.recordList.showThumbnail = function (model, elPath, row) {
        var segs = fluid.model.parseEL(row);
        var item = model[elPath][segs[segs.length - 1]];
        return !!(item && item.imgThumb);
    };
    
    var selectNavigate = function (model, options, url, permissionsResolver, dom, typePath) {
        var record = fluid.get(model, options.elPaths.items)[model.selectonIndex];
        if (!record) {
            return;
        }
        if (!cspace.permissions.resolve({
            permission: "read",
            target: record.recordtype,
            resolver: permissionsResolver
        })) {
            dom.locate("row").removeClass(options.styles.selected);
            return;
        }
        options.globalNavigator.events.onPerformNavigation.fire(function () {
            window.location = fluid.stringTemplate(url, {
                recordType: record[typePath].toLowerCase(),
                csid: record.csid
            });
        });
    };

    cspace.recordList.selectNavigateVocab = function (model, options, url, permissionsResolver, dom) {
        selectNavigate(model, options, url, permissionsResolver, dom, "sourceFieldType");
    };

    cspace.recordList.selectNavigate = function (model, options, url, permissionsResolver, dom) {
        selectNavigate(model, options, url, permissionsResolver, dom, "recordtype");
    };

    cspace.recordList.selectFromList = function (model, options, dataContext) {
        var record = fluid.get(model, options.elPaths.items)[model.selectonIndex];
        if (!record) {
            return;
        }
        options.globalNavigator.events.onPerformNavigation.fire(function () {
            dataContext.fetch(record.csid);
        });
    };

    cspace.recordList.extractRowCsid = function (rows, row, model, elPath) {
        return fluid.get(model, elPath)[rows.index(row)].csid;
    };

    cspace.recordList.deleteRelation = function (event, recordList, recordEditor, tab) {
        var targetCsid = cspace.recordList.extractRowCsid(recordList.locate("row"),
            $(event.target).closest("li"), recordList.model, recordList.options.elPaths.items);
        recordEditor.confirmation.open("cspace.confirmation.deleteDialog", undefined, {
            listeners: {
                onClose: function (userAction) {
                    if (userAction === "act") {
                        tab.relationManager.dataContext.removeRelations({
                            source: {
                                csid: tab.model.csid,
                                recordtype: tab.primary
                            },
                            target: {
                                csid: targetCsid,
                                recordtype: tab.related
                            },
                            type: "affects",
                            "one-way": false
                        });
                    }
                }
            },
            model: {
                messages: [ "tab-re-deletePrimaryMessage" ]
            },
            parentBundle: recordEditor.options.parentBundle
        });
        return false;
    };

})(jQuery, fluid);
