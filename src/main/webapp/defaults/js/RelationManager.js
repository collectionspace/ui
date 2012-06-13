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
        parentBundle: "{globalBundle}",
        selectorsToIgnore: "searchDialog",
        components: {
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
                type: "cspace.searchToRelateDialog",
                createOnEvent: "onSearchToRelateDialog"
            }
        },
        invokers: {
            add: "cspace.relationManager.add"
        },
        events: {
            onSearchToRelateDialog: null,
            onAddRelation: null,
            onRemoveRelation: null,
            afterAddRelation: null,
            afterRemoveRelation: null,
            onCreateNewRecord: null
        },
        model: {
            showAddButton: false
        },
        finalInitFunction: "cspace.relationManager.finalInit"
    });

    cspace.relationManager.finalInit = function (that) {
        that.refreshView();
        if (!that.model.showAddButton) {
            // No need to instantiate search to relate dialog.
            return;
        }
        that.dialogNode = that.locate("searchDialog"); // since blasted jQuery UI dialog will move it out of our container
        that.events.onSearchToRelateDialog.fire();
    };

    cspace.relationManager.addFromTab = function (that, recordEditor, globalBundle, messageBar, csid) {
        if (!recordEditor) {
            cspace.relationManager.add(that, globalBundle, messageBar, csid);
            return;
        }
        recordEditor.globalNavigator.events.onPerformNavigation.fire(function () {
            cspace.relationManager.add(that, globalBundle, messageBar, csid);
        });
    };

    cspace.relationManager.add = function (that, globalBundle, messageBar, csid) {
        if (csid) {
            messageBar.hide();
            that.searchToRelateDialog.open();
        } else {
            messageBar.show(globalBundle.resolve("relationManager-pleaseSaveFirst"), null, true);
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

    /*

    fluid.defaults("cspace.relationManager", {
        components: {
            searchToRelateDialog: {
                type: "cspace.searchToRelateDialog",
                createOnEvent: "afterInitDependents",
                options: {
                    listeners: {
                        addRelations: "{relationManager}.dataContext.addRelations",
                        onCreateNewRecord: "{relationManager}.events.onCreateNewRecord.fire"
                    },
                    model: "{relationManager}.model",
                    related: "{relationManager}.options.related",
                    primary: "{relationManager}.options.primary"
                }
            }
        }
    });
*/
    
})(jQuery, fluid);