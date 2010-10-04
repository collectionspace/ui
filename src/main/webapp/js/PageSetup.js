/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace, fluid*/
"use strict";

cspace = cspace || {};

(function ($) {
    fluid.log("PageSetup.js loaded");

    var fetchConfig = function (that, callback) {
        $.ajax({
            url: that.options.configURL || cspace.util.getDefaultConfigURL(),
            dataType: "json",
            async: false,
            success: function (config) {
                if (callback) {
                    callback(config);
                }
                fluid.merge(null, config, that.options);
                that.options = config;
            },
            error: function (xhr, textStatus, errorThrown) {
                fluid.fail("fetchConfig: " + errorThrown);
            }
        });
    };
    
    var buildDependencies = function (that) {
        $.each(that.options.depOpts, function (depName, dep) {
            that.options.dependencies[depName].args.push(dep.options);
        });
    };
    
    var setupPage = function (that) {
        fetchConfig(that, that.options.fetchConfigCallback);
        buildDependencies(that);
        that.pageBuilder = fluid.initSubcomponent(that, "pageBuilder", [
            // TODO: Should the dependencies be an option of PageBuilder?
            that.options.dependencies,            
            fluid.COMPONENT_OPTIONS
        ]);
    };
    
    cspace.pageSetup = function (options) {        
        var that = fluid.initLittleComponent("cspace.pageSetup", options);        
        setupPage(that);
        return that;
    };
    
    fluid.defaults("cspace.pageSetup", {
        pageBuilder: {
            type: "cspace.pageBuilder"
        },
        fetchConfigCallback: null,
        dependencies: {},
        depOpts: {},
        configURL: "",
        mergePolicy: {
            model: "preserve",
            applier: "preserve"
        }
    });
    
})(jQuery);