/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace, jQuery, fluid, window*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    
    fluid.registerNamespace("cspace.myCollectionSpace");
    
    var buildUrl = function (recordType) {
        if (cspace.util.useLocalData()) {
            return "./data/" + recordType + "/records/list.json";
        } else {
            return "../../chain/" + recordType;
        }
    };
    
    var makeArrayExpander = function (recordType) {
        return fluid.expander.makeFetchExpander({
            url: buildUrl(recordType),
            fetchKey: recordType, 
            disposer: function (model) {
                model.selectonIndex = -1;
                return model;
            }
        });
    };
    
    var makeOpts = function (recordType) {
        return {
            listeners: {
                afterSelect: cspace.recordList.afterSelectHandlerDefault
            },
            strings: {
                nothingYet: "No records yet"
            },
            uispec: "{myCollectionSpace}.options.uispec." + recordType,
            model: makeArrayExpander(recordType)
        };
    };
    
    var makeComponentsOpts = function (options) {
        fluid.each(options.components, function (component, key) {
            component.options = makeOpts(key);
        });
    };
    
    cspace.myCollectionSpace = function (container, options) {
        var that = fluid.initView("cspace.myCollectionSpace", container, options);        
        var resourceSpecs = {};
        makeComponentsOpts(that.options);
        fluid.withEnvironment({resourceSpecCollector: resourceSpecs}, function () {
            that.options.components = fluid.expander.expandLight(that.options.components, {noValue: true});
        });
        fluid.fetchResources(resourceSpecs, function () {
            fluid.initDependents(that);
        });
        return that;
    };
    
    fluid.demands("cataloging", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.cataloging", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("intake", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.intake", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("acquisition", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.acquisition", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("loanin", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.loanin", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("loanout", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.loanout", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("movement", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.movement", fluid.COMPONENT_OPTIONS]);
        
    fluid.demands("objectexit", "cspace.myCollectionSpace", 
        ["{myCollectionSpace}.dom.objectexit", fluid.COMPONENT_OPTIONS]);
    
    fluid.defaults("cspace.myCollectionSpace", {
        selectors: {
            cataloging: ".object-records-group",
            intake: ".intake-records-group",
            acquisition: ".acquisition-records-group",
            loanin: ".loanIn-records-group",
            loanout: ".loanOut-records-group",
            movement: ".movement-records-group",
            objectexit: ".objectexit-records-group"
        },
        components: {
            cataloging: {
                type: "cspace.recordList"
            },
            intake: {
                type: "cspace.recordList"
            },
            acquisition: {
                type: "cspace.recordList"
            },
            loanin: {
                type: "cspace.recordList"
            },
            loanout: {
                type: "cspace.recordList"
            },
            movement: {
                type: "cspace.recordList"
            },
            objectexit: {
                type: "cspace.recordList"
            }
        }
    });
    
    fluid.demands("myCollectionSpace", "cspace.pageBuilder", 
        ["{pageBuilder}.options.selectors.myCollectionSpace", fluid.COMPONENT_OPTIONS]);
    
})(jQuery, fluid);