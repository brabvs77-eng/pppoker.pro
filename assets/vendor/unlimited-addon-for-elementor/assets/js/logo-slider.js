;(function($){
    $(window).on('elementor/frontend/init',function(){
      
      function swiper_slider(){ 
        for (var i = 0; i < $('.swiper-container').length; i++) {
            // Swiper Slider Active Mechanisum
            var mySwiper = mySwiper + i;
            var swiperMain = $('.swiper-container').eq(i);
            var swiperControl = swiperMain.parents('.ts-slider');
            swiperMain.addClass('swiper-container' + i);
            swiperControl.find('.pagination').addClass('pagination' + i);
            swiperControl.find('.swiper-arrow-right').addClass('swiper-arrow-right' + i);
            swiperControl.find('.swiper-arrow-left').addClass('swiper-arrow-left' + i);
            // Added Unique Class
            var activeSwiper = '.swiper-container' + i;
            var activePagination = '.pagination' + i;
            var arrowRight = '.swiper-arrow-right' + i;
            var arrowLeft = '.swiper-arrow-left' + i;
            // Auro Play
            var autoPlay = parseInt($(activeSwiper).attr('data-autoplay'), 10);
            (autoPlay === 0) ? (autoPlay = false) : (autoPlay = true);
            // Slider Loop
            var sliderLoop = parseInt($(activeSwiper).attr('data-loop'), 10);
            (sliderLoop === 0) ? (sliderLoop = false) : (sliderLoop = true);
            // Slider effect
            var sliderEffect = $(activeSwiper).attr('data-effect');
            if (sliderEffect === 'fade') {
              sliderEffect = 'fade';
            } else {
              sliderEffect = '';
            }
            // Auro Play Speed
            var sliderSpeed = parseInt($(activeSwiper).attr('data-speed'), 10);
            // Slider Per View
            var slidesPerView = $(activeSwiper).attr('data-slides-per-view');
            var slideView = parseInt($(activeSwiper).attr('data-add-slides'), 10);
            var xlPoint = parseInt($(activeSwiper).attr('data-lg-slides'), 10);
            var lgPoint = parseInt($(activeSwiper).attr('data-md-slides'), 10);
            var mdPoint = parseInt($(activeSwiper).attr('data-sm-slides'), 10);
            var smPoint = parseInt($(activeSwiper).attr('data-xs-slides'), 10);
            var sliderBreakpoints = {};
            if (slidesPerView == 1) {
              slidesPerView = 1;
            } else if (slidesPerView === 'auto') {
              slidesPerView = 'auto';
            } else {
              slidesPerView = slideView;
              sliderBreakpoints = {
                575: {
                  slidesPerView: smPoint
                },
                767: {
                  slidesPerView: mdPoint
                },
                991: {
                  slidesPerView: lgPoint
                },
                1199: {
                  slidesPerView: xlPoint
                }
              }
            }
      
            mySwiper = new Swiper(activeSwiper, {
              loop: sliderLoop,
              autoplay: autoPlay,
              effect: sliderEffect,
              speed: sliderSpeed,
              pagination: {
                el: activePagination,
                clickable: true,
              },
              navigation: {
                nextEl: arrowRight,
                prevEl: arrowLeft,
              },
              slidesPerView: slidesPerView,
              breakpoints: sliderBreakpoints
            });
          }
    };

      var triggerSwiper = [
        'logo-slider',
        'imageCarousel',
        'testimonial-carousel',
        'team-carousel',
        'card-carousel',
        'service-carousel',
        'icon-carousel',
      ];
      
      $.each(triggerSwiper, function(index, item) {
        elementorFrontend.hooks.addAction('frontend/element_ready/' + item + '.default', function($scope, $) {
          swiper_slider();
        });
      });

        elementorFrontend.hooks.addAction( 'frontend/element_ready/advancedtabs.default', function(scope,$){  
          $('.ts-tabs.ts-fade-tabs .ts-tab-links a').on('click', function(e) {
            var currentAttrValue = $(this).attr('href');
            $('.ts-tabs ' + currentAttrValue).fadeIn(400).siblings().hide();
            $(this).parents('li').addClass('active').siblings().removeClass('active');
            e.preventDefault();
          });         
        });   

        elementorFrontend.hooks.addAction( 'frontend/element_ready/accordions.default', function(scope,$){  
          var $this = $(this);
          $('.ts-accordian').children('.ts-accordian-body').hide();
          $('.ts-accordian.active').children('.ts-accordian-body').show();
          $('.ts-accordian-title').on('click', function() {
            $(this).parent('.ts-accordian').siblings().children('.ts-accordian-body').slideUp(250);
            $(this).siblings().slideDown(250);
            /* Accordian Active Class */
            $(this).parents('.ts-accordian').addClass('active');
            $(this).parent('.ts-accordian').siblings().removeClass('active');
          });
        });

        elementorFrontend.hooks.addAction( 'frontend/element_ready/Filterable_Gallery.default', function(scope,$){  
          if ($.exists('.ts-isotop')) {
            $('.ts-isotop').isotope({
              itemSelector: '.ts-isotop-item',
              transitionDuration: '0.60s',
              percentPosition: true,
              masonry: {
                columnWidth: '.ts-grid-sizer'
              }
            });
            /* Active Class of Portfolio*/
            $('.ts-isotop-filter ul li').on('click', function(event) {
              $(this).siblings('.active').removeClass('active');
              $(this).addClass('active');
              event.preventDefault();
            });
            /*=== Portfolio filtering ===*/
            $('.ts-isotop-filter ul').on('click', 'a', function() {
              var filterElement = $(this).attr('data-filter');
              $(this).parents('.ts-isotop-filter').next().isotope({
                filter: filterElement
              });
            });
          }
      });


    });
})(jQuery);