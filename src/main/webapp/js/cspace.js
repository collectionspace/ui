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

function ShowHide(toggleme) {
	jQuery(toggleme).toggle(); 
	var self = toggleme + "-img";
	var source = (jQuery(self).attr("src") === "../images/toggle-more.png") ? "../images/toggle-less.png" : "../images/toggle-more.png";
	jQuery(self).attr("src", source);
}

function ToggleTabs(toggleme, toggleother, toggleSelected) {
	jQuery(toggleother).hide();
	jQuery(toggleme).show();
	jQuery(toggleSelected).removeClass("selected");
	
}

 
function getRadioValue() {
	for (var i=0; i < document.selecttype.recordtype.length; i++) {
		if (document.selecttype.recordtype[i].checked) {
			var rad_val = document.selecttype.recordtype[i].value;
			window.open(rad_val, "_self", "");
			return;
		}
	}

}


jQuery(document).ready(function() {

	
	$currentFocus = null;
	jQuery(':input').focus( function() {
		$currentFocus = this;
		
	});


	$switch = false;
	jQuery('#primary').val($switch);
	
	jQuery('#primary').focus(function() {
	
		if ( $switch === false ) { //ok to change focus to secondary
			jQuery('#primary').removeClass('activate').addClass('deactivate');
			jQuery('#secondary').removeClass('hidden').addClass('show');
			jQuery('#secondary').focus();
		}
		
		else {
			jQuery('#primary').removeClass('deactivate').addClass('activate');
		}
		
		$switch = false;
			
		jQuery('#primary').val($switch);
    });
	
	jQuery('#primary').blur(function() {
		$switch = false;
	});
	
    jQuery('#secondary').blur(function() {
			jQuery('#secondary').removeClass('show').addClass('hidden');
			
			jQuery('#primary').removeClass('deactivate').addClass('activate');
			
			$switch = true;

			jQuery('#primary').val($switch);
    });
		
});
