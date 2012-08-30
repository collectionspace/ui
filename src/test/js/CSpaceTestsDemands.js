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
    
    fluid.demands("cspace.autocomplete.popup", ["cspace.autocomplete", "cspace.autocompleteTests"], {
        container: "{autocomplete}.popupElement",
        options: {
            produceTree: "cspace.autocomplete.produceTreeStructuredObjects",
            selectors: {
                newTermName: ".csc-autocomplete-newTermName",
                newTermNamePrefix: ".csc-autocomplete-newTermName-prefix",
                newTermNamePostfix: ".csc-autocomplete-newTermName-postfix"
            }
        }
    });
})(jQuery, fluid);