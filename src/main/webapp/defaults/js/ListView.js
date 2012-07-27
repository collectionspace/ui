/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/

cspace = cspace || {};

(function ($, fluid) {
    
    "use strict";
    
    fluid.registerNamespace("cspace.listView");
    
    cspace.listView.sorter = function (overallThat, model) {
        return null;
    };
    
    fluid.defaults("cspace.listView", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        disablePageSize: false,
        stubbPagination: false,
        model: {
            columns: [{
                sortable: true,
                id: "",
                name: ""
            }],
            pagerModel: {
                pageCount: 1,
                pageIndex: 0,
                pageSize: 5,
                sortDir: 1,
                sortKey: "",
                totalRange: 0
            },
            pageSizeList: ["1", "5", "10", "20", "50"],
            list: []
        },
        selectors: {
            pager: ".fl-pager",
            headers: ".csc-listView-headers",
            row: ".csc-listView-row",
            show: ".csc-listView-show",
            perPage: ".csc-listView-perPage",
            pageSize: ".csc-listView-page-size",
            previous: ".csc-listView-previous",
            next: ".csc-listView-next",
            rows: ".csc-listView-rows"
        },
        selectorsToIgnore: ["pager", "rows"],
        styles: {
            row: "cs-listView-row",
            selected: "cs-selected",
            selecting: "cs-selecting"
        },
        produceTree: "cspace.listView.produceTree",
        components: {
            messageBar: "{messageBar}",
            dataSource: {
                type: "cspace.listView.dataSource"
            },
            permissionsResolver: "{permissionsResolver}",
            listNavigator: {
                type: "cspace.listView.listNavigator",
                createOnEvent: "pagerAfterRender",
                container: "{cspace.listView}.dom.rows",
                options: {
                    offset: "{cspace.listView}.model.offset",
                    selectors: {
                        row: "{cspace.listView}.options.selectors.row"
                    },
                    list: "{cspace.listView}.model.list"
                }
            },
            listPermissionStyler: {
                type: "cspace.listView.listPermissionStyler",
                createOnEvent: "pagerAfterRender",
                options: {
                    offset: "{cspace.listView}.model.offset",
                    rows: "{cspace.listView}.dom.row",
                    list: "{cspace.listView}.model.list"
                }
            },
            workflowStyler: {
                type: "cspace.util.workflowStyler",
                createOnEvent: "pagerAfterRender",
                options: {
                    offset: "{cspace.listView}.model.offset",
                    rows: "{cspace.listView}.dom.row",
                    list: "{cspace.listView}.model.list"
                }
            },
            pager: {
                type: "fluid.pager",
                createOnEvent: "afterRender",
                options: {
                    dataModel: "{cspace.listView}.model",
                    model: "{cspace.listView}.model.pagerModel",
                    dataOffset: "list",
                    sorter: cspace.listView.sorter,
                    columnDefs: {
                        expander: {
                            type: "fluid.deferredCall",
                            func: "cspace.listView.colDefsGenerator",
                            args: ["{cspace.listView}.model.columns", "{cspace.listView}.options.parentBundle"]
                        }
                    },
                    annotateColumnRange: {
                        expander: {
                            type: "fluid.deferredCall",
                            func: "cspace.listView.getColumnRange",
                            args: "{cspace.listView}.model.columns"
                        }
                    },
                    bodyRenderer: {
                        type: "fluid.pager.selfRender",
                        options: {
                            renderOptions: {
                                autoBind: true
                            }
                        }
                    },
                    pagerBar: {
                        type: "fluid.pager.pagerBar",
                        options: {
                            pageList: {
                                type: "fluid.pager.renderedPageList"
                            }
                        }
                    },
                    events: {
                        onModelChange: "{cspace.listView}.events.onModelChange"
                    },
                    listeners: {
                        afterRender: [{
                            listener: "{cspace.listView}.events.pagerAfterRender.fire"
                        }, {
                            listener: "{cspace.listView}.bindEvents"
                        }]
                    }
                }
            }
        },
        invokers: {
            select: "cspace.listView.select",
            styleAndActivate: "cspace.listView.styleAndActivate"
        },
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/ListViewTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        events: {
            onModelChange: null,
            afterUpdate: null,
            ready: null,
            onError: null,
            onSelect: null,
            pagerAfterRender: null
        },
        strings: {},
        parentBundle: "{globalBundle}",
        preInitFunction: "cspace.listView.preInit",
        finalInitFunction: "cspace.listView.finalInit",
        urls: cspace.componentUrlBuilder({
            listUrl: "%tenant/%tname/%recordType?pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey",
            navigate: "%webapp/html/%recordType.html?csid=%csid",
            navigateLocal: "%webapp/html/record.html?recordtype=%recordType&csid=%csid"
        }),
        elPath: "items",
        recordType: ""
    });

    cspace.listView.produceTree = function (that) {
        return {
            headers: {
                decorators: [{
                    type: "fluid",
                    func: "cspace.listView.headers",
                    options: {
                        model: {
                            columns: "${columns}"
                        }
                    }
                }, {
                    type: "attrs",
                    attributes: {
                        "rsf:id": "header:"
                    }
                }]
            },
            row: {
                decorators: [{
                    "addClass": "{styles}.row"
                }, {
                    type: "attrs",
                    attributes: {
                        "rsf:id": "row:"
                    }
                }, {
                    type: "fluid",
                    func: "cspace.listView.columns",
                    options: {
                        model: {
                            columns: "${columns}"
                        }
                    }
                }]
            },
            show: {
                messagekey: "listView-show"
            },
            perPage: {
                messagekey: "listView-perPage"
            },
            pageSize: {
                optionlist: "${pageSizeList}",
                optionnames: "${pageSizeList}",
                selection: "${pagerModel}.pageSize",
                decorators: {
                    type: "jQuery",
                    func: "prop",
                    args: {
                        disabled: that.options.disablePageSize
                    }
                }
            },
            next: {
                messagekey: "listView-next"
            },
            previous: {
                messagekey: "listView-previous"
            },
            nonSortableColumns: {} // Object with pair of recordType name : Array of column names which won't be sorted
        };
    };

    cspace.listView.produceTreeSidebar = function (that) {
        var tree = cspace.listView.produceTree(that);
        tree.show.messagekey = "listView-show-short";
        tree.next.messagekey = "listView-next-short";
        tree.previous.messagekey = "listView-previous-short";
        return tree;
    };

    fluid.demands("fluid.pager", "cspace.listView", ["{cspace.listView}.dom.pager", fluid.COMPONENT_OPTIONS]);

    cspace.listView.preInit = function (that) {
        // get a non sortable array of column names by recordType
        var nonSortable = fluid.get(that.options.nonSortableColumns, that.options.recordType) || [];
        
        fluid.each(that.model.columns, function (column) {
            fluid.each(["id", "name"], function (key) {
                column[key] = fluid.stringTemplate(column[key], {
                    recordType: that.options.recordType
                });
                // If column id in the nonSortable array then make the column non sortable
                if ($.inArray(column["id"], nonSortable) !== -1) {
                    column["sortable"] = false;
                }
            });
        });
        that.bindEvents = function () {
            $("a", that.locate("rows")).focus(function () {
                $(that.options.selectors["row"]).removeClass(that.options.styles.selected + " " + that.options.styles.selecting);
                $(this).parents("tr").addClass(that.options.styles.selecting);
            }).hover(function () {
                $(that.options.selectors["row"]).removeClass(that.options.styles.selecting);
            });
            that.locate("row").click(function () {
                that.styleAndActivate($(this), that.locate("row"));
            });
        };
        that.updateList = function (list) {
            var pagerModel = that.pager.model;
            var offset = pagerModel.pageIndex * pagerModel.pageSize;
            that.applier.requestChange("offset", offset);

            // TODO: THIS IS A HACK UNTIL THE SERVER SUPPORTS PAGINATION EVERYWHERE.
            if (list.length === 0 || that.options.stubbPagination) {
                that.applier.requestChange(fluid.model.composeSegments("list"), list);
            }
            fluid.each(list, function (row, index) {
                var fullIndex = offset + index;
                that.applier.requestChange(fluid.model.composeSegments("list", fullIndex), row);
            });
        };
        that.updateModel = function (model) {
            var initialUpdate;
            if (!model) {
                initialUpdate = true;
                model = that.pager.model;
            }
            var directModel = {
                recordType: that.options.recordType,
                pageNum: model.pageIndex,
                pageSize: model.pageSize,
                sortDir: model.sortDir,
                sortKey: model.sortKey || cspace.listView.getColumnRange(that.model.columns)
            };
            that.dataSource.get(directModel, function (data) {
                if (!data || data.isError) {
                    data = data || {};
                    if (!data.messages) {
                        var resolve = that.options.parentBundle.resolve;
                        data.messages = fluid.makeArray({
                            message: resolve("listView-error", [
                                resolve("listView-unknownError")
                            ])
                        });
                    }
                    var messages = data.messages || fluid.makeArray(data.message);
                    fluid.each(messages, function (message) {
                        that.messageBar.show(message.message, Date.today(), true);
                    });
                    that.events.onError.fire();
                    return;
                }
                that.updateList(fluid.get(data, that.options.elPath));

                // TODO: THIS IS A HACK UNTIL THE SERVER SUPPORTS PAGINATION EVERYWHERE.
                if (that.options.stubbPagination) {
                    fluid.set(data, "pagination.totalItems", that.model.list.length.toString())
                }

                that.pager.applier.requestChange("totalRange", parseInt(fluid.get(data, "pagination.totalItems"), 10));
                that.pager.events.initiatePageChange.fire({pageIndex: model.pageIndex, forceUpdate: true});
                that.events[initialUpdate ? "ready" : "afterUpdate"].fire(that);
            }, cspace.util.provideErrorCallback(that, that.dataSource.resolveUrl(directModel), "errorFetching"));
        };
    };

    cspace.listView.finalInit = function (that) {
        that.refreshView();

        function validChange (oldModel, newModel) {
            var valid = oldModel["sortKey"] !== newModel["sortKey"];
            valid = valid || fluid.find(["pageCount", "pageIndex", "pageSize", "sortDir", "totalRange"], function (field) {
                var oldVal = oldModel[field],
                    newVal = newModel[field];
                if (isNaN(oldVal)) {
                    return false;
                }
                if (isNaN(newVal)) {
                    return false;
                }
                if (oldVal !== newVal) {
                    return true;
                }
            });
            return !!valid;
        }

        that.pager.events.onModelChange.addListener(function (model, oldModel) {
            if (validChange(model, oldModel)) {
                that.updateModel(model);
            }
        });
        
        that.updateModel();
    };

    cspace.listView.styleAndActivate = function (that, row, rows) {
        $(that.options.selectors["row"]).removeClass(that.options.styles.selected + " " + that.options.styles.selecting);
        var index = that.model.offset + rows.index(row),
            record = that.model.list[index],
            recordtype = record.recordtype || record.sourceFieldType;
        if (!cspace.permissions.resolve({
            permission: "read",
            target: recordtype,
            resolver: that.permissionsResolver
        })) {
            return;
        }
        row.addClass(that.options.styles.selected);
        that.applier.requestChange("selectonIndex", index);
        that.events.onSelect.fire({
            recordType: recordtype,
            csid: record.csid
        });
    };

    fluid.demands("cspace.listView.styleAndActivate", "cspace.listView", {
        funcName: "cspace.listView.styleAndActivate",
        args: ["{cspace.listView}", "{arguments}.0", "{arguments}.1"]
    });

    fluid.demands("cspace.listView.listNavigator", ["cspace.listView", "cspace.localData"], {
        options: {
            finalInitFunction: "cspace.listView.listNavigator.finalInit",
            url: "{cspace.listView}.options.urls.navigateLocal"
        }
    });

    fluid.demands("cspace.listView.listNavigator", "cspace.listView", {
        options: {
            finalInitFunction: "cspace.listView.listNavigator.finalInit",
            url: "{cspace.listView}.options.urls.navigate"
        }
    });

    fluid.demands("cspace.listView.listNavigator", ["cspace.listView", "cspace.relatedRecordsTab"], {
        options: {
            finalInitFunction: "cspace.listView.listNavigator.finalInitEdit",
            invokers: {
                styleAndActivate: "cspace.listView.styleAndActivate",
                navigate: {
                    funcName: "cspace.listView.listNavigator.navigate",
                    args: ["{cspace.listView.listNavigator}", "{recordEditor}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                }
            },
            url: "#"
        }
    });

    fluid.demands("cspace.listView.listNavigator", ["cspace.listView", "cspace.relatedRecordsTab", "cspace.localData"], {
        options: {
            finalInitFunction: "cspace.listView.listNavigator.finalInitEdit",
            invokers: {
                styleAndActivate: "cspace.listView.styleAndActivate",
                navigate: {
                    funcName: "cspace.listView.listNavigator.navigate",
                    args: ["{cspace.listView.listNavigator}", "{recordEditor}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                }
            },
            url: "#"
        }
    });

    fluid.demands("cspace.listView.listNavigator", ["cspace.listView", "cspace.admin"], {
        options: {
            finalInitFunction: "cspace.listView.listNavigator.finalInitEdit",
            invokers: {
                styleAndActivate: "cspace.listView.styleAndActivate",
                navigate: {
                    funcName: "cspace.listView.listNavigator.navigate",
                    args: ["{cspace.listView.listNavigator}", "{recordEditor}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                }
            },
            url: "#"
        }
    });

    fluid.demands("cspace.listView.listNavigator", ["cspace.listView", "cspace.admin", "cspace.localData"], {
        options: {
            finalInitFunction: "cspace.listView.listNavigator.finalInitEdit",
            invokers: {
                styleAndActivate: "cspace.listView.styleAndActivate",
                navigate: {
                    funcName: "cspace.listView.listNavigator.navigate",
                    args: ["{cspace.listView.listNavigator}", "{recordEditor}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                }
            },
            url: "#"
        }
    });

    fluid.defaults("cspace.listView.listNavigator", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        typePath: "recordtype",
        selectors: {
            column: ".csc-listView-column"
        },
        offset: 0
    });

    cspace.listView.listNavigator.navigate = function (that, recordEditor, row, rows, evt) {
        if (!recordEditor) {
            that.styleAndActivate(row, rows);
            return;
        }
        recordEditor.globalNavigator.events.onPerformNavigation.fire(function () {
            that.styleAndActivate(row, rows);
        }, evt);
    };

    cspace.listView.listNavigator.finalInitEdit = function (that) {
        cspace.listView.listNavigator.finalInit(that);
        var rows = that.locate("row");
        fluid.each(rows, function (row, index) {
            var link = $("a", that.locate("column", rows.eq(index)));
            link.click(function (evt) {
                var row = $(this).parents(that.options.selectors.row);
                if (evt.shiftKey || evt.ctrlKey || evt.metaKey) {
                    return;
                }
                that.navigate(row, rows, evt);
                return false;
            });
        });
    };

    cspace.listView.listNavigator.finalInit = function (that) {
        var rows = that.locate("row");
        fluid.each(rows, function (row, index) {
            var record = that.options.list[that.options.offset + index];
            if (!record) {
                $(row).hide();
                return;
            }
            that.locate("column", rows.eq(index)).wrapInner($("<a/>").attr("href", fluid.stringTemplate(that.options.url, {
                recordType: record[that.options.typePath].toLowerCase(),
                csid: record.csid
            })));
        });
    };

   fluid.defaults("cspace.listView.listPermissionStyler", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "cspace.listView.listPermissionStyler.finalInit",
        components: {
            permissionsResolver: "{permissionsResolver}"
        },
        styles: {
            disabled: "cs-disabled"
        },
        offset: 0
    });

    cspace.listView.listPermissionStyler.finalInit = function (that) {
        fluid.each(that.options.rows, function (row, index) {
            var record = that.options.list[that.options.offset + index];
            if (!record) {
                return;
            }
            if (!cspace.permissions.resolve({
                permission: "read",
                target: record.recordtype || record.sourceFieldType,
                resolver: that.permissionsResolver
            })) {
                // Make links unclickable and also style them as read-only
                that.options.rows.eq(index).addClass(that.options.styles.disabled);
                that.options.rows.eq(index).find("a").attr("href", "#");
            }
        });
    };

    cspace.listView.colDefsGenerator = function (columns, globalBundle) {
        return fluid.transform(columns, function (column) {
            var key = column.id;
            return {
                key: key,
                valuebinding: "*." + key,
                components: {
                    value: "${" + fluid.model.composeSegments("*", key) + "}"
                },
                sortable: column.sortable,
                label: globalBundle.resolve(column.name)
            };
        });
    };

    cspace.listView.getColumnRange = function (columns) {
        return fluid.find(columns, function (column) {
            return column.id;
        });
    };
    
    fluid.demands("cspace.listView.dataSource",  ["cspace.localData", "cspace.listView"], {
        funcName: "cspace.listView.testDataSource",
        args: {
            targetTypeName: "cspace.listView.testDataSource",
            termMap: {
                recordType: "%recordType"
            }
        }
    });
    fluid.demands("cspace.listView.dataSource", ["cspace.listView"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.listView}.options.urls.listUrl",
            termMap: {
                recordType: "%recordType",
                pageNum: "%pageNum",
                pageSize: "%pageSize",
                sortDir: "%sortDir",
                sortKey: "%sortKey"
            },
            targetTypeName: "cspace.listView.dataSource"
        }
    });

    fluid.defaults("cspace.listView.testDataSource", {
        url: "%test/data/%recordType/records.json"
    });
    cspace.listView.testDataSource = cspace.URLDataSource;

    fluid.demands("cspace.listView.columns", "cspace.listView", {
        container: "{arguments}.0",
        mergeAllOptions: [{}, "{arguments}.1"]
    });

    fluid.defaults("cspace.listView.columns", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            column: ".csc-listView-column"
        },
        repeatingSelectors: ["column"],
        protoTree: {
            expander: {
                repeatID: "column",
                type: "fluid.renderer.repeat",
                pathAs: "column",
                valueAs: "columnValue",
                controlledBy: "columns",
                tree: {
                    decorators: {
                        type: "attrs",
                        attributes: {
                            "rsf:id": "${{column}.id}"                        
                        }
                    }
                }
            }
        },
        renderOnInit: true
    });
    
    fluid.demands("cspace.listView.headers", "cspace.listView", {
        container: "{arguments}.0",
        mergeAllOptions: [{}, "{arguments}.1"]
    });
    
    fluid.defaults("cspace.listView.headers", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            header: ".csc-listView-header"
        },
        repeatingSelectors: ["header"],
        protoTree: {
            expander: {
                repeatID: "header",
                type: "fluid.renderer.repeat",
                pathAs: "column",
                valueAs: "columnValue",
                controlledBy: "columns",
                tree: {
                    decorators: [{
                        type: "fluid",
                        func: "cspace.listView.headers.header",
                        options: {
                            model: "{columnValue}"
                        }
                    }, {
                        type: "fluid",
                        func: "cspace.listView.headers.sortable",
                        options: {
                            model: {
                                sortable: "${{column}.sortable}"
                            }
                        }
                    }]
                }
            }
        },
        renderOnInit: true
    });
    
    fluid.defaults("cspace.listView.headers.sortable", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        styles: {
            sortable: "flc-pager-sort-header"
        },
        finalInitFunction: "cspace.listView.headers.sortable.finalInit"
    });
    cspace.listView.headers.sortable.finalInit = function (that) {
        if (!that.model.sortable) {
            return;
        }
        that.container.addClass(that.options.styles.sortable);
    };
    
    fluid.demands("cspace.listView.headers.header", "cspace.listView.headers", {
        container: "{arguments}.0",
        mergeAllOptions: [{}, "{arguments}.1"]
    });
    
    fluid.defaults("cspace.listView.headers.header", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        selectors: {
            text: ".csc-listView-header-text",
            link: ".csc-listView-header-link"
        },
        styles: {
            link: "cs-listView-header-link"
        },
        protoTree: {
            expander: {
                type: "fluid.renderer.condition",
                condition: "${sortable}",
                trueTree: {
                    link: {
                        target: "#",
                        linktext: {
                            messagekey: "${name}"
                        },
                        decorators: [{
                            type: "attrs",
                            attributes: {
                                "rsf:id": "${id}"                        
                            }
                        }, {"addClass": "{styles}.link"}]
                    }
                },
                falseTree: {
                    text: {
                        messagekey: "${name}",
                        decorators: [{
                            type: "attrs",
                            attributes: {
                                "rsf:id": "${id}"                        
                            }
                        }]
                    }
                }
            }
        },
        strings: {},
        parentBundle: "{globalBundle}",
        renderOnInit: true
    });
    
    fluid.fetchResources.primeCacheFromResources("cspace.listView");
    
})(jQuery, fluid);
