function ShowHide(toggleme) {
	jQuery(toggleme).toggle(); 
	var self = toggleme + "-img";
	var src = (jQuery(self).attr("src") === "../images/toggle-more.png") ? "../images/toggle-less.png" : "../images/toggle-more.png";
	jQuery(self).attr("src", src);
}
 
function getRadioValue() {
	for (var i=0; i < document.selectprocedure.procedure.length; i++) {
		if (document.selectprocedure.procedure[i].checked) {
			var rad_val = document.selectprocedure.procedure[i].value;
			window.open(rad_val, "_self", "");
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
