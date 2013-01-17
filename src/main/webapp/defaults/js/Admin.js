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

    // cspace.admin component used for every administration tab.
    fluid.defaults("cspace.admin", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        produceTree: "cspace.admin.produceTree",
        components: {
            instantiator: "{instantiator}",
            // A subcomponent responsible for showing/hiding the add button
            // that lets the user create a new admin record.
            showAddButton: {
                type: "cspace.admin.showAddButton",
                options: {
                    model: "{admin}.model",
                    applier: "{admin}.applier"
                }
            },
            // A subcomponent that is initially displayed when the admin page
            // loads.
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
            // A paginated list portion of any admin page. It is used to display
            // the list of admin records.
            adminListView: {
                type: "cspace.listView",
                container: "{admin}.dom.listView",
                createOnEvent: "afterRender",
                options: {
                    recordType: "{admin}.options.recordType",
                    // URL to fetch the list of admin records from.
                    urls: cspace.componentUrlBuilder({
                        listUrl: "%tenant/%tname/%recordType?pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey"
                    }),
                    // Path to the list data in the list payload.
                    elPath: "items",
                    produceTree: "cspace.listView.produceTreeSidebar",
                    // Model for the pager.
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
                        ready: [
                            "{loadingIndicator}.events.hideOn.fire",
                            "{admin}.events.ready.fire"
                        ],
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
            // Subcomponent responsible for rendering and editing the admin
            // records.
            adminRecordEditor: {
                type: "cspace.recordEditor",
                container: "{admin}.dom.recordEditor",
                options: {
                    csid: "{admin}.selectedRecordCsid",
                    recordType: "{admin}.options.recordType",
                    globalRef: "adminModel",
                    listeners: {
                        afterInit: [
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
            ready: null,
            onSelect: null,
            onCreateNewRecord: null,
            recordEditorReady: null
        },
        listeners: {
            recordEditorReady: "{admin}.clearPassword",
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
        elPaths: {
            adminRecordEditorCsid: "csid"
        },
        strings: {}
    });

    // Initial admin component setup.
    cspace.admin.preInit = function (that) {
        // Expand all strings in the model and resolve recordType.
        that.model.strings = cspace.util.stringBuilder(that.model.strings, {
            vars: {
                recordType: that.options.recordType
            }
        });
        // Clearing password fields once Admin page is loaded.
        // NOTE: We might want to get rid of this once server is changed NOT
        // to return password back.
        that.clearPassword = function () {
            that.locate("password").val("");
            that.locate("passwordConfirm").val("");
        };
        // Listener for the record editor's after save event.
        that.afterRecordSave = function (model) {
            // Trigger list's update.
            that.adminListView.updateModel();
            that.selectedRecordCsid = fluid.get(that.adminRecordEditor.model, that.options.elPaths.adminRecordEditorCsid);
        };
        // Listener for the record editor's after remove event.
        that.afterRecordRemove = function () {
            // Recreate the banner, remove the record editor component.
            // Trigger list's update.
            var instantiator = that.instantiator,
                banner = "banner";
            that.adminListView.updateModel();
            instantiator.clearComponent(that, "adminRecordEditor");
            instantiator.clearComponent(that, banner);
            fluid.initDependent(that, banner, instantiator);
        };
        // Listener for the event that fires when admin record is selected.
        that.onSelectHandler = function (record) {
            that.selectedRecordCsid = record.csid;
        };
        // Listener for the event that is fired when the user wants to
        // create a new admin record.
        that.onCreateNewRecord = function () {
            that.events.onSelect.fire({
                recordType: that.options.recordType
            });
        };
        // A wrapper that is taking care of unsaved data before the
        // onCreateNewRecord event is fired.
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

    // Additional admin component setup for user administration page.
    cspace.admin.preInitUserAdmin = function (that) {
        cspace.admin.preInit(that);
        // Validate before save.
        that.onSave = function () {
            return that.validate();
        };
        // Status can only be changed for other users.
        that.processStatus = function () {
            if (that.options.userId !== fluid.get(that.adminRecordEditor.model, "fields.userId")) {
                return;
            }
            that.locate("status").add(that.locate("statusLabel")).hide();
        };
    };

    // Render the admin component at the end of initialization.
    cspace.admin.finalInit = function (that) {
        that.refreshView();
    };

    // A generic protoTree for the admin component.
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

    // User admin specific protoTree.
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

    // Only display roles that have display setting not set to "none."
    cspace.admin.assertRoleDisplay = function (displayString) {
        return displayString !== "none";
    };

    // User admin related search functionality.
    cspace.admin.search = function (that) {
        var globalNavigator = fluid.get(that, "adminRecordEditor.globalNavigator"),
            instantiator = that.instantiator,
            listView = "adminListView",
            recordEditor = "adminRecordEditor",
            banner = "banner";
        function search () {
            // Recreate the list view component with search results.
            // Recreate the banner since the old list is ivalid.
            that.events.onSearch.fire();
            if (that[recordEditor]) {
                instantiator.clearComponent(that, recordEditor);
            }
            instantiator.clearComponent(that, banner);
            instantiator.clearComponent(that, listView);
            fluid.initDependent(that, banner, instantiator);
            fluid.initDependent(that, listView, instantiator);
            that.locate("unSearchButton").show();
            that.events.afterSearch.fire();
        }
        if (!globalNavigator) {
            search();
            return;
        }
        // Make sure data is saved, if aplicable.
        globalNavigator.events.onPerformNavigation.fire(search);
    };

    // User admin related unsearch functionality.
    cspace.admin.unSearch = function (that) {
        var globalNavigator = fluid.get(that, "adminRecordEditor.globalNavigator"),
            instantiator = that.instantiator,
            listView = "adminListView",
            recordEditor = "adminRecordEditor",
            banner = "banner";
        function unSearch () {
            // Recreate the list view component with search results.
            // Recreate the banner since the old list is ivalid.
            that.events.onUnSearch.fire();
            that.locate("searchField").val("").change();
            that.locate("unSearchButton").hide();
            if (that[recordEditor]) {
                instantiator.clearComponent(that, recordEditor);
            }
            instantiator.clearComponent(that, banner);
            instantiator.clearComponent(that, listView);
            fluid.initDependent(that, banner, instantiator);
            fluid.initDependent(that, listView, instantiator);
            that.events.afterUnSearch.fire();
        }
        if (!globalNavigator) {
            unSearch();
            return;
        }
        // Make sure data is saved, if aplicable.
        globalNavigator.events.onPerformNavigation.fire(unSearch);
    };

    // Validate passowords.
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

    // Verify is user is editing its own record.
    cspace.admin.isCurrentUser = function (sessionUser, currentUser) {
        return sessionUser !== currentUser;
    };

    // Component that is responsible for add new admin record button
    // visibility.
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
        // Dissallow adding new term list records.
        if (that.options.recordType === "termlist") {
            that.applier.requestChange("showAddButton", false);
            return;
        }
        // Display add button if user has appropriate permissions.
        that.applier.requestChange("showAddButton", cspace.permissions.resolve({
            permission: that.options.addButtonPermission,
            target: that.options.recordType,
            resolver: that.permissionsResolver
        }));
    };

    // Message banner that is displayed by default on admin page load.
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
        // Hide itself if user selects an admin record.
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
    
    fluid.demands("cspace.admin.clearPassword", "cspace.admin", {
        funcName: "cspace.admin.clearPassword",
        args: ["{admin}"]
    });

    fluid.demands("cspace.admin.validate", "cspace.admin", {
        funcName: "cspace.admin.validate",
        args: ["{admin}", "{messageBar}", "{passwordValidator}"]
    });

    // Data source used to fetch lists of admin records.
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