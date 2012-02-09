/*
Copyright 2011 Museum of Moving Image

Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {

    fluid.defaults("cspace.uispecVerifier", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        components: {
            messageBar: "{messageBar}"
        },
        mergePolicy: {
            uispec: "noexpand"
        },
        uispec: {},
        template: "",
        finalInitFunction: "cspace.uispecVerifier.finalInit",
        preInitFunction: "cspace.uispecVerifier.preInit",
        strings: {
            message: "The following keys are missing in the template: %keys"
        }
    });

    var isDecorator = function (source, type) {
        var decorator = fluid.makeArray(source.decorators)[0];
        if (!decorator) {
            return false;
        }
        if (decorator.func) {
            return decorator.func === type;
        }
        return  decorator.type === type;
    };

    cspace.uispecVerifier.preInit = function (that) {
        function checkTemplate(keys, key) {
            if ($(key, that.options.template).length > 0) {
                return;
            }
            keys.push(key);
        }
        function verifyUispecImpl (uispec, keys) {
            fluid.each(uispec, function (val, key) {
                if (!val) {
                    return;
                }
                if (key === "expander") {
                    fluid.each(fluid.makeArray(val), function (expander) {
                        fluid.each(["tree", "trueTree", "falseTree"], function (tree) {
                            if (!expander[tree]) {return;}
                            verifyUispecImpl(expander[tree], keys);
                        });
                    });
                } else if (isDecorator(val, "cspace.makeRepeatable")) {
                    checkTemplate(keys, key);
                    verifyUispecImpl(val.decorators[0].options.repeatTree.expander.tree, keys);
                } else {
                    checkTemplate(keys, key);
                }
            });
        }
        that.verifyUispec = function (uispec) {
            var keys = [];
            verifyUispecImpl(uispec, keys);
            if (keys.length < 1) {
                return;
            }
            that.messageBar.show(fluid.stringTemplate(that.options.strings.message, {
                keys: keys.join(", ")
            }));
        };
    };

    cspace.uispecVerifier.finalInit = function (that) {
        fluid.each(that.options.uispec, function (uispec) {
            that.verifyUispec(uispec);
        });
    };

})(jQuery, fluid);