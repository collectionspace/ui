/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.log("RelatedRecordsList.js loaded");
    
    fluid.defaults("cspace.relatedRecordsList", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        components: {
            recordTypes: "{recordTypes}",
            relationManager: {
                type: "cspace.relationManager",
                container: "{relatedRecordsList}.dom.relationManagerSelector",
                options: {
                    primary: "{relatedRecordsList}.options.primary",
                    related: "{relatedRecordsList}.options.related",
                    model: {
                        addButton: "relationManager-addButton"
                    },
                    events: {
                        afterAddRelation: "{cspace.relatedRecordsList}.events.afterAddRelation"
                    }
                }
            },
            rrlListView: {
                type: "cspace.listView",
                container: "{relatedRecordsList}.dom.listViewSelector",
                createOnEvent: "primaryRecordCreated",
                options: {
                    recordType: "{relatedRecordsList}.options.related",
                    urls: cspace.componentUrlBuilder({
                        listUrl: "%tenant/%tname/%primary/%related/%csid?pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey"
                    }),
                    produceTree: "cspace.listView.produceTreeSidebar",
                    elPath: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "fluid.stringTemplate",
                            args: ["results.%recordType", {
                                recordType: "{relatedRecordsList}.options.related"
                            }]
                        }
                    },
                    model: {
                        pageSizeList: ["5", "10", "20", "50"],
                        columns: [{
                            sortable: true,
                            id: "number",
                            name: "%recordType-number"
                        }, {
                            sortable: true,
                            id: "summary",
                            name: "title"
                        }, {
                            sortable: true,
                            id: "summarylist.updatedAt",
                            name: "updatedAt"
                        }]
                    },
                    components: {
                        pager: {
                            options: {
                                summary: {
                                    options: {
                                        message: {
                                            expander: {
                                                type: "fluid.deferredInvokeCall",
                                                func: "cspace.util.resolveMessage",
                                                args: ["{globalBundle}", "listView-total-short"]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            listBanner: {
                type: "cspace.sidebar.banner",
                container: "{relatedRecordsList}.dom.banner",
                options: {
                    selectors: {
                        list: "{relatedRecordsList}.dom.recordListSelector"
                    }
                }
            },
            togglableRelated: {
                type: "cspace.util.togglable",
                container: "{relatedRecordsList}.container",
                options: {
                    selectors: {
                        header: "{relatedRecordsList}.options.selectors.header",
                        togglable: "{relatedRecordsList}.options.selectors.togglable"
                    }
                }
            }
        },
        events: {
            afterAddRelation: null,
            relationsUpdated: {
                event: "{globalEvents}.events.relationsUpdated",
                args: "{relatedRecordsList}.options.related"
            },
            primaryRecordCreated: {
                event: "{globalEvents}.events.primaryRecordCreated"
            },
            relatedRelationsUpdated: null
        },
        listeners: {
            relationsUpdated: "{relatedRecordsList}.relationsUpdatedHandler",
            relatedRelationsUpdated: "{relatedRecordsList}.relatedRelationsUpdatedHandler",
            afterAddRelation: [
                "{relatedRecordsList}.events.relationsUpdated.fire"
            ]
        },
        parentBundle: "{globalBundle}",
        protoTree: {
            mainHeader: {
                messagekey: "${related}"
            }
        },
        selectors: {
            relationManagerSelector: ".csc-relatedRecordsList-relationManager",
            listViewSelector: ".csc-listViewSelector",
            mainHeader: ".csc-related-mainheader",
            header: ".csc-related-header",
            togglable: ".csc-related-togglable",
            banner: ".csc-sidebar-bannerContainer"
        },
        selectorsToIgnore: ["relationManagerSelector", "listViewSelector", "header", "togglable", "banner"],
        strings: {},
        renderOnInit: true,
        resources: {
            template: cspace.resourceSpecExpander({
                fetchClass: "fastTemplate",
                url: "%webapp/html/components/RelatedRecordListTemplate.html",
                options: {
                    dataType: "html"
                }
            })
        },
        preInitFunction: "cspace.relatedRecordsList.preInit"
    });

    cspace.relatedRecordsList.preInit = function (that) {
        that.relatedListTag = fluid.typeTag("cspace.relatedRecordsList.related");
        that.relationsUpdatedHandler = function (related) {
            if (related !== that.options.related) {
                return;
            }
            that.events.relatedRelationsUpdated.fire();
        };
        that.relatedRelationsUpdatedHandler = function () {
            that.rrlListView.updateModel();
        };
    };

    fluid.demands("cspace.listView.dataSource",  ["cspace.localData", "cspace.listView", "cspace.sidebar", "cspace.relatedRecordsList.related"], {
        funcName: "cspace.relatedRecordsList.testDataSourceRelatedRecordsList",
        args: {
            targetTypeName: "cspace.relatedRecordsList.testDataSourceRelatedRecordsList",
            termMap: {
                primary: "{cspace.relatedRecordsList}.options.primary",
                related: "{cspace.relatedRecordsList}.options.related",
                csid: "{globalModel}.model.primaryModel.csid"
            },
            responseParser: "cspace.listView.responseParserTab"
        }
    });
    fluid.demands("cspace.listView.dataSource", ["cspace.listView", "cspace.sidebar", "cspace.relatedRecordsList.related"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.listView}.options.urls.listUrl",
            termMap: {
                primary: "{cspace.relatedRecordsList}.options.primary",
                related: "{cspace.relatedRecordsList}.options.related",
                csid: "{cspace.relatedRecordsTab}.options.csid",
                pageNum: "%pageNum",
                pageSize: "%pageSize",
                sortDir: "%sortDir",
                sortKey: "%sortKey"
            },
            targetTypeName: "cspace.listView.dataSource",
            responseParser: "cspace.listView.responseParserTab"
        }
    });

    fluid.defaults("cspace.relatedRecordsList.testDataSourceRelatedRecordsList", {
        url: "%test/data/%primary/%related/%csid.json"
    });
    cspace.relatedRecordsList.testDataSourceRelatedRecordsList = cspace.URLDataSource;

    fluid.fetchResources.primeCacheFromResources("cspace.relatedRecordsList");
})(jQuery, fluid);
