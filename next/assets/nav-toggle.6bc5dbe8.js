/**
 * Wires up the sidebar nav's `.nav-toggle` buttons (module spec section 5,
 * step 4) - the server already renders each collapsible section's initial
 * open/closed state (via `hidden` on its child `<ul>` and `aria-expanded`
 * on the button, from the current page's own active branch). This swaps
 * that `hidden` attribute for a `max-height` transition on init (display:none
 * can't be animated, so a `hidden` list is measurable but never visibly
 * slides), then animates every click the same way - measuring the real
 * content height via `scrollHeight` rather than a guessed fixed max-height,
 * so the slide always takes the same-feeling duration regardless of how
 * many links a section holds. Shared across all built-in themes, loaded
 * unconditionally alongside admonition-collapse.js - a no-op page with no
 * `theme.options.navCollapsible` simply has no `.nav-toggle` buttons to find.
 *
 * The click target is the whole `.nav-group-header` row (a bigger, more
 * discoverable hit area than the small chevron alone), not just the button -
 * except when the click actually lands on the row's own `<a>` title link,
 * which must keep navigating normally rather than only toggling.
 */
( function () {
	function collapse( list ) {
		// Force a reflow between setting the current (open) height and the
		// target 0 - without it the browser coalesces both writes and skips
		// straight to the end state, no visible transition.
		list.style.maxHeight = list.scrollHeight + "px";
		list.getBoundingClientRect();
		list.style.maxHeight = "0px";
	}

	function expand( list ) {
		list.style.maxHeight = list.scrollHeight + "px";
		list.addEventListener( "transitionend", function onEnd( event ) {
			if ( event.propertyName !== "max-height" ) {
				return;
			}
			list.style.maxHeight = "none";
			list.removeEventListener( "transitionend", onEnd );
		} );
	}

	function init() {
		document.querySelectorAll( ".nav-toggle" ).forEach( function ( button ) {
			var item = button.closest( ".nav-item, .md-nav__item, li" );
			var childList = item ? item.querySelector( "ul" ) : null;
			if ( !childList ) {
				return;
			}

			childList.classList.add( "nav-toggle-body" );
			if ( childList.hidden ) {
				childList.hidden = false;
				childList.style.maxHeight = "0px";
			} else {
				childList.style.maxHeight = "none";
			}

			function toggle() {
				var open = button.getAttribute( "aria-expanded" ) === "true";
				button.setAttribute( "aria-expanded", open ? "false" : "true" );
				if ( open ) {
					collapse( childList );
				} else {
					expand( childList );
				}
			}

			var header = button.parentElement;
			if ( header && header.classList.contains( "nav-group-header" ) ) {
				header.addEventListener( "click", function ( event ) {
					// A click on (or inside) the row's own title link keeps
					// navigating normally - everything else in the row,
					// chevron included, toggles.
					if ( event.target.closest( "a" ) ) {
						return;
					}
					toggle();
				} );
			} else {
				button.addEventListener( "click", toggle );
			}
		} );
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
