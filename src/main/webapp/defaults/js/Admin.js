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
            globalSetup: "{globalSetup}",
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
                        afterRecordRender: "{loadingIndicator}.events.hideOn.fire",
                        afterSave: "{admin}.afterRecordSave",
                        afterRemove: "{admin}.afterRecordRemove"
                    }
                },
                createOnEvent: "onSelect"
            }
        },
        events: {
            onSelect: null,
            onCreateNewRecord: null
        },
        listeners: {
            onCreateNewRecord: "{admin}.onCreateNewRecord",
            onSelect: [
                "{loadingIndicator}.events.showOn.fire",
                "{admin}.onSelectHandler", {
                    listener: "{admin}.applyGlobalNavigator",
                    priority: "last"
                }
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
                bannerBottom: "%recordType-admin-detaulsNoneSelected"
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
        that.afterRecordSave = function (model) {
            that.adminListView.updateModel();
        };
        that.afterRecordRemove = function () {
            that.adminListView.updateModel();
        };
        that.onSelectHandler = function (record) {
            that.selectedRecordCsid = record.csid;
        };
        that.applyGlobalNavigator = function () {
            that.globalSetup.globalNavigator = that.adminRecordEditor.globalNavigator;
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

    cspace.admin.assertRoleDisplay = function (displayString) {
        return displayString !== "none";
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

    /*
fluid.defaults("cspace.admin", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        produceTree: "cspace.admin.produceTree",
        renderOnInit: true,
        components: {
            adminListEditor: {
                type: "cspace.listEditor"
            }
        },
        preInitFunction: "cspace.admin.preInit",
        parentBundle: "{globalBundle}",
        selectors: {
            listHeader: ".csc-admin-listHeader",
            add: ".csc-admin-add",
            detailsHeader: ".csc-admin-detailsHeader",
            detailsNone: ".csc-admin-detailsNone",
            detaulsNoneSelected: ".csc-admin-detailsNoneSelected"
        },
        model: {
            strings: {
                add: "%recordType-admin-add",
                listHeader: "%recordType-admin-listHeader",
                detailsHeader: "%recordType-admin-detailsHeader",
                detailsNone: "%recordType-admin-detailsNone",
                detaulsNoneSelected: "%recordType-admin-detaulsNoneSelected"
            }
        },
        permissionsResolver: "{permissionsResolver}",
        addButtonPermission: "create",
        strings: {}
    });
    
    cspace.admin.preInit = function (that) {
        that.model.strings = cspace.util.stringBuilder(that.model.strings, {
            vars: {
                recordType: that.options.recordType
            }
        });
    };
    
    cspace.admin.produceTree = function (that) {
        return {
            listHeader: {
                messagekey: "${strings.listHeader}"
            },
            detailsHeader: {
                messagekey: "${strings.detailsHeader}"
            },
            detailsNone: {
                messagekey: "${strings.detailsNone}"
            },
            detaulsNoneSelected: {
                messagekey: "${strings.detaulsNoneSelected}"
            },
            expander: {
                type: "fluid.renderer.condition",
                condition: {
                    funcName: "cspace.permissions.resolve",
                    args: {
                        permission: that.options.addButtonPermission,
                        target: that.options.recordType,
                        resolver: that.options.permissionsResolver
                    }
                },
                trueTree: {
                    add: {
                        decorators: {
                            type: "attrs",
                            attributes: {
                                value: that.options.parentBundle.messageBase[that.model.strings.add]
                            }
                        }
                    }
                }
            }
        };
    };
    
    cspace.admin.produceAdminUserTree = function (that) {
        return fluid.merge(null, cspace.admin.produceTree(that), {
            passwordLabel: {
                messagekey: "users-passwordLabel"
            },
            passwordConfirmLabel: {
                messagekey: "users-confirmPasswordLabel"
            },
            passwordInstructionsLabel: {
                messagekey: "users-passwordInstructionsLabel"
            },
            searchNote: {
                messagekey: "users-searchNote"
            },
            searchButton: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.parentBundle.messageBase["users-search"]
                    } 
                }
            },
            unSearchButton: {
                decorators: {
                    type: "attrs",
                    attributes: {
                        value: that.options.parentBundle.messageBase["users-unsearch"]
                    } 
                }
            }
        });
    };
    
    cspace.admin.assertRoleDisplay = function (displayString) {
        return displayString !== "none";
    };
    
    cspace.admin.finalInit = function (that) {
        that.bindEvents();
        that.events.afterSetup.fire(that);
    };
    
    cspace.admin.validate = function (messageBar, dom, applier, passwordValidator, strings) {
        // In the default configuration, the email address used as the userid.
        // If all required fields are present and the userid is not set, use the email
        if (!dom.locate("userId").val()) {
            applier.requestChange("fields.userId", dom.locate("email").val());
        }
        var password = dom.locate("password");
        if (password.is(":visible")) {
            var pwd = password.val();
            if (pwd !== dom.locate("passwordConfirm").val()) {
                messageBar.show(strings["admin-passwordsDoNotMatch"], null, true);
                return false;
            }
            if (!passwordValidator.validateLength(pwd)) {
                return false;
            }
        }
        return true;
    };

    cspace.admin.bindEventHandlers = function (that) {
        that.globalNavigator = that.adminListEditor.details.globalNavigator;
        that.locate("unSearchButton").click(function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                that.locate("searchField").val("")
                that.locate("unSearchButton").hide();
                that.adminListEditor.updateList();
            });
        }).hide();
        that.locate("searchButton").click(function () {
            that.globalNavigator.events.onPerformNavigation.fire(function () {
                that.adminListEditor.updateList();
                that.locate("unSearchButton").show();
            });
        });

        that.adminListEditor.details.events.onSave.addListener(that.validate);
        that.adminListEditor.events.pageReady.addListener(function () {
            that.events.afterTreeRender.fire(that);
        });
        
        that.adminListEditor.events.afterAddNewListRow.addListener(function () {
            that.passwordValidator.bindEvents();
        });
        
        that.adminListEditor.details.events.afterRender.addListener(function () {
            that.locate("deleteButton")[that.options.login.options.csid === that.adminListEditor.details.model.csid ? "hide" : "show"]();
        });
    };
*/
    
})(jQuery, fluid);