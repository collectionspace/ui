function ShowHide() {
	for ( var i=0; i < arguments.length; i++ ) {
		$(arguments[i]).toggle(); 
		var self = arguments[i] + "-img";
		var src = ($(self).attr("src") === "../images/toggle-less.png") ? "../images/toggle-more.png" : "../images/toggle-less.png";
		$(self).attr("src", src);
	}
}