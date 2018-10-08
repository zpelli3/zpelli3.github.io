;(function ( $, window, document, undefined ) {

	var pluginName = 'ik_accordion',
		defaults = { // set default parameters
			autoCollapse: false,
			animationSpeed: 200
		};

	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {boolean} options.autoCollapse - Automatically collapse inactive panels.
	 * @param {number} options.animationSpeed - Panel toggle speed in milliseconds.
	 */
	function Plugin( element, options ) {

		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ; // override default parameters if setup object is present

		this.init();
	}

	/** Initializes plugin. */
	Plugin.prototype.init = function () {

		var id, $elem, plugin;

		id = 'acc' + $('.ik_accordion').length; // create unique id
		$elem = this.element;
		plugin = this;

		$elem.attr({
			'id': id,
      'role': 'region' // add the accordion to the landmarked regions
		}).addClass('ik_accordion');

    $elem.attr({'aria-multiselectable': !this.options.autoCollapse}); // define if more than one panel can be expanded

    this.headers = $elem.children('dt')
         .attr({'role': 'heading'}); // set heading role for each accordion header

    this.headers = $elem.children('dt').each(function(i, el) {
			var $me, $btn;

			$me = $(el);
			$btn = $('<div/>').attr({
          'id': id + '_btn_' + i
        })
        .addClass('button')
        .html($me.html())
        .on('click', {'plugin': plugin}, plugin.togglePanel);

			$me.empty().append($btn); // wrap content of each header in an element with role button
		});

		this.panels = $elem.children('dd').each(function(i, el) {
			var $me = $(this), id = $elem.attr('id') + '_panel_' + i;
			$me.attr({
				'id': id
			});
		}).hide();

	};

	/**
	 * Toggles accordion panel.
	 *
	 * @param {Object} event - Keyboard or mouse event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.togglePanel = function (event) {

		var plugin, $elem, $panel, $me, isVisible;

		plugin = event.data.plugin;
		$elem = $(plugin.element);
		$me = $(event.target);
		$panel = $me.parent('dt').next();

		if(plugin.options.autoCollapse) { // expand current panel and collapse the rest

			plugin.headers.each(function(i, el) {
				var $hdr, $btn;

				$hdr = $(el);
				$btn = $hdr.find('.button');

				if($btn[0] != $(event.currentTarget)[0]) {
					$btn.removeClass('expanded');
					$hdr.next().slideUp(plugin.options.animationSpeed);
				} else {
					$btn.addClass('expanded');
					$hdr.next().slideDown(plugin.options.animationSpeed);
				}
			});

		} else { // toggle current panel depending on the state

			isVisible = !!$panel.is(':visible');
			$panel.slideToggle({ duration: plugin.options.animationSpeed });

		}
	};

	$.fn[pluginName] = function ( options ) {

		return this.each(function () {

			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}

		});

	}

})( jQuery, window, document );
