/*
Copyright 2010

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace, window*/
"use strict";

fluid.registerNamespace("cspace.permissions");

(function ($, fluid) {
    fluid.log("Permissions.js loaded");
    
    cspace.permissions.hasPermission = function (permissions, target, permission) {
        return $.inArray(permission, fluid.makeArray(permissions[target])) > -1;
    };
    
    cspace.permissions.logicalCombine = function (values, applyAnd) {
        if (values.length === 0) {
            return false;
        }
        var found = fluid.find(values, function (value) {
            if (value !== applyAnd) {
                return !applyAnd;
            }
        });
        return found === undefined ? applyAnd: found;
    };
    
    cspace.permissions.resolver = function (options) {
        var that = fluid.initLittleComponent("cspace.permissions.resolver", options);
        that.resolve = function (resOpts) {
            var target = fluid.makeArray(resOpts.target);
            var values = fluid.transform(target, function (thisTarget) {
                return cspace.permissions.hasPermission(that.options.permissions, thisTarget, resOpts.permission);
            });
            return cspace.permissions.logicalCombine(values, resOpts.method === "AND");
        };
        return that;
    };
    fluid.defaults("cspace.permissions.resolver", {
        gradeNames: ["fluid.littleComponent"],
        mergePolicy: {
            permissions: "nomerge"
        }
    });
    
    cspace.permissions.ensureResolver = function (options) {
        if (!options.resolver) {
            options.resolver = cspace.permissions.resolver({permissions: options.permissions});
        }
    };
    
    cspace.permissions.filterList = function (options) {
        options = fluid.copy(options);
        cspace.permissions.ensureResolver(options);
        return fluid.remove_if(fluid.copy(options.toFilter), function (item) {
            options.target = item;
            return !options.resolver.resolve(options);     
        });
    };
    
    cspace.permissions.getPermissibleRelatedRecords = function (related, resolver, recordTypeManager, permission) {
        var toFilter = recordTypeManager.recordTypesForCategory(related);
        return cspace.permissions.filterList({
            toFilter: toFilter,
            permission: permission,
            resolver: resolver
        });
    };
    
    var buildResOpts = function (options) {
        var resOpts = {};
        if (options.oneOf) {
            resOpts.method = "OR";
            resOpts.target = options.oneOf;
        }
        if (options.allOf) {
            resOpts.method = "AND";
            resOpts.target = options.allOf; 
        }
        if (options.target) {
            resOpts.method = options.method || "AND";
            resOpts.target = options.target; 
        }
        return resOpts;
    };
    
    cspace.permissions.resolve = function (options) {
        var resOpts = buildResOpts(options);
        resOpts.permission = options.permission;
        cspace.permissions.ensureResolver(options);
        return options.resolver.resolve(resOpts);
    };
    
    cspace.permissions.resolveMultiple = function (options) {
        if (options.permission) {
            return cspace.permissions.resolve(options);
        }
        var resOpts = buildResOpts(options);
        if (!resOpts.target) {
            return false;
        }
        cspace.permissions.ensureResolver(options);
        return cspace.permissions.logicalCombine(fluid.transform(resOpts.target, function (thisTarget) {
            thisTarget.resolver = options.resolver;
            return cspace.permissions.resolveMultiple(thisTarget);
        }), resOpts.method === "AND");
    };
    
})(jQuery, fluid);
