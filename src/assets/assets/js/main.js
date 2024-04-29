(function($){
    "use strict";

        // target menu
        $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if  (target.length) {
                    $('html, body').animate({
                        scrollTop: (target.offset().top - 50)
                    }, 1000, "easeInOutExpo");
                    return false;
                }
            }
        });

        // Closes responsive menu when a scroll trigger link is clicked
        $('.js-scroll-trigger').click(function() {
             $('.navbar-collapse').collapse('hide');
        });

        // Activate scrollspy to add active class to navbar items on scroll
        $('body').scrollspy({
            target: '#mainNav',
            offset: 100
        });

        //add class into header menu
        $(window).on('scroll',function() {
            if ($(this).scrollTop() > 20){  
                $('.navbar-expand-lg').addClass("color-set");
                $('.navbar-brand img').attr('src', 'assets/img/logo-black.png');
            }
            else{
                $('.navbar-expand-lg').removeClass("color-set");
                $('.navbar-brand img').attr('src', 'assets/img/logo.png');
            }
        });

        //Click event
        $('.go-top').on('click', function() {
            $("html, body").animate({ scrollTop: "0" },  500);
        });


        //  Newsletter Subscribe
        $('#mc-form').ajaxChimp({
            url: 'https://xyz.us15.list-manage.com/subscribe/post?u=a26d8d38db8b11ffd3352f889&amp;id=d60b8b0444'
            /* Replace Your AjaxChimp Subscription Link */
        });        
        
        // Hero Slides
        $(".hero-slides").owlCarousel({
            items: 1,
            nav: false,
            dots: true,
            touchDrag: false,
            mouseDrag: false,
            autoplay: true,
            smartSpeed: 700,
            loop: true,
            navText: [
            "<i class='icofont-rounded-left'></i>",
            "<i class='icofont-rounded-right'></i>"
            ]
        });

        // testimonial  
        var testimonialCarousel = $('.testimonial-carousel');
            testimonialCarousel.owlCarousel({
            loop:true,
            dots:true,
            nav:false,
            responsive : {
                0 : {
                    items: 1
                },
                768 : {
                    items: 1
                },
                960 : {
                    items: 1
                },
                1200 : {
                    items: 1
                },
                1920 : {
                    items: 1
                }
            }
        }); 

        // Blog Slider
        if ($(".blog-slider").length) {
            $(".blog-slider").owlCarousel({
                autoplay:true,
                smartSpeed: 300,
                margin: 30,
                loop:true,
                autoplayHoverPause:true,
                dots: true,
                responsive: {
                    0 : {
                        items: 1
                    },
                    550 : {
                        items: 2
                    },
                    992 : {
                        items: 3
                    },
                    1200 : {
                        items: 4
                    },
                    1600 : {
                        items: 5
                    }
                }
            });
        }

        // Tabs
        $('.tab ul.tabs').addClass('active').find('> li:eq(0)').addClass('current');
        $('.tab ul.tabs li a').on('click', function (g) {
            var tab = $(this).closest('.tab'), 
            index = $(this).closest('li').index();
            tab.find('ul.tabs > li').removeClass('current');
            $(this).closest('li').addClass('current');
            tab.find('.tab_content').find('div.tabs_item').not('div.tabs_item:eq(' + index + ')').slideUp();
            tab.find('.tab_content').find('div.tabs_item:eq(' + index + ')').slideDown();
            g.preventDefault();
        });
           
        // Counter
        $(".count").counterUp({
            delay: 20,
            time: 1500
        });
                
        // Popup Gallery
        $('.popup-btn').magnificPopup({
            type: 'image',
            gallery:{
                enabled:true
            }
        });
        
        // Popup Video
        $('.popup-video').magnificPopup({
            disableOn: 320,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });
        
        //preloader
        $(".book_preload").delay(2000).fadeOut(200);
        $(".book").on('click', function() {
             $(".book_preload").fadeOut(200);
        })

        // wow animation
        var wow = new WOW({
            mobile: false,
            offset: 60,
        });
        wow.init();


        // scroll animation
        window.sr = ScrollReveal();

        sr.reveal('.reveal-left-fade', {
            origin: 'left',
            distance: '20px',
            duration: 800,
            delay: 0,
            opacity: 0,
            scale: 0,
            easing: 'linear',
            mobile: false
        });

        sr.reveal('.reveal-right-fade', {
            origin: 'right',
            distance: '20px',
            duration: 800,
            delay: 0,
            opacity: 0,
            scale: 0,
            easing: 'linear',
            mobile: false
        });

        sr.reveal('.reveal-right-delay', {
            origin: 'right',
            distance: '20px',
            duration: 1000,
            delay: 0,
            opacity: 0,
            scale: 0,
            easing: 'linear',
            mobile: false
        }, 500);

        sr.reveal('.reveal-bottom-fade', {
            origin: 'bottom',
            distance: '20px',
            duration: 800,
            delay: 0,
            opacity: 0,
            scale: 0,
            easing: 'linear',
            mobile: false
        });
















}(jQuery));