/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, cspace*/

cspace = cspace || {};

(function ($, fluid) {

    cspace.sidebar = function (container, options) {
        var that = fluid.initView("cspace.sidebar", container, options);
        
        that.integratedAuthorities = fluid.initSubcomponent(that, "recordList", [that.options.selectors.termsUsed,
             {data: that.options.applier.model.termsUsed,
              csid: that.options.applier.model.csid,
              uispec: that.options.uispec.termsUsed}]);

        that.relatedProcedures = fluid.initSubcomponent(that, "relatedRecordsList", [that.options.selectors.relatedProcedures,
             {applier: that.options.applier,
              dataContext: that.options.dataContext,
              recordType: "procedures",
              uispec: that.options.uispec.relatedProcedures}]);

        that.relatedObjects = fluid.initSubcomponent(that, "relatedRecordsList", [that.options.selectors.relatedObjects,
             {applier: that.options.applier,
              dataContext: that.options.dataContext,
              recordType: "object",
              uispec: that.options.uispec.relatedObjects}]);

        return that;
    };
    
    fluid.defaults("cspace.sidebar", {
        recordList: {
            type: "cspace.recordList"
        },
        relatedRecordsList: {
            type: "cspace.relatedRecordsList"
        },
        selectors: {
            mediaSnapshot: ".csc-media-snapshot",
            termsUsed: ".csc-integrated-authorities",
            relatedObjects: ".csc-related-objects",
            relatedProcedures: ".csc-related-procedures"
        }
    });
})(jQuery, fluid_1_2);
