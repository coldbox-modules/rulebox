/**
 * Drives `::: conditional key="..." value="..."` and its optional
 * `::: audience-switcher key="..." options="..."` control (DirectiveBlockProcessor.bx),
 * shared across all built-in themes, always copied (no `bxsites.json`
 * opt-in flag - inert with zero cost on a page/project with neither block).
 *
 * A reader's own preference is stored in `localStorage` under
 * `bxsites-pref-<key>`, so it's remembered across pages and future visits.
 * A `?<key>=<value>` query string param is also read once on load and
 * stored the same way, before anything renders, so a shared link like
 * `?plan=pro` can hand a reader straight to the right variant everywhere
 * on the site, not just the page the link pointed at.
 *
 * Every `::: conditional` variant is present in the HTML regardless of
 * preference (hidden client-side via plain `element.hidden`, never
 * omitted) - a reader with JS disabled, or a search crawler, still sees
 * every variant rather than none.
 */
( function () {
	function storageKey( key ) {
		return "bxsites-pref-" + key;
	}

	function getPreference( key ) {
		try {
			return localStorage.getItem( storageKey( key ) );
		} catch ( e ) {
			return null;
		}
	}

	function setPreference( key, value ) {
		try {
			localStorage.setItem( storageKey( key ), value );
		} catch ( e ) {
			// Storage unavailable (private browsing, blocked site data) -
			// applyPreferences() below still runs for this page load, the
			// choice just won't be remembered on the next one.
		}
		applyPreferences();
	}

	function applyPreferences() {
		document.querySelectorAll( ".bxsites-conditional[data-bxsites-key]" ).forEach( function ( el ) {
			var key = el.getAttribute( "data-bxsites-key" );
			var value = el.getAttribute( "data-bxsites-value" );
			var preferred = getPreference( key );
			el.hidden = preferred !== null && preferred !== value;
		} );

		document.querySelectorAll( ".bxsites-audience-switcher[data-bxsites-key]" ).forEach( function ( switcher ) {
			var key = switcher.getAttribute( "data-bxsites-key" );
			var preferred = getPreference( key );
			switcher.querySelectorAll( ".bxsites-audience-switcher__option" ).forEach( function ( btn ) {
				btn.classList.toggle( "bxsites-audience-switcher__option--active", btn.getAttribute( "data-bxsites-value" ) === preferred );
			} );
		} );
	}

	function readQueryStringPreferences() {
		var params = new URLSearchParams( window.location.search );
		document.querySelectorAll( "[data-bxsites-key]" ).forEach( function ( el ) {
			var key = el.getAttribute( "data-bxsites-key" );
			if ( params.has( key ) && getPreference( key ) === null ) {
				setPreference( key, params.get( key ) );
			}
		} );
	}

	function init() {
		document.querySelectorAll( ".bxsites-audience-switcher" ).forEach( function ( switcher ) {
			var key = switcher.getAttribute( "data-bxsites-key" );
			switcher.querySelectorAll( ".bxsites-audience-switcher__option" ).forEach( function ( btn ) {
				btn.addEventListener( "click", function () {
					setPreference( key, btn.getAttribute( "data-bxsites-value" ) );
				} );
			} );
		} );

		readQueryStringPreferences();
		applyPreferences();
	}

	window.bxSitesSetPreference = setPreference;

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
