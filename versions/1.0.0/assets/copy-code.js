/**
 * Adds a "Copy" button to every code block, shared across all built-in
 * themes. Runs after highlight.js (loaded first in each layout.bxm) so it
 * sees the final markup either way - it only needs a plain `<pre><code>`.
 */
( function () {
	function init() {
		document.querySelectorAll( "pre" ).forEach( function ( pre ) {
			if ( pre.querySelector( ".bxsites-copy-btn" ) ) {
				return;
			}
			var code = pre.querySelector( "code" );
			if ( !code ) {
				return;
			}

			pre.classList.add( "bxsites-pre" );

			var button = document.createElement( "button" );
			button.type = "button";
			button.className = "bxsites-copy-btn";
			button.textContent = "Copy";
			button.setAttribute( "aria-label", "Copy code to clipboard" );

			button.addEventListener( "click", function () {
				navigator.clipboard.writeText( code.textContent ).then(
					function () {
						button.textContent = "Copied!";
						setTimeout( function () {
							button.textContent = "Copy";
						}, 1500 );
					},
					function () {
						button.textContent = "Failed";
						setTimeout( function () {
							button.textContent = "Copy";
						}, 1500 );
					}
				);
			} );

			pre.appendChild( button );
		} );
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
