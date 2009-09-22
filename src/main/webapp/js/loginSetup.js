/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var cspace_login = cspace_login || {};

(function ($) {

    cspace_login.setup = function (errorMessageSelector) {
        errorMessageSelector = errorMessageSelector || ".csc-login-error";
        var loginResult = cspace.util.getUrlParameter("result");
        if (loginResult === "fail") {
            $(errorMessageSelector).show();
        } else {
            $(errorMessageSelector).hide();
        }
    };
    
})(jQuery);

