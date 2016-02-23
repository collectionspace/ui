/*
Copyright 2011
Licensed under the Educational Community License (ECL), Version 2.0. 
You may not use this file except in compliance with this License.
You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global cspace:true, jQuery, fluid*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {

    // Footer component used on all pages within Collection
    // Space application.
    cspace.footer = function (container, options) {
        var that = fluid.initRendererComponent("cspace.footer", container, options);
        that.renderer.refreshView();        
        return that;
    };

    // Build a renderer tree for the footer.
    cspace.footer.produceTree = function () {
        return {
            text1: {
                messagekey: "footer-text1"
            },
            text2: {
                messagekey: "footer-text2"
            },
            currentRelease: {
                target: "${currentRelease}",
                linktext: {
                    messagekey: "footer-currentRelease",
                    args: ["${version}"]
                }
            },
            about: {
                target: "${about}",
                linktext: {
                    messagekey: "footer-about"
                }
            },
            feedback: {
                target: "${feedback}",
                linktext: {
                    messagekey: "footer-feedback"
                }
            }
        };
    };
    
    fluid.defaults("cspace.footer", {
        gradeNames: "fluid.rendererComponent",
        mergePolicy: {
            model: "preserve"
        },
        selectors: {
            text1: ".csc-footer-text1",
            text2: ".csc-footer-text2",
            currentRelease: ".csc-footer-currentRelease",
            about: ".csc-footer-about",
            feedback: ".csc-footer-feedback"
        },
        model: {
            about: "http://www.lyrasis.org/LYRASIS%20Digital/Pages/CollectionSpace.aspx",
            currentRelease: "http://wiki.collectionspace.org/display/collectionspace/Resources",
            feedback: "https://lyrasis.zendesk.com/hc",
            version: "4.1.1"
        },
        // Footer template resource.
        resources: {
            template: {
                expander: {
                    type: "fluid.deferredInvokeCall",
                    func: "cspace.specBuilder",
                    args: {
                        forceCache: true,
                        fetchClass: "fastTemplate",
                        url: "%webapp/html/components/footer.html",
                        options: {
                            dataType: "html"
                        }
                    }
                }
            }
        },
        parentBundle: "{globalBundle}",
        produceTree: cspace.footer.produceTree,
        strings: {}
    });

    fluid.fetchResources.primeCacheFromResources("cspace.footer");
})(jQuery, fluid);

(function ($) {
  $.fn.waitUntilExists = function (handler, shouldRunHandlerOnce, isChild) {
    var found     = 'found';
    var $this     = $(this.selector);
    var $elements = $this.not(function () { return $(this).data(found); }).each(handler).data(found, true);

    if (!isChild) {
      (window.waitUntilExists_Intervals = window.waitUntilExists_Intervals || {})[this.selector] = window.setInterval(function () { $this.waitUntilExists(handler, shouldRunHandlerOnce, true); }, 500);
    }
    else if (shouldRunHandlerOnce && $elements.length) {
      window.clearInterval(window.waitUntilExists_Intervals[this.selector]);
    }

    return $this;
  }
})(jQuery);

if(window.location.pathname.search("index") != -1) {
    $('.login-outer-border .content ul.login-webcast-links').waitUntilExists(function() {
        $(this).remove();
    });
}
