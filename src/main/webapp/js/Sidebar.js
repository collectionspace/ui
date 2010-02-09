/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

cspace = cspace || {};

(function ($, fluid) {

// related stuff in "relations"
// integratedAuthorities in "termsUsed"

    var buildRelationsList = function (data, recordTypeList) {
        var relationList = [];
        if (data) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < recordTypeList.length; j++) {
                    if (data[i].recordtype === recordTypeList[j]) {
                        relationList.push(data[i]);
                    }
                }
            }
        }
        return relationList;     
    };

    cspace.sidebar = function (container, options) {
        var that = fluid.initComponent("cspace.sidebar", container, options);
        
        that.integratedAuthorities = initSubcomponent(that, "cspace.recordList",
            [that.options.selectors.integratedAuthorities,
             {data: that.options.termsUsed}]);

        that.relatedRecords = initSubcomponent(that, "cspace.recordList",
            [that.options.selectors.relatedRecords,
             {data: buildRelationsList(that.options.relations, ["objects"])}]);

        that.relatedProcedures = initSubcomponent(that, "cspace.recordList",
            [that.options.selectors.relatedProcedures,
             {data: buildRelationsList(that.options.relations, ["intake", "acquisition"])}]);

        return that;
    };
    
    fluid.defaults("cspace.sidebar", {
        selectors: {
            mediaSnapshot: ".csc-media-snapshot",
            integratedAuthorities: ".csc-integrated-authorities",
            relatedRecords: ".csc-related-records",
            relatedProcedures: ".csc-related-procedures",
            relatedCollections: ".csc-related-collections"
        }
    });
})(jQuery, fluid_1_2)
