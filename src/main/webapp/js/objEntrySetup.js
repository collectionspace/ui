/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery*/

var demo = demo || {};

(function ($) {

     var getUrlParameter = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results === null) {
            return "";
        } else {
            return results[1];
        }
    };
    
    demo.setup = function () {
        var objectId = getUrlParameter("objectId");
        var opts = {};
/*
The CollectionObjectDAO default options are suitable for testing on a local machine.
To configure the demo to run on a particular server, set the baseUrl option to reference
the URL for the application layer, as shown in the following sample:
        opts.dao = {
            type: "cspace.collectionObjectDAO",
            options: {
                baseUrl: "http://localhost:8080/chain/"
            }
        };
*/
        if (objectId) {
            opts.objectId = objectId;
        }
        cspace.objectEntry(".csc-object-entry-container", opts);
    };
    
})(jQuery);

