(function($) { // Begin jQuery
  $(function() { // DOM ready
    $(this).scrollTop(0);
    // If a link has a dropdown, add sub menu toggle.
    $('nav ul li a:not(:only-child)').click(function(e) {
      $(this).siblings('.nav-dropdown').toggle();
      // Close one dropdown when selecting another
      $('.nav-dropdown').not($(this).siblings()).hide();
      e.stopPropagation();
    });
    // Clicking away from dropdown will remove the dropdown class
    $('html').click(function() {
      $('.nav-dropdown').hide();
    });
    // Toggle open and close nav styles on click
    $('#nav-toggle').click(function() {
      $('nav ul').slideToggle();
    });
    // Hamburger to X toggle
    $('#nav-toggle').on('click', function() {
      this.classList.toggle('active');
    });

    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    if (windowWidth > 768){
     $('#map').height(windowHeight - 64.8);
     $('#wrapper').height(64.8);
    }else{
     $('#map').height(windowHeight - 58);
     $('#wrapper').height(58);
    } 
  }); // end DOM ready
})(jQuery); // end jQuery

$(window).resize(function(){
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  
  if (windowWidth > 768){
    $('#map').height(windowHeight - 64.8);
  }else{
    $('#map').height(windowHeight - 58);
  }      
});

