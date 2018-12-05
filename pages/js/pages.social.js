/* ============================================================
 * Pages Social
 * ============================================================ */

(function($) {

    'use strict';

    // SOCIAL CLASS DEFINITION
    // ======================

    var Social = function(element, options) {
        this.$element = $(element);
        this.options = $.extend(true, {}, $.fn.social.defaults, options);
        this.$day =
            this.resizeTimeout =
            this.columns =
            this.colWidth = null;
        this.init();
    }
    Social.VERSION = "1.0.0";

    Social.prototype.init = function() {
        this.$cover = this.$element.find(this.options.cover);
        this.$day = this.$element.find(this.options.day);
        this.$item = this.$element.find(this.options.item);
        this.$status = this.$element.find(this.options.status);
        this.colWidth = this.options.colWidth;

        var _this = this;

        // TODO: transition disabled for mobile (animation starts after touch end)
    
        // Dependency: stepsForm 
        if (typeof stepsForm != 'undefined') {
            this.$status.length && new stepsForm(this.$status.get(0), {
                onSubmit: function(form) {
                    _this.$status.find('.status-form-inner').addClass('hide');
                    // form.submit()
                    // show success message
                    _this.$status.find('.final-message').html('<i class="fa fa-check-circle-o"></i> Status updated').addClass('show');
                }
            });


        }
        // Prevent 'vh' bug on iOS7
        if($.Pages.getUserAgent() == 'mobile'){
            //var wh = $(window).height();
            this.$cover.length && this.$cover.css('height', 400);
        }
       
        setTimeout(function() {
            this.$day.length && this.$day.isotope({
                "itemSelector": this.options.item,
                "masonry": {
                    "columnWidth": this.colWidth,
                    "gutter": 20,
                    "isFitWidth": true
                }
            });
           _this.$day.isotope('layout');
        }.bind(this), 500);

    }

    // Set container width in order to align it horizontally. 

    Social.prototype.setContainerWidth = function() {
        var currentColumns = Math.floor(($('body').width() - 100) / this.colWidth);
        if (currentColumns !== this.columns) {
            // set new column count
            this.columns = currentColumns;
            // apply width to container manually, then trigger relayout
            this.$day.length && this.$day.width(this.columns * (this.colWidth + 20));
        }
    }


    // SOCIAL PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('pg.social');
            var options = typeof option == 'object' && option;

            if (!data) $this.data('pg.social', (data = new Social(this, options)));
            if (typeof option == 'string') data[option]();
        })
    }

    var old = $.fn.social

    $.fn.social = Plugin
    $.fn.social.Constructor = Social

    $.fn.social.defaults = {
        cover: '[data-social="cover"]',
        day: '[data-social="day"]',
        status: '[data-social="status"]',
        item: '[data-social="item"]',
        colWidth: 300
    }

    // SOCIAL NO CONFLICT
    // ====================

    $.fn.social.noConflict = function() {
        $.fn.social = old;
        return this;
    }

    // SOCIAL DATA API
    //===================

    $(window).on('load', function() {
        $('[data-pages="social"]').each(function() {
            var $social = $(this);
            $social.social($social.data());

            setTimeout(function() {
                $social.find('[data-social="status"] li.current input').focus();
            }, 1000);

        })
    })

    $(window).on('resize', function() {
        $('[data-pages="social"]').each(function() {
            var $social = $(this);

            clearTimeout($social.data('pg.social').resizeTimeout);

            $social.data('pg.social').resizeTimeout = setTimeout(function() {
                // $social.data('pg.social').setContainerWidth();
                $social.data('pg.social').$day.isotope('layout');
            }, 300);

        });

    });


})(window.jQuery);