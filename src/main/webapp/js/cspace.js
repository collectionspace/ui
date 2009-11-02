function ShowHide(toggleme) {
	$(toggleme).toggle(); 
	var self = toggleme + "-img";
	var src = ($(self).attr("src") === "../images/toggle-more.png") ? "../images/toggle-less.png" : "../images/toggle-more.png";
	$(self).attr("src", src);
}

function getRadioValue() {
	for (var i=0; i < document.selectprocedure.procedure.length; i++) {
		if (document.selectprocedure.procedure[i].checked) {
			var rad_val = document.selectprocedure.procedure[i].value;
			window.open(rad_val, "_self", "");
		}
	}
}

$(document).ready(function() {
	$currentFocus = null;
	$(':input').focus( function() {
		$currentFocus = this;
		
	});


	$switch = false;
	$('#primary').val($switch);
	
	//$('#primary').val($('#secondary').val());
	
	$('#primary').focus(function() {
	
		if ( $switch == false ) { //ok to change focus to secondary
			$('#primary').removeClass('activate').addClass('deactivate');
			$('#secondary').removeClass('hidden').addClass('show');
			$('#secondary').focus();
		}
		
		else {
			//$('#secondary').removeClass('show').addClass('hidden');
			$('#primary').removeClass('deactivate').addClass('activate');
		}
		
		$switch = false;
			
		//$('#primary').val($switch);
		$('#primary').val($switch);
    });
	
	$('#primary').blur(function() {
		$switch = false;
	});
	
    $('#secondary').blur(function() {
			$('#secondary').removeClass('show').addClass('hidden');
			
			$('#primary').removeClass('deactivate').addClass('activate');
			
			$switch = true;

			$('#primary').val($switch);
    });
});
