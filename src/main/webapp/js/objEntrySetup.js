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
        if (objectId) {
            opts.objectId = objectId;
        }
        cspace.objectEntry(".csc-object-entry-container", opts);
    };
    
})(jQuery);

