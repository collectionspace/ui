/*
Copyright 2009-2010 Museum of the Moving Image
Copyright 2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, window, cspace*/

var cspace = cspace || {};
fluid.setLogging(true);
fluid.log("cspace.js loaded");

function ShowHide(toggleme, source) {
    jQuery(toggleme).toggle();
    var foo = jQuery(source).find("img").attr("src");
    var image = (foo === "../images/toggle-more.png") ? "../images/toggle-less.png" : "../images/toggle-more.png";
    jQuery(source).find("img").attr("src", image);
}

jQuery(document).ready(function() {
    $currentFocus = null;
    jQuery(':input').focus( function() {
        $currentFocus = this;
    }); 
});
