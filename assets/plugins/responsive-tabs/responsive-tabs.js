/*!
 * jQuery plug-in to turn bootstrap tabbed navigation into responsive tabbed navigation
 * Original author: @stephen_thomas
 * Plugin Boilerplate: http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
 * Additional Boilerplate: http://f6design.com/journal/2012/05/06/a-jquery-plugin-boilerplate/
 * Comments from boilerplate sources retained
 * Licensed under the MIT license
 */


// the semi-colon before the function invocation is a safety 
// net against concatenated scripts and/or other plugins 
// that are not closed properly.
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global 
		// variable in ECMAScript 3 and is mutable (i.e. it can 
		// be changed by someone else). undefined isn't really 
		// being passed in so we can ensure that its value is 
		// truly undefined. In ES5, undefined can no longer be 
		// modified.

		// window and document are passed through as local 
		// variables rather than as globals, because this (slightly) 
		// quickens the resolution process and can be more 
		// efficiently minified (especially when both are 
		// regularly referenced in your plugin).


		// From http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
		//
		// Strict Mode is a new feature in ECMAScript 5 that allows you to
		// place a program, or a function, in a "strict" operating context.
		// This strict context prevents certain actions from being taken
		// and throws more exceptions (generally providing the user with
		// more information and a tapered-down coding experience).
		//
		// Since ECMAScript 5 is backwards-compatible with ECMAScript 3,
		// all of the "features" that were in ECMAScript 3 that were
		// "deprecated" are just disabled (or throw errors) in strict
		// mode, instead.
		//
		// Strict mode helps out in a couple ways:
		//
		//  *  It catches some common coding bloopers, throwing exceptions.
		//  *  It prevents, or throws errors, when relatively "unsafe"
		//     actions are taken (such as gaining access to the global object).
		//  *  It disables features that are confusing or poorly thought out.

		"use strict";

		var pluginName = 'resptabs';

		// The plug-in itself is implemented as an object. Here's the
		// constructor function

		function Plugin(element, options) {

				// Members
				var el = element,      // DOM version of element
					 $el = $(element),   // jQuery version of element
					 windowSize;         // last measured window size

				// Extend default options with those supplied by user.
				options = $.extend({}, $.fn[pluginName].defaults, options);

				// Slide the tab itself (not the content)
				function slideTab($tabEl, inOrOut, leftOrRight) {

						// grab the current values for styles we might change
						var oldStyles = {
										"margin-left": $tabEl.css('margin-left'),
										"opacity":     $tabEl.css('opacity'),
										"position":    $tabEl.css('position')
								},
								startAnimation = {},
								endAnimation = {};

						// if the tab is going away, absolute position it so the
						// replacement tab will appear in its place
						if (inOrOut === 'out') {
								$tabEl.css('position', 'absolute');
								// define where the animation should end
								endAnimation["opacity"]     = 0;
								endAnimation["margin-left"] = $(window).width();
								if (leftOrRight === 'left') { endAnimation["margin-left"] *= -1; }

						// if the tab is coming into view, position it where it can
						// start its animation and set it up to fade in
						} else if (inOrOut === 'in') {
								startAnimation["opacity"]     = 0;
								startAnimation["margin-left"] = $(window).width();
								if (leftOrRight === 'left') { startAnimation["margin-left"] *= -1; }
								$tabEl.css(startAnimation);
								// ensure the tab will be visible as it moves in
								$tabEl.show();
								// end up with the modified styles restored
								endAnimation["opacity"]     = oldStyles["opacity"];
								endAnimation["margin-left"] = oldStyles["margin-left"];
						}

						// do the animation
						$tabEl.animate(
								endAnimation,
								options.slideTime,
								function() {

										// if the tab has gone away, hide it in the conventional
										// way and restore the properties that we animated
										if (inOrOut === 'out') {
												$tabEl.hide();
												$tabEl.css(oldStyles);
										}
								}
						);
			 }

				// Set the small screen (responsive) style for tabbable naviation.
				function setSmallStyle() {

						$(".nav-tabs > li",$el).css("text-align", "center");
						$(".nav-tabs > li:not(.active)",$el).hide();
						$("<a class='right tab-control'>&rsaquo;</a>").appendTo($(".nav-tabs li:not(:last-child)",$el))
							.each(function(i){
								var thisLi  = $(this).parents("ul").first().children("li:nth-child("+(i+1)+")"),
										thisTab = $(thisLi).children("a[href]"),
										nextLi  = $(this).parents("ul").first().children("li:nth-child("+(i+2)+")"),
										nextTab = $(nextLi).children("a[href]");
								$(this).click(function() {
										slideTab(thisLi, "out", "left" );
										slideTab(nextLi, "in",  "right");
										$(nextTab).tab('show');
								});
						});
						$("<a class='left tab-control'>&lsaquo;</a>").prependTo($(".nav-tabs li:not(:first-child)",$el))
							.each(function(i){
								var thisLi = $(this).parents("ul").first().children("li:nth-child("+(i+2)+")"),
										thisTab = $(thisLi).children("a[href]"),
										prevLi = $(this).parents("ul").first().children("li:nth-child("+(i+1)+")"),
										prevTab = $(prevLi).children("a[href]");
								$(this).click(function() {
										slideTab(thisLi, "out", "right");
										slideTab(prevLi, "in", "left");
										$(prevTab).tab('show');
								});
						});
						$(".nav-tabs li:first-child",$el).prepend("<span class='left tab-control-spacer'> </span>");
						$(".nav-tabs li:last-child",$el).append("<span class='right tab-control-spacer'> </span>");
				}

				// Set the large screen version of tabbable navigation;
				// this is just the bootstrap default, so all we need to do is
				// to undo any potential changes we made for a small screen
				// style.

				function setLargeStyle() {

						$(".nav-tabs > li",$el).css("text-align", "left");
						$(".nav-tabs > li:not(.active)",$el).show();
						$(".tab-control",$el).remove();
						$(".tab-control-spacer",$el).remove();

				}

				function windowResized() {

						// Although this isn't strictly necessary, let's monitor the
						// window size so we can detect when it crosses the threshold
						// that triggers re-styling. Not likely a big deal for actual
						// users, but we include the functionality for the geeks that
						// like to look at responsive web sites and mess around with
						// browser window widths.
						//
						// We're not bothering with debouncing the window resize 
						// event since we only care when a breakpoint is crossed.
						// Ignoring the other resizes effectively serves as a
						// debouncer.

						var newWidth = $('body').width();
						if ( (windowSize > options.maxSmallWidth) && 
								 (newWidth <= options.maxSmallWidth) )  {

								setSmallStyle();

						} else if ( (windowSize <= options.maxSmallWidth) && 
												(newWidth > options.maxSmallWidth) ) {

								setLargeStyle();

						}
						windowSize = newWidth;
				}

				// Initialize plugin.
				function init() {
						// keep track of the window size so we can tell when it crosses a breakpoint
						windowSize = $('body').width();

						// default is large window styling; adjust if appropriate
						if (windowSize <= options.maxSmallWidth) {
								setSmallStyle();
						}

						// track window size changes to look for breakpoints
						$(window).on('resize', windowResized);

						hook('onInit');

				}

				// Get/set a plugin option.
				// Get usage: $('#el').responsive-tabs('option', 'key');
				// Set usage: $('#el').responsive-tabs('option', 'key', value);

				function option (key, val) {
						if (val) {
								options[key] = val;
						} else {
								return options[key];
						}
				}

				// Destroy plugin.
				// Usage: $('#el').responsive-tabs('destroy');

				function destroy() {
						// Clean up by removing the event handlers we've added
						$(window).off('resize', windowResized);

						// restore styles and DOM
						setLargeStyle();

						// Iterate over each matching element.
						$el.each(function() {
								var el = this,
									 $el = $(this);

								hook('onDestroy');

								// Remove Plugin instance from the element.
								$el.removeData('plugin_' + pluginName);
						});
				}

				// Callback hooks.
				// Usage: In the defaults object specify a callback function:
				// hookName: function() {}
				// Then somewhere in the plugin trigger the callback:
				// hook('hookName');

				function hook(hookName) {
						if (options[hookName] !== undefined) {
								// Call the user defined function.
								// Scope is set to the jQuery element we are operating on.
								options[hookName].call(el);
						}
				}

				// Initialize the plugin instance.
				init();

				// Expose methods of Plugin we wish to be public.
				return {
						option: option,
						destroy: destroy
				};
		}

		// Build the plugin here 

		$.fn[pluginName] = function ( options ) {

				// If the first parameter is a string, treat this as a call to
				// a public method. The first parameter is the method name and
				// following parameters are arguments for the method.

				if (typeof arguments[0] === 'string') {
						var methodName = arguments[0];
						var args = Array.prototype.slice.call(arguments, 1);
						var returnVal;
						this.each(function() {
								// Check that the element has a plugin instance, and that
								// the requested public method exists.
								if ( $.data(this, 'plugin_' + pluginName) && 
										 typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function' ) {
										// Call the method of the Plugin instance, and Pass it
										// the supplied arguments.
										returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
								} else {
										throw new Error('Method ' +  methodName + ' does not exist on jQuery.' + pluginName);
								}
						});
						if (returnVal !== undefined){
								// If the method returned a value, return the value.
								return returnVal;
						} else {
								// Otherwise, returning 'this' preserves chainability.
								return this;
						}

				// If the first parameter is an object (options), or was omitted,
				// instantiate a new instance of the plugin.

				} else if (typeof options === "object" || !options) {

						return this.each(function() {
								// Only allow the plugin to be instantiated once.
								if (!$.data(this, 'plugin_' + pluginName)) {
										// Pass options to Plugin constructor, and store Plugin
										// instance in the elements jQuery data object.
										$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
								}
						});
				}
		};

		// Default plugin options.
		// Options can be overwritten when initializing plugin, by
		// passing an object literal, or after initialization:
		// $('#el').responsive-tabs('option', 'key', value);
		$.fn[pluginName].defaults = {
				maxSmallWidth: 767,   // biggest screen size for which we use "small" configuration
				slideTime: 500,       // milliseconds to slide from one tab to another
				onInit: function() {},
				onDestroy: function() {}
		};

})( jQuery, window, document );
