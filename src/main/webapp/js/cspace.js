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
	$('#number1-info').val($('#number1').val());
	
	$('#number1-info').focus(function() {
		$('#number1-info').toggleClass('deactivate');
		$('#number1').toggleClass('hidden');
		$('#number1').focus();
		
    });
		
    $('#number1').blur(function() {
		$('#number1-info').toggleClass('deactivate');
		$('#number1-info').val($('#number1').val());
		$('#number1').toggleClass("hidden");
		
    });
});
