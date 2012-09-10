/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace:true, fluid*/

cspace = cspace || {};

(function ($, fluid) {

    "use strict";

    fluid.log("RelationManager.js loaded");

    fluid.defaults("cspace.relationManager", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
            searchDialog: ".csc-search-related-dialog",
            addButton: ".csc-add-related-record-button"
        },
        styles: {
            addButton: "cs-add-related-record-button"
        },
        produceTree: "cspace.relationManager.produceTree",
        strings: {},
        messageKeys: {
            addRelationsFailedMessage: "recordEditor-addRelationsFailedMessage",
            pleaseSaveFirst: "relationManager-pleaseSaveFirst"
        },
        parentBundle: "{globalBundle}",
        selectorsToIgnore: "searchDialog",
        primaryCSID: "{globalModel}.model.primaryModel.csid",
        components: {
            messageBar: "{messageBar}",
            // TODO: this should really not be a component but in fact it requires access to 
            // already merged option values and so cannot use an expander - also, the 
            // indirection on recordType cannot be performed directly via IoC
            showAddButton: {
                type: "cspace.relationManager.permissionResolver",
                options: {
                    locked: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.resolveLocked",
                            args: "{globalModel}.model.primaryModel"
                        }
                    },
                    model: "{relationManager}.model",
                    applier: "{relationManager}.applier"
                }
            },
            searchToRelateDialog: {
                container: "{relationManager}.dom.searchDialog",
                type: "cspace.searchToRelateDialog",
                createOnEvent: "onSearchToRelateDialog",
                options: {
                    primaryCSID: "{relationManager}.options.primaryCSID"
                }
            },
            relationDataSource: {
                type: "cspace.relationManager.relationDataSource"
            }
        },
        invokers: {
            add: "cspace.relationManager.add"
        },
        events: {
            onSearchToRelateDialog: null,
            onAddRelation: null,
            afterAddRelation: null,
            onCreateNewRecord: null
        },
        listeners: {
            onAddRelation: "{cspace.relationManager}.onAddRelation",
            afterAddRelation: "{cspace.relationManager}.afterAddRelation"
        },
        model: {
            showAddButton: false
        },
        relationURL: cspace.componentUrlBuilder("%tenant/%tname/relationships"),
        preInitFunction: "cspace.relationManager.preInit",
        finalInitFunction: "cspace.relationManager.finalInit"
    });

    fluid.demands("cspace.relationManager.relationDataSource",  ["cspace.localData", "cspace.relationManager"], {
        funcName: "cspace.relationManager.TestRelationDataSource",
        args: {
            writeable: true,
            targetTypeName: "cspace.relationManager.TestRelationDataSource"
        }
    });
    fluid.demands("cspace.relationManager.relationDataSource", "cspace.relationManager", {
        funcName: "cspace.URLDataSource",
        args: {
            writeable: true,
            url: "{cspace.relationManager}.options.relationURL",
            targetTypeName: "cspace.relationManager.relationDataSource"
        }
    });

    fluid.defaults("cspace.relationManager.TestRelationDataSource", {
        url: "%test/data/relationships.json"
    });
    cspace.relationManager.TestRelationDataSource = cspace.URLDataSource;

    cspace.relationManager.preInit = function (that) {
        var options = that.options,
            addRelationsFailedMessage = options.messageKeys.addRelationsFailedMessage;

        that.onAddRelation = function (relations) {
            that.relationDataSource.set(relations, null, function (data) {
                if (!data || data.isError) {
                    data.messages = data.messages || fluid.makeArray("");
                    fluid.each(data.messages, function (message) {
                        message = message.message || message;
                        that.messageBar.show(options.parentBundle.resolve(addRelationsFailedMessage, [message]), null, true);
                    });
                    return;
                }
                that.events.afterAddRelation.fire(options.related);
            });
        };
        that.afterAddRelation = function () {
            that.messageBar.show(options.parentBundle.resolve(addRelationsFailedMessage), null, false);
        };
    };

    cspace.relationManager.finalInit = function (that) {
        that.refreshView();
        if (!that.model.showAddButton) {
            // No need to instantiate search to relate dialog.
            return;
        }
        that.dialogNode = that.locate("searchDialog"); // since blasted jQuery UI dialog will move it out of our container
        that.events.onSearchToRelateDialog.fire();
    };

    cspace.relationManager.addFromTab = function (that, recordEditor, messageBar, csid, event) {
        var callback = function () {
            cspace.relationManager.add(that, messageBar, csid, event);
        };

        if (!recordEditor) {
            callback();
            return;
        }
        recordEditor.globalNavigator.events.onPerformNavigation.fire(callback);
    };

    cspace.relationManager.add = function (that, messageBar, csid, event) {
        var options = that.options;
        event.stopPropagation();
        if (csid) {
            messageBar.hide();
            that.searchToRelateDialog.open();
        } else {
            messageBar.show(options.parentBundle.resolve(options.messageKeys.pleaseSaveFirst), null, true);
        }
    };

    cspace.relationManager.produceTree = function (that) {
        return {
            expander: {
                type: "fluid.renderer.condition",
                condition: "${showAddButton}",
                trueTree: {
                    addButton: {
                        messagekey: "${addButton}",
                        decorators: [{
                            addClass: "{styles}.addButton"
                        }, {
                            type: "jQuery",
                            func: "click",
                            args: that.add
                        }]
                    }
                }
            }
        };
    };

    fluid.defaults("cspace.relationManager.permissionResolver", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        components: {
            recordTypeManager: "{recordTypeManager}",
            resolver: "{permissionsResolver}"
        },
        recordType: "{relationManager}.options.related",
        recordTypePermission: "update",
        allOf: [{
            target: "{relationManager}.options.primary",
            permission: "update"
        }],
        finalInitFunction: "cspace.relationManager.permissionResolver.finalInit"
    });

    cspace.relationManager.permissionResolver.finalInit = function (that) {
        if (that.options.locked) {
            that.applier.requestChange("showAddButton", false);
            return;
        }
        that.options.resolver = that.resolver;
        that.options.allOf.push({
            permission: that.options.recordTypePermission,
            oneOf: that.recordTypeManager.recordTypesForCategory(that.options.recordType)
        });
        that.applier.requestChange("showAddButton", cspace.permissions.resolveMultiple(that.options));
    };
    
})(jQuery, fluid);