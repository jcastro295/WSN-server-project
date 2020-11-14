jQuery(document).ready(function($) {
	tab = $('.tabs h3 a');

	tab.on('click', function(event) {
		event.preventDefault();
		tab.removeClass('active');
		$(this).addClass('active');

		tab_content = $(this).attr('href');
		$('div[id$="tab-content"]').removeClass('active');
		$(tab_content).addClass('active');
	});

	$('#user_signup').click(function() {
  		 if( !$(this).val() ) {
          $('#show-username').text('Must contain at least 6 characters').css({"padding" : "10px", "border" : "2px solid #62c9c3"});
          $('#show-email').empty().css({"padding" : "0px", "border" : "0px"});
          $('#show-pass').empty().css({"padding" : "0px", "border" : "0px"});
          $('#show-cpass').empty().css({"padding" : "0px", "border" : "0px"});
    	}else{
    		$('#show-username').empty().css({"padding" : "0px", "border" : "0px"});
    	}
	});
	$('#user_email').click(function() {
  		 if( !$(this).val() ) {
          $('#show-email').text('Must be a valid email').css({"padding" : "10px", "border" : "2px solid #62c9c3"});
          $('#show-username').empty().css({"padding" : "0px" , "border" : "0px"});
          $('#show-pass').empty().css({"padding" : "0px", "border" : "0px"});
          $('#show-cpass').empty().css({"padding" : "0px", "border" : "0px"});
    	}else{
    		$('#show-email').empty().css({"padding" : "0px", "border" : "0px"});
    	}
	});
	$('#user_pass').click(function() {
  		 if( !$(this).val() ) {
          $('#show-pass').text('Must contain a number and at least 6 characteres').css({"padding" : "10px", "border" : "2px solid #62c9c3"});
          $('#show-username').empty().css({"padding" : "0px", "border" : "0px"});
          $('#show-email').empty().css({"padding" : "0px", "border" : "0px"});
          $('#show-cpass').empty().css({"padding" : "0px", "border" : "0px"});
    	}else{
    		$('#show-pass').empty().css({"padding" : "0px", "border" : "0px"});
    	}
	});
	$('#user_cpass').click(function() {
  		 if( !$(this).val() ) {
          $('#show-cpass').text('Must match with password').css({"padding" : "10px", "border" : "2px solid #62c9c3"});
          $('#show-username').empty().css({"padding" : "0px", "border" : "0px"});
          $('#show-email').empty().css({"padding" : "0px", "border" : "0px"});
          $('#show-pass').empty().css({"padding" : "0px", "border" : "0px"});
    	}else{
    		$('#show-cpass').empty().css({"padding" : "0px", "border" : "0px"});
    	}
	});
	$('body').click(function(e) {   
		if (!$('.input').is(e.target) && $('.input').has(e.target).length === 0)
    		{
        	  $('#show-username').empty().css({"padding" : "0px", "border" : "0px"});
	          $('#show-email').empty().css({"padding" : "0px", "border" : "0px"});
	          $('#show-pass').empty().css({"padding" : "0px", "border" : "0px"});
	          $('#show-cpass').empty().css({"padding" : "0px", "border" : "0px"});
    		}
	});

  $('#w-name').click(function(){
    $('#show-pass').empty().css({"padding" : "0px", "border" : "0px"});
    $('#show-cpass').empty().css({"padding" : "0px", "border" : "0px"});
  });

  $('#w-user_email').click(function(){
    $('#show-pass').empty().css({"padding" : "0px", "border" : "0px"});
    $('#show-cpass').empty().css({"padding" : "0px", "border" : "0px"});
  });
});