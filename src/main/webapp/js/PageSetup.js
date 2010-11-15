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
    
    cspace.pageSetup.recordFetchConfigCallback = function (config) {
        config.pageBuilder.options.csid = cspace.util.getUrlParameter("csid");
    };
    
    cspace.pageSetup.localRecordFetchConfigCallback = function (config) {
        cspace.pageSetup.recordFetchConfigCallback(config);
        config.pageBuilder.options.dataContext.options.baseUrl = "data";
        config.pageBuilder.options.dataContext.options.fileExtension = ".json";
    };
    
    cspace.pageSetup.localFindeditFetchConfigCallback = function (config) {
        config.depOpts.search.options.searchUrlBuilder = cspace.search.localSearchUrlBuilder;
    };
    
    cspace.pageSetup.roleFetchConfigCallback = function (config) {
        config.depOpts.role.options.roleListEditor.options.dataContext.options.dataSource.options.sources.permission.merge = 
            cspace.dataSource.mergePermissions;
    };
    
    cspace.pageSetup.localRoleFetchConfigCallback = function (config) {
        cspace.pageSetup.roleFetchConfigCallback(config);
        config.depOpts.role.options.recordType = "role/records/list.json";
        config.depOpts.role.options.roleListEditor.options.baseUrl = "data/";
        config.depOpts.role.options.roleListEditor.options.dataContext.options.baseUrl = "data/";
        config.depOpts.role.options.roleListEditor.options.dataContext.options.fileExtension = ".json";
        config.depOpts.role.options.roleListEditor.options.dataContext.options.dataSource.options.sources.permission.href = 
            "data/permission/list.json";
    };
    
    cspace.pageSetup.usersFetchConfigCallback = function (config) {
        config.depOpts.users.options.userListEditor.options.dataContext.options.dataSource.options.sources.role.merge = 
            cspace.dataSource.mergeRoles;
    };
    
    cspace.pageSetup.localUsersFetchConfigCallback = function (config) {
        cspace.pageSetup.usersFetchConfigCallback(config);
        config.depOpts.users.options.recordType = "users/records/list.json";
        config.depOpts.users.options.queryURL = "data/users/search/list.json";
        config.depOpts.users.options.userListEditor.options.baseUrl = "data/";
        config.depOpts.users.options.userListEditor.options.dataContext.options.baseUrl = "data/";
        config.depOpts.users.options.userListEditor.options.dataContext.options.fileExtension = ".json";
        config.depOpts.users.options.userListEditor.options.dataContext.options.dataSource.options.sources.role.href = 
            "data/role/list.json";
    };
    
    cspace.pageSetup.resolvePageSetup = function (options, callback) {
        fluid.merge(null, options, {
            fetchConfigCallback: callback
        });
        return cspace.pageSetup(options);
    };
    
    fluid.demands("cspace.pageSetup", ["cspace.createnew"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("cspace.pageSetup", ["cspace.record"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS, cspace.pageSetup.recordFetchConfigCallback]
    });
    
    fluid.demands("cspace.pageSetup", ["cspace.record", "cspace.localData"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS, cspace.pageSetup.localRecordFetchConfigCallback]
    });
    
    fluid.demands("cspace.pageSetup", ["cspace.findedit"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS]
    });
    
    fluid.demands("cspace.pageSetup", ["cspace.findedit", "cspace.localData"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS, cspace.pageSetup.localFindeditFetchConfigCallback]
    });
    
    fluid.demands("cspace.pageSetup", ["cspace.role"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS, cspace.pageSetup.roleFetchConfigCallback]
    });
    
    fluid.demands("cspace.pageSetup", ["cspace.role", "cspace.localData"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS, cspace.pageSetup.localRoleFetchConfigCallback]
    });
    
    fluid.demands("cspace.pageSetup", ["cspace.users"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS, cspace.pageSetup.usersFetchConfigCallback]
    });
    
    fluid.demands("cspace.pageSetup", ["cspace.users", "cspace.localData"], {
        funcName: "cspace.pageSetup.resolvePageSetup",
        args: [fluid.COMPONENT_OPTIONS, cspace.pageSetup.localUsersFetchConfigCallback]
    });
    
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
    
    cspace.setup = function (tag) {
        fluid.staticEnvironment.cspacePage = fluid.typeTag(tag);
        fluid.invoke("cspace.pageSetup");
    };
    
})(jQuery);