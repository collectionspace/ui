/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var demo = demo || {};

(function ($) {

    demo.setup = function () {
        var objectId = cspace.util.getUrlParameter("objectId");
        var oeOpts = {};
        if (objectId) {
            oeOpts.objectId = objectId;
        }
        if (document.location.protocol === "file:") {
            oeOpts.dataContext = cspace.util.setupTestDataContext("collection-object");
        }
        var objEntry = cspace.dataEntry(".csc-object-entry-container", oeOpts);
    };
    
})(jQuery);

