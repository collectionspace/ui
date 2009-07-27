/*
Copyright 2009 University of Cambridge
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_1*/

var cspace = cspace || {};

(function ($, fluid) {

    var sendLoginToServer = function (that) {
        // TODO: Security - don't want to send login info as plain text
        var loginInfo = {
            userID: that.locate("userID").val(),
            password: that.locate("password").val()
        };
        
        jQuery.ajax({
            // TODO: Specify the URL in the options, so users can provide it
            url: "http://localhost/",
            type: "POST",
            dataType: "json",
            data: JSON.stringify(loginInfo),
            success: that.events.loginSuccess.fire,
            error: that.events.loginError.fire
        });
    };
    
    var handleError = function (that, XMLHttpRequest, textStatus, errorThrown) {
        that.locate("unWarning").show();
    };
    
    var setupLogin = function (that) {        
        that.locate("loginButton").click(function () {
            that.events.onLogin.fire();
        });
        
        that.events.onLogin.addListener(function () {
            sendLoginToServer(that);
        });
        
        that.events.loginError.addListener(function (XMLHttpRequest, textStatus, errorThrown) {
            handleError(that, XMLHttpRequest, textStatus, errorThrown);
        });
    };
    
    /**
     * Login Component
     * 
     * @param {Object} container
     * @param {Object} options
     */
    cspace.login = function (container, options) {
        var that = fluid.initView("cspace.login", container, options);
        that.model = {};
                
        setupLogin(that);
        return that;
    };

    fluid.defaults("cspace.login", {
        
        events: {
            onLogin: null,
            loginSuccess: null,
            loginError: null
        },
    
        selectors: {
            userID: ".csc-user-id",
            password: ".csc-password",
            loginButton: ".csc-login-button",
            unWarning: ".csc-un-warning",
            pwWarning: ".csc-pw-warning"
        }
    });
    
})(jQuery, fluid_1_1);
