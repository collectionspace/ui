/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace*/

cspace = cspace || {};

(function ($, fluid) {

    cspace.permissions = function (container, options) {
        var that = fluid.initView("cspace.permissions", container, options);
        
        return that;
    };

    fluid.defaults("cspace.permissions", {
        selectors: {},
        events: {
            onSave: null,
            onCancel: null,
            pageRendered: null
        }
    });
})(jQuery, fluid);
