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
        var that = fluid.initView("cspace.sidebar", container, options);
        
        that.integratedAuthorities = cspace.recordList(that.options.selectors.termsUsed,
             {data: that.options.termsUsed,
              uispec: that.options.uispec.termsUsed});

        that.relatedObjects = cspace.recordList(that.options.selectors.relatedObjects,
             {data: buildRelationsList(that.options.relations, ["objects"]),
              uispec: that.options.uispec.relatedObjects});

        that.relatedProcedures = cspace.recordList(that.options.selectors.relatedProcedures,
             {data: buildRelationsList(that.options.relations, ["intake", "acquisition"]),
              uispec: that.options.uispec.relatedProcedures});

        return that;
    };
    
    fluid.defaults("cspace.sidebar", {
        selectors: {
            mediaSnapshot: ".csc-media-snapshot",
            termsUsed: ".csc-integrated-authorities",
            relatedObjects: ".csc-related-objects",
            relatedProcedures: ".csc-related-procedures"
        }
    });
})(jQuery, fluid_1_2)
