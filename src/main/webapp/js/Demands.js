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
    
    fluid.demands("cspace.localDemands", "cspace.localData", {
        options: {
            finalInitFunction: "cspace.includeLocalDemands"
        }
    });
    fluid.demands("cspace.testDemands", "cspace.test", {
        options: {
            finalInitFunction: "cspace.includeTestDemands"
        }
    });
    
    fluid.defaults("cspace.demands", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "cspace.includeDemands"
    });
    fluid.defaults("cspace.localDemands", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    fluid.defaults("cspace.testDemands", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    cspace.includeLocalDemands = function () {
        
        // Admin roles demands
        fluid.demands("role", ["cspace.pageBuilder", "cspace.localData"], {
            container: "{pageBuilder}.options.selectors.role",
            options: {
                recordType: "role/records.json",
                components: {
                    roleListEditor: {
                        options: {
                            baseUrl: "../../../test/data/"
                        }
                    }
                }
            }
        });
        
        // Admin users demands
        fluid.demands("users", ["cspace.pageBuilder", "cspace.localData"], {
            container: "{pageBuilder}.options.selectors.users",
            options: {
                recordType: "users/records.json",
                queryURL: "../../../test/data/users/search.json",
                components: {
                    userListEditor: {
                        options: {
                            baseUrl: "../../../test/data/"
                        }
                    }
                }
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
            funcName: "cspace.createNew.createRecordLocal",
            args: ["{createNew}"]
        });
        
        // DataContext demands
        fluid.demands("detailsDC", ["cspace.listEditor", "cspace.localData"], {
            options: {
                model: "{listEditor}.model.details",
                baseUrl: "../../../test/data",
                fileExtension: ".json"
            }
        });
        fluid.demands("detailsDC", ["cspace.listEditor", "cspace.tabs", "cspace.localData"], {
            options: {
                model: "{listEditor}.model.details",
                baseUrl: "../../../test/data",
                fileExtension: ".json"
            }
        });
        fluid.demands("dataContext", ["cspace.relationManager", "cspace.localData"], {
            options: {
                model: "{relationManager}.model",
                baseUrl: "../../../test/data",
                fileExtension: ".json"
            }
        });
        fluid.demands("dataContext", ["cspace.pageBuilderIO", "cspace.localData"], {
            options: {
                model: "{pageBuilderIO}.options.model",
                baseUrl: "../../../test/data",
                fileExtension: ".json"
            }
        });
        
        // DataSource demands
        fluid.demands("dataSource", "cspace.localData", {
            options: {
                schema: "{pageBuilder}.schema"
            }
        });
        fluid.demands("dataSource", ["cspace.role", "cspace.localData"], {
            options: {
                schema: "{pageBuilder}.schema",
                sources: {
                    permission: {
                        href: "../../../test/data/permission/list.json",
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
                        href: "../../../test/data/role/list.json",
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
                listeners: {
                    addRelations: {
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.relationManager.provideLocalAddRelations",
                            args: "{relationManager}"
                        }
                    }
                }
            }
        });
        
        // searchView demands
        fluid.demands("search", ["cspace.searchToRelateDialog", "cspace.localData"], {
            container: "{searchToRelateDialog}.container",
            options: {
                searchUrlBuilder: "cspace.search.localSearchUrlBuilder"
            }
        });
        fluid.demands("search", ["cspace.pageBuilder", "cspace.localData"], {
            container: "{pageBuilder}.options.selectors.search",
            options: {
                searchUrlBuilder: "cspace.search.localSearchUrlBuilder"
            }
        });
        
        // urlExpander demands
        fluid.demands("cspace.urlExpander", "cspace.localData", {
            options: {
                vars: {
                    chain: ".."
                }
            }
        });
        
        // getDefaultConfigURL demands
        fluid.demands("cspace.util.getDefaultConfigURL", ["cspace.record", "cspace.localData"], {
            options: {
                invokers: {
                    getRecordType: {
                        funcName: "cspace.util.getDefaultConfigURL.getRecordTypeLocal"
                    }
                }
            }
        });
        fluid.demands("cspace.util.getDefaultConfigURL", "cspace.localData", "{options}");
        
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
        
        // List Editor's demands
        fluid.demands("roleListEditor", "cspace.adminRoles", {
            container: "{adminRoles}.container", 
            options: {
                recordType: "{adminRoles}.options.recordType",
                uispec: "{adminRoles}.options.uispec"
            }
        });
        fluid.demands("userListEditor", "cspace.adminUsers", {
            container: "{adminUsers}.container",
            options: {
                recordType: "{adminUsers}.options.recordType",
                uispec: "{adminUsers}.options.uispec"
            }
        });
        fluid.demands("listEditor", "cspace.relatedRecordsTab", {
            container: "{relatedRecordsTab}.container",
            options: {
                recordType: "{relatedRecordsTab}.related",
                uispec: "{relatedRecordsTab}.options.uispec"
            }
        });
            
        // Admin roles demands
        fluid.demands("role", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.role"
        });
        fluid.demands("users", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.users"
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
                    term: "encodeURIComponent:%term"
                },
                targetTypeName: "cspace.autocomplete.matchesDataSource"
            }
        });
        fluid.demands("cspace.autocomplete.newTermDataSource", "cspace.autocomplete", {
            funcName: "cspace.URLDataSource",
            args: {
                url: "../../chain%termUrl",
                termMap: {
                    termUrl: "%termUrl"
                },
                writeable: true,
                targetTypeName: "cspace.autocomplete.newTermDataSource"
            }
        });
        fluid.demands("fluid.autocomplete.autocompleteView", "cspace.autocomplete", {
            container: "{autocomplete}.autocompleteInput",
        }); 
        fluid.demands("cspace.autocomplete.popup", "cspace.autocomplete", {
            container: "{autocomplete}.popupElement"
        });
        fluid.demands("cspace.autocomplete.closeButton", "cspace.autocomplete", {
            container: "{autocomplete}.autocompleteInput"
        });
        fluid.demands("cspace.autocomplete", "cspace.recordEditor", {
            container: "{arguments}.0"
        });
        
        // Confirmation demands
        fluid.demands("confirmation", "cspace.recordEditor", "{options}");
        
        // CreateNew demands
        fluid.demands("createRecord", "cspace.pageBuilder", {
            funcName: "cspace.createNew.createRecord",
            args: ["{createNew}"]
        });
        fluid.demands("createNew", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.createNew"
        });
        
        // DataContext demands
        fluid.demands("detailsDC", "cspace.listEditor", {
            options: {
                model: "{listEditor}.model.details"
            }
        });
        fluid.demands("dataContext", "cspace.relationManager", {
            options: {
                model: "{relationManager}.model"
            }
        });
        fluid.demands("dataContext", "cspace.pageBuilderIO", {
            options: {
                model: "{pageBuilderIO}.options.model"
            }
        });
        fluid.demands("detailsDC", ["cspace.listEditor", "cspace.tabs"], {
            options: {
                model: "{listEditor}.model.details"
            }
        });
        
        // DataSource demands
        fluid.demands("dataSource", "cspace.role", {
            options: {
                schema: "{pageBuilder}.schema",
                sources: {
                    permission: {
                        href: "../../chain/permission/search?actGrp=CRUDL",
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
                        href: "../../chain/role",
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
                messageBar: "{recordEditor}.options.messageBar"
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
        
        // Record Editor demands
        fluid.demands("details", "cspace.listEditor", {
            container: "{listEditor}.dom.details"
        });
        fluid.demands("recordEditor", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.recordEditor"
        });
        fluid.demands("cancel", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.cancel",
            args: "{recordEditor}"
        });
        
        // Record List demands
        fluid.demands("list", "cspace.listEditor", {
            container: "{listEditor}.dom.list"
        });
        fluid.demands("cataloging", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.dom.cataloging"
        }); 
        fluid.demands("intake", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.dom.intake"
        }); 
        fluid.demands("acquisition", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.dom.acquisition"
        });
        fluid.demands("loanin", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.dom.loanin"
        });
        fluid.demands("loanout", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.dom.loanout"
        }); 
        fluid.demands("movement", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.dom.movement"
        });
        fluid.demands("objectexit", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.dom.objectexit"
        });
        fluid.demands("media", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.dom.media"
        });
        fluid.demands("cspace.recordList", "cspace.relatedRecordsList", {
            container: "{relatedRecordsList}.dom.recordListSelector",
            options: {
                model: {
                    selectionIndex: -1,
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
        
        // Login demands
        fluid.demands("login", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.login"
        });
        
        // Media upload demands
        fluid.demands("uploader", "cspace.recordEditor", {
            container: "{recordEditor}.dom.uploader",
            options: {
                model: "{recordEditor}.model",
                applier: "{recordEditor}.options.applier",
                listeners: {
                    onLink: "{recordEditor}.requestSave",
                    onRemove: "{recordEditor}.requestSave"
                }
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
            options: {
                baseUrl: "{recordEditor}.options.dataContext.options.baseUrl"
            }
        });
        
        // Togglable demands
        fluid.demands("togglable", "cspace.myCollectionSpace", {
            container: "{myCollectionSpace}.container"
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
        
        // Password validator demands
        fluid.demands("passwordValidator", "cspace.adminUsers", {
            container: "{adminUsers}.container"
        }); 
        fluid.demands("passwordValidator", "cspace.login", {
            container: "{login}.container"
        });
        
        // Related records list demands
        fluid.demands("procedures", "cspace.sidebar", {
            container: "{sidebar}.options.selectors.relatedProcedures"
        });
        fluid.demands("cataloging", "cspace.sidebar", {
            container: "{sidebar}.options.selectors.relatedCataloging"
        });
        
        // Relation manager demands
        fluid.demands("cspace.relationManager", "cspace.relatedRecordsList", {
            container: "{relatedRecordsList}.container"
        });
        fluid.demands("relationManager", "cspace.relatedRecordsTab", {
            container: "{relatedRecordsTab}.container"
        });
        
        // Related records tab demands
        fluid.demands("relatedRecordsTab", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.relatedRecordsTab"
        });
        
        // Search To Relate Dialog demands
        fluid.demands("cspace.searchToRelateDialog", "cspace.relationManager", {
            container: "{relationManager}.dom.searchDialog"
        });
        
        // Repeatable demands
        fluid.demands("cspace.makeRepeatable", "cspace.recordEditor", {
            container: "{arguments}.0",
            options: {
                applier: "{recordEditor}.options.applier",
                model: "{recordEditor}.model"
            }
        });
        
        // searchView deamnds
        fluid.demands("fluid.pager", "cspace.search.searchView", ["{searchView}.dom.resultsContainer", fluid.COMPONENT_OPTIONS]);
        fluid.demands("search", "cspace.searchToRelateDialog", {
            container: "{searchToRelateDialog}.container"
        });
        fluid.demands("search", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.search"
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
        
        // sidebar demands
        fluid.demands("sidebar", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                primaryRecordType: "{pageBuilder}.options.pageType",
                uispec: "{pageBuilder}.options.uispec.sidebar",
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model",
            }
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
        
        // tab list demands
        fluid.demands("tabsList", ["cspace.tabs", "cspace.person"], {
            container: "{tabs}.dom.tabsList",
            options: {
                strings: {
                    primary: "Current record"
                },
                model: {
                    tabs: {
                        primary: {
                            "name": "primary",
                            href: "#primaryTab"
                        }
                    }
                }
            }
        });
        fluid.demands("tabsList", ["cspace.tabs", "cspace.organization"], {
            container: "{tabs}.dom.tabsList",
            options: {
                strings: {
                    primary: "Current record"
                },
                model: {
                    tabs: {
                        primary: {
                            "name": "primary",
                            href: "#primaryTab"
                        }
                    }
                }
            }
        });
        fluid.demands("tabsList", "cspace.tabs", {
            container: "{tabs}.dom.tabsList"
        });
        fluid.demands("titleBar", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.titleBar",
            options: {
                recordApplier: "{pageBuilder}.applier",
                recordModel: "{pageBuilder}.model",
                model: {
                    recordType: "{pageBuilder}.options.recordType"
                }
            }
        });
        
        // getDefaultConfigURL demands
        fluid.demands("cspace.util.getDefaultConfigURL", "cspace.record", "{options}");
        
        // urnToStringFieldConverter demands
        fluid.demands("cspace.util.urnToStringFieldConverter", "cspace.recordEditor", {
            container: "{arguments}.0"
        });
        
        // nameForValueFinder demands
        fluid.demands("cspace.util.nameForValueFinder", "cspace.recordEditor", {
            container: "{arguments}.0"
        });
        
        // nologin demands
        fluid.demands("noLogin", "cspace.login", {
            options: {
                noLogin: true
            }
        });
    };
    
    cspace.includeTestDemands = function () {
        // DataContext demands
        fluid.demands("detailsDC", ["cspace.listEditor", "cspace.tabs", "cspace.localData", "cspace.test"], {
            options: {
                model: "{listEditor}.model.details",
                baseUrl: "../data",
                fileExtension: ".json"
            }
        });
        fluid.demands("detailsDC", ["cspace.listEditor", "cspace.test", "cspace.localData"], {
            options: {
                model: "{listEditor}.model.details",
                baseUrl: "../data",
                fileExtension: ".json"
            }
        });
        
        // DataSource demands
        fluid.demands("dataSource", ["cspace.localData", "cspace.test"], {
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
    };
    
    if (document.location.protocol === "file:") {
        fluid.staticEnvironment.cspaceEnvironment = fluid.typeTag("cspace.localData");
    }
    fluid.invoke("cspace.demands");
    fluid.invoke("cspace.localDemands");
    fluid.invoke("cspace.testDemands");
    
})(jQuery, fluid);