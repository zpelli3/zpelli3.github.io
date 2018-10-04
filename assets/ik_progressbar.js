;(function ( $, window, document, undefined ) {

	var pluginName = 'ik_progressbar',
		defaults = { // values can be overitten by passing configuration options to plugin constructor
			'instructions': 'Press spacebar, or Enter to get progress',
			'max': 100
		};

	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {string} options.instructions - Custom instructions for screen reader users.
	 * @param {number} options.max - End value.
	 */
	function Plugin( element, options ) {

		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;

		this.init();

	}

	/** Initializes plugin. */
	Plugin.prototype.init = function () { // initialization function

		var id = 'pb' + $('.ik_progressbar').length;

		this.element
			.attr({
				'id': id,
				'tabindex': -1, // add current element to tab oder
        'role': 'progressbar', // assign  progressbar role
        'aria-valuenow': 0, // set current value to 0
        'aria-valuemin': 0, // set minimum (start) value to 0 (required by screen readers)
        'aria-valuemax': this.options.max, // set maximum (end) value
        'aria-describedby': id + '_instructions' // add aria-describedby attribute
			})
			.addClass('ik_progressbar')
      .on('keydown.ik', {'plugin': this}, this.onKeyDown);

		this.fill = $('<div/>')
			.addClass('ik_fill');

		this.notification = $('<div/>') // add div element to be used to notify about the status of download
			.attr({
					'aria-live': 'assertive', // set notofocation priority to high
					'aria-atomic': 'additions' // notify only about newly added text
			})
			.addClass('ik_readersonly')
			.appendTo(this.element);

			$('<div/>') // add div element to be used with aria-described attribute of the progressbar
        .text(this.options.instructions) // get instruction text from plugin options
            .addClass('ik_readersonly') // hide element from visual display
            .attr({
            'id': id + '_instructions',
            'aria-hidden': 'true'  // hide element from screen readers to prevent it from being read twice
    })
    .appendTo(this.element);

		$('<div/>')
			.addClass('ik_track')
			.append(this.fill)
			.appendTo(this.element);

	};

	/**
	 * Gets the current value of progressbar.
	 *
	 * @returns {number}
	 */
	Plugin.prototype.getValue = function() {

		var value;

	//	value = Number( this.element.data('value') ); // inaccessible
		value = Number( this.element.attr('aria-valuenow') );

		return parseInt( value );

	};

	/**
	 * Gets the current value of progressbar.
	 *
	 * @returns {number}
	 */
	Plugin.prototype.getPercent = function() {

		var percent = this.getValue() / this.options.max * 100;

		return parseInt( percent );

	};

	/**
	 * Sets the current value of progressbar.
	 *
	 * @param {number} n - The current value.
	 */
	Plugin.prototype.setValue = function(n) {

		var $el, val, isComplete = false;

		$el = $(this.element);

		if (n >= this.options.max) {
			val = this.options.max;
			$el.attr({
					'tabindex': -1
				});
			this.notification.text('Loading complete');
		} else {
			val = n;
		}

		this.element
			/*.data({ // inaccessible
				'value': parseInt(val)
			}) */
			.attr({ // accessible
            'aria-valuenow': val
      });

		this.updateDisplay();

	};

	/** Updates visual display. */
	Plugin.prototype.updateDisplay = function() {

		this.fill.css({
			'transform': 'scaleX(' + this.getPercent() / 100 + ')'
		});

	};

	/** Updates text in live region to notify about current status. */
	Plugin.prototype.notify = function() {

		this.notification.text(  this.getPercent() + '%' );

	};

	/** Resets progressbar. */
	Plugin.prototype.reset = function() {

		this.setValue(0);
		this.updateDisplay();
		this.notify();

	};

	/**
 * Handles kedown event on progressbar element.
 *
 * @param {Object} event - Keyboard event.
 * @param {object} event.data - Event data.
 * @param {object} event.data.plugin - Reference to plugin.
 */
Plugin.prototype.onKeyDown = function(event) {

    switch(event.keyCode) {

        case ik_utils.keys.space:
        case ik_utils.keys.enter:
            event.preventDefault();
            event.stopPropagation();
            event.data.plugin.notify();
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
