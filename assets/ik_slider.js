;(function ( $, window, document, undefined ) {

	var pluginName = 'ik_slider',
		defaults = {
			'instructions': 'Use the right and left arrow keys to increase or decrease the slider value. ',
			'minValue': 0,
			'maxValue': 100,
			'nowValue': 0,
			'step': 1
		};

	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {string} options.instructions - Custom instructions for screen reader users.
	 * @param {number} options.minValue - Slider minimum value.
	 * @param {number} options.maxValue - Slider maximum value.
	 * @param {number} options.nowValue - Slider current value.
	 * @param {number} options.step - Slider increment value.
	 */
	function Plugin( element, options ) {

		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;

		this.init();

	}

	/** Initializes plugin. */
	Plugin.prototype.init = function () {

		var id, plugin;

		plugin = this;
		id = 'slider' + $('.ik_slider').length; // generate unique id

		plugin.textfield = plugin.element;

		if( !plugin.textfield.is(':text') ) {

			throw( plugin._name + ' plugin must be used only with text input elements.');

		} else {

			plugin.textfield
				.attr({
					'readonly': '',
					'tabindex': -1
				})
				.addClass('ik_value')
				.wrap('<div></div>'); // wrap initial element in a div

			plugin.element = plugin.textfield.parent('div').addClass('ik_slider')
				.on('mousedown', function(event){ event.preventDefault(); })
				.on('mouseleave', {'plugin': plugin}, plugin.onMouseUp);

			plugin.fill = $('<div/>')
				.addClass('ik_fill');

			plugin.knob = $('<div/>')
				.attr({
					'id': id,
					'tabindex': 0, // add this element to tab order
          'role': 'slider', // assign role slider
          'aria-valuemin': plugin.options.minValue, // set slider minimum value
          'aria-valuemax': plugin.options.maxValue, // set slider maximum value
          'aria-valuenow': plugin.options.minValue, // set slider current value
          'aria-describedby': id + '_instructions' // add description */
				})
				.addClass('ik_knob')
				.on('keydown', {'plugin': plugin}, plugin.onKeyDown)
				.on('mousedown', {'plugin': plugin}, plugin.onMouseDown)
				.on('mousemove', {'plugin': plugin}, plugin.onMouseMove)
				.on('mouseup', {'plugin': plugin}, plugin.onMouseUp)
				.on('mouseleave', function(){ setTimeout(plugin.onMouseUp, 100, { 'data': {'plugin': plugin} }) });

				$('<div/>') // add slider track
					.addClass('ik_track')
					.append(this.fill, this.knob)
					.prependTo(this.element);

				this.setValue(plugin.options.minValue); // update current value


				$('<div/>') // add instructions for screen reader users
		    .attr({
		    'id': id + '_instructions'
		    })
		    .text(this.options.instructions)
		    .addClass('ik_readersonly')
		    .appendTo(this.element);


		}

	};

	/**
	 * Sets current value.
	 *
	 * @param {number} n - Current value.
	 */
	Plugin.prototype.setValue = function (n) {

		this.textfield.val(n);
		this.options.nowValue = n;
		this.knob
	    .attr({
	        'aria-valuenow': n
	    });
		this.updateDisplay(n); // update display
	};

	/**
	 * Updates display.
	 *
	 * @param {number} n - Current value.
	 */
	Plugin.prototype.updateDisplay = function (n) {

		var percent;

		percent = (n - this.options.minValue) / (this.options.maxValue - this.options.minValue);

		this.fill
			.css({
				'transform':'scaleX(' + percent + ')'
			});

		this.knob
			.css({
				'left': percent * 100 + '%'
			});

	};



	/**
	 * Mousedown event handler.
	 *
	 * @param {object} event - Keyboard event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onMouseDown = function (event) {

		var plugin = event.data.plugin;
		plugin.dragging = true;
		plugin.element.addClass('dragging');

	};

	/**
	 * Mousemove event handler.
	 *
	 * @param {object} event - Keyboard event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onMouseMove = function (event) {

		var $elem, plugin, $parent, min, max, step, value, percent, diff, mod, test;

		event.preventDefault();
		event.stopPropagation();

		$me = $(this);
		$parent = $me.parent();
		plugin = event.data.plugin;

		if(event.data.plugin.dragging) {

			min = plugin.options.minValue;
			max = plugin.options.maxValue
			step = plugin.options.step;

			percent = (event.pageX - $parent.offset().left) / $parent.width();
			value = percent <= 0 ? min : percent >= 1 ? max : min + Math.floor( (max - min) * percent );
			mod = (value - min) % step;

			if (mod < step / 1.5) {
				plugin.setValue(value - mod);
			} else {
				plugin.setValue(value - mod + step);
			}
			plugin.updateDisplay(value);

		}

	};

	/**
	 * Mouseup event handler.
	 *
	 * @param {object} event - Keyboard event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onMouseUp = function (event) {

		var plugin = event.data.plugin;
		plugin.dragging = false;
		plugin.element.removeClass('dragging');
		plugin.setValue(plugin.options.nowValue);

	};

	/**
* Keyboard event handler.
*
* @param {object} event - Keyboard event.
* @param {object} event.data - Event data.
* @param {object} event.data.plugin - Reference to plugin.
*/
/**
* Keyboard event handler.
*
* @param {object} event - Keyboard event.
* @param {object} event.data - Event data.
* @param {object} event.data.plugin - Reference to plugin.
*/
Plugin.prototype.onKeyDown = function (event) {

    var $elem, plugin, value;

    $elem = $(this);
    plugin = event.data.plugin;

    switch (event.keyCode) {

        case ik_utils.keys.right:

            value = parseInt($elem.attr('aria-valuenow')) + plugin.options.step;
            value = value < plugin.options.maxValue ? value : plugin.options.maxValue;
            plugin.setValue(value);
            break;

        case ik_utils.keys.end:
            plugin.setValue(plugin.options.maxValue);
            break;

        case ik_utils.keys.left:

            value = parseInt($elem.attr('aria-valuenow')) - plugin.options.step;
            value = value > plugin.options.minValue ? value : plugin.options.minValue
            plugin.setValue(value);
            break;

        case ik_utils.keys.home:
            plugin.setValue(plugin.options.minValue);
            break;

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
