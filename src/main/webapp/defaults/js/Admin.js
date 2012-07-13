/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";
    
    fluid.log("Admin.js loaded");

    fluid.defaults("cspace.admin", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        produceTree: "cspace.admin.produceTree",
        components: {
            instantiator: "{instantiator}",
            showAddButton: {
                type: "cspace.admin.showAddButton",
                options: {
                    model: "{admin}.model",
                    applier: "{admin}.applier"
                }
            },
            banner: {
                type: "cspace.admin.banner",
                container: "{admin}.dom.banner",
                createOnEvent: "afterRender",
                options: {
                    recordType: "{admin}.options.recordType",
                    recordEditor: "{admin}.dom.recordEditor",
                    model: {
                        strings: "{admin}.model.strings"
                    }
                }
            },
            adminListView: {
                type: "cspace.listView",
                container: "{admin}.dom.listView",
                createOnEvent: "afterRender",
                options: {
                    recordType: "{admin}.options.recordType",
                    urls: cspace.componentUrlBuilder({
                        listUrl: "%tenant/%tname/%recordType?pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey"
                    }),
                    elPath: "items",
                    produceTree: "cspace.listView.produceTreeSidebar",
                    model: {
                        pageSizeList: ["5", "10", "20", "50"],
                        columns: [{
                            sortable: false,
                            id: "number",
                            name: "%recordType-number"
                        }]
                    },
                    events: {
                        onSelect: "{admin}.events.onSelect"
                    },
                    listeners: {
                        ready: "{loadingIndicator}.events.hideOn.fire",
                        onModelChange: "{loadingIndicator}.events.showOn.fire",
                        afterUpdate: "{loadingIndicator}.events.hideOn.fire",
                        onError: "{loadingIndicator}.events.hideOn.fire"
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
            adminRecordEditor: {
                type: "cspace.recordEditor",
                container: "{admin}.dom.recordEditor",
                options: {
                    csid: "{admin}.selectedRecordCsid",
                    recordType: "{admin}.options.recordType",
                    globalRef: "adminModel",
                    listeners: {
                        afterRecordRender: [
                            "{loadingIndicator}.events.hideOn.fire",
                            "{admin}.events.recordEditorReady.fire"
                        ],
                        afterSave: "{admin}.afterRecordSave",
                        afterRemove: {
                            listener: "{admin}.afterRecordRemove",
                            priority: "last"
                        }
                    },
                    strings: "{admin}.model.strings"
                },
                createOnEvent: "onSelect"
            }
        },
        events: {
            onSelect: null,
            onCreateNewRecord: null,
            recordEditorReady: null,
            cleanPassword: {
                events: {
                    recordEditorReady: "{admin}.events.recordEditorReady"
                },
                args: ["{admin}"]
            }
        },
        listeners: {
            cleanPassword: "{admin}.cleanPassword",
            onCreateNewRecord: "{admin}.onCreateNewRecord",
            onSelect: [
                "{loadingIndicator}.events.showOn.fire",
                "{admin}.onSelectHandler"
            ]
        },
        preInitFunction: "cspace.admin.preInit",
        finalInitFunction: "cspace.admin.finalInit",
        parentBundle: "{globalBundle}",
        selectors: {
            listViewHeader: ".csc-admin-listViewHeader",
            listView: ".csc-admin-listView",
            recordEditorHeader: ".csc-admin-recordEditorHeader",
            recordEditor: ".csc-admin-recordEditor",
            add: ".csc-admin-add",
            banner: ".csc-admin-banner"
        },
        selectorsToIgnore: ["recordEditor", "listView", "banner"],
        model: {
            query: "",
            strings: {
                add: "%recordType-admin-add",
                listViewHeader: "%recordType-admin-listHeader",
                recordEditorHeader: "%recordType-admin-detailsHeader",
                bannerTop: "%recordType-admin-detailsNone",
                bannerBottom: "%recordType-admin-detaulsNoneSelected",
                removeSuccessfulMessage: "recordEditor-removeSuccessfulMessage",
                deleteFailedMessage: "recordEditor-deleteFailedMessage",
                fetchFailedMessage: "recordEditor-fetchFailedMessage"
            }
        },
        addButtonPermission: "create",
        strings: {}
    });

    cspace.admin.preInit = function (that) {
        that.model.strings = cspace.util.stringBuilder(that.model.strings, {
            vars: {
                recordType: that.options.recordType
            }
        });
        that.cleanPassword = function (that) {
            that.locate("password").val("");
        };
        that.afterRecordSave = function (model) {
            that.adminListView.updateModel();
        };
        that.afterRecordRemove = function () {
            var instantiator = that.instantiator,
                banner = "banner";
            that.adminListView.updateModel();
            instantiator.clearComponent(that, "adminRecordEditor");
            instantiator.clearComponent(that, banner);
            fluid.initDependent(that, banner, instantiator);
        };
        that.onSelectHandler = function (record) {
            that.selectedRecordCsid = record.csid;
        };
        that.onCreateNewRecord = function () {
            that.events.onSelect.fire({
                recordType: that.options.recordType
            });
        };
        that.add = function () {
            var globalNavigator = fluid.get(that, "adminRecordEditor.globalNavigator");
            if (!globalNavigator) {
                that.events.onCreateNewRecord.fire();
                return;
            }
            globalNavigator.events.onPerformNavigation.fire(function () {
                that.events.onCreateNewRecord.fire();
            });
        };
    };

    cspace.admin.preInitUserAdmin = function (that) {
        cspace.admin.preInit(that);
        that.onSave = function () {
            return that.validate();
        };
        that.processStatus = function () {
            if (that.options.userId !== fluid.get(that.adminRecordEditor.model, "fields.userId")) {
                return;
            }
            that.locate("status").add(that.locate("statusLabel")).hide();
        };
    };

    cspace.admin.finalInit = function (that) {
        that.refreshView();
    };

    cspace.admin.produceTree = function (that) {
        return {
            listViewHeader: {
                messagekey: "${strings.listViewHeader}"
            },
            recordEditorHeader: {
                messagekey: "${strings.recordEditorHeader}"
            },
            expander: {
                type: "fluid.renderer.condition",
                condition: "${showAddButton}",
                trueTree: {
                    add: {
                        messagekey: "${strings.add}",
                        decorators: {
                            type: "jQuery",
                            func: "click",
                            args: that.add
                        }
                    }
                }
            }
        };
    };

    cspace.admin.produceAdminUserTree = function (that) {
        return fluid.merge(null, cspace.admin.produceTree(that), {
            searchField: "${query}",
            searchNote: {
                messagekey: "users-searchNote"
            },
            searchButton: {
                messagekey: "users-search",
                decorators: {
                    type: "jQuery",
                    func: "click",
                    args: that.search
                }
            },
            unSearchButton: {
                messagekey: "users-unsearch",
                decorators: [{
                    addClass: "hidden"
                }, {
                    type: "jQuery",
                    func: "click",
                    args: that.unSearch
                }]
            }
        });
    };

    cspace.admin.assertRoleDisplay = function (displayString) {
        return displayString !== "none";
    };

    cspace.admin.search = function (that) {
        var globalNavigator = fluid.get(that, "adminRecordEditor.globalNavigator"),
            instantiator = that.instantiator,
            listView = "adminListView",
            recordEditor = "adminRecordEditor",
            banner = "banner";
        function search () {
            if (that[recordEditor]) {
                instantiator.clearComponent(that, recordEditor);
            }
            instantiator.clearComponent(that, banner);
            instantiator.clearComponent(that, listView);
            fluid.initDependent(that, banner, instantiator);
            fluid.initDependent(that, listView, instantiator);
            that.locate("unSearchButton").show();
        }
        if (!globalNavigator) {
            search();
            return;
        }
        globalNavigator.events.onPerformNavigation.fire(search);
    };

    cspace.admin.unSearch = function (that) {
        var globalNavigator = fluid.get(that, "adminRecordEditor.globalNavigator"),
            instantiator = that.instantiator,
            listView = "adminListView",
            recordEditor = "adminRecordEditor",
            banner = "banner";
        function unSearch () {
            that.locate("searchField").val("").change();
            that.locate("unSearchButton").hide();
            if (that[recordEditor]) {
                instantiator.clearComponent(that, recordEditor);
            }
            instantiator.clearComponent(that, banner);
            instantiator.clearComponent(that, listView);
            fluid.initDependent(that, banner, instantiator);
            fluid.initDependent(that, listView, instantiator);
        }
        if (!globalNavigator) {
            unSearch();
            return;
        }
        globalNavigator.events.onPerformNavigation.fire(unSearch);
    };

    cspace.admin.validate = function (that, messageBar, passwordValidator) {
        var password = that.locate("password");
        if (password.is(":visible")) {
            var pwd = password.val();
            if (pwd !== that.locate("passwordConfirm").val()) {
                messageBar.show(that.options.parentBundle.resolve("admin-passwordsDoNotMatch"), null, true);
                return false;
            }
            
            if (!that.selectedRecordCsid) {
                if (!passwordValidator.validateLength(pwd)) {
                    return false;
                }
            }
            
            if (pwd.length > 0 && !passwordValidator.validateLength(pwd)) {
                return false;
            }
        }
        return true;
    };

    cspace.admin.isCurrentUser = function (sessionUser, currentUser) {
        return sessionUser !== currentUser;
    };

    fluid.defaults("cspace.admin.showAddButton", {
        gradeNames: ["autoInit", "fluid.modelComponent"],
        components: {
            permissionsResolver: "{permissionsResolver}"
        },
        recordType: "{cspace.admin}.options.recordType",
        addButtonPermission: "{cspace.admin}.options.addButtonPermission",
        finalInitFunction: "cspace.admin.showAddButton.finalInit"
    });

    cspace.admin.showAddButton.finalInit = function (that) {
        if (that.options.recordType === "termlist") {
            that.applier.requestChange("showAddButton", false);
            return;
        }
        that.applier.requestChange("showAddButton", cspace.permissions.resolve({
            permission: that.options.addButtonPermission,
            target: that.options.recordType,
            resolver: that.permissionsResolver
        }));
    };

    fluid.defaults("cspace.admin.banner", {
        gradeNames: ["autoInit", "fluid.rendererComponent"],
        events: {
            onSelect: {
                event: "{cspace.admin}.events.onSelect"
            }
        },
        listeners: {
            onSelect: "{cspace.admin.banner}.onSelectHandler"
        },
        selectors: {
            bannerTop: ".csc-admin-bannerTop",
            bannerBottom: ".csc-admin-bannerBottom"
        },
        selectorsToIgnore: "recordEditor",
        styles: {
            bannerTop: "cs-admin-bannerTop",
            bannerBottom: "cs-admin-bannerBottom"
        },
        strings: {},
        parentBundle: "{globalBundle}",
        protoTree: {
            bannerTop: {
                messagekey: "${strings.bannerTop}",
                decorators: {
                    addClass: "{styles}.bannerTop"
                }
            },
            bannerBottom: {
                messagekey: "${strings.bannerBottom}",
                decorators: {
                    addClass: "{styles}.bannerBottom"
                }
            }
        },
        renderOnInit: true,
        preInitFunction: "cspace.admin.banner.preInit",
        postInitFunction: "cspace.admin.banner.postInit"
    });

    cspace.admin.banner.preInit = function (that) {
        that.onSelectHandler = function () {
            that.options.recordEditor.show();
            that.container.hide();
        };
    };

    cspace.admin.banner.postInit = function (that) {
        that.container.show();
        that.options.recordEditor.hide();
    };

    fluid.demands("cspace.admin.search", "cspace.admin", {
        funcName: "cspace.admin.search",
        args: ["{admin}"]
    });

    fluid.demands("cspace.admin.unSearch", "cspace.admin", {
        funcName: "cspace.admin.unSearch",
        args: ["{admin}"]
    });

    fluid.demands("cspace.admin.validate", "cspace.admin", {
        funcName: "cspace.admin.validate",
        args: ["{admin}", "{messageBar}", "{passwordValidator}"]
    });

    fluid.demands("cspace.listView.dataSource",  ["cspace.localData", "cspace.listView", "cspace.admin"], {
        funcName: "cspace.listView.testDataSourceAdmin",
        args: {
            targetTypeName: "cspace.listView.testDataSourceAdmin",
            termMap: {
                recordType: "{admin}.options.recordType"
            }
        }
    });
    fluid.demands("cspace.listView.dataSource", ["cspace.listView", "cspace.admin"], {
        funcName: "cspace.URLDataSource",
        args: {
            url: "{cspace.listView}.options.urls.listUrl",
            termMap: {
                recordType: "{admin}.options.recordType",
                query: "{admin}.model.query",
                pageNum: "%pageNum",
                pageSize: "%pageSize",
                sortDir: "%sortDir",
                sortKey: "%sortKey"
            },
            targetTypeName: "cspace.listView.dataSource"
        }
    });

    fluid.defaults("cspace.listView.testDataSourceAdmin", {
        url: "%test/data/%recordType/records.json"
    });
    cspace.listView.testDataSourceAdmin = cspace.URLDataSource;
    
})(jQuery, fluid);