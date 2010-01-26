/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var demo = demo || {};

(function ($) {

    demo.setup = function () {
        var csid = cspace.util.getUrlParameter("csid");
		var isLocal = cspace.util.isLocal();
        var oeOpts = {
// CSPACE-701
			uiSpecUrl: isLocal ? "./uispecs/collection-object/uispec.json" : "../../chain/objects/uispec"
        };
        if (csid) {
            oeOpts.csid = csid;
        }
        if (isLocal) {
            oeOpts.dataContext = cspace.util.setupTestDataContext("collection-object");
        }
        var objEntry = cspace.dataEntry(".csc-object-entry-container", oeOpts);
    };
    
})(jQuery);

