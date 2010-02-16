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
	
	//Hide (Collapse) the toggle containers on load
	//$(".ttt").hide(); 

	//Switch the "Open" and "Close" state per click
	//$(".toggle").toggle(function(){
	//	$(this).addClass("active");
	//	}, function () {
	//	$(this).removeClass("active");
	//});

	//Slide up and down on click
	//$(".toggle").click(function(){
	//	$(this).next(".ttt").slideToggle("slow");
	//});

	
	
	// from http://www.sohtanaka.com/web-design/simple-tabs-w-css-jquery/
   //When page loads...
	//$(".information-group").hide(); //Hide all content
	//$(".menu-record li:first").addClass("selected").show(); //Activate first tab
	//$(".information-group:first").show(); //Show first tab content

	//On Click Event
	//$(".menu-record li").click(function() {

	//	$(".menu-record li").removeClass("selected"); //Remove any "active" class
	//	$(this).addClass("selected"); //Add "active" class to selected tab
	//	$(".information-group").hide(); //Hide all tab content

	//	var activeTab = $(this).find("a").attr("href"); //Find the href attribute value to identify the active tab + content
	//	$(activeTab).show(); //Fade in the active ID content
	//	return false;
	//});


	

	
	
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
