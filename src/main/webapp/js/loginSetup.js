/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

cspace = cspace || {};

(function ($) {

    cspace.loginSetup = function(){
        fluid.log("loginSetup.js loaded");

        var loginOpts = {};

        cspace.login(".csc-login", loginOpts);
    };
        
})(jQuery);

