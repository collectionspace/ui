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

    cspace.findEdit = function (container, options) {
        var that = fluid.initComponent("cspace.findEdit", container, options);
        
        return that;
    };
    
    fluid.defaults("cspace.findEdit", {
        selectors: {
        }
    });
})(jQuery, fluid_1_2)
