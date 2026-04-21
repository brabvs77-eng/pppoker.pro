;(function ($) {
    $(window).on("elementor/frontend/init", function () {
        elementorFrontend.hooks.addAction("frontend/element_ready/counterdown.default", function (scope, $) {
            var clockElement = $(scope).find(".clock");
        
            var now = new Date();
            var targetTime = clockElement.data('target-time');
            var targetDataObject = new Date(targetTime);
            var difference = (targetDataObject.getTime()-now.getTime())/1000;
            clockFace = 'HourlyCounter';
            if(difference >24*60*60){
                clockFace='DailyCounter';
            }
            var clock = clockElement.FlipClock({
                clockFace: clockFace,
            });
            clock.setTime(difference);
            clock.setCountdown(true);
        });
        
        
     elementorFrontend.hooks.addAction("frontend/element_ready/clock.default", function (scope, $) {
            var clockElement = $(scope).find(".clock");
            var clockFormat = clockElement.data('clock-format');
            clockFace = '12' == clockFormat ? 'TwelveHourClock' : 'TwentyFourHourClock';
            clockElement.FlipClock({
                clockFace: clockFace
            });
        });    
        
        
    })
})(jQuery);

