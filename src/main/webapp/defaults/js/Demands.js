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
    
    fluid.setLogging(false);

    fluid.registerNamespace("cspace");
    
    cspace.includeLocalDemands = function () {
    
        fluid.demands("cspace.search.searchView.buildUrl", ["cspace.search.searchView", "cspace.localData"], {
            funcName: "cspace.search.searchView.buildUrlLocal",
            args: ["{searchView}.model.searchModel", "{searchView}.options.urls"]
        });
        
        fluid.demands("cspace.advancedSearch.fetcher", ["cspace.localData", "cspace.advancedSearch"], {
            options: {
                resourceSpec: {
                    uispec: {
                        href: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.util.urlBuilder",
                                args: "%tenant/%tname/uispecs/%recordType-search.json"
                            }
                        }
                    },
                    uischema: {
                        href: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.util.urlBuilder",
                                args: "%tenant/%tname/uischema/%recordType-search.json"
                            }
                        }
                    }
                }
            }
        });
        
        fluid.demands("cspace.util.extractTenant.segment", "cspace.localData", {
            options: {
                path: "defaults"
            }
        });
        
        // Report producer
        fluid.demands("cspace.reportProducer", ["cspace.sidebar", "cspace.localData"], {
            container: "{sidebar}.dom.report",
            options: {
                recordType: "{sidebar}.options.primaryRecordType"
            }
        });
        
        // getDefaultConfigURL demands
        fluid.demands("getRecordType", ["cspace.util.getDefaultConfigURL", "cspace.localData"], {
            funcName: "cspace.util.getDefaultConfigURL.getRecordTypeLocal"
        });
        
        // Admin demands
        fluid.demands("admin", ["cspace.pageBuilder", "cspace.pageBuilderIO", "cspace.localData"], {
            container: "{pageBuilder}.options.selectors.admin",
            options: {
                queryURL: "../../../../test/data/users/search.json",
                recordType: "{pageBuilderIO}.options.recordType"
            }
        });
        
        // Record List demands
        fluid.demands("select", ["cspace.recordList", "cspace.localData"], {
            funcName: "cspace.recordList.selectNavigate",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigateLocal", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "cspace.localData", "person", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigateLocal", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "cspace.localData", "organization", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigateLocal", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "cspace.localData", "location", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigateLocal", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "cspace.localData", "place", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigateLocal", "{permissionsResolver}", "{recordList}.dom"]
        }); 
        fluid.demands("select", ["cspace.recordList", "cspace.localData", "concept", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigateLocal", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "cspace.localData", "taxon", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigateLocal", "{permissionsResolver}", "{recordList}.dom"]
        });
        
        // Report Producer
        fluid.demands("cspace.reportProducer.reportTypesSource", ["cspace.reportProducer", "cspace.localData"], {
            funcName: "cspace.reportProducer.testReportTypesSource",
            args: {
                targetTypeName: "cspace.reportProducer.testReportTypesSource",
                termMap: {
                    recordType: "%recordType"
                }
            }
        });
        
        // List editor's demands
        fluid.demands("cspace.listEditor.listDataSource",  ["cspace.users", "cspace.localData", "cspace.listEditor"], {
            funcName: "cspace.listEditor.testListDataSource",
            args: {
                targetTypeName: "cspace.listEditor.testListDataSource",
                termMap: {
                    query: "%query",
                    recordType: "%recordType"
                }
            }
        });
        fluid.demands("cspace.listEditor.listDataSource",  ["cspace.localData", "cspace.listEditor"], {
            funcName: "cspace.listEditor.testListDataSource",
            args: {
                targetTypeName: "cspace.listEditor.testListDataSource",
                termMap: {
                    recordType: "%recordType"
                }
            }
        });
        fluid.demands("cspace.listEditor.listDataSource",  ["cspace.tab", "cspace.localData", "cspace.listEditor"], {
            funcName: "cspace.listEditor.testTabsListDataSource",
            args: {
                targetTypeName: "cspace.listEditor.testTabsListDataSource"
            }
        });
        
        // Autocomplete demands
        fluid.demands("cspace.autocomplete.authoritiesDataSource",  ["cspace.localData", "cspace.autocomplete"], {
            funcName: "cspace.autocomplete.testAuthoritiesDataSource",
            args: {
                targetTypeName: "cspace.autocomplete.testAuthoritiesDataSource"
            }
        });
        fluid.demands("cspace.autocomplete.matchesDataSource", ["cspace.localData", "cspace.autocomplete"], {
            funcName: "cspace.autocomplete.testMatchesDataSource",
            args: {
                targetTypeName: "cspace.autocomplete.testMatchesDataSource"
            }
        });
        fluid.demands("cspace.autocomplete.newTermDataSource",  ["cspace.localData", "cspace.autocomplete"], {
            funcName: "cspace.autocomplete.testNewTermDataSource",
            args: {
                targetTypeName: "cspace.autocomplete.testNewTermDataSource"
            }
        });
        
        // CreateNew demands
        fluid.demands("createRecord", ["cspace.pageBuilder", "cspace.localData"], {
            funcName: "cspace.createNew.createRecord",
            args: ["{createNew}.model", "{createNew}.options.urls.newRecordLocalUrl"]
        });
        
        // DataContext demands
        fluid.demands("detailsDC", ["cspace.listEditor", "cspace.localData"], {
            options: {
                model: "{listEditor}.options.detailsModel",
                baseUrl: "../../../../test/data",
                fileExtension: ".json",
                listeners: {
                    afterFetch: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onFetch: "{loadingIndicator}.events.showOn.fire",
                    modelChanged: {
                        listener: "{listEditor}.events.detailsModelChanged.fire",
                        priority: "last"
                    }
                },
                recordType: "{listEditor}.options.recordType"
            }
        });
        fluid.demands("detailsDC", ["cspace.listEditor", "cspace.tab", "cspace.localData"], {
            options: {
                model: "{listEditor}.options.detailsModel",
                baseUrl: "../../../../test/data",
                fileExtension: ".json",
                listeners: {
                    modelChanged: {
                        listener: "{listEditor}.events.detailsModelChanged.fire",
                        priority: "last"
                    },
                    afterFetch: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onFetch: "{loadingIndicator}.events.showOn.fire"
                }
            }
        });
        fluid.demands("dataContext", ["cspace.relationManager", "cspace.localData"], {
            options: {
                model: "{relationManager}.model",
                baseUrl: "../../../../test/data",
                fileExtension: ".json"
            }
        });
        fluid.demands("dataContext", ["cspace.pageBuilderIO", "cspace.localData"], {
            options: {
                listeners: {
                    afterFetch: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onFetch: "{loadingIndicator}.events.showOn.fire"
                },
                model: "{pageBuilderIO}.options.model",
                baseUrl: "../../../../test/data",
                fileExtension: ".json"
            }
        });
        
        // DataSource demands
        fluid.demands("dataSource", ["cspace.tab", "cspace.localData"], {
            options: {
                schema: "{pageBuilder}.schema"
            }
        });
        fluid.demands("dataSource", ["cspace.role", "cspace.localData"], {
            options: {
                schema: "{pageBuilder}.schema",
                sources: {
                    permission: {
                        href: "../../../../test/data/permission/list.json",
                        path: "fields.permissions",
                        resourcePath: "items",
                        merge: "cspace.dataSource.mergePermissions"
                    } 
                }
            }
        });
        fluid.demands("dataSource", ["cspace.users", "cspace.localData"], {
            options: {
                schema: "{pageBuilder}.schema",
                sources: {
                    role: {
                        href: "../../../../test/data/role/list.json",
                        path: "fields.role",
                        resourcePath: "items",
                        merge: "cspace.dataSource.mergeRoles"
                    } 
                }
            }
        });
        
        // Search To Relate Dialog
        fluid.demands("cspace.searchToRelateDialog", ["cspace.relationManager", "cspace.localData"], {
            container: "{relationManager}.dom.searchDialog",
            options: {
                strings: {
                    closeAlt: "{globalBundle}.messageBase.searchToRelateDialog-closeAlt"
                },
                showCreate: true,
                listeners: {
                    addRelations: "{relationManager}.addRelations"
                }
            }
        });

        fluid.demands("cspace.searchToRelateDialog", ["cspace.relationManager", "cspace.localData", "cspace.sidebar"], {
            container: "{relationManager}.dom.searchDialog",
            options: {                
                strings: {
                    closeAlt: "{globalBundle}.messageBase.searchToRelateDialog-closeAlt"
                },
                listeners: {
                    addRelations: "{relationManager}.addRelations"
                }
            }
        });
        
        fluid.demands("cspace.createTemplateBox", ["cspace.localData", "cspace.pageBuilder"], {
            container: "{pageBuilder}.options.selectors.createTemplateBox",
            options: {
                urls: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.urlBuilder",
                        args: {
                            cloneURL: "%webapp/html/record.html?recordtype=%recordType"
                        }
                    }                                    
                }
            }
        });
        
        fluid.demands("cspace.termList.termListSource",  ["cspace.localData", "cspace.termList"], {
            funcName: "cspace.termList.testTermListSource",
            args: {
                targetTypeName: "cspace.termList.testTermListSource"
            }
        });
        
        fluid.demands("cspace.createTemplateBox.listDataSource",  ["cspace.localData", "cspace.createTemplateBox"], {
            funcName: "cspace.createTemplateBox.testListDataSource",
            args: {
                targetTypeName: "cspace.createTemplateBox.testListDataSource",
                termMap: {
                    recordType: "%recordType"
                }
            }
        });
        
        fluid.demands("cspace.createTemplateBox.templateDataSource",  ["cspace.localData", "cspace.createTemplateBox"], {
            funcName: "cspace.createTemplateBox.testTemplateDataSource",
            args: {
                targetTypeName: "cspace.createTemplateBox.testTemplateDataSource",
                termMap: {
                    recordType: "%recordType",
                    templateType: "%templateType"
                }
            }
        });        
        
        // urlExpander demands
        fluid.demands("cspace.urlExpander", "cspace.localData", {
            options: {
                vars: {
                    tenant: "../../../../test",
                    tname: "."
                }
            }
        });
        
        // getLoginURL demands
        fluid.demands("cspace.util.getLoginURL", "cspace.localData", {
            options: {
                url: "%test/data/login/status.json"
            }
        });
        
        // getDefaultSchemaURL demands
        fluid.demands("cspace.util.getDefaultSchemaURL", "cspace.localData", {
            args: ["{arguments}.0", {
                url: "%test/uischema/%recordType.json"
            }]
        });
        
        // getUISpecURL demands
        fluid.demands("cspace.util.getUISpecURL", "cspace.localData", {
            args: ["{arguments}.0", {
                url: "%test/uispecs/%pageType.json"
            }]
        });
    };
    
    cspace.includeDemands = function () {

        fluid.demands("cspace.util.recordLock", "cspace.recordList", {
            options: fluid.COMPONENT_OPTIONS
        });

        fluid.demands("cspace.util.recordLock", ["cspace.recordEditor", "cspace.recordList"], {
            container: "{cspace.recordEditor}.dom.recordLockContainer",
            options: {
                model: "{cspace.recordEditor}.model",
                applier: "{cspace.recordEditor}.applier"
            }
        });

        fluid.demands("cspace.util.recordLock", "cspace.recordEditor", {
            container: "{cspace.recordEditor}.dom.recordLockContainer",
            options: {
                model: "{cspace.recordEditor}.model",
                applier: "{cspace.recordEditor}.applier"
            }
        });

        fluid.demands("cspace.recordTraverser", "cspace.recordEditor", {
            container: "{cspace.recordEditor}.dom.recordTraverser"
        });

        fluid.demands("cspace.dimension", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{recordEditor}.applier",
                model: "{recordEditor}.model"
            }, "{arguments}.1"]
        });
        
        fluid.demands("cspace.preferred", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                recordType: "{recordEditor}.options.recordType",
                applier: "{recordEditor}.applier",
                model: "{recordEditor}.model",
                readOnly: "{recordEditor}.options.readOnly"
            }, "{arguments}.1"]
        });
    
        // Term list
        fluid.demands("cspace.termList", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                recordType: "{recordEditor}.options.recordType",
                applier: "{recordEditor}.applier",
                model: "{recordEditor}.model"
            }, "{arguments}.1"]
        });
        
        fluid.demands("cspace.termList", "cspace.advancedSearch.searchFields", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                recordType: "{searchFields}.options.recordType",
                applier: "{searchFields}.applier",
                model: "{searchFields}.model"
            }, "{arguments}.1"]
        });

        fluid.demands("cspace.util.lookupMessage", "cspace.globalSetup", {
            funcName: "cspace.util.lookupMessage",
            args: ["{globalBundle}.messageBase", "{arguments}.0"]
        });
        
        // Display error message
        fluid.demands("cspace.util.displayErrorMessage", "cspace.globalSetup", {
            funcName: "cspace.util.displayErrorMessage",
            args: ["{messageBar}", "{arguments}.0", "{loadingIndicator}"]
        });
    
        fluid.demands("cspace.relationManager.add", "cspace.relationManager", {
            funcName: "cspace.relationManager.add",
            args: "{relationManager}"
        });
        
        fluid.demands("cspace.relationManager.add", ["cspace.relationManager", "cspace.relatedRecordsTab"], {
            funcName: "cspace.relationManager.addFromTab",
            args: "{relationManager}"
        });
    
        // Validator
        fluid.demands("cspace.validator", "cspace.recordEditor", {
            options: {  
                recordType: "{pageBuilderIO}.options.recordType",
                schema: "{pageBuilder}.schema"
            }
        });
        
        // Search history
        fluid.demands("cspace.searchTools.block", "cspace.searchTools", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                events: {
                    currentSearchUpdated: "{searchTools}.events.currentSearchUpdated"
                }
            }, "{arguments}.1"]
        });

        // Pagebuilder
        fluid.demands("cspace.pageBuilder", ["cspace.debug", "cspace.record"], {
            options: {
                components: {
                    uispecVerifier: {
                        type: "cspace.uispecVerifier"
                    }
                }
            }
        });
        fluid.demands("cspace.pageBuilder", "cspace.pageBuilderIO", {
            options: fluid.COMPONENT_OPTIONS
        });

        // Pagebuilder renderer
        fluid.demands("cspace.pageBuilder.renderer", ["cspace.pageBuilderIO", "cspace.pageBuilder"], {
            options: {
                pageType: "{pageBuilderIO}.options.pageType"
            }
        });

        // PageBuilderIO
        fluid.demands("cspace.pageBuilderIO", "cspace.globalSetup", {
            options: {
                listeners: {
                    pageReady: "{globalSetup}.events.pageReady.fire",
                    onError: "{globalSetup}.events.onError.fire"
                }
            }
        });
        
        // Hierarchy demands
        fluid.demands("hierarchy", "cspace.recordEditor", {
            container: "{recordEditor}.dom.hierarchy",
            options: {
                model: "{recordEditor}.model",
                applier: "{recordEditor}.applier"
            }
        });
        
        // getDefaultConfigURL demands
        fluid.demands("getRecordType", "cspace.util.getDefaultConfigURL", {
            funcName: "cspace.util.getDefaultConfigURL.getRecordType"
        });
        
        // List Editor's demands
        fluid.demands("adminListEditor", ["cspace.admin"], {
            container: "{admin}.container", 
            options: {
                listeners: {
                    afterListUpdate: "{loadingIndicator}.events.hideOn.fire",
                    onListUpdate: "{loadingIndicator}.events.showOn.fire"
                },
                selectors: {
                    allDetails: ".csc-admin-details"
                },
                selectorsToIgnore: ["allDetails"],
                recordType: "{admin}.options.recordType",
                uispec: "{admin}.options.uispec",
                urls: {
                    listUrl: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "fluid.stringTemplate",
                            args: ["%tenant/%tname/%recordType", {
                                recordType: "{admin}.options.recordType"
                            }]  
                        }
                    }
                }
            }
        });
        fluid.demands("adminListEditor", ["cspace.admin", "cspace.users"], {
            container: "{admin}.container",
            options: {
                listeners: {
                    afterListUpdate: "{loadingIndicator}.events.hideOn.fire",
                    onListUpdate: "{loadingIndicator}.events.showOn.fire"
                },
                selectors: {
                    allDetails: ".csc-admin-details"
                },
                selectorsToIgnore: ["allDetails"],
                recordType: "users",
                uispec: "{admin}.options.uispec",
                urls: {
                    listUrl: "%tenant/%tname/users/search?query=%query"
                }
            }
        });
        fluid.demands("listEditor", "cspace.relatedRecordsTab", {
            container: "{relatedRecordsTab}.container",
            options: {
                listeners: {
                    pageReady: "{loadingIndicator}.events.hideOn.fire",
                    afterListUpdate: "{loadingIndicator}.events.hideOn.fire",
                    onListUpdate: "{loadingIndicator}.events.showOn.fire"
                },
                selectors: {
                    allDetails: ".csc-relatedRecordsTab-recordEditor"
                },
                selectorsToIgnore: ["allDetails"],
                uispec: "{relatedRecordsTab}.options.uispec",
                urls: {
                    listUrl: "%tenant/%tname/%recordType/%csid"
                }
            }
        });
        fluid.demands("updateList", ["cspace.listEditor", "cspace.tab"], {
            funcName: "cspace.listEditor.updateListRelated",
            args: ["{listEditor}", "{relatedRecordsTab}.primary", "{relatedRecordsTab}.model.csid", "{arguments}.0"]
        });
        fluid.demands("updateList", ["cspace.listEditor", "cspace.users"], {
            funcName: "cspace.listEditor.updateListUsers",
            args: ["{listEditor}", "{admin}.dom.searchField", "{arguments}.0"]
        });
        fluid.demands("updateList", "cspace.listEditor", {
            funcName: "cspace.listEditor.updateList",
            args: ["{listEditor}", "{arguments}.0"]
        });
        fluid.demands("cspace.listEditor.listDataSource", ["cspace.listEditor"], {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{listEditor}.options.urls.listUrl",
                targetTypeName: "cspace.listEditor.listDataSource"
            }
        });
        fluid.demands("cspace.listEditor.listDataSource", ["cspace.listEditor", "cspace.users"], {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{listEditor}.options.urls.listUrl",
                targetTypeName: "cspace.listEditor.listDataSource",
                responseParser: "cspace.listEditor.responseParseUsers",
                termMap: {
                    query: "%query",
                    recordType: "%recordType"
                }
            }
        });
        fluid.demands("cspace.listEditor.listDataSource", ["cspace.listEditor", "cspace.tab"], {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{listEditor}.options.urls.listUrl",
                targetTypeName: "cspace.listEditor.listDataSource",
                responseParser: "cspace.listEditor.responseParseTabs",
                termMap: {
                    csid: "%csid",
                    recordType: "%recordType"
                }
            }
        });
            
        // Admin demands
        fluid.demands("admin", ["cspace.pageBuilder", "cspace.pageBuilderIO"], {
            container: "{pageBuilder}.options.selectors.admin",
            options: {
                recordType: "{pageBuilderIO}.options.recordType"
            }
        });
        
        // Autocomplete demands
        fluid.demands("cspace.autocomplete.authoritiesDataSource", "cspace.autocomplete", {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{autocomplete}.options.vocabUrl",
                targetTypeName: "cspace.autocomplete.authoritiesDataSource"
            }
        });
        fluid.demands("cspace.autocomplete.matchesDataSource", "cspace.autocomplete", {
            funcName: "cspace.URLDataSource", 
            args: {
                url: "%queryUrl?q=%term",
                termMap: {
                    queryUrl: "{autocomplete}.options.queryUrl",
                    term: "encodeURIComponent:%term",
                    vocab: "vocab"
                },
                targetTypeName: "cspace.autocomplete.matchesDataSource"
            }
        });
        fluid.demands("cspace.autocomplete.newTermDataSource", "cspace.autocomplete", {
            funcName: "cspace.URLDataSource",
            args: {
                url: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.urlBuilder",
                        args: "%tenant/%tname/%termUrl"
                    }
                },
                termMap: {
                    termUrl: "%termUrl"
                },
                writeable: true,
                targetTypeName: "cspace.autocomplete.newTermDataSource"
            }
        });
        fluid.demands("fluid.autocomplete.autocompleteView", "cspace.autocomplete", {
            container: "{autocomplete}.autocompleteInput"
        }); 
        fluid.demands("cspace.autocomplete.popup", "cspace.autocomplete", {
            container: "{autocomplete}.popupElement"
        });
        fluid.demands("cspace.autocomplete.closeButton", "cspace.autocomplete", {
            container: "{autocomplete}.autocompleteInput"
        });
        fluid.demands("cspace.autocomplete", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: {
                    vocab: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.vocab.resolve",
                            args: {
                                model: "{cspace.recordEditor}.model",
                                recordType: "{cspace.recordEditor}.options.recordType",
                                vocab: "{vocab}"
                            }
                        }
                    }
                },
                invokers: {
                    handlePermissions: {
                        funcName: "cspace.autocomplete.handlePermissions",
                        args: ["{autocomplete}.applier", "{autocomplete}.model", "cspace.permissions.resolve", {
                            resolver: "{permissionsResolver}",
                            permission: "update"
                        }, "create", "{autocomplete}.autocompleteInput"]
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.autocomplete", ["cspace.recordEditor", "location", "cspace.hierarchy"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: {
                    vocab: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.vocab.resolve",
                            args: {
                                model: "{cspace.recordEditor}.model",
                                recordType: "{cspace.recordEditor}.options.recordType",
                                vocab: "{vocab}"
                            }
                        }
                    }
                },
                invokers: {
                    handlePermissions: {
                        funcName: "cspace.autocomplete.handlePermissions",
                        args: ["{autocomplete}.applier", "{autocomplete}.model", "cspace.permissions.resolve", {
                            resolver: "{permissionsResolver}",
                            permission: "update"
                        }, "create", "{autocomplete}.autocompleteInput"]
                    }
                },
                components: {
                    confirmation: "{confirmation}",
                    broaderDataSource: {
                        type: "cspace.autocomplete.broaderDataSource"
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.autocomplete", ["cspace.recordEditor", "place", "cspace.hierarchy"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: {
                    vocab: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.vocab.resolve",
                            args: {
                                model: "{cspace.recordEditor}.model",
                                recordType: "{cspace.recordEditor}.options.recordType",
                                vocab: "{vocab}"
                            }
                        }
                    }
                },
                invokers: {
                    handlePermissions: {
                        funcName: "cspace.autocomplete.handlePermissions",
                        args: ["{autocomplete}.applier", "{autocomplete}.model", "cspace.permissions.resolve", {
                            resolver: "{permissionsResolver}",
                            permission: "update"
                        }, "create", "{autocomplete}.autocompleteInput"]
                    }
                },
                components: {
                    confirmation: "{confirmation}",
                    broaderDataSource: {
                        type: "cspace.autocomplete.broaderDataSource"
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.autocomplete", ["cspace.recordEditor", "concept", "cspace.hierarchy"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: {
                    vocab: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.vocab.resolve",
                            args: {
                                model: "{cspace.recordEditor}.model",
                                recordType: "{cspace.recordEditor}.options.recordType",
                                vocab: "{vocab}"
                            }
                        }
                    }
                },
                invokers: {
                    handlePermissions: {
                        funcName: "cspace.autocomplete.handlePermissions",
                        args: ["{autocomplete}.applier", "{autocomplete}.model", "cspace.permissions.resolve", {
                            resolver: "{permissionsResolver}",
                            permission: "update"
                        }, "create", "{autocomplete}.autocompleteInput"]
                    }
                },
                components: {
                    confirmation: "{confirmation}",
                    broaderDataSource: {
                        type: "cspace.autocomplete.broaderDataSource"
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.autocomplete", ["cspace.recordEditor", "person", "cspace.hierarchy"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: {
                    vocab: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.vocab.resolve",
                            args: {
                                model: "{cspace.recordEditor}.model",
                                recordType: "{cspace.recordEditor}.options.recordType",
                                vocab: "{vocab}"
                            }
                        }
                    }
                },
                invokers: {
                    handlePermissions: {
                        funcName: "cspace.autocomplete.handlePermissions",
                        args: ["{autocomplete}.applier", "{autocomplete}.model", "cspace.permissions.resolve", {
                            resolver: "{permissionsResolver}",
                            permission: "update"
                        }, "create", "{autocomplete}.autocompleteInput"]
                    }
                },
                components: {
                    confirmation: "{confirmation}",
                    broaderDataSource: {
                        type: "cspace.autocomplete.broaderDataSource"
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.autocomplete", ["cspace.recordEditor", "organization", "cspace.hierarchy"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: {
                    vocab: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.vocab.resolve",
                            args: {
                                model: "{cspace.recordEditor}.model",
                                recordType: "{cspace.recordEditor}.options.recordType",
                                vocab: "{vocab}"
                            }
                        }
                    }
                },
                invokers: {
                    handlePermissions: {
                        funcName: "cspace.autocomplete.handlePermissions",
                        args: ["{autocomplete}.applier", "{autocomplete}.model", "cspace.permissions.resolve", {
                            resolver: "{permissionsResolver}",
                            permission: "update"
                        }, "create", "{autocomplete}.autocompleteInput"]
                    }
                },
                components: {
                    confirmation: "{confirmation}",
                    broaderDataSource: {
                        type: "cspace.autocomplete.broaderDataSource"
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.autocomplete", ["cspace.recordEditor", "taxon", "cspace.hierarchy"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: {
                    vocab: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.vocab.resolve",
                            args: {
                                model: "{cspace.recordEditor}.model",
                                recordType: "{cspace.recordEditor}.options.recordType",
                                vocab: "{vocab}"
                            }
                        }
                    }
                },
                invokers: {
                    handlePermissions: {
                        funcName: "cspace.autocomplete.handlePermissions",
                        args: ["{autocomplete}.applier", "{autocomplete}.model", "cspace.permissions.resolve", {
                            resolver: "{permissionsResolver}",
                            permission: "update"
                        }, "create", "{autocomplete}.autocompleteInput"]
                    }
                },
                components: {
                    confirmation: "{confirmation}",
                    broaderDataSource: {
                        type: "cspace.autocomplete.broaderDataSource"
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.autocomplete.broaderDataSource", "cspace.autocomplete", {
            funcName: "cspace.URLDataSource",
            args: {
                url: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.urlBuilder",
                        args: "%tenant/%tname/relationships/hierarchical/search?source=%recordType/%csid&type=hasBroader"
                    }
                },
                termMap: {
                    recordType: "%recordType",
                    csid: "%csid"
                },
                targetTypeName: "cspace.autocomplete.broaderDataSource"
            }
        });
        
        // Report producer  
        fluid.demands("cspace.reportProducer", ["cspace.sidebar", "cspace.pageBuilder"], {
            container: "{sidebar}.dom.report",
            options: {
                recordType: "{sidebar}.options.primaryRecordType",
                recordModel: "{pageBuilder}.model",
                recordApplier: "{pageBuilder}.applier"
            }
        });
        
        fluid.demands("cspace.reportProducer.reportTypesSource", "cspace.reportProducer", {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{reportProducer}.options.urls.reportTypesUrl",
                targetTypeName: "cspace.reportProducer.reportTypesSource",
                termMap: {
                    recordType: "%recordType"
                }
            }
        });
        
        fluid.demands("cspace.reportProducer.generateReport", ["cspace.reportProducer", "cspace.recordEditor"], {
            funcName: "cspace.reportProducer.generateReport",
            args: ["{reportProducer}.confirmation", "{reportProducer}.options.parentBundle", "{reportProducer}.requestReport", "{recordEditor}"]
        });
        
        // Confirmation demands
        fluid.demands("confirmation", "cspace.recordEditor", {
            options: {
                strings: {
                    title: "{globalBundle}.messageBase.confirmationDialog-title"
                }
            }
        });

        fluid.demands("confirmation", "cspace.relatedRecordsTab", {
            options: {
                strings: {
                    title: "{globalBundle}.messageBase.confirmationDialog-title"
                }
            }
        });
        
        fluid.demands("confirmation", "cspace.reportProducer", "{options}");

        // CreateNew demands
        fluid.demands("createRecord", "cspace.pageBuilder", {
            funcName: "cspace.createNew.createRecord",
            args: ["{createNew}.model", "{createNew}.options.urls.newRecordUrl"]
        });
        fluid.demands("createTemplate", "cspace.pageBuilder", {
            funcName: "cspace.createNew.createRecord",
            args: ["{createNew}.model", "{createNew}.options.urls.templateUrl"]
        });
        fluid.demands("createNew", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.createNew"
        });
        fluid.demands("cspace.createNew.templateViewDataSource",  ["cspace.createNew"], {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{createNew}.options.urls.templateViewsUrl",
                targetTypeName: "cspace.createNew.templateViewDataSource"
            }
        });
        fluid.demands("cspace.createNew.recordBox", "cspace.createNew", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                createNewModel: "{createNew}.model",
                createNewApplier: "{createNew}.applier",
                listeners: {
                    onShowTemplate: "{createNew}.events.collapseAll.fire",
                    updateModel: "{createNew}.updateModel"
                },
                events: {
                    collapseOn: "{createNew}.events.collapseAll"
                }
            }, "{arguments}.1"]
        });
        
        // DataContext demands
        fluid.demands("detailsDC", "cspace.listEditor", {
            options: {
                model: "{listEditor}.options.detailsModel",
                listeners: {
                    modelChanged: {
                        listener: "{listEditor}.events.detailsModelChanged.fire",
                        priority: "last"
                    },
                    afterFetch: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onFetch: "{loadingIndicator}.events.showOn.fire"
                }
            }
        });
        fluid.demands("dataContext", "cspace.relationManager", {
            options: {
                model: "{relationManager}.model"
            }
        });
        fluid.demands("dataContext", "cspace.pageBuilderIO", {
            options: {
                model: "{pageBuilderIO}.options.model",
                listeners: {
                    onError: [{
                        listener: "{globalSetup}.events.onError.fire"
                    }, {
                        listener: "{loadingIndicator}.events.hideOn.fire"
                    }],
                    afterFetch: "{loadingIndicator}.events.hideOn.fire",
                    onFetch: "{loadingIndicator}.events.showOn.fire"
                }
            }
        });
        fluid.demands("dataContext", ["cspace.pageBuilderIO", "cspace.template"], {
            options: {
                model: "{pageBuilderIO}.options.model",
                listeners: {
                    onError: [{
                        listener: "{globalSetup}.events.onError.fire"
                    }, {
                        listener: "{loadingIndicator}.events.hideOn.fire"
                    }],
                    afterFetch: "{loadingIndicator}.events.hideOn.fire",
                    onFetch: "{loadingIndicator}.events.showOn.fire"
                },
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
        fluid.demands("detailsDC", ["cspace.listEditor", "cspace.tab"], {
            options: {
                model: "{listEditor}.options.detailsModel",
                listeners: {
                    modelChanged: {
                        listener: "{listEditor}.events.detailsModelChanged.fire",
                        priority: "last"
                    },
                    afterFetch: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onFetch: "{loadingIndicator}.events.showOn.fire"
                }
            }
        });
        fluid.demands("cspace.dataContext.buildUrl", "cspace.dataContext", {
            funcName: "cspace.util.buildUrl",
            args: ["{arguments}.0", "{dataContext}.options.baseUrl", "{dataContext}.options.recordType", "{arguments}.1", "{dataContext}.options.fileExtension", "{arguments}.2"]
        });
        fluid.demands("cspace.dataContext.buildUrl", ["cspace.dataContext", "cspace.template"], {
            funcName: "cspace.dataContext.buildTemplateUrl",
            args: ["{arguments}.0", "{dataContext}.options.urls.templateUrl", "{dataContext}.options.recordType", "{arguments}.1"]
        });
        
        // DataSource demands
        fluid.demands("dataSource", "cspace.tab", {
            options: {
                schema: "{pageBuilder}.schema"
            }
        });
        fluid.demands("dataSource", "cspace.role", {
            options: {
                schema: "{pageBuilder}.schema",
                sources: {
                    permission: {
                        href: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.util.urlBuilder",
                                args: "%tenant/%tname/permission/search?actGrp=CRUDL"
                            }
                        },
                        path: "fields.permissions",
                        resourcePath: "items",
                        merge: "cspace.dataSource.mergePermissions"
                    } 
                }
            }
        });
        fluid.demands("dataSource", "cspace.users", {
            options: {
                schema: "{pageBuilder}.schema",
                sources: {
                    role: {
                        href: {
                            expander: {
                                type: "fluid.deferredInvokeCall",
                                func: "cspace.util.urlBuilder",
                                args: "%tenant/%tname/role"
                            }
                        },
                        path: "fields.role",
                        resourcePath: "items",
                        merge: "cspace.dataSource.mergeRoles"
                    } 
                }
            }
        });
        
        // DatePicker demands
        fluid.demands("cspace.datePicker", "cspace.recordEditor", {
            container: "{arguments}.0",
            options: {
                readOnly: "{recordEditor}.options.readOnly"
            }
        });
        
        // Footer demands
        fluid.demands("footer", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.footer"
        });
        
        // Header demands
        fluid.demands("header", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.header"
        });
        
        fluid.demands("recordEditor", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.recordEditor",
            options: {
                components: {
                    recordTraverser: {
                        type: "cspace.recordTraverser",
                        createOnEvent: "afterRender",
                        options: {
                            events: {
                                onSave: "{cspace.recordEditor}.events.onSave"
                            },
                            listeners: {
                                onSave: {
                                    namespace: "recordTraverser",
                                    listener: "{cspace.recordTraverser}.save",
                                    priority: "last"
                                }
                            }
                        }
                    }
                },
                listeners: {
                    afterRender: "{loadingIndicator}.events.hideOn.fire",
                    cancelSave: "{loadingIndicator}.events.hideOn.fire",
                    onSave: "{loadingIndicator}.events.showOn.fire",
                    onCancel: "{loadingIndicator}.events.showOn.fire"
                },
                readOnly: "{pageBuilderIO}.options.readOnly",
                recordType: "{pageBuilderIO}.options.recordType",
                showDeleteButton: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.permissions.resolve",
                        args: {
                            resolver: "{permissionsResolver}",
                            permission: "delete",
                            target: "{pageBuilderIO}.options.recordType"
                        }
                    }
                },
                showCreateFromExistingButton: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.permissions.resolve",
                        args: {
                            resolver: "{permissionsResolver}",
                            permission: "create",
                            target: "{pageBuilderIO}.options.recordType"
                        }
                    }
                },
                strings: {
                    updateSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-updateSuccessfulMessage",
                    createSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-createSuccessfulMessage",
                    removeSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-removeSuccessfulMessage",
                    updateFailedMessage: "{globalBundle}.messageBase.recordEditor-updateFailedMessage",
                    createFailedMessage: "{globalBundle}.messageBase.recordEditor-createFailedMessage",
                    deleteFailedMessage: "{globalBundle}.messageBase.recordEditor-deleteFailedMessage",
                    fetchFailedMessage: "{globalBundle}.messageBase.recordEditor-fetchFailedMessage",
                    addRelationsFailedMessage: "{globalBundle}.messageBase.recordEditor-addRelationsFailedMessage",
                    removeRelationsFailedMessage: "{globalBundle}.messageBase.recordEditor-removeRelationsFailedMessage",
                    missingRequiredFields: "{globalBundle}.messageBase.recordEditor-missingRequiredFields",
                    deleteButton: "{globalBundle}.messageBase.recordEditor-deleteButton",
                    deleteMessageWithRelated: "{globalBundle}.messageBase.recordEditor-deleteMessageWithRelated",
                    deleteMessageMediaAttached: "{globalBundle}.messageBase.recordEditor-deleteMessageMediaAttached"
                }
            }
        });
        
        fluid.demands("recordEditor", ["cspace.pageBuilder", "cspace.template"], {
            container: "{pageBuilder}.options.selectors.recordEditor",
            options: {
                listeners: {
                    afterRender: "{loadingIndicator}.events.hideOn.fire",
                    cancelSave: "{loadingIndicator}.events.hideOn.fire",
                    onSave: "{loadingIndicator}.events.showOn.fire",
                    onCancel: "{loadingIndicator}.events.showOn.fire"
                },
                readOnly: "{pageBuilderIO}.options.readOnly",
                recordType: "{pageBuilderIO}.options.recordType",
                produceTree: "cspace.recordEditor.produceTreeTemplate",
                strings: {
                    updateSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-updateSuccessfulMessage",
                    createSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-createSuccessfulMessage",
                    removeSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-removeSuccessfulMessage",
                    updateFailedMessage: "{globalBundle}.messageBase.recordEditor-updateFailedMessage",
                    createFailedMessage: "{globalBundle}.messageBase.recordEditor-createFailedMessage",
                    deleteFailedMessage: "{globalBundle}.messageBase.recordEditor-deleteFailedMessage",
                    fetchFailedMessage: "{globalBundle}.messageBase.recordEditor-fetchFailedMessage",
                    addRelationsFailedMessage: "{globalBundle}.messageBase.recordEditor-addRelationsFailedMessage",
                    removeRelationsFailedMessage: "{globalBundle}.messageBase.recordEditor-removeRelationsFailedMessage",
                    missingRequiredFields: "{globalBundle}.messageBase.recordEditor-missingRequiredFields",
                    deleteButton: "{globalBundle}.messageBase.recordEditor-deleteButton",
                    deleteMessageWithRelated: "{globalBundle}.messageBase.recordEditor-deleteMessageWithRelated",
                    deleteMessageMediaAttached: "{globalBundle}.messageBase.recordEditor-deleteMessageMediaAttached"
                }
            }
        });
        
        fluid.demands("navigateToFullImage", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.navigateToFullImage",
            args: "{recordEditor}"
        });

        fluid.demands("cspace.recordEditor.requestSave", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.requestSave",
            args: "{recordEditor}"
        });

        fluid.demands("cspace.recordEditor.requestSave", ["cspace.recordEditor", "movement.lock"], {
            funcName: "cspace.recordEditor.requestSaveMovement",
            args: "{recordEditor}"
        });
        
        fluid.demands("cancel", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.cancel",
            args: "{recordEditor}"
        });
        
        fluid.demands("remove", ["cspace.recordEditor", "person"], {
            funcName: "cspace.recordEditor.removeWithCheck",
            args: "{recordEditor}"
        });
        
        fluid.demands("remove", ["cspace.recordEditor", "organization"], {
            funcName: "cspace.recordEditor.removeWithCheck",
            args: "{recordEditor}"
        });
        
        fluid.demands("remove", ["cspace.recordEditor", "taxon"], {
            funcName: "cspace.recordEditor.removeWithCheck",
            args: "{recordEditor}"
        });
        
        fluid.demands("remove", ["cspace.recordEditor", "location"], {
            funcName: "cspace.recordEditor.removeWithCheck",
            args: "{recordEditor}"
        });

        fluid.demands("remove", ["cspace.recordEditor", "concept"], {
            funcName: "cspace.recordEditor.removeWithCheck",
            args: "{recordEditor}"
        });
        
        fluid.demands("remove", ["cspace.recordEditor", "place"], {
            funcName: "cspace.recordEditor.removeWithCheck",
            args: "{recordEditor}"
        });
        
        fluid.demands("remove", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.remove",
            args: "{recordEditor}"
        });
        
        fluid.demands("cspace.recordEditor.cloneAndStore", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.cloneAndStore", 
            args: "{recordEditor}"
        });

        fluid.demands("reloadAndCloneRecord", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.reloadAndCloneRecord", 
            args: "{recordEditor}"
        });
        
        fluid.demands("createNewFromExistingRecord", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.createNewFromExistingRecord",
            args: ["{recordEditor}.globalNavigator", "{recordEditor}.reloadAndCloneRecord"]
        });        

        fluid.demands("afterDelete", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.redirectAfterDelete",
            args: "{recordEditor}"
        });

        fluid.demands("checkDeleteDisabling", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.checkDeleteDisabling",
            args: "{recordEditor}"
        });
        
        fluid.demands("checkCreateFromExistingDisabling", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.checkCreateFromExistingDisabling",
            args: "{recordEditor}.model"
        });        

        fluid.demands("hasMediaAttached", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.hasMediaAttached",
            args: "{recordEditor}"
        });

        fluid.demands("hasRelations", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.hasRelations",
            args: "{recordEditor}"
        });

        fluid.demands("afterDelete", ["cspace.listEditor", "cspace.admin"], {
            funcName: "cspace.recordEditor.statusAfterDelete",
            args: "{recordEditor}"
        });
        
        fluid.demands("details", ["cspace.listEditor", "cspace.administration"], {
            container: "{listEditor}.dom.details",
            options: {
                listeners: {
                    afterRender: "{loadingIndicator}.events.hideOn.fire",
                    cancelSave: "{loadingIndicator}.events.hideOn.fire",
                    afterRemove: "{loadingIndicator}.events.hideOn.fire",
                    onSave: "{loadingIndicator}.events.showOn.fire",
                    onCancel: "{loadingIndicator}.events.showOn.fire"
                },
                readOnly: "{pageBuilderIO}.options.readOnly",
                recordType: "{listEditor}.options.recordType",
                showDeleteButton: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.permissions.resolve",
                        args: {
                            resolver: "{permissionsResolver}",
                            permission: "delete",
                            target: "{pageBuilderIO}.options.recordType"
                        }
                    }
                },
                showCreateFromExistingButton: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.permissions.resolve",
                        args: {
                            resolver: "{permissionsResolver}",
                            permission: "create",
                            target: "{pageBuilderIO}.options.recordType"
                        }
                    }
                },
                strings: {
                    updateSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-updateSuccessfulMessage",
                    createSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-createSuccessfulMessage",
                    removeSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-removeSuccessfulMessage",
                    updateFailedMessage: "{globalBundle}.messageBase.recordEditor-updateFailedMessage",
                    createFailedMessage: "{globalBundle}.messageBase.recordEditor-createFailedMessage",
                    deleteFailedMessage: "{globalBundle}.messageBase.recordEditor-deleteFailedMessage",
                    fetchFailedMessage: "{globalBundle}.messageBase.recordEditor-fetchFailedMessage",
                    addRelationsFailedMessage: "{globalBundle}.messageBase.recordEditor-addRelationsFailedMessage",
                    removeRelationsFailedMessage: "{globalBundle}.messageBase.recordEditor-removeRelationsFailedMessage",
                    missingRequiredFields: "{globalBundle}.messageBase.recordEditor-missingRequiredFields",
                    deleteButton: "{globalBundle}.messageBase.recordEditor-deleteButton",
                    deleteMessageWithRelated: "{globalBundle}.messageBase.recordEditor-deleteMessageWithRelated",
                    deleteMessageMediaAttached: "{globalBundle}.messageBase.recordEditor-deleteMessageMediaAttached"
                }
            }
        });
        
        fluid.demands("details", ["cspace.listEditor", "cspace.tab"], {
            container: "{listEditor}.dom.details",
            options: {
                listeners: {
                    afterRender: "{loadingIndicator}.events.hideOn.fire",
                    cancelSave: "{loadingIndicator}.events.hideOn.fire",
                    afterRemove: "{loadingIndicator}.events.hideOn.fire",
                    onSave: "{loadingIndicator}.events.showOn.fire",
                    onCancel: "{loadingIndicator}.events.showOn.fire"
                },
                readOnly: "{pageBuilderIO}.options.readOnly",
                recordType: "{listEditor}.options.recordType",
                showDeleteButton: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.permissions.resolveMultiple",
                        args: {
                            recordTypeManager: "{recordTypeManager}",
                            resolver: "{permissionsResolver}",
                            allOf: [{
                                    target: "{relatedRecordsTab}.primary",
                                    permission: "update"
                                }, {
                                    target: "{relatedRecordsTab}.related",
                                    permission: "update"
                                }
                            ]
                        }
                    }
                },
                showCreateFromExistingButton: false,
                strings: {
                    updateSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-updateSuccessfulMessage",
                    createSuccessfulMessage: "{globalBundle}.messageBase.recordEditor-createSuccessfulMessage",
                    updateFailedMessage: "{globalBundle}.messageBase.recordEditor-updateFailedMessage",
                    createFailedMessage: "{globalBundle}.messageBase.recordEditor-createFailedMessage",
                    fetchFailedMessage: "{globalBundle}.messageBase.recordEditor-fetchFailedMessage",
                    addRelationsFailedMessage: "{globalBundle}.messageBase.recordEditor-addRelationsFailedMessage",
                    removeRelationsFailedMessage: "{globalBundle}.messageBase.recordEditor-removeRelationsFailedMessage",
                    missingRequiredFields: "{globalBundle}.messageBase.recordEditor-missingRequiredFields",
                    deleteMessageWithRelated: "{globalBundle}.messageBase.recordEditor-deleteMessageWithRelated",
                    deleteMessageMediaAttached: "{globalBundle}.messageBase.recordEditor-deleteMessageMediaAttached",
                    deleteButton: "{globalBundle}.messageBase.tab-re-deleteButton",
                    deleteFailedMessage: "{globalBundle}.messageBase.tab-re-deleteFailedMessage",
                    removeSuccessfulMessage: "{globalBundle}.messageBase.tab-re-removeSuccessfulMessage"
                }
            }
        });

        fluid.demands("afterDelete", ["cspace.listEditor", "cspace.tab"], {
            funcName: "cspace.recordEditor.statusAfterDelete",
            args: "{recordEditor}"
        });
        
        fluid.demands("remove", ["cspace.listEditor", "cspace.tab"], {
            funcName: "cspace.relatedRecordsTab.deleteRelation",
            args: ["{relatedRecordsTab}", "{recordEditor}"]
        });

        // Record List demands
        fluid.demands("list", "cspace.listEditor", {
            container: "{listEditor}.dom.list"
        });
        fluid.demands("list", ["cspace.listEditor", "cspace.tab", "media"], {
            container: "{listEditor}.dom.list",
            options: {
                showDeleteButton: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.resolveDeleteRelation",
                        args: {
                            recordTypeManager: "{recordTypeManager}",
                            resolver: "{permissionsResolver}",
                            allOf: [{
                                target: "{relatedRecordsTab}.primary",
                                permission: "update"
                            }, {
                                target: "{relatedRecordsTab}.related",
                                permission: "update"
                            }],
                            recordModel: "{relatedRecordsTab}.model"
                        }
                    }
                },
                columns: ["number", "summary"],
                produceTree: "cspace.recordList.produceTreeMediaTabs",
                invokers: {
                    deleteRelation: {
                        funcName: "cspace.recordList.deleteRelation",
                        args: ["{arguments}.0", "{recordList}", "{details}", "{relatedRecordsTab}"]
                    }
                },
                styles: {
                    deleteRelation: "cs-recordList-deleteRelation",
                    titleColumn: "cs-recordList-title-column-tab",
                    column2: "cs-recordList-column2-tab"
                },
//                model: {
//                    messagekeys: {
//                        newRow: "tab-list-newRow"
//                    }
//                },
                strings: {
                    number: "{globalBundle}.messageBase.tab-list-number",
                    summary: "{globalBundle}.messageBase.tab-list-summary"
                }
            }
        });
        fluid.demands("list", ["cspace.listEditor", "cspace.tab"], {
            container: "{listEditor}.dom.list",
            options: {
                showDeleteButton: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.resolveDeleteRelation",
                        args: {
                            recordTypeManager: "{recordTypeManager}",
                            resolver: "{permissionsResolver}",
                            allOf: [{
                                target: "{relatedRecordsTab}.primary",
                                permission: "update"
                            }, {
                                target: "{relatedRecordsTab}.related",
                                permission: "update"
                            }],
                            recordModel: "{relatedRecordsTab}.model"
                        }
                    }
                },
                columns: ["number", "summary"],
                produceTree: "cspace.recordList.produceTreeTabs",
                invokers: {
                    deleteRelation: {
                        funcName: "cspace.recordList.deleteRelation",
                        args: ["{arguments}.0", "{recordList}", "{details}", "{relatedRecordsTab}"]
                    }
                },
                styles: {
                    deleteRelation: "cs-recordList-deleteRelation"
                },
//                model: {
//                    messagekeys: {
//                        newRow: "tab-list-newRow"
//                     }
//                },
                strings: {
                    number: "{globalBundle}.messageBase.tab-list-number",
                    summary: "{globalBundle}.messageBase.tab-list-summary"
                }
            }
        });
        fluid.demands("list", ["cspace.listEditor", "cspace.admin", "cspace.users"], {
            container: "{listEditor}.dom.list",
            options: {
                columns: ["screenName", "status"],
//                model: {
//                    messagekeys: {
//                        newRow: "users-admin-newRow"
//                    }
//                },
                strings: {
                    screenName: "{globalBundle}.messageBase.users-admin-screenName",
                    status: "{globalBundle}.messageBase.users-admin-status"
                }
            }
        });
        fluid.demands("list", ["cspace.listEditor", "cspace.admin"], {
            container: "{listEditor}.dom.list",
            options: {
                recordType: "{listEditor}.options.recordType",
                columns: ["number"],
//                model: {
//                    messagekeys: {
//                        newRow: "admin-newRow"                        
//                    }
//                },
                strings: {
                    number: "{globalBundle}.messageBase.admin-number"
                }
            }
        });
        fluid.demands("cspace.listView", "cspace.myCollectionSpace", {
            options: {
                listeners: {
                    onModelChange: "{loadingIndicator}.events.showOn.fire",
                    afterUpdate: "{loadingIndicator}.events.hideOn.fire",
                    ready: "{loadingIndicator}.events.hideOn.fire"
                }
            }
        });
        fluid.demands("cspace.recordList", ["cspace.relatedRecordsList", "person"], {
            container: "{relatedRecordsList}.dom.recordListSelector",
            options: {
                columns: ["number", "summary", "sourceFieldName"],
                strings: {
                    number: "{globalBundle}.messageBase.rl-rrl-number",
                    summary: "{globalBundle}.messageBase.rl-rrl-summary",
                    sourceFieldName: "{globalBundle}.messageBase.rl-rrl-sourceFieldName"
                },
                model: {
                    items: "{relatedRecordsList}.model.refobjs"
                }
            }
        });
        fluid.demands("cspace.recordList", ["cspace.relatedRecordsList", "organization"], {
            container: "{relatedRecordsList}.dom.recordListSelector",
            options: {
                columns: ["number", "summary", "sourceFieldName"],
                strings: {
                    number: "{globalBundle}.messageBase.rl-rrl-number",
                    summary: "{globalBundle}.messageBase.rl-rrl-summary",
                    sourceFieldName: "{globalBundle}.messageBase.rl-rrl-sourceFieldName"
                },
                model: {
                    items: "{relatedRecordsList}.model.refobjs"
                }
            }
        });
        fluid.demands("cspace.recordList", ["cspace.relatedRecordsList", "taxon"], {
            container: "{relatedRecordsList}.dom.recordListSelector",
            options: {
                columns: ["number", "summary", "sourceFieldName"],
                strings: {
                    number: "{globalBundle}.messageBase.rl-rrl-number",
                    summary: "{globalBundle}.messageBase.rl-rrl-summary",
                    sourceFieldName: "{globalBundle}.messageBase.rl-rrl-sourceFieldName"
                },
                model: {
                    items: "{relatedRecordsList}.model.refobjs"
                }
            }
        });
        fluid.demands("cspace.recordList", ["cspace.relatedRecordsList", "location"], {
            container: "{relatedRecordsList}.dom.recordListSelector",
            options: {
                columns: ["number", "summary", "sourceFieldName"],
                strings: {
                    number: "{globalBundle}.messageBase.rl-rrl-number",
                    summary: "{globalBundle}.messageBase.rl-rrl-summary",
                    sourceFieldName: "{globalBundle}.messageBase.rl-rrl-sourceFieldName"
                },
                model: {
                    items: "{relatedRecordsList}.model.refobjs"
                }
            }
        });
        fluid.demands("cspace.recordList", ["cspace.relatedRecordsList", "place"], {
            container: "{relatedRecordsList}.dom.recordListSelector",
            options: {
                columns: ["number", "summary", "sourceFieldName"],
                strings: {
                    number: "{globalBundle}.messageBase.rl-rrl-number",
                    summary: "{globalBundle}.messageBase.rl-rrl-summary",
                    sourceFieldName: "{globalBundle}.messageBase.rl-rrl-sourceFieldName"
                },
                model: {
                    items: "{relatedRecordsList}.model.refobjs"
                }
            }
        });
        fluid.demands("cspace.recordList", ["cspace.relatedRecordsList", "concept"], {
            container: "{relatedRecordsList}.dom.recordListSelector",
            options: {
                columns: ["number", "summary", "sourceFieldName"],
                strings: {
                    number: "{globalBundle}.messageBase.rl-rrl-number",
                    summary: "{globalBundle}.messageBase.rl-rrl-summary",
                    sourceFieldName: "{globalBundle}.messageBase.rl-rrl-sourceFieldName"
                },
                model: {
                    items: "{relatedRecordsList}.model.refobjs"
                }
            }
        });
        fluid.demands("cspace.recordList", "cspace.relatedRecordsList", {
            container: "{relatedRecordsList}.dom.recordListSelector",
            options: {
                columns: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.relatedRecordsList.buildRelationsListColumns",
                        args: ["{relatedRecordsList}.options.related"]
                    }
                },
                names: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.relatedRecordsList.buildRelationsListNames",
                        args: ["{relatedRecordsList}.options.related"]
                    }
                },
                model: {
                    items: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.relatedRecordsList.buildRelationsList",
                            args: ["{recordTypes}", "{relatedRecordsList}.model.relations", "{relatedRecordsList}.options.related"]
                        }
                    }
                }
            }
        });
        fluid.demands("cspace.recordList", "cspace.sidebar", {
            container: "{sidebar}.options.selectors.termsUsed"
        });
        fluid.demands("select", ["cspace.recordList", "cspace.tab"], {
            funcName: "cspace.recordList.selectFromList",
            args: ["{recordList}.model", "{recordList}.options", "{listEditor}.detailsDC"]
        });
        fluid.demands("select", ["cspace.recordList", "cspace.admin"], {
            funcName: "cspace.recordList.selectFromList",
            args: ["{recordList}.model", "{recordList}.options", "{listEditor}.detailsDC"]
        });
        fluid.demands("select", "cspace.recordList", {
            funcName: "cspace.recordList.selectNavigate",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigate", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "person", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigate", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "organization", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigate", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "taxon", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigate", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "location", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigate", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "place", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigate", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("select", ["cspace.recordList", "concept", "cspace.relatedRecordsList"], {
            funcName: "cspace.recordList.selectNavigateVocab",
            args: ["{recordList}.model", "{recordList}.options", "{recordList}.options.urls.navigate", "{permissionsResolver}", "{recordList}.dom"]
        });
        fluid.demands("cspace.recordList.thumbRenderer", "cspace.recordList", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: "{recordList}.model",
                elPath: "{recordList}.options.elPaths.items"
            }, "{arguments}.1"]
        });
        
        fluid.demands("cspace.recordList.rowStyler", "cspace.recordList", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: "{recordList}.model",
                elPath: "{recordList}.options.elPaths.items",
                permissionsResolver: "{permissionsResolver}",
                styles: "{recordList}.options.styles"
            }, "{arguments}.1"]       
        });
        
        // Login demands
        fluid.demands("login", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.login",
            options: {
                listeners: {
                    afterRender: "{loadingIndicator}.events.hideOn.fire"
                }
            }
        });
        
        // Media upload demands
        fluid.demands("uploader", "cspace.recordEditor", {
            container: "{recordEditor}.dom.uploader",
            options: {
                model: "{recordEditor}.model",
                applier: "{recordEditor}.options.applier",
                listeners: {
                    onLink: "{recordEditor}.requestSave",
                    onRemove: "{recordEditor}.refreshNoSave"
                }
            }
        });

        fluid.demands("fluid.uploader", ["cspace.mediaUploader", "fluid.uploader.singleFile"], {
            options: fluid.COMPONENT_OPTIONS
        });
        fluid.demands("fluid.uploader", ["cspace.mediaUploader", "fluid.uploader.html5"], {
            options: {
                listeners: {
                    onUploadStart: "{loadingIndicator}.events.showOn.fire",
                    afterFileQueued: "{mediaUploader}.afterFileQueuedListener",
                    onFileSuccess: [{
                        listener: "{mediaUploader}.onFileSuccess"
                    }, {
                        listener: "{loadingIndicator}.events.hideOn.fire"
                    }],
                    onFileError: [{
                        listener: "{loadingIndicator}.events.hideOn.fire"
                    }, {
                        listener: "{mediaUploader}.onFileError"
                    }]
                }
            }
        });
        fluid.demands("fluid.uploader", ["cspace.mediaUploader", "fluid.uploader.swfUpload"], {
            options: {
                listeners: {
                    onUploadStart: "{loadingIndicator}.events.showOn.fire",
                    afterFileQueued: "{mediaUploader}.afterFileQueuedListener",
                    onFileSuccess: [{
                        listener: "{mediaUploader}.onFileSuccess"
                    }, {
                        listener: "{loadingIndicator}.events.hideOn.fire"
                    }],
                    onFileError: [{
                        listener: "{loadingIndicator}.events.hideOn.fire"
                    }, {
                        listener: "{mediaUploader}.onFileError"
                    }]
                }
            }
        });
        fluid.demands("fluid.uploader.html5Strategy.browseButtonView", ["fluid.uploader.html5Strategy.local", "cspace.mediaUploader"], {
            container: "{multiFileUploader}.container",
            options: {
                mergePaths: ["{options}", {
                    events: {
                        onBrowse: "{local}.events.onFileDialog"
                    }
                }, {
                    multiFileInputMarkup: "<input type='file' name='file' multiple='' class='flc-uploader-html5-input fl-hidden' />"
                }]
            }
        });
        
        // Messagebar demands
        fluid.demands("messageBarImpl", "cspace.messageBar", {
            container: "{messageBar}.options.selectors.messageBarContainer"
        });
        fluid.demands("messageBar", "cspace.globalSetup", {
            container: "body"
        });
        fluid.demands("messageBar", "cspace.login", {
            container: "body"
        });
        
        // My collection space demands
        fluid.demands("myCollectionSpace", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.myCollectionSpace"
        });
        
        // Number pattern chooser demands
        fluid.demands("cspace.numberPatternChooser", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                baseUrl: "{recordEditor}.options.dataContext.options.baseUrl",
                readOnly: "{recordEditor}.options.readOnly",
                strings: {
                    notSupported: "{globalBundle}.messageBase.numberPatternChooser-notSupported"
                }
            }, "{arguments}.1"]
        });
        
        // Togglable demands
        fluid.demands("togglable", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.container",
            options: {
                selectors: {
                    header: "{myCollectionSpace}.options.selectors.header",
                    togglable: "{myCollectionSpace}.options.selectors.togglable"
                }
            }
        });
        fluid.demands("recordEditorTogglable", "cspace.recordEditor", {
            container: "{recordEditor}.container"
        });
        fluid.demands("togglableRelated", "cspace.relatedRecordsList", {
            container: "{relatedRecordsList}.container"
        });
        fluid.demands("togglable", "cspace.relatedRecordsTab", {
            container: "{relatedRecordsTab}.container"
        });
        fluid.demands("togglable", "cspace.sidebar", {
            container: "{sidebar}.container"
        });
        fluid.demands("hierarchyTogglable", "cspace.hierarchy", {
            container: "{hierarchy}.container",
            options: {
                selectors: {
                    header: "{hierarchy}.options.selectors.header",
                    togglable: "{hierarchy}.options.selectors.togglable"
                }
            }
        });
        
        // Password validator demands
        fluid.demands("passwordValidator", "cspace.admin", {
            container: "{admin}.container"
        }); 
        fluid.demands("passwordValidator", "cspace.login", {
            container: "{login}.container"
        });
        
        // Related records list demands
        fluid.demands("procedures", "cspace.sidebar", {
            container: "{sidebar}.options.selectors.relatedProcedures"
        });
        fluid.demands("nonVocabularies", "cspace.sidebar", {
            container: "{sidebar}.options.selectors.relatedNonVocabularies"
        });
        fluid.demands("cataloging", "cspace.sidebar", {
            container: "{sidebar}.options.selectors.relatedCataloging"
        });
        
        // Relation manager demands
        fluid.demands("relationManager", "cspace.relatedRecordsList", {
            container: "{relatedRecordsList}.dom.relationManagerSelector"
        });
        fluid.demands("relationManager", ["cspace.relatedRecordsList", "person"], {
            container: "{relatedRecordsList}.dom.relationManagerSelector", 
            options: {
                components: {
                    showAddButton: {
                        type: "fluid.emptySubcomponent"
                    }
                }
            }
        });
        fluid.demands("relationManager", ["cspace.relatedRecordsList", "location"], {
            container: "{relatedRecordsList}.dom.relationManagerSelector", 
            options: {
                components: {
                    showAddButton: {
                        type: "fluid.emptySubcomponent"
                    }
                }
            }
        });
        fluid.demands("relationManager", ["cspace.relatedRecordsList", "place"], {
            container: "{relatedRecordsList}.dom.relationManagerSelector", 
            options: {
                components: {
                    showAddButton: {
                        type: "fluid.emptySubcomponent"
                    }
                }
            }
        });
        fluid.demands("relationManager", ["cspace.relatedRecordsList", "concept"], {
            container: "{relatedRecordsList}.dom.relationManagerSelector", 
            options: {
                components: {
                    showAddButton: {
                        type: "fluid.emptySubcomponent"
                    }
                }
            }
        });
        fluid.demands("relationManager", ["cspace.relatedRecordsList", "organization"], {
            container: "{relatedRecordsList}.dom.relationManagerSelector", 
            options: {
                components: {
                    showAddButton: {
                        type: "fluid.emptySubcomponent"
                    }
                }
            }
        });
        fluid.demands("relationManager", ["cspace.relatedRecordsList", "taxon"], {
            container: "{relatedRecordsList}.dom.relationManagerSelector", 
            options: {
                components: {
                    showAddButton: {
                        type: "fluid.emptySubcomponent"
                    }
                }
            }
        });
        fluid.demands("relationManager", ["cspace.relatedRecordsTab", "cspace.tab"], {
            container: "{relatedRecordsTab}.container"
        });
        
        // relationResolver demands
        fluid.demands("cspace.util.relationResolver", "cspace.pageBuilder", {
            options: {
                model: "{pageBuilder}.model"
            }
        });
        
        // Related records tab demands
        fluid.demands("relatedRecordsTab", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.relatedRecordsTab"
        });
        
        // Search To Relate Dialog demands
        fluid.demands("cspace.searchToRelateDialog", "cspace.relationManager", {
            container: "{relationManager}.dom.searchDialog",
            options: {                
                strings: {
                    closeAlt: "{globalBundle}.messageBase.searchToRelateDialog-closeAlt"
                },                
                showCreate: true
            }
        });
        fluid.demands("cspace.searchToRelateDialog", ["cspace.relationManager", "cspace.sidebar"], {
            container: "{relationManager}.dom.searchDialog",
            options: {              
                strings: {
                    closeAlt: "{globalBundle}.messageBase.searchToRelateDialog-closeAlt"
                }                
            }
        });
        
        // Repeatable demands
        fluid.demands("cspace.makeRepeatable", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{recordEditor}.applier",
                model: "{recordEditor}.model",
                schema: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.repeatableImpl.getSchema",
                        args: ["{pageBuilder}.schema", "{pageBuilderIO}.options.recordType"]
                    }
                },
                recordType: "{pageBuilderIO}.options.recordType"
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.repeatableImpl", "cspace.makeRepeatable", {
            mergeAllOptions: [{
                selectors: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.repeatableImpl.expandSelectors",
                        args: [{
                            add: ".csc-repeatable-add",
                            "delete": ".csc-repeatable-delete",
                            primary: ".csc-repeatable-primary",
                            repeat: ".csc-repeatable-repeat",
                            headerRow: ".csc-repeatable-headerRow"
                        }, "{makeRepeatable}.id"]
                    }
                }
            }, "{options}"]
        });
        fluid.demands("cspace.repeatableImpl", "cspace.repeatable", {
            options: fluid.COMPONENT_OPTIONS
        });
        
        fluid.demands("cspace.makeRepeatable", "cspace.advancedSearch.searchFields", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{searchFields}.applier",
                model: "{searchFields}.model",
                schema: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.repeatableImpl.getSchema",
                        args: ["{advancedSearch}.options.searchFields.schema", "{advancedSearch}.model.recordType"]
                    }
                },
                recordType: "{advancedSearch}.model.recordType"
            }, "{arguments}.1"]
        });
        
        // Structured date demands
        fluid.demands("cspace.structuredDate", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{recordEditor}.applier",
                model: "{recordEditor}.model",
                events: {
                    removeListeners: "{recordEditor}.events.onRefreshView"
                }
            }, "{arguments}.1"]
        });

        fluid.demands("cspace.structuredDate", ["cspace.repeatableImpl", "cspace.makeRepeatable", "cspace.recordEditor"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{repeatableImpl}.applier",
                model: "{repeatableImpl}.model",
                events: {
                    repeatableOnRefreshView: "{repeatableImpl}.events.onRefreshView",
                    recordEditorOnRefreshView: "{recordEditor}.events.onRefreshView"
                },
                listeners: {
                    repeatableOnRefreshView: "{structuredDate}.events.removeListeners.fire",
                    recordEditorOnRefreshView: "{structuredDate}.events.removeListeners.fire"
                }
            }, "{arguments}.1"]
        });
        
        // searchView deamnds
        fluid.demands("fluid.pager", "cspace.search.searchView", ["{searchView}.dom.resultsContainer", fluid.COMPONENT_OPTIONS]);
        fluid.demands("search", "cspace.searchToRelateDialog", {
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
                },
                components: {
                    searchResultsResolver: {
                        type: "cspace.search.searchResultsResolver"
                    }
                },
                listeners: {
                    afterSearch: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onSearch: "{loadingIndicator}.events.showOn.fire"
                }
            }
        });
        fluid.demands("search", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.search",
            options: {
                source: "findedit",
                strings: {
                    errorMessage: "{globalBundle}.messageBase.search-errorMessage",
                    resultsCount: "{globalBundle}.messageBase.search-resultsCount",
                    looking: "{globalBundle}.messageBase.search-looking",
                    selected: "{globalBundle}.messageBase.search-selected",
                    number: "{globalBundle}.messageBase.search-number",
                    summary: "{globalBundle}.messageBase.search-summary",
                    recordtype: "{globalBundle}.messageBase.search-recordtype",
                    "summarylist.updatedAt": "{globalBundle}.messageBase.search-updatedAt"
                },
                listeners: {
                    ready: "{loadingIndicator}.events.hideOn.fire",
                    afterSearch: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onSearch: "{loadingIndicator}.events.showOn.fire"
                },
                components: {
                    searchReferenceStorage: {
                        type: "cspace.util.localStorageDataSource",
                        options: {
                            elPath: "searchReference"
                        }
                    },
                    searchHistoryStorage: {
                        type: "cspace.util.localStorageDataSource",
                        options: {
                            elPath: "searchHistory",
                            source: "advancedsearch"
                       }
                    },
                    findeditHistoryStorage: {
                        type: "cspace.util.localStorageDataSource",
                        options: {
                            elPath: "findeditHistory",
                            source: "findedit"
                        }
                    },
                    mainSearch: {
                        options: {
                            components: {
                                findeditHistoryStorage: {
                                    type: "cspace.util.localStorageDataSource",
                                    options: {
                                        elPath: "findeditHistory"
                                    }
                                }
                            },
                            events: {
                                afterSearch: "{searchView}.events.afterSearch"
                            },
                            preInitFunction: {
                                namespace: "preInitSearch",
                                listener: "cspace.searchBox.preInitSearch"
                            },
                            invokers: {
                                updateSearchHistory: "cspace.searchBox.updateSearchHistory"
                            }
                        }
                    }
                }
            }
        });

        fluid.demands("cspace.advancedSearch.updateSearchHistory", ["cspace.advancedSearch", "cspace.search.searchView"], {
            funcName: "cspace.search.updateSearchHistory",
            args: ["{advancedSearch}.searchHistoryStorage", "{arguments}.0", "{cspace.search.searchView}.model.pagination.traverser"]
        });

        fluid.demands("cspace.searchBox.updateSearchHistory", ["cspace.searchBox", "cspace.search.searchView"], {
            funcName: "cspace.search.updateSearchHistory",
            args: ["{searchBox}.findeditHistoryStorage", "{arguments}.0", "{cspace.search.searchView}.model.pagination.traverser"]
        });

        fluid.demands("cspace.search.searchView.onInitialSearch", ["cspace.advancedSearch", "cspace.search.searchView"], {
            funcName: "cspace.search.searchView.onInitialSearchAdvanced",
            args: "{cspace.search.searchView}"
        });

        fluid.demands("cspace.search.searchView.onInitialSearch", ["cspace.search.searchView"], {
            funcName: "cspace.search.searchView.onInitialSearch",
            args: "{cspace.search.searchView}"
        });

        fluid.demands("search", ["cspace.pageBuilder", "cspace.advancedSearch"], {
            container: "{pageBuilder}.options.selectors.search",
            options: {
                source: "advancedsearch",
                strings: {
                    errorMessage: "{globalBundle}.messageBase.search-errorMessage",
                    resultsCount: "{globalBundle}.messageBase.search-resultsCount",
                    looking: "{globalBundle}.messageBase.search-looking",
                    selected: "{globalBundle}.messageBase.search-selected",
                    number: "{globalBundle}.messageBase.search-number",
                    summary: "{globalBundle}.messageBase.search-summary",
                    recordtype: "{globalBundle}.messageBase.search-recordtype",
                    "summarylist.updatedAt": "{globalBundle}.messageBase.search-updatedAt"
                },
                selectors: {
                    mainSearch: "{pageBuilder}.options.selectors.advancedSearch"
                },
                preInitFunction: "cspace.search.searchView.preInitAdvanced",
                events: {
                    onAdvancedSearch: null,
                    hideResults: null,
                    currentSearchUpdated: "{searchTools}.events.currentSearchUpdated"
                },
                listeners: {
                	ready: "{loadingIndicator}.events.hideOn.fire",
                	afterSearch: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onSearch: "{loadingIndicator}.events.showOn.fire"
                },
                invokers: {
                    updateSearch: {
                        funcName: "cspace.search.searchView.updateSearch",
                        args: ["{arguments}.0", "{mainSearch}"]
                    },
                    handleAdvancedSearch: {
                        funcName: "cspace.search.searchView.handleAdvancedSearch",
                        args: ["{arguments}.0", "{searchView}"]
                    }
                },
                components: {
                    searchReferenceStorage: {
                        type: "cspace.util.localStorageDataSource",
                        options: {
                            elPath: "searchReference"
                        }
                    },
                    searchHistoryStorage: {
                        type: "cspace.util.localStorageDataSource",
                        options: {
                            elPath: "searchHistory",
                            source: "advancedsearch"
                       }
                    },
                    findeditHistoryStorage: {
                        type: "cspace.util.localStorageDataSource",
                        options: {
                            elPath: "findeditHistory",
                            source: "findedit"
                        }
                    },
                    mainSearch: {
                        type: "cspace.advancedSearch",
                        options: {
                            events: {
                                afterSearch: "{searchView}.events.afterSearch",
                                onSearch: "{searchView}.events.onAdvancedSearch",
                                afterToggle: "{searchView}.events.hideResults"
                            },
                            listeners: {
                            	afterSearchFieldsInit: "{loadingIndicator}.events.hideOn.fire",
                                recordTypeChanged: "{loadingIndicator}.events.showOn.fire",
                                onSearch: {
                                    listener: "{searchTools}.events.renderOn.fire",
                                    priority: "last"
                                }
                            }
                        }
                    }
                }
            }
        });
        
        fluid.demands("cspace.search.searchView.search", "cspace.search.searchView", {
            funcName: "cspace.search.searchView.search",
            args: ["{arguments}.0", "{searchView}"]
        });
        
        fluid.demands("cspace.search.searchView.search", ["cspace.search.searchView", "cspace.advancedSearch"], {
            funcName: "cspace.search.searchView.advancedSearch",
            args: ["{arguments}.0", "{searchView}"]
        });
        
        fluid.demands("cspace.search.searchView.buildUrl", "cspace.search.searchView", {
            funcName: "cspace.search.searchView.buildUrlDefault",
            args: ["{searchView}.model.searchModel", "{searchView}.options.urls"]
        });
        
        // searchBox demands
        fluid.demands("mainSearch", "cspace.search.searchView", {
            container: "{searchView}.dom.mainSearch"
        });
        fluid.demands("pivotSearch", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.pivotSearch"
        });
        fluid.demands("searchBox", "cspace.header", {
            container: "{header}.options.selectors.searchBox"
        });
        fluid.demands("cspace.searchBox.navigateToSearch", "cspace.searchBox", {
            funcName: "cspace.searchBox.navigateToSearch",
            args: ["{searchBox}"]
        });
        fluid.demands("cspace.searchBox.navigateToSearch", ["cspace.searchBox", "cspace.search.searchView"], {
            funcName: "cspace.search.handleSubmitSearch",
            args: ["{searchBox}", "{searchView}"]
        });
        
        fluid.demands("cspace.termList.termListSource", ["cspace.termList"], {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{termList}.options.urls.termList",
                targetTypeName: "cspace.termList.termListSource",
                termMap: {
                    recordType: "%recordType",
                    termListType: "%termListType"
                }
            }
        });
        
        // createTemplate demands
        fluid.demands("cspace.createTemplateBox", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.createTemplateBox"
        });
        fluid.demands("cspace.createTemplateBox.listDataSource", ["cspace.createTemplateBox"], {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{createTemplateBox}.options.urls.listUrl",
                targetTypeName: "cspace.createTemplateBox.listDataSource",
                termMap: {
                    recordType: "%recordType"
                }
            }
        });
        fluid.demands("cspace.createTemplateBox.templateDataSource", ["cspace.createTemplateBox"], {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{createTemplateBox}.options.urls.listUrl",
                targetTypeName: "cspace.createTemplateBox.templateDataSource",
                termMap: {
                    recordType: "%recordType",
                    templateType: "%templateType"
                }
            }
        });        
        
        // sidebar demands
        fluid.demands("sidebar", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                relationsElPath: "relations",
                primaryRecordType: "{pageBuilder}.options.pageType",
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model"
            }
        });
        fluid.demands("sidebar", ["cspace.pageBuilder", "person"], {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                primaryRecordType: "{pageBuilder}.options.pageType",
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model",
                relationsElPath: "refobjs",
                components: {
                    cataloging: {
                        type: "fluid.emptySubcomponent"
                    },
                    procedures: {
                        type: "fluid.emptySubcomponent"
                    },
                    nonVocabularies: {
                        type: "cspace.relatedRecordsList",
                        createOnEvent: "afterRender",
                        options: {
                            primary: "{sidebar}.options.primaryRecordType",
                            related: "nonVocabularies",
                            applier: "{sidebar}.options.recordApplier",
                            model: "{sidebar}.options.recordModel",
                            relationsElPath: "{sidebar}.options.relationsElPath"
                        }
                    }
                },
                selectors: {
                    relatedNonVocabularies: ".csc-related-nonVocabularies"
                },
                selectorsToIgnore: ["report", "numOfTerms", "mediaSnapshot", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable", "relatedNonVocabularies"],
                model: {
                    categories: [{
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.modelBuilder",
                            args: {
                                callback: "cspace.sidebar.buildModel",
                                related: "nonVocabularies",
                                resolver: "{permissionsResolver}",
                                recordTypeManager: "{recordTypeManager}",
                                permission: "list"
                            }
                        }
                    }, undefined]
                }
            }
        });
        fluid.demands("sidebar", ["cspace.pageBuilder", "organization"], {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                primaryRecordType: "{pageBuilder}.options.pageType",
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model",
                relationsElPath: "refobjs",
                components: {
                    cataloging: {
                        type: "fluid.emptySubcomponent"
                    },
                    procedures: {
                        type: "fluid.emptySubcomponent"
                    },
                    nonVocabularies: {
                        type: "cspace.relatedRecordsList",
                        createOnEvent: "afterRender",
                        options: {
                            primary: "{sidebar}.options.primaryRecordType",
                            related: "nonVocabularies",
                            applier: "{sidebar}.options.recordApplier",
                            model: "{sidebar}.options.recordModel",
                            relationsElPath: "{sidebar}.options.relationsElPath"
                        }
                    }
                },
                selectors: {
                    relatedNonVocabularies: ".csc-related-nonVocabularies"
                },
                selectorsToIgnore: ["report", "numOfTerms", "mediaSnapshot", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable", "relatedNonVocabularies"],
                model: {
                    categories: [{
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.modelBuilder",
                            args: {
                                callback: "cspace.sidebar.buildModel",
                                related: "nonVocabularies",
                                resolver: "{permissionsResolver}",
                                recordTypeManager: "{recordTypeManager}",
                                permission: "list"
                            }
                        }
                    }, undefined]
                }
            }
        });
        fluid.demands("sidebar", ["cspace.pageBuilder", "taxon"], {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                primaryRecordType: "{pageBuilder}.options.pageType",
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model",
                relationsElPath: "refobjs",
                components: {
                    cataloging: {
                        type: "fluid.emptySubcomponent"
                    },
                    procedures: {
                        type: "fluid.emptySubcomponent"
                    },
                    nonVocabularies: {
                        type: "cspace.relatedRecordsList",
                        createOnEvent: "afterRender",
                        options: {
                            primary: "{sidebar}.options.primaryRecordType",
                            related: "nonVocabularies",
                            applier: "{sidebar}.options.recordApplier",
                            model: "{sidebar}.options.recordModel",
                            relationsElPath: "{sidebar}.options.relationsElPath"
                        }
                    }
                },
                selectors: {
                    relatedNonVocabularies: ".csc-related-nonVocabularies"
                },
                selectorsToIgnore: ["report", "numOfTerms", "mediaSnapshot", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable", "relatedNonVocabularies"],
                model: {
                    categories: [{
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.modelBuilder",
                            args: {
                                callback: "cspace.sidebar.buildModel",
                                related: "nonVocabularies",
                                resolver: "{permissionsResolver}",
                                recordTypeManager: "{recordTypeManager}",
                                permission: "list"
                            }
                        }
                    }, undefined]
                }
            }
        });
        fluid.demands("sidebar", ["cspace.pageBuilder", "location"], {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                primaryRecordType: "{pageBuilder}.options.pageType",
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model",
                relationsElPath: "refobjs",
                components: {
                    cataloging: {
                        type: "fluid.emptySubcomponent"
                    },
                    procedures: {
                        type: "fluid.emptySubcomponent"
                    },
                    nonVocabularies: {
                        type: "cspace.relatedRecordsList",
                        createOnEvent: "afterRender",
                        options: {
                            primary: "{sidebar}.options.primaryRecordType",
                            related: "nonVocabularies",
                            applier: "{sidebar}.options.recordApplier",
                            model: "{sidebar}.options.recordModel",
                            relationsElPath: "{sidebar}.options.relationsElPath"
                        }
                    }
                },
                selectors: {
                    relatedNonVocabularies: ".csc-related-nonVocabularies"
                },
                selectorsToIgnore: ["report", "numOfTerms", "mediaSnapshot", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable", "relatedNonVocabularies"],
                model: {
                    categories: [{
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.modelBuilder",
                            args: {
                                callback: "cspace.sidebar.buildModel",
                                related: "nonVocabularies",
                                resolver: "{permissionsResolver}",
                                recordTypeManager: "{recordTypeManager}",
                                permission: "list"
                            }
                        }
                    }, undefined]
                }
            }
        });
        fluid.demands("sidebar", ["cspace.pageBuilder", "place"], {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                primaryRecordType: "{pageBuilder}.options.pageType",
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model",
                relationsElPath: "refobjs",
                components: {
                    cataloging: {
                        type: "fluid.emptySubcomponent"
                    },
                    procedures: {
                        type: "fluid.emptySubcomponent"
                    },
                    nonVocabularies: {
                        type: "cspace.relatedRecordsList",
                        createOnEvent: "afterRender",
                        options: {
                            primary: "{sidebar}.options.primaryRecordType",
                            related: "nonVocabularies",
                            applier: "{sidebar}.options.recordApplier",
                            model: "{sidebar}.options.recordModel",
                            relationsElPath: "{sidebar}.options.relationsElPath"
                        }
                    }
                },
                selectors: {
                    relatedNonVocabularies: ".csc-related-nonVocabularies"
                },
                selectorsToIgnore: ["report", "numOfTerms", "mediaSnapshot", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable", "relatedNonVocabularies"],
                model: {
                    categories: [{
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.modelBuilder",
                            args: {
                                callback: "cspace.sidebar.buildModel",
                                related: "nonVocabularies",
                                resolver: "{permissionsResolver}",
                                recordTypeManager: "{recordTypeManager}",
                                permission: "list"
                            }
                        }
                    }, undefined]
                }
            }
        });
        fluid.demands("sidebar", ["cspace.pageBuilder", "concept"], {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                primaryRecordType: "{pageBuilder}.options.pageType",
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model",
                relationsElPath: "refobjs",
                components: {
                    cataloging: {
                        type: "fluid.emptySubcomponent"
                    },
                    procedures: {
                        type: "fluid.emptySubcomponent"
                    },
                    nonVocabularies: {
                        type: "cspace.relatedRecordsList",
                        createOnEvent: "afterRender",
                        options: {
                            primary: "{sidebar}.options.primaryRecordType",
                            related: "nonVocabularies",
                            applier: "{sidebar}.options.recordApplier",
                            model: "{sidebar}.options.recordModel",
                            relationsElPath: "{sidebar}.options.relationsElPath"
                        }
                    }
                },
                selectors: {
                    relatedNonVocabularies: ".csc-related-nonVocabularies"
                },
                selectorsToIgnore: ["report", "numOfTerms", "mediaSnapshot", "termsUsed", "relatedCataloging", "relatedProcedures", "header", "togglable", "relatedNonVocabularies"],
                model: {
                    categories: [{
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.modelBuilder",
                            args: {
                                callback: "cspace.sidebar.buildModel",
                                related: "nonVocabularies",
                                resolver: "{permissionsResolver}",
                                recordTypeManager: "{recordTypeManager}",
                                permission: "list"
                            }
                        }
                    }, undefined]
                }
            }
        });
        fluid.demands("cspace.sidebar.media", "cspace.sidebar", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                model: "{sidebar}.options.recordModel",
                applier: "{sidebar}.options.recordApplier"
            }, "{arguments}.1"]
        });
        
        // tabs demands
        fluid.demands("tabs", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.tabs",
            options: {
                primaryRecordType: "{pageBuilder}.options.pageType",
                applier: "{pageBuilder}.applier",
                model: "{pageBuilder}.model"
            }
        });
        fluid.demands("tabs", ["cspace.pageBuilder", "cspace.administration"], {
            container: "{pageBuilder}.options.selectors.tabs",
            options: {
                configURLTemplate: "%webapp/config/administration-%record.json"
            }
        });
        
        fluid.demands("cspace.tabs.tabsSuccess", "cspace.tabs", {
            funcName: "cspace.tabs.tabsSuccess",
            args: ["{arguments}.0", "{arguments}.1", "{arguments}.2", "{tabs}.tabsList", "{tabs}.dom.tabs", "{tabs}.setupTab"]
        });
        
        fluid.demands("cspace.tabs.tabsSelect", "cspace.tabs", {
            funcName: "cspace.tabs.tabsSelect",
            args: ["{arguments}.0", "{tabs}.tabsList", "{tabs}.options.selectors", "{tabs}.dom.tabs"]
        });
        
        fluid.demands("cspace.tabs.tabsSelectWrapper", "cspace.tabs", {
            funcName: "cspace.tabs.tabsSelectWrapper",
            args: ["{arguments}.0", "{arguments}.1", "{tabs}.globalNavigator", "{tabs}.tabsList", "{tabs}.tabsList.options.styles", "{tabs}.tabsSelect"]
        });
        
        fluid.demands("cspace.tabs.setupTab", "cspace.tabs", {
            funcName: "cspace.tabs.setupTab",
            args: ["@0", "{tabs}"]
        });
        
        fluid.demands("cspace.tabs.setupTab", ["cspace.tabs" ,"cspace.administration"], {
            funcName: "cspace.tabs.setupAdminTab",
            args: ["@0", "{tabs}"]
        });
        
        // tab list demands
        fluid.demands("tabsList", ["cspace.tabs", "person"], {
            container: "{tabs}.dom.tabsList",
            options: {
                model: {
                    tabs: {
                        primary: {
                            "name": "tablist-primary",
                            href: "#primaryTab",
                            title: "tablist-primary"
                        }
                    }
                }
            }
        });
        fluid.demands("tabsList", ["cspace.tabs", "organization"], {
            container: "{tabs}.dom.tabsList",
            options: {
                model: {
                    tabs: {
                        primary: {
                            "name": "tablist-primary",
                            href: "#primaryTab",
                            title: "tablist-primary"
                        }
                    }
                }
            }
        });
        fluid.demands("tabsList", ["cspace.tabs", "taxon"], {
            container: "{tabs}.dom.tabsList",
            options: {
                model: {
                    tabs: {
                        primary: {
                            "name": "tablist-primary",
                            href: "#primaryTab",
                            title: "tablist-primary"
                        }
                    }
                }
            }
        });
        fluid.demands("tabsList", ["cspace.tabs", "location"], {
            container: "{tabs}.dom.tabsList",
            options: {
                model: {
                    tabs: {
                        primary: {
                            "name": "tablist-primary",
                            href: "#primaryTab",
                            title: "tablist-primary"
                        }
                    }
                }
            }
        });
        fluid.demands("tabsList", ["cspace.tabs", "concept"], {
            container: "{tabs}.dom.tabsList",
            options: {
                model: {
                    tabs: {
                        primary: {
                            "name": "tablist-primary",
                            href: "#primaryTab",
                            title: "tablist-primary"
                        }
                    }
                }
            }
        });
        fluid.demands("tabsList", ["cspace.tabs", "place"], {
            container: "{tabs}.dom.tabsList",
            options: {
                model: {
                    tabs: {
                        primary: {
                            "name": "tablist-primary",
                            href: "#primaryTab",
                            title: "tablist-primary"
                        }
                    }
                }
            }
        }); 
        fluid.demands("tabsList", ["cspace.tabs", "cspace.administration"], {
            container: "{tabs}.dom.tabsList",
            options: {
                model: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.modelBuilder",
                        args: {
                            related: "administration",
                            resolver: "{permissionsResolver}",
                            recordTypeManager: "{recordTypeManager}",
                            permission: "list",
                            href: "%webapp/html/pages/Administration-%recordType.html",
                            callback: "cspace.tabsList.buildAdminModel"
                        }
                    }
                }
            }
        });
        fluid.demands("tabsList", "cspace.tabs", {
            container: "{tabs}.dom.tabsList"
        });
        fluid.demands("cspace.templateEditor", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{recordEditor}.applier",
                model: "{recordEditor}.model"
            }, "{arguments}.1"]
        });
        fluid.demands("titleBar", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.titleBar",
            options: {
                recordApplier: "{cspace.recordEditor}.applier",
                recordModel: "{cspace.recordEditor}.model",
                model: {
                    recordType: "{pageBuilder}.options.recordType"
                }
            }
        });
        fluid.demands("titleBar", ["cspace.pageBuilder", "cspace.administration"], {
            container: "{pageBuilder}.options.selectors.titleBar",
            options: {
                strings: {
                    administration: "{globalBundle}.messageBase.admin-administration"
                },
                model: {
                    recordType: "administration"
                }
            }
        });
        
        // urnToStringFieldConverter demands
        fluid.demands("cspace.util.urnToStringFieldConverter", "cspace.recordEditor", {
            container: "{arguments}.0"
        });
        
        // nameForValueFinder demands
        fluid.demands("cspace.util.nameForValueFinder", "cspace.recordEditor", {
            container: "{arguments}.0"
        });
        
        // Composite demands
        fluid.demands("cspace.composite", "cspace.pageBuilderIO", {
            options: {
                invokers: {
                    transform: {
                        funcName: "fluid.model.transformWithRules",
                        args: ["{arguments}.0", "{arguments}.1"]
                    }
                },
                resources: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "fluid.merge",
                        args: [null, {}, "{pageBuilderIO}.options.schema", {"uispec": null}]
                    }
                },
                urls: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.urlBuilder",
                        args: {
                            composite: "%tenant/%tname/composite",
                            prefix: "%tenant/%tname"
                        }
                    }
                }
            }
        });
        fluid.demands("cspace.composite", ["cspace.pageBuilderIO", "cspace.localData"], "{options}");
        fluid.demands("cspace.composite.compose", ["cspace.composite", "cspace.localData"], {
            funcName: "cspace.composite.composeLocal",
            args: "{arguments}.0"
        });
        fluid.demands("cspace.composite.compose", "cspace.composite", {
            funcName: "cspace.composite.compose",
            args: ["{composite}", "{arguments}.0"]
        });
        
        fluid.demands("cspace.advancedSearch.fetcher", "cspace.advancedSearch", "{options}");

        fluid.demands("cspace.advancedSearch.searchFields", "cspace.debug", {
            options: {
                components: {
                    uispecVerifier: {
                        type: "cspace.uispecVerifier"
                    }
                }
            }
        });
    };
    
    fluid.demands("cspace.localDemands", "cspace.localData", {
        options: {
            finalInitFunction: cspace.includeLocalDemands
        }
    });
    
    fluid.defaults("cspace.demands", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: cspace.includeDemands
    });
    fluid.defaults("cspace.localDemands", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    if (document.location.protocol === "file:") {
        fluid.staticEnvironment.cspaceEnvironment = fluid.typeTag("cspace.localData");
    }
    fluid.invoke("cspace.demands");
    fluid.invoke("cspace.localDemands");
    
})(jQuery, fluid);
