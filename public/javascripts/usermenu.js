(function($) { // Begin jQuery
    $(function() { // DOM ready
      $(this).scrollTop(0);
      $('#open-menu').click(function(){
        $('#left-menu').toggleClass('active-menu');
      });
    }); // end DOM ready
  })(jQuery); // end jQuery

  