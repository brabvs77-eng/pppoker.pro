;(function($){
    $(window).on("elementor/frontend/init",function(){
        elementorFrontend.hooks.addAction('frontend/element_ready/uaeProgressbar.default',function($scope, $){
 
                $scope.find(".uae-progress").each(function(){
                    var element = $(this)[0];
                    var bar_color = $(this).data('bar-color');
                    var bar_fill = $(this).data('bar-fill');
                    var bar_height = $(this).data('bar-height');
                    var counter_color = $(this).data('counter-color');
                    
                    
                    if(element) {
                        var bar = new ProgressBar.Line(element, {
                            strokeWidth: 4,
                            easing: 'easeInOut',
                            duration: 1400,
                            color: bar_color,
                            trailColor: '#eee',
                            trailWidth:bar_height,
                            svgStyle: {width: '100%', height: bar_height},
                            text: {
                                style: {
                                    // Text color.
                                    // Default: same as stroke color (options.color)
                                    color: counter_color,
                                    position: 'absolute',
                                    right: '0',
                                    top: 0,
                                    padding: 0,
                                    margin: 0,
                                    transform: null,
                                },
                                autoStyleContainer: false
                            },
                            step: (state, bar) => {
                                bar.setText(Math.round(bar.value() * 100) + ' %');
                            }
                        });

                        bar.animate(bar_fill);  // Number from 0.0 to 1.0
                    }
                });

          
        }) ;
    });


})(jQuery);