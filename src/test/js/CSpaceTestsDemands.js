/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

(function ($, fluid) {
    
    fluid.registerNamespace("cspace");
    
    fluid.demands("cspace.util.lookupMessage", "cspace.admin", {
        funcName: "cspace.util.lookupMessage",
        args: ["{admin}.options.parentBundle.messageBase", "{arguments}.0"]
    });
    
    fluid.demands("cspace.util.lookupMessage", "cspace.inputValidator", {
        funcName: "cspace.util.lookupMessage",
        args: ["{globalBundle}.messageBase", "{arguments}.0"]
    });
    
    fluid.demands("cspace.util.lookupMessage", "cspace.login", {
        funcName: "cspace.util.lookupMessage",
        args: ["{globalBundle}.messageBase", "{arguments}.0"]
    });
    
    fluid.demands("cspace.util.lookupMessage", "cspace.recordEditor", {
        funcName: "cspace.util.lookupMessage",
        args: ["{recordEditor}.options.parentBundle.messageBase", "{arguments}.0"]
    });
    
    fluid.demands("cspace.util.lookupMessage", "cspace.recordList", {
        funcName: "cspace.util.lookupMessage",
        args: ["{globalBundle}.messageBase", "{arguments}.0"]
    });
    
    fluid.demands("cspace.util.displayErrorMessage", "cspace.test", {
        funcName: "cspace.tests.displayErrorMessage",
        args: "{arguments}.0"
    });
    
    fluid.demands("cspace.termList", ["cspace.structuredDate"], {
        funcName: "fluid.emptySubcomponent"
    })
    
    // Validator
    fluid.demands("cspace.modelValidator", ["cspace.recordEditor", "cspace.test", "cspace.listEditor"], {
        options: {  
            recordType: "{recordEditor}.options.recordType",
            schema: "{detailsDC}.options.schema"
        }
    });
    
    fluid.demands("cspace.modelValidator", ["cspace.recordEditor", "cspace.test", "cspace.listEditor", "cspace.relatedRecordsTab"], {
        options: {  
            recordType: "{recordEditor}.options.recordType",
            schema: "{pageBuilder}.schema"
        }
    });
    
    fluid.demands("cspace.modelValidator", ["cspace.recordEditor", "cspace.test"], {
        options: {  
            recordType: "{recordEditor}.options.recordType",
            schema: "{pageBuilder}.schema"
        }
    });
    
    fluid.demands("cspace.createNew.recordBox", ["cspace.createNew", "cspace.test"], {
        container: "{arguments}.0",
        mergeAllOptions: [{
            createNewModel: "{createNew}.model",
            createNewApplier: "{createNew}.applier",
            parentBundle: "{createNew}.options.parentBundle",
            listeners: {
                onShowTemplate: "{createNew}.events.collapseAll.fire",
                updateModel: "{createNew}.updateModel"
            },
            events: {
                collapseOn: "{createNew}.events.collapseAll"
            }
        }, "{arguments}.1"]
    });
    
    fluid.demands("cspace.util.extractTenant.segment", ["cspace.localData" ,"cspace.test"], {
        options: {
            path: "test"
        }
    });
    
    // Record editor demands
    fluid.demands("afterDelete", ["cspace.recordEditor", "cspace.test"], {
        funcName: "cspace.tests.testAfterDelete",
        args: "{recordEditor}"
    });
    
    // DataContext demands
    fluid.demands("detailsDC", ["cspace.listEditor", "cspace.localData", "cspace.test"], {
        options: {
            model: "{listEditor}.options.detailsModel",
            baseUrl: "../data",
            fileExtension: ".json",
            listeners: {
                modelChanged: {
                    listener: "{listEditor}.events.detailsModelChanged.fire",
                    priority: "last"
                }
            },
            recordType: "{listEditor}.options.recordType"
        }
    });
    fluid.demands("detailsDC", ["cspace.listEditor", "cspace.tab", "cspace.localData", "cspace.test"], {
        options: {
            model: "{listEditor}.options.detailsModel",
            baseUrl: "../data",
            fileExtension: ".json",
            listeners: {
                modelChanged: {
                    listener: "{listEditor}.events.detailsModelChanged.fire",
                    priority: "last"
                }
            }
        }
    });
    fluid.demands("detailsDC", ["cspace.listEditor", "cspace.test", "cspace.localData"], {
        options: {
            model: "{listEditor}.options.detailsModel",
            baseUrl: "../data",
            fileExtension: ".json",
            listeners: {
                modelChanged: {
                    listener: "{listEditor}.events.detailsModelChanged.fire",
                    priority: "last"
                }
            }
        }
    });
    
    fluid.demands("dataContext", ["cspace.test", "cspace.localData"], {
        options: {
            fileExtension: ".json",
            urls: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.util.urlBuilder",
                    args: {
                        templateUrl: "%tenant/%tname/%recordType/template/%csid"
                    }
                }
            }
        }
    });
    
    // DataSource demands
    fluid.demands("dataSource", ["cspace.tab", "cspace.localData", "cspace.test"], {
        options: {
            schema: "{dataContext}.options.schema"
        }
    });
    fluid.demands("dataSource", ["cspace.users", "cspace.localData", "cspace.test"], {
        options: {
            schema: "{dataContext}.options.schema",
            sources: {
                role: {
                    href: "../data/role/list.json",
                    path: "fields.role",
                    resourcePath: "items",
                    merge: "cspace.dataSource.mergeRoles"
                } 
            }
        }
    });

    // Messagebar demands
    fluid.demands("messageBar", "cspace.test", {
        container: "body"
    });
    
    // search demands
    fluid.demands("search", ["cspace.searchToRelateDialog", "cspace.localData", "cspace.test"], {
       container: "{searchToRelateDialog}.container",
       options: {
           strings: {
                errorMessage: "{globalBundle}.messageBase.search-errorMessage",
                resultsCount: "{globalBundle}.messageBase.search-resultsCount",
                looking: "{globalBundle}.messageBase.search-looking",
                selected: "{globalBundle}.messageBase.search-selected",
                number: "{globalBundle}.messageBase.search-number",
                summary: "{globalBundle}.messageBase.search-summary",
                recordtype: "{globalBundle}.messageBase.search-recordtype",
                "summarylist.updatedAt": "{globalBundle}.messageBase.search-updatedAt"
            }
       }
    });
    
    // ListEditor demands
    fluid.demands("adminListEditor", ["cspace.userAdminTests", "cspace.admin", "cspace.localData", "cspace.test"], {
        container: "{admin}.container",
        options: {
            selectors: {
                allDetails: ".csc-admin-details"
            },
            selectorsToIgnore: ["allDetails"],
            recordType: "users",
            uispec: "{admin}.options.uispec",
            urls: {
                listUrl: "%tenant/%tname/users/search?query=%query"
            },
            components: {
                listSearchSource: {
                    type: "cspace.listEditor.testUsersListSearchDataSource"
                }
            }
        }
    });
    fluid.demands("list", ["cspace.listEditor", "cspace.localData", "cspace.test", "cspace.admin", "cspace.users"], {
        container: "{listEditor}.dom.list",
        options: {
            recordType: "{listEditor}.options.recordType",
            columns: ["screenName", "status"],
            parentBundle: "{listEditor}.options.parentBundle",
            strings: {
                screenName: "{listEditor}.options.parentBundle.messageBase.users-admin-screenName",
                status: "{listEditor}.options.parentBundle.messageBase.users-admin-status",
                newRow: "{listEditor}.options.parentBundle.messageBase.users-admin-newRow"
            }
        }
    });
    fluid.demands("list", ["cspace.listEditor", "cspace.localData", "cspace.test"], {
        container: "{listEditor}.dom.list",
        options: {
            recordType: "{listEditor}.options.recordType",
            columns: ["screenName", "status"],
            parentBundle: "{listEditor}.options.parentBundle",
            strings: {
                screenName: "{listEditor}.options.parentBundle.messageBase.users-admin-screenName",
                status: "{listEditor}.options.parentBundle.messageBase.users-admin-status",
                newRow: "{listEditor}.options.parentBundle.messageBase.users-admin-newRow"
            }
        }
    });
    fluid.demands("cspace.listEditor.testUsersListSearchDataSource",  ["cspace.localData", "cspace.userAdminTests", "cspace.listEditor"], {
        funcName: "cspace.listEditor.testUsersListSearchDataSource",
        args: {
            targetTypeName: "cspace.listEditor.testUsersListSearchDataSource"
        }
    });
    
    fluid.demands("updateList", ["cspace.listEditor", "cspace.userAdminTests", "cspace.localData"], {
        funcName: "cspace.tests.updateListUsers",
        args: ["{listEditor}", "{admin}.dom.searchField", "{arguments}.0"]
    });
    fluid.demands("updateList", ["cspace.listEditor", "cspace.listEditorTests", "cspace.localData"], {
        funcName: "cspace.listEditor.updateList",
        args: ["{listEditor}", "{arguments}.0"]
    });
    fluid.demands("cspace.specBuilderImpl", "cspace.test", {
        mergeAllOptions: [{
            spec: {
                async: false
            }
        }, "{arguments}.0"]
    });
    fluid.demands("cspace.urlExpander", ["cspace.localData", "cspace.test"],
        {
        args: {
            vars: {
                tenant: "..",
                tname: ".",
                webapp: "../../main/webapp/defaults",
                test: ".."
            }
        }
    });
    fluid.demands("mainSearch", "cspace.search.searchView", ["{searchView}.dom.mainSearch", fluid.COMPONENT_OPTIONS]);
    fluid.demands("structuredDate", "cspace.test", [".csc-structuredDate-container-field", "{options}"]);

    fluid.demands("cspace.relationManager.add", ["cspace.relationManager", "cspace.test"], {
            funcName: "cspace.relationManager.add",
            args: ["{relationManager}", "{globalBundle}", "{messageBar}", "{relationManager}.options.primaryCSID", "{arguments}.0"]
        });
    
    // Report producer  
    fluid.demands("report", ["cspace.sidebar", "cspace.test"], {
        options: {
            components: {
                globalNavigator: "{globalNavigator}"
            }
        }
    });
})(jQuery, fluid);