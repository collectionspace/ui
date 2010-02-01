/*
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid_1_2*/

var cspace = cspace || {};

(function ($, fluid) {

    // Notes:
    // the HTML has been constructed on the server
    // and the UISpec has been provided through JSONP, stored in cspace.pageBuilder.uispec

    var buildCutpoints = function (uispec) {
        var cutpoints = [];
        for (var key in uispec) {
            if (uispec.hasOwnProperty(key)) {
                cutpoints.push({
                    id: key,
                    selector: "." + key
                });
            }
        }
        return cutpoints;
    };

    var setup = function (that) {
        that.uispec = cspace.pageBuilder.uispec;
        that.expander = fluid.renderer.makeProtoExpander({ELstyle: "${}"});
        for (var region in that.uispec) {
            if (that.uispec.hasOwnProperty(region)) {
                var tree = that.expander(that.uispec[region]);
                
                // note: renderer options like debugMode should be passed in, not hard-coded
                var renderOpts = {
                    debugMode: true,
                    cutpoints: buildCutpoints(that.uispec[region])
                };
                if (that.options.model) {
                    if (that.options.modelPath) {
                        renderOpts.model = that.options.model[modelPath];
                    } else {
                        renderOpts.model = that.options.model;
                    }
                }
                fluid.selfRender(that.container, tree, renderOpts);
            }
        }

        var scriptBlocks = $("script", that.container);
        scriptBlocks.each(function (index, domElement) {
            var block = $(domElement);
            var parent = block.parent();
            block.remove();
            parent.append(block);
        });
    };

    cspace.pageBuilder = function (container, options) {
        var that = fluid.initView("cspace.pageBuilder", container, options);

        setup(that);
    };

})(jQuery, fluid_1_2);
