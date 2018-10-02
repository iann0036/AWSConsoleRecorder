#Responsive Tabbed Navigation

A jQuery plug-in to turn bootstrap tabbed navigation into responsive tabbed navigation.

1. [What it does](#1-what-it-does)
2. [Dependencies](#2-dependencies)
3. [Usage](#3-usage)
4. [Credits](#4-credits)

##1. What it does

[Twitter bootstrap](http://twitter.github.com/bootstrap/) is a wonderful framework for web applications, with tons of components and superb styling. One of the many components included in the framework is tabbed navigation:

![](http://f.cl.ly/items/3A3e2P1x0x0e3W2B2s3Z/large.png)

Tabbed navigation looks fine on desktop-sized displays. Unfortunately, the stock framework doesn't make any accommodations for smaller screens. On a smartphone, the user experience can be confusing:

![](http://f.cl.ly/items/3A3e2P1x0x0e3W2B2s3Z/unresponsive-small.png)

This plug-in modifies the standard tabbed navigation to better fit smaller screens. Instead of showing all the tabs at once, it shows only the active tab, giving users a simple way to switch to a different tab.

![](http://f.cl.ly/items/3A3e2P1x0x0e3W2B2s3Z/responsive-small.png)

The responsive version does come with some compromises, however. Most obviously, users aren't able to view all the tab choices at the same time. In addition, users cannot navigate directly from one tab to any arbitrary tab; instead, they must increment through the tab options in order. Because of these issues, the responsive approach is best used when there's a natural order to the tab choices. Tabs that selected between "Hourly," "Daily,", "Weekly," "Monthly," "Quarterly," and "Yearly", for example, are excellent candidates. The obvious order in the tabs lets users immediately know if they've "gone too far" so they don't have to visit all the options. 

As a final note, if the user's browser does not support Javascript, the styles supplied with the plug-in fall back to behavior that still accommodates small screens:

![](http://f.cl.ly/items/3A3e2P1x0x0e3W2B2s3Z/styled-small.png)

##2. Dependencies

Although the plug-in assumes tabbed navigation markup as defined by [Twitter bootstrap](http://twitter.github.com/bootstrap/components.html#navs), it shouldn't be too difficult to modify it for other tab implementations.

The plug-in obviously requires [jQuery](http://jquery.com/). It has only been tested with version 1.7.2, but since it doesn't need anything very fancy or new, it most likely works fine with much older versions.

##3. Usage

### Install the plugin

There are a couple of options for installing the plug-in: a quick and simple approach and a more thorough integration into a site's assets. To check out the plug-in with minimal effort, first include the sample CSS file in the page header.

	<link rel="stylesheet" href="css/responsive-tabs.css" />

Then include the plug-in code after jQuery.

	<script src="js/jquery-1.7.2.min.js"></script>
	<script src="js/jquery.responsive-tabs-min.js"></script>

If your site uses a more advanced work flow based on Less and Javascript concatenation, use the `responsive-tabs.less` and `responsive-tabs.js` files as appropriate for your environment.

### Markup the desired tabbed navigation

If you're using the sample CSS without modification, add the `responsive` class to `tabbable` `<div>`s that should be modified for smaller screens.

	<div class="tabbable responsive">
	  <ul class="nav nav-tabs">
	    <li class="active"><a href="#tab1" data-toggle="tab">Tabbed Section 1</a></li>
	    <li><a href="#tab2" data-toggle="tab">Tabbed Section 2</a></li>
	    <li><a href="#tab3" data-toggle="tab">Tabbed Section 3</a></li>
	    <li><a href="#tab4" data-toggle="tab">Tabbed Section 4</a></li>
	  </ul>
	  <div class="tab-content">
	    <div class="tab-pane fade in active" id="tab1">
	      <p>This is dummy content for Tabbed Section 1. …</p>
	    </div>
	    <div class="tab-pane fade in" id="tab2">
	      <p>This is dummy content for Tabbed Section 2. …</p>
	    </div>
	    <div class="tab-pane fade in" id="tab3">
	      <p>This is dummy content for Tabbed Section 3. …</p>
	    </div>
	    <div class="tab-pane fade in" id="tab4">
	      <p>This is dummy content for Tabbed Section 4. …</p>
	    </div>
	  </div> <!-- /tab-content -->
	</div> <!-- /tabbable -->

As the example shows, it is a good idea to add `fade in` classes to the actual tab panes. The plug-in uses animation to shift the tabs themselves, and it might be disconcerting to the user if the tab content updated immediately.

### Invoke the plugin

Finally, invoke the plug-in once the document is ready.

	$(document).ready(function() {
	    $(".tabbable.responsive").resptabs(); 
	});

### Plug-in options

The plug-in has a few options that can be set globally or per-invocation. The supported options are

* maxSmallWidth: the largest window width (in pixels) that should receive the small screen styling. Defaults to 767.
* slideTime: the duration (in milliseconds) for the tab slide animation. Defaults to 500.

To set options on a case-by-case basis, just include an object as the parameter to the plug-in call.

	$(".tabbable.responsive").resptabs({
	    maxSmallWidth: 479,
	    slideTime: 300
	});

You can also set a single option

	$(".tabbable.responsive").resptabs("option", "maxSmallWidth", 479);

##4. Credits

A big "thank you" to Jonathan Nicol. Not only does responsive-tabs use his [jQuery plugin boilerplate](http://f6design.com/journal/2012/05/06/a-jquery-plugin-boilerplate/), but this readme file is based on the readme from his [Trackpad Scroll Emulator](https://github.com/jnicol/trackpad-scroll-emulator). (Definitely saved me time not having to research and figure out best practices for github's flavor of markdown.)
