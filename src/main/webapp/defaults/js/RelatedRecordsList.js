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
                    elPath: "items",
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
                    },
                    listeners: {
                        afterUpdate: "{relatedRecordsList}.events.listUpdated.fire",
                        ready: "{relatedRecordsList}.events.listUpdated.fire",
                        onError: "{loadingIndicator}.events.hideOn.fire"
                    }
                }
            },
            listBanner: {
                type: "cspace.relatedRecordsList.banner",
                container: "{relatedRecordsList}.dom.banner",
                options: {
                    list: "{relatedRecordsList}.dom.listViewSelector"
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
                event: "{globalEvents}.events.relationsUpdated"
            },
            primaryRecordCreated: {
                event: "{globalEvents}.events.primaryRecordCreated"
            },
            listUpdated: null,
            relatedRelationsUpdated: null
        },
        listeners: {
            listUpdated: "{relatedRecordsList}.listUpdatedHandler",
            relationsUpdated: "{relatedRecordsList}.relationsUpdatedHandler",
            relatedRelationsUpdated: "{relatedRecordsList}.relatedRelationsUpdatedHandler",
            afterAddRelation: [
                "{relatedRecordsList}.events.relationsUpdated.fire"
            ]
        },
        category: [],
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
        that.relatedListTypeTag = fluid.typeTag(fluid.model.composeSegments("cspace.relatedRecordsList", that.options.related));
        that.relationsUpdatedHandler = function (related) {
            if (related !== that.options.related && !fluid.find(that.options.category, function (recordType) {
                if (recordType === related) {return true;}
            })) {
                return;
            }
            that.events.relatedRelationsUpdated.fire();
        };
        that.relatedRelationsUpdatedHandler = function () {
            that.rrlListView.updateModel();
        };
        that.listUpdatedHandler = function () {
            var showBanner = fluid.get(that.rrlListView.model, "list").length < 1;
            that.listBanner.events[showBanner ? "showBanner": "hideBanner"].fire();
        };
    };

    fluid.defaults("cspace.relatedRecordsList.banner", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        events: {
            hideBanner: null,
            showBanner: null
        },
        listeners: {
            hideBanner: "{cspace.relatedRecordsList.banner}.hideHandler",
            showBanner: "{cspace.relatedRecordsList.banner}.showBanner"
        },
        selectors: {
            banner: ".csc-sidebar-banner",
            bannerMessage: ".csc-sidebar-banner-message"
        },
        styles: {
            banner: "cs-sidebar-banner",
            bannerMessage: "cs-sidebar-banner-message"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            banner: {
                decorators: {
                    addClass: "{styles}.banner"
                }
            },
            bannerMessage: {
                messagekey: "sidebar-banner-message",
                args: [],
                decorators: {
                    addClass: "{styles}.bannerMessage"
                }
            }
        },
        renderOnInit: true,
        preInitFunction: "cspace.relatedRecordsList.banner.preInit",
        postInitFunction: "cspace.relatedRecordsList.banner.postInit"
    });

    cspace.relatedRecordsList.banner.preInit = function (that) {
        that.showBanner = function () {
            that.options.list.hide();
            that.locate("banner").show();
        };
        that.hideHandler = function () {
            that.locate("banner").hide();
            that.options.list.show();
        };
    };

    cspace.relatedRecordsList.banner.postInit = function (that) {
        that.locate("banner").show();
        that.options.list.hide();
    };

    fluid.demands("cspace.listView.dataSource",  ["cspace.localData", "cspace.listView", "cspace.sidebar", "cspace.relatedRecordsList.related"], {
        funcName: "cspace.relatedRecordsList.testDataSourceRelatedRecordsList",
        args: {
            targetTypeName: "cspace.relatedRecordsList.testDataSourceRelatedRecordsList",
            termMap: {
                primary: "{cspace.relatedRecordsList}.options.primary",
                related: "{cspace.relatedRecordsList}.options.related",
                csid: "{globalModel}.model.primaryModel.csid"
            }
        }
    });
    fluid.demands("cspace.listView.dataSource", ["cspace.listView", "cspace.sidebar", "cspace.relatedRecordsList.related"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.listView}.options.urls.listUrl",
            termMap: {
                primary: "{cspace.relatedRecordsList}.options.primary",
                related: "{cspace.relatedRecordsList}.options.related",
                csid: "{globalModel}.model.primaryModel.csid",
                pageNum: "%pageNum",
                pageSize: "%pageSize",
                sortDir: "%sortDir",
                sortKey: "%sortKey"
            },
            targetTypeName: "cspace.listView.dataSource"
        }
    });

    fluid.demands("cspace.listView.dataSource",  ["cspace.localData", "cspace.listView", "cspace.sidebar", "cspace.relatedRecordsList.related", "cspace.relatedRecordsList.authorities"], {
        funcName: "cspace.relatedRecordsList.testDataSourceRelatedRecordsList",
        args: {
            targetTypeName: "cspace.relatedRecordsList.testDataSourceRelatedRecordsList",
            termMap: {
                primary: "{cspace.relatedRecordsList}.options.primary",
                related: "{cspace.relatedRecordsList}.options.related",
                csid: "{globalModel}.model.primaryModel.csid"
            },
            responseParser: "cspace.relatedRecordsList.responseParserAuth"
        }
    });
    fluid.demands("cspace.listView.dataSource", ["cspace.listView", "cspace.sidebar", "cspace.relatedRecordsList.related", "cspace.relatedRecordsList.authorities"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.listView}.options.urls.listUrl",
            termMap: {
                primary: "{cspace.relatedRecordsList}.options.primary",
                related: "{cspace.relatedRecordsList}.options.related",
                csid: "{globalModel}.model.primaryModel.csid",
                pageNum: "%pageNum",
                pageSize: "%pageSize",
                sortDir: "%sortDir",
                sortKey: "%sortKey"
            },
            targetTypeName: "cspace.listView.dataSource",
            responseParser: "cspace.relatedRecordsList.responseParserAuth"
        }
    });

    fluid.defaults("cspace.relatedRecordsList.testDataSourceRelatedRecordsList", {
        url: "%test/data/%primary/%related/%csid.json"
    });
    cspace.relatedRecordsList.testDataSourceRelatedRecordsList = cspace.URLDataSource;

    cspace.relatedRecordsList.responseParserAuth = function (data) {
        return data.termsUsed;
    };

    fluid.fetchResources.primeCacheFromResources("cspace.relatedRecordsList");
})(jQuery, fluid);