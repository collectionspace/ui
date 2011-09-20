/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.defaults("cspace.listEditor", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        invokers: {
            refreshView: {
                funcName: "cspace.listEditor.refreshView",
                args: "{listEditor}"
            },
            bindEvents: {
                funcName: "cspace.listEditor.bindEvents",
                args: "{listEditor}"
            },
            updateList: "updateList",
            hideDetails: {
                funcName: "cspace.listEditor.hideDetails",
                args: ["{listEditor}.dom", "{listEditor}.events"]
            },
            showDetails: {
                funcName: "cspace.listEditor.showDetails",
                args: ["{listEditor}.dom", {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.listEditor.newDetails",
                        args: "{listEditor}.options.detailsModel"
                    }
                }, "{listEditor}.events"]
            },
            addNewListRow: {
                funcName: "cspace.listEditor.addNewListRow",
                args: "{listEditor}"
            },
            displayErrorMessage: "cspace.util.displayErrorMessage",
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{globalBundle}.messageBase", "{arguments}.0"]
            }
        },
        parentBundle: "{globalBundle}",
        events: {
            beforeCreateList: null,
            detailsModelChanged: null,
            pageReady: null,
            afterAddNewListRow: null,
            afterHideDetails: null,
            afterShowDetails: null,
            onListUpdate: null,
            afterListUpdate: null
        },
        preInitFunction: "cspace.listEditor.preInitFunction",
        finalInitFunction: "cspace.listEditor.finalInitFunction",
        detailsModel: {},
        selectors: {
            list: ".csc-listEditor-list",
            details: ".csc-listEditor-details",
            detailsNone: ".csc-listEditor-details-none",
            hideOnCreate: ".csc-details-hideOnCreate",
            hideOnEdit: ".csc-details-hideOnEdit",
            addNewListRowButton: ".csc-listEditor-createNew"
        },
        urls: {},
        globalNavigator: "{globalNavigator}",
        messageBar: "{messageBar}",
        components: {
            listLoadingIndicator: {
                type: "cspace.util.loadingIndicator",
                container: "{listEditor}.dom.list",
                options: {
                    events: {
                        showOn: "{listEditor}.events.onListUpdate",
                        hideOn: "{listEditor}.events.afterListUpdate"
                    }
                }
            },
            listSource: {
                type: "cspace.listEditor.listDataSource"
            },
            detailsDC: {
                type: "cspace.dataContext",
                options: {
                    recordType: "{listEditor}.options.recordType",
                    dataType: "json",
                    fileExtension: "",
                    model: "{listEditor}.options.detailsModel"
                }
            },
            list: {
                type: "cspace.recordList",
                createOnEvent: "beforeCreateList",
                options: {
                    elPaths: {
                        items: "items"
                    },
                    model: "{listEditor}.options.listModel",
                    showNumberOfItems: false
                }
            },
            details: {
                type: "cspace.recordEditor",
                options: {
                    deferRendering: true,
                    applier: "{listEditor}.options.detailsApplier",
                    model: "{listEditor}.options.detailsModel",
                    uispec: "{listEditor}.options.uispec.details"
                }
            }
        },
        mergePolicy: {
            listModel: "preserve",
            detailsModel: "preserve"
        }
    });
    
    cspace.listEditor.preInitFunction = function (that) {
        that.options.detailsApplier = fluid.makeChangeApplier(that.options.detailsModel);
    };
    
    cspace.listEditor.finalInitFunction = function (that) {
        that.detailsDC.initDataSource();
        that.bindEvents();
        if (!that.options.listModel) {
            that.events.onListUpdate.fire();
            that.updateList(function (listModel) {
                that.options.listModel = listModel;
                that.events.beforeCreateList.fire();
                that.events.afterListUpdate.fire();
            });
        }
        else {
            that.events.beforeCreateList.fire();
        }
        that.hideDetails();
    };
    
    var provideSuccessCallback = function (that, callback) {
        return function (data) {
            if (!data) {
                that.displayErrorMessage(fluid.stringTemplate(that.lookupMessage("emptyResponse"), {
                    url: that.listSource.options.url
                }));
                return;
            }
            if (data.isError === true) {
                fluid.each(data.messages, function (message) {
                    that.displayErrorMessage(message);
                });
            }
            callback.apply(null, arguments);
        };
    };
    
    var getList = function (that, callback, termMap) {
        that.events.onListUpdate.fire();
        that.listSource.get(termMap, provideSuccessCallback(that, callback), cspace.util.provideErrorCallback(that, that.listSource.options.url, "errorFetching"));
    };
    
    cspace.listEditor.updateListRelated = function (that, primary, csid, callback) {
        callback = (typeof callback === "function") ? callback : function (listModel) {
            that.list.applier.requestChange(that.list.options.elPaths.items, listModel[that.options.recordType]);
            that.refreshView();
        };
        getList(that, callback, {
            recordType: primary,
            csid: csid
        });
    };
    
    var updatelistcallback = function (that) {
        return function (listmodel) {
            that.list.applier.requestChange(that.list.options.elPaths.items, listmodel[that.list.options.elPaths.items]);
            that.refreshView();
        };
    };
    
    cspace.listEditor.updateListUsers = function (that, searchField, callback) {
        callback = (typeof callback === "function") ? callback : updatelistcallback(that);
        getList(that, callback, {
            query: searchField.val() || "",
            recordType: that.options.recordType
        });
    };
    
    cspace.listEditor.updateList = function (that, callback) {
        callback = (typeof callback === "function") ? callback : updatelistcallback(that);
        getList(that, callback, {
            recordType: that.options.recordType
        });
    };
    
    cspace.listEditor.hideDetails = function (dom, events) {
        dom.locate("details").hide();
        dom.locate("detailsNone").show();
        events.afterHideDetails.fire();
    };
    
    cspace.listEditor.showDetails = function (dom, newDetails, events) {
        dom.locate("detailsNone").hide();
        dom.locate("details").show();
        if (newDetails) {
            dom.locate("hideOnCreate").hide();
            dom.locate("hideOnEdit").show();
        } else {
            dom.locate("hideOnEdit").hide();
            dom.locate("hideOnCreate").show();
        }
        events.afterShowDetails.fire();
    };
    
    cspace.listEditor.newDetails = function (detailsModel) {
        return !detailsModel.csid;
    };
    
    cspace.listEditor.bindEvents = function (that) {
        that.events.detailsModelChanged.addListener(that.showDetails);
        that.events.beforeCreateList.addListener(function () {
            that.events.pageReady.fire(that);
        });
        
        that.locate("addNewListRowButton").click(that.addNewListRow);
        
        that.detailsDC.events.afterSave.addListener(that.updateList);
        that.detailsDC.events.afterRemove.addListener(function () {
            that.hideDetails();
        });
        that.detailsDC.events.afterCreate.addListener(function () {
            that.list.handleNewRow("hide");
        });
    };
    
    cspace.listEditor.addNewListRow = function (that) {
        that.options.globalNavigator.events.onPerformNavigation.fire(function () {
            that.list.handleNewRow("show");
            that.detailsDC.fetch();
            that.events.afterAddNewListRow.fire();
        });
    };
    
    cspace.listEditor.refreshView = function (that) {
        that.list.refreshView();
        that.hideDetails();
        that.events.afterListUpdate.fire();
    };
    
    fluid.defaults("cspace.listEditor.testUsersListSearchDataSource", {
        url: "%test/data/users/search.json"
    });
    cspace.listEditor.testUsersListSearchDataSource = cspace.URLDataSource;
    
    fluid.defaults("cspace.listEditor.testListDataSource", {
        url: "%test/data/%recordType/records.json"
    });
    cspace.listEditor.testListDataSource = cspace.URLDataSource;
    
    fluid.defaults("cspace.listEditor.testTabsListDataSource", {
        url: "%test/data/%recordType/%csid.json",
        responseParser: "cspace.listEditor.responseParseTabs"
    });
    cspace.listEditor.testTabsListDataSource = cspace.URLDataSource;
    
    cspace.listEditor.responseParseTabs = function (data) {
        return data.relations;
    };
    
    cspace.listEditor.responseParseUsers = function (data) {
        return {
            items: data.results
        };
    };
    
})(jQuery, fluid);
