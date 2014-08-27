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

    // This file contains most of the demand blocks across Collection
    // Space application.
    // The file is split into 2 sections: one for local
    // (inside cspace.includeLocalDemands) that's only loaded when
    // application is run locally in the browser from filesystem,
    // the other ones is (within cspace.includeDemands) that is loaded
    // in all contexts - a set of demands used in production.
    
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
        
        // getDefaultConfigURL demands
        fluid.demands("getRecordType", ["cspace.util.getDefaultConfigURL", "cspace.localData"], {
            funcName: "cspace.util.getDefaultConfigURL.getRecordTypeLocal"
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
        
        // Batch Runner
        fluid.demands("cspace.batchRunner.batchTypesSource", ["cspace.batchRunner", "cspace.localData"], {
            funcName: "cspace.batchRunner.testBatchTypesSource",
            args: {
                targetTypeName: "cspace.batchRunner.testBatchTypesSource",
                termMap: {
                    recordType: "%recordType"
                }
            }
        });

        // Autocomplete demands
        var localDataSourceDemands = {
            funcName: "cspace.URLDataSource",
            args: {
                url: "%tenant/%tname/data/basic/%recordType/%csid.json",
                termMap: {
                    csid: "%csid",
                    recordType: "%recordType",
                    vocab: "%vocab"
                }
            }
        };
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cspace.localData"], localDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cspace.localData", "person-miniView"], localDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cspace.localData", "organization-miniView"], localDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cspace.localData", "location-miniView"], localDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cspace.localData", "concept-miniView"], localDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cspace.localData", "place-miniView"], localDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cspace.localData", "citation-miniView"], localDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cspace.localData", "work-miniView"], localDataSourceDemands);
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

        fluid.demands("cspace.util.globalNavigator", null, {
            container: "body",
            options: {
                selectors: {
                    include: "a",
                    exclude: ".cke_button, [href*=#], .csc-confirmation-exclusion, .ui-autocomplete a",
                    forms: ".csc-header-logout-form"
                }
            }
        });

        fluid.demands("cspace.util.recordLock", "cspace.recordEditor", {
            options: fluid.COMPONENT_OPTIONS
        });

        fluid.demands("cspace.util.recordLock", ["cspace.recordEditor", "cspace.recordEditor.controlPanel"], {
            options: {
                model: "{cspace.recordEditor}.model",
                applier: "{cspace.recordEditor}.applier"
            }
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
            args: ["{relationManager}", "{messageBar}", "{globalModel}.model.primaryModel.csid", "{arguments}.0"]
        });
        
        fluid.demands("cspace.relationManager.add", ["cspace.relationManager", "cspace.relatedRecordsTab"], {
            funcName: "cspace.relationManager.addFromTab",
            args: ["{relationManager}", "{recordEditor}", "{messageBar}", "{globalModel}.model.primaryModel.csid", "{arguments}.0"]
        });
    
        // Validator
        fluid.demands("cspace.modelValidator", "cspace.recordEditor", {
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
            options: {
                model: "{recordEditor}.model",
                applier: "{recordEditor}.applier",
                uispec: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.hierarchy.filterUISpec",
                        args: "{pageBuilder}.options.uispec.hierarchy"
                    }
                }
            }
        });
        
        // getDefaultConfigURL demands
        fluid.demands("getRecordType", "cspace.util.getDefaultConfigURL", {
            funcName: "cspace.util.getDefaultConfigURL.getRecordType"
        });
            
        // Admin demands
        fluid.demands("admin", ["cspace.pageBuilder", "cspace.pageBuilderIO"], {
            container: "{pageBuilder}.options.selectors.admin",
            options: {
                recordType: "{pageBuilderIO}.options.recordType"
            }
        });
        
        // Autocomplete demands
        var authUrnToCSID = {
            options: {
                toCSID: "cspace.util.shortIdentifierToCSID"
            }
        };
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "cataloging-miniView"], {
            options: {
                toCSID: "cspace.util.urnToCSID"
            }
        });
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "vocab-miniView"], authUrnToCSID);
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "person-miniView"], authUrnToCSID);
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "organization-miniView"], authUrnToCSID);
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "location-miniView"], authUrnToCSID);
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "concept-miniView"], authUrnToCSID);
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "place-miniView"], authUrnToCSID);
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "citation-miniView"], authUrnToCSID);
        fluid.demands("cspace.autocomplete.popup.miniView.urnToCSID", ["cspace.autocomplete.popup.miniView", "work-miniView"], authUrnToCSID);
        fluid.demands("cspace.autocomplete.popup.miniView.renderer", ["cspace.autocomplete.popup.miniView", "person-miniView"], {
            options: {
                protoTree: {
                    displayName: {
                        target: "${miniView-link}",
                        linktext: "${fields.termDisplayName}"
                    },
                    field1: "${fields.birthPlace}",
                    field2: "${fields.birthDateGroup.dateDisplayDate}",
                    field3: "${fields.deathDateGroup.dateDisplayDate}",
                    field4: "${fields.datesActive}",
                    field1Label: {
                        messagekey: "person-miniView-field1Label"
                    },
                    field2Label: {
                        messagekey: "person-miniView-field2Label"
                    },
                    field3Label: {
                        messagekey: "person-miniView-field3Label"
                    },
                    field4Label: {
                        messagekey: "person-miniView-field4Label"
                    }
                }
            }
        });
        fluid.demands("cspace.autocomplete.popup.miniView.renderer", ["cspace.autocomplete.popup.miniView", "organization-miniView"], {
            options: {
                protoTree: {
                    displayName: {
                        target: "${miniView-link}",
                        linktext: "${fields.termDisplayName}"
                    },
                    field1: "${fields.foundingDateGroup.dateDisplayDate}",
                    field2: "${fields.dissolutionDateGroup.dateDisplayDate}",
                    field3: "${fields.historyNotes.0.historyNote}",
                    field1Label: {
                        messagekey: "organization-miniView-field1Label"
                    },
                    field2Label: {
                        messagekey: "organization-miniView-field2Label"
                    }
                }
            }
        });
        fluid.demands("cspace.autocomplete.popup.miniView.renderer", ["cspace.autocomplete.popup.miniView", "location-miniView"], {
            options: {
                protoTree: {
                    displayName: {
                        target: "${miniView-link}",
                        linktext: "${fields.termDisplayName}"
                    }
                }
            }
        });
        fluid.demands("cspace.autocomplete.popup.miniView.renderer", ["cspace.autocomplete.popup.miniView", "concept-miniView"], {
            options: {
                protoTree: {
                    displayName: {
                        target: "${miniView-link}",
                        linktext: "${fields.termDisplayName}"
                    }
                }
            }
        });
        fluid.demands("cspace.autocomplete.popup.miniView.renderer", ["cspace.autocomplete.popup.miniView", "place-miniView"], {
            options: {
                protoTree: {
                    displayName: {
                        target: "${miniView-link}",
                        linktext: "${fields.termDisplayName}"
                    }
                }
            }
        });
        fluid.demands("cspace.autocomplete.popup.miniView.renderer", ["cspace.autocomplete.popup.miniView", "citation-miniView"], {
            options: {
                protoTree: {
                    displayName: {
                        target: "${miniView-link}",
                        linktext: "${fields.termDisplayName}"
                    }
                }
            }
        });
        fluid.demands("cspace.autocomplete.popup.miniView.renderer", ["cspace.autocomplete.popup.miniView", "work-miniView"], {
            options: {
                protoTree: {
                    displayName: {
                        target: "${miniView-link}",
                        linktext: "${fields.termDisplayName}"
                    }
                }
            }
        });
        fluid.demands("cspace.autocomplete.popup.miniView.renderer", ["cspace.autocomplete.popup.miniView", "cataloging-miniView"], {
            options: {
                toCSID: "cspace.util.urnToCSID",
                url: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.urlBuilder",
                        args: "%webapp/html/%recordType.html?csid=%csid"
                    }
                },
                protoTree: {
                    displayName: {
                        target: "${miniView-link}",
                        linktext: "${fields.objectNumber}"
                    }
                }
            }
        });
        var authDataSourceDemands = {
            funcName: "cspace.URLDataSource",
            args: {
                url: "%tenant/%tname/vocabularies/basic/%vocab/%csid",
                termMap: {
                    csid: "%csid",
                    recordType: "%recordType",
                    vocab: "%vocab"
                }
            }
        };
        var nonAuthDataSourceDemands = {
            funcName: "cspace.URLDataSource",
            args: {
                url: "%tenant/%tname/basic/%recordType/%csid",
                termMap: {
                    csid: "%csid",
                    recordType: "%recordType",
                    vocab: "%vocab"
                }
            }
        };
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "cataloging-miniView"], nonAuthDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "vocab-miniView"], authDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "person-miniView"], authDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "organization-miniView"], authDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "location-miniView"], authDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "concept-miniView"], authDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "place-miniView"], authDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "citation-miniView"], authDataSourceDemands);
        fluid.demands("cspace.autocomplete.popup.miniView.dataSource", ["cspace.autocomplete.popup.miniView", "work-miniView"], authDataSourceDemands);
        fluid.demands("cspace.autocomplete.authoritiesDataSource", "cspace.autocomplete", {
            funcName: "cspace.URLDataSource",
            args: {
                url: "%vocabUrl%vocab",
                termMap: {
                    vocabUrl: "{autocomplete}.options.vocabUrl",
                    vocab: "{autocomplete}.options.urls.vocabSingle"
                },
                targetTypeName: "cspace.autocomplete.authoritiesDataSource"
            }
        });
        fluid.demands("cspace.autocomplete.matchesDataSource", "cspace.autocomplete", {
            funcName: "cspace.URLDataSource", 
            args: {
                url: "%queryUrl?q=%term%vocab",
                termMap: {
                    queryUrl: "{autocomplete}.options.queryUrl",
                    term: "encodeURIComponent:%term",
                    vocab: "{autocomplete}.options.urls.vocab"
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
        fluid.demands("cspace.autocomplete.popup", ["cspace.hierarchyAutocomplete", "cspace.autocomplete", "cspace.authority"], {
            container: "{autocomplete}.popupElement",
            options: {
                recordModel: "{cspace.recordEditor}.model"
            }
        });
        fluid.demands("cspace.autocomplete.popup", ["cspace.hierarchyAutocomplete", "cspace.autocomplete", "cspace.nonAuthority"], {
            container: "{autocomplete}.popupElement",
            options: {
                produceTree: "cspace.autocomplete.produceTreeStructuredObjects",
                recordModel: "{cspace.recordEditor}.model",
                selectors: {
                    newTermName: ".csc-autocomplete-newTermName",
                    newTermNamePrefix: ".csc-autocomplete-newTermName-prefix",
                    newTermNamePostfix: ".csc-autocomplete-newTermName-postfix"
                }
            }
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
                        }, "create"]
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.autocomplete", ["cspace.recordEditor", "cspace.authority", "cspace.hierarchyAutocomplete"], {
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
                        }, "create"]
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
        fluid.demands("cspace.autocomplete", ["cspace.recordEditor", "cspace.nonAuthority", "cspace.hierarchyAutocomplete"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                components: {
                    confirmation: "{confirmation}",
                    broaderDataSource: {
                        type: "cspace.autocomplete.broaderDataSource"
                    }
                },
                invokers: {
                    selectAuthority: {
                        funcName: "cspace.autocomplete.selectAuthorityStructuredObjects",
                        args: ["{autocomplete}", "{cspace.recordEditor}.model", "{changeTracker}", "{messageBar}", "{cspace.recordEditor}.options.fieldsToIgnore", "{pageBuilder}.schema", "{arguments}.0"]
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

        // Batch runner

        fluid.demands("cspace.batchRunner", ["cspace.sidebar", "cspace.pageBuilder"], {
            options: {
                listeners: {
                    onSynchronousFetch: "{loadingIndicator}.events.showOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire",
                    onStop: "{loadingIndicator}.events.hideOn.fire",
                    batchFinished: "{loadingIndicator}.events.hideOn.fire"
                }
            }
        });

        fluid.demands("cspace.batchRunner.batchTypesSource", "cspace.batchRunner", {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{batchRunner}.options.urls.batchTypesUrl",
                targetTypeName: "cspace.batchRunner.batchTypesSource",
                termMap: {
                    recordType: "%recordType"
                }
            }
        });
        
        fluid.demands("cspace.batchRunner.runBatch", ["cspace.batchRunner", "cspace.recordEditor"], {
            funcName: "cspace.batchRunner.runBatch",
            args: ["{batchRunner}.confirmation", "{batchRunner}.options.parentBundle", "{batchRunner}.requestBatch", "{recordEditor}"]
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
        fluid.demands("confirmation", "cspace.batchRunner", "{options}");

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
        
        // DatePicker demands
        fluid.demands("cspace.datePicker", "cspace.recordEditor", {
            container: "{arguments}.0",
            options: {
                readOnly: "{recordEditor}.options.readOnly"
            }
        });
        fluid.demands("cspace.datePicker", "cspace.advancedSearch", {
            options: {
                eras: ["BCE", "B.C.", "B.C.E.", "C.E.", "BC", "CE", "AD", "A.D."]
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

        fluid.demands("header", ["cspace.pageBuilder", "cspace.authority"], {
            container: "{pageBuilder}.options.selectors.header",
            options: {
                components: {
                    parentStyler: {
                        type: "cspace.header.parentStyler",
                        container: "{cspace.header}.container"
                    }
                }
            }
        });
        
        fluid.demands("recordEditor", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.recordEditor",
            options: {
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
        
        fluid.demands("cancel", "cspace.recordEditor", {
            funcName: "cspace.recordEditor.cancel",
            args: "{recordEditor}"
        });
        
        fluid.demands("cspace.recordEditor.remover.remove", ["cspace.recordEditor.remover", "cspace.authority"], {
            funcName: "cspace.recordEditor.remover.removeWithCheckRefobjs",
            args: ["{cspace.recordEditor.remover}", "{cspace.recordEditor}.model", "{confirmation}", "{globalBundle}"]
        });
        
        fluid.demands("cspace.recordEditor.remover.remove", ["cspace.recordEditor.remover", "cataloging.delete"], {
            funcName: "cspace.recordEditor.remover.removeWithCheck",
            args: ["{cspace.recordEditor.remover}", "{cspace.recordEditor}.model", "{confirmation}", "{globalBundle}"]
        });
        
        fluid.demands("cspace.recordEditor.remover.remove", "cspace.recordEditor.remover", {
            funcName: "cspace.recordEditor.remover.remove",
            args: "{cspace.recordEditor.remover}"
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
        fluid.demands("cspace.listView", "cspace.myCollectionSpace", {
            options: {
                listeners: {
                    onModelChange: "{loadingIndicator}.events.showOn.fire",
                    afterUpdate: "{loadingIndicator}.events.hideOn.fire",
                    ready: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire"
                }
            }
        });
        fluid.demands("cspace.listView", ["cspace.admin", "cspace.termlist"], {
            options: fluid.COMPONENT_OPTIONS
        });
        fluid.demands("cspace.listView", ["cspace.admin", "cspace.users"], {
            options: {
                urls: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.urlBuilder",
                        args: {
                            listUrl: "%tenant/%tname/%recordType/search?query=%query&pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey"
                        }
                    }
                },
                elPath: "results",
                // TODO: Disabling pagintaion related things, since it does not work yet for users.
                disablePageSize: true,
                model: {
                    // TODO: Disabling pagintaion related things, since it does not work yet for users.
                    pageSizeList: ["40"],
                    pagerModel: {
                        pageSize: 40
                    },
                    columns: [{
                        sortable: false,
                        id: "screenName",
                        name: "%recordType-screenName"
                    }, {
                        sortable: false,
                        id: "status",
                        name: "%recordType-status"
                    }]
                }
            }
        });
        fluid.demands("cspace.listView", ["cspace.admin", "cspace.role"], {
            options: {
                elPath: "items",
                disablePageSize: true,
                stubbPagination: true,
                model: {
                    pageSizeList: ["40"],
                    pagerModel: {
                        pageSize: 40
                    },
                    columns: [{
                        sortable: false,
                        id: "number",
                        name: "%recordType-number"
                    }]
                }
            }
        });
        fluid.demands("cspace.listView", "cspace.sidebar", {
            options: fluid.COMPONENT_OPTIONS
        });
        fluid.demands("cspace.listView", ["cspace.sidebar", "cspace.authority"], {
            options: {
                urls: {
                    expander: {
                        type: "fluid.deferredInvokeCall",
                        func: "cspace.util.urlBuilder",
                        args: {
                            listUrl: "%tenant/%tname/vocabularies/%vocab/%related/%csid?pageNum=%pageNum&pageSize=%pageSize&sortDir=%sortDir&sortKey=%sortKey"
                        }
                    }
                }
            }
        });
        fluid.demands("cspace.listView", "cspace.relatedRecordsTab", {
            options: {
                components: {
                    relationRemover: {
                        type: "cspace.util.relationRemover",
                        createOnEvent: "pagerAfterRender",
                        options: {
                            offset: "{cspace.listView}.model.offset",
                            rows: "{cspace.listView}.dom.row",
                            list: "{cspace.listView}.model.list",
                            primary: "{cspace.relatedRecordsTab}.options.primary",
                            related: "{cspace.relatedRecordsTab}.options.related"
                        }
                    }
                }
            }
        });
        fluid.demands("cspace.listView", ["cspace.relatedRecordsTab", "cspace.relatedTabList.movement"], {
            options: {
                model: {
                    pagerModel: {
                        sortDir: -1,
                        sortKey: "movements_common.locationDate"
                    },
                    columns: [{
                        sortable: true,
                        id: "number",
                        name: "%recordType-number"
                    }, {
                        sortable: true,
                        id: "summary",
                        name: "summary"
                    }, {
                        sortable: true,
                        id: "summarylist.locationDate",
                        name: "listView-locationDate"
                    }]
                },
                components: {
                    relationRemover: {
                        type: "cspace.util.relationRemover",
                        createOnEvent: "pagerAfterRender",
                        options: {
                            offset: "{cspace.listView}.model.offset",
                            rows: "{cspace.listView}.dom.row",
                            list: "{cspace.listView}.model.list",
                            primary: "{cspace.relatedRecordsTab}.options.primary",
                            related: "{cspace.relatedRecordsTab}.options.related"
                        }
                    }
                }
            }
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
        fluid.demands("togglable", "cspace.relatedRecordsTab", {
            container: "{relatedRecordsTab}.container"
        });
        fluid.demands("hierarchyTogglable", "cspace.hierarchyAutocomplete", {
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
        fluid.demands("vocabularies", "cspace.sidebar", {
            container: "{sidebar}.options.selectors.relatedVocabularies"
        });
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
            options: fluid.COMPONENT_OPTIONS
        });
        fluid.demands("relationManager", ["cspace.relatedRecordsList", "cspace.authority"], {
            options: {
                components: {
                    showAddButton: {
                        type: "fluid.emptySubcomponent"
                    }
                }
            }
        });

        fluid.demands("cspace.searchResultsRelationManager", "cspace.advancedSearch", {
            options: {
                listeners: {
                    beforeFetchExistingRelations: "{loadingIndicator}.events.showOn.fire",
                    afterAddRelations: "{loadingIndicator}.events.hideOn.fire",
                    onError: "{loadingIndicator}.events.hideOn.fire"
                }
            }
        });
        
        // Related records tab demands
        fluid.demands("relatedRecordsTab", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.relatedRecordsTab"
        });
        
        // Search To Relate Dialog demands
        fluid.demands("cspace.searchToRelateDialog", "cspace.relationManager", {
            options: {
                model: {
                    showCreate: true
                },
                related: "{cspace.relationManager}.options.related",
                primary: "{cspace.relationManager}.options.primary",
                events: {
                    onAddRelation: "{cspace.relationManager}.events.onAddRelation",
                    onCreateNewRecord: "{cspace.relationManager}.events.onCreateNewRecord"
                },
                listeners: {
                    onClose: "{cspace.relationManager}.onDialogClose"
                }
            }
        });
        fluid.demands("cspace.searchToRelateDialog", ["cspace.relationManager", "cspace.sidebar"], {
            options: {
                related: "{cspace.relationManager}.options.related",
                primary: "{cspace.relationManager}.options.primary",
                events: {
                    onAddRelation: "{cspace.relationManager}.events.onAddRelation",
                    onCreateNewRecord: "{cspace.relationManager}.events.onCreateNewRecord"
                },
                listeners: {
                    onClose: "{cspace.relationManager}.onDialogClose"
                }
            }
        });

       fluid.demands("cspace.searchToRelateDialog", "cspace.searchResultsRelationManager", {
           options: {
               events: {
                   onAddRelation: "{cspace.searchResultsRelationManager}.events.onAddRelation"
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
                    removeListeners: "{recordEditor}.events.onRenderTree"
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
                    recordEditorOnRenderTree: "{recordEditor}.events.onRenderTree"
                },
                listeners: {
                    repeatableOnRefreshView: "{structuredDate}.events.removeListeners.fire",
                    recordEditorOnRenderTree: "{structuredDate}.events.removeListeners.fire"
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
                }
            }
        });
        fluid.demands("search", ["cspace.searchToRelateDialog", "cspace.searchResultsRelationManager"], {
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
                    namespace: "{globalBundle}.messageBase.search-namespace",
                    "summarylist.updatedAt": "{globalBundle}.messageBase.search-updatedAt"
                },
                listeners: {
                    ready: "{loadingIndicator}.events.hideOn.fire"
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

        fluid.demands("cspace.search.searchView.onInitialSearch", ["cspace.advancedSearch", "cspace.searchToRelateDialog", "cspace.search.searchView"], {
            // The search component in the Add to Record dialog should not perform any search when the page initially loads.
            funcName: "jQuery.noop"
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
                    relatedResultsCount: "{globalBundle}.messageBase.search-relatedResultsCount",
                    looking: "{globalBundle}.messageBase.search-looking",
                    relatedLooking: "{globalBundle}.messageBase.search-relatedLooking",
                    selected: "{globalBundle}.messageBase.search-selected",
                    number: "{globalBundle}.messageBase.search-number",
                    summary: "{globalBundle}.messageBase.search-summary",
                    recordtype: "{globalBundle}.messageBase.search-recordtype",
                    namespace: "{globalBundle}.messageBase.search-namespace",
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
                    ready: "{loadingIndicator}.events.hideOn.fire"
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

        fluid.demands("cspace.search.searchView.search", ["cspace.search.searchView", "cspace.searchToRelateDialog", "cspace.advancedSearch"], {
            funcName: "cspace.search.searchView.search",
            args: ["{arguments}.0", "{searchView}"]
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
            args: ["{searchBox}", "{recordEditor}"]
        });
        fluid.demands("cspace.searchBox.navigateToSearch", ["cspace.searchBox", "cspace.search.searchView", "cspace.searchToRelateDialog"], {
            funcName: "cspace.search.handleSubmitSearch",
            args: ["{searchBox}", "{searchView}"]
        });
        
        fluid.demands("cspace.termList.termListSource", ["cspace.termList"], {
            funcName: "cspace.URLDataSource",
            args: {
                url: "{termList}.options.urls.termList",
                caching: true,
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
                primary: "{pageBuilder}.options.pageType"
            }
        });
        fluid.demands("sidebar", ["cspace.pageBuilder", "cspace.authority"], {
            container: "{pageBuilder}.options.selectors.sidebar",
            options: {
                primary: "{pageBuilder}.options.pageType",
                components: {
                    cataloging: {
                        type: "fluid.emptySubcomponent"
                    },
                    procedures: {
                        type: "fluid.emptySubcomponent"
                    },
                    nonVocabularies: {
                        type: "cspace.relatedRecordsList",
                        options: {
                            primary: "{sidebar}.options.primary",
                            related: "refobjs",
                            model: {
                                related: "refobjs"
                            },
                            components: {
                                rrlListView: {
                                    options: {
                                        model: {
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
                                                id: "sourceFieldName",
                                                name: "rl-rrl-sourceFieldName"
                                            }]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                selectors: {
                    relatedNonVocabularies: ".csc-related-nonVocabularies"
                },
                selectorsToIgnore: ["batch", "report", "termsUsed", "relatedVocabularies", "relatedCataloging", "relatedProcedures", "header", "togglable", "termsUsedBanner", "relatedNonVocabularies"],
                model: {
                    categories: [{
                        expander: {
                            type: "fluid.deferredInvokeCall",
                            func: "cspace.util.modelBuilder",
                            args: {
                                callback: "cspace.sidebar.buildModel",
                                related: "vocabularies",
                                resolver: "{permissionsResolver}",
                                recordTypeManager: "{recordTypeManager}",
                                permission: "list"
                            }
                        }
                    }, {
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
        
        // tabs demands
        fluid.demands("tabs", "cspace.pageBuilder", {
            container: "{pageBuilder}.options.selectors.tabs",
            options: {
                finalInitFunction: "cspace.tabs.finalInitSecondary",
                primaryRecordType: "{pageBuilder}.options.pageType",
                applier: "{pageBuilder}.applier",
                model: "{pageBuilder}.model"
            }
        });
        fluid.demands("tabs", ["cspace.pageBuilder", "cspace.administration"], {
            container: "{pageBuilder}.options.selectors.tabs",
            options: {
                finalInitFunction: "cspace.tabs.finalInit",
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
            args: ["{arguments}.0", "{arguments}.1", "{recordEditor}.globalNavigator", "{tabs}.tabsList", "{tabs}.tabsList.options.styles", "{tabs}.tabsSelect"]
        });

        fluid.demands("cspace.tabs.tabsSelectWrapper", ["cspace.tabs" ,"cspace.administration"], {
            funcName: "cspace.tabs.tabsSelectWrapperAdmin",
            args: ["{arguments}.0", "{arguments}.1", "{tabs}.tabsList", "{tabs}.tabsList.options.styles", "{tabs}.tabsSelect"]
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

       fluid.demands("tabsList", ["cspace.tabs", "citation"], {
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
        fluid.demands("tabsList", ["cspace.tabs", "work"], {
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
/*
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
*/
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

        // computedField demands
        fluid.demands("cspace.computedField", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{recordEditor}.applier",
                model: "{recordEditor}.model",
                events: {
                    removeApplierListeners: "{recordEditor}.events.onRenderTree",
                    onSubmit: "{recordEditor}.saver.events.beforeSave",
                    recordEditorAfterSave: "{recordEditor}.events.afterSave",
                    recordEditorAfterCancel: "{recordEditor}.events.afterCancel"
                },
                listeners: {
                    recordEditorAfterSave: {
                        listener: "{computedField}.events.removeAllListeners.fire",
                        priority: "first"
                    },
                    recordEditorAfterCancel: {
                        listener: "{computedField}.events.removeAllListeners.fire"
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.computedField", ["cspace.repeatableImpl", "cspace.makeRepeatable", "cspace.recordEditor"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{repeatableImpl}.applier",
                model: "{repeatableImpl}.model",
                events: {
                    repeatableOnRefreshView: "{repeatableImpl}.events.onRefreshView",
                    recordEditorOnRenderTree: "{recordEditor}.events.onRenderTree",
                    onSubmit: "{recordEditor}.saver.events.beforeSave",
                    recordEditorAfterSave: "{recordEditor}.events.afterSave",
                    recordEditorAfterCancel: "{recordEditor}.events.afterCancel"
                },
                listeners: {
                    repeatableOnRefreshView: "{computedField}.events.removeAllListeners.fire",
                    recordEditorOnRenderTree: "{computedField}.events.removeAllListeners.fire",
                    recordEditorAfterSave: {
                        listener: "{computedField}.events.removeAllListeners.fire",
                        priority: "first"
                    },
                    recordEditorAfterCancel: {
                        listener: "{computedField}.events.removeAllListeners.fire"
                    }
               }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.computedField", "cspace.advancedSearch.searchFields", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                applier: "{searchFields}.applier",
                model: "{searchFields}.model",
                events: {
                    removeAllListeners: "{advancedSearch}.events.recordTypeChanged",
                    onSubmit: "{searchView}.events.onAdvancedSearch"
                },
            }, "{arguments}.1"]
        });

        // richTextEditor demands
        fluid.demands("cspace.richTextEditor", "cspace.recordEditor", {
            container: "{arguments}.0",
            mergeAllOptions: [{
                events: {
                    recordEditorAfterSave: "{recordEditor}.events.afterSave",
                    recordEditorAfterCancel: "{recordEditor}.events.afterCancel",
                    onSubmit: "{recordEditor}.saver.events.beforeSave"
                },
                listeners: {
                    recordEditorAfterSave: {
                        listener: "{richTextEditor}.events.removeAllListeners.fire",
                        priority: "first"
                    },
                    recordEditorAfterCancel: {
                        listener: "{richTextEditor}.events.removeAllListeners.fire"
                    }
                }
            }, "{arguments}.1"]
        });
        fluid.demands("cspace.richTextEditor", ["cspace.repeatableImpl", "cspace.makeRepeatable", "cspace.recordEditor"], {
            container: "{arguments}.0",
            mergeAllOptions: [{
                events: {
                    repeatableOnUpdateModel: "{repeatableImpl}.events.onUpdateModel",
                    repeatableOnRefreshView: "{repeatableImpl}.events.onRefreshView",
                    recordEditorAfterSave: "{recordEditor}.events.afterSave",
                    recordEditorAfterCancel: "{recordEditor}.events.afterCancel",
                    onSubmit: "{recordEditor}.saver.events.beforeSave"
                },
                listeners: {
                    recordEditorAfterSave: {
                        listener: "{richTextEditor}.events.destroyEditor.fire",
                        priority: "first"
                    },
                    recordEditorAfterCancel: {
                        listener: "{richTextEditor}.events.destroyEditor.fire"
                    }
                }
            }, "{arguments}.1"]
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
