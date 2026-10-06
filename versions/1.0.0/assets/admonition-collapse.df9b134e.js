/**
 * Makes bx-markdown's collapsible admonitions actually toggle open/closed on
 * click - the extension ships the markup (`??? type` renders with an
 * `adm-collapsed` marker class, `???+ type` with `adm-open`) and CSS but no
 * JS interaction of its own. Both marker classes just mean "collapsible";
 * toggling always flips `adm-collapsed`, which the CSS uses to hide the
 * body. Shared across all built-in themes, loaded unconditionally alongside
 * copy-code.js since admonitions are on by default.
 */
( function () {
	function init() {
		document.querySelectorAll( ".adm-block.adm-collapsed > .adm-heading, .adm-block.adm-open > .adm-heading" ).forEach( function ( heading ) {
			if ( heading.hasAttribute( "role" ) ) {
				return;
			}
			heading.setAttribute( "role", "button" );
			heading.setAttribute( "tabindex", "0" );

			function toggle() {
				heading.parentElement.classList.toggle( "adm-collapsed" );
			}

			heading.addEventListener( "click", toggle );
			heading.addEventListener( "keydown", function ( event ) {
				if ( event.key === "Enter" || event.key === " " ) {
					event.preventDefault();
					toggle();
				}
			} );
		} );
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
