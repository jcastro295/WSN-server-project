function AboutFunc() {
	scrollPos = $(this).scrollTop();
	$('#banner').css({
		'background-position' : '50% ' + (-scrollPos/4)+"px"
	});
	$('#bannertext').css({
		'margin-top': (scrollPos/4)+"px",
		'opacity': 1-(scrollPos/250),
		'z-index': 200-(scrollPos)
	});
}
$(document).ready(function(){
	$(window).scroll(function() {
		AboutFunc();
	});
});