/**
 * Wires up the GitBook-style page-actions dropdown (page.bxm's own
 * renderPageActions() - only rendered when bxsites.json's `pageActions`
 * is `true`), shared across every built-in theme. The dropdown's own
 * open/closed state is a plain <details>/<summary> (no JS needed for
 * that part, same as ::: expandable - DirectiveBlockProcessor.bx's own
 * renderExpandable()); this only wires up the individual actions:
 *
 * - [data-bxsites-action="copy-markdown"] fetches its own
 *   data-bxsites-markdown-url (same-origin, relative) and copies the raw
 *   Markdown text to the clipboard.
 * - [data-bxsites-action="copy-link"] copies its own data-bxsites-page-url
 *   (the page's absolute canonical URL) to the clipboard directly.
 * - [data-bxsites-action="print"] triggers the browser's own print dialog
 *   (window.print()), scoped to just this page by each theme's own
 *   @media print rules (see the ::: pagebreak content block's own CSS).
 *
 * "View as Markdown"/"Open in ChatGPT"/"Open in Claude"/"Report an
 * issue"/"Share on X"/"Share on LinkedIn" are plain <a> links - no JS
 * needed to fire them, only to close the panel afterwards.
 *
 * A bare "c" keydown (see below) also toggles the whole menu open/closed
 * from anywhere on the page, matching the "C" hint page.bxm's own
 * renderPageActions() renders in the button.
 */
( function () {
	function flashLabel( button, text, revertAfter ) {
		var label = button.querySelector( "span" );
		if ( !label ) {
			return;
		}
		var original = label.textContent;
		label.textContent = text;
		setTimeout( function () {
			label.textContent = original;
		}, revertAfter );
	}

	function closeMenu( button, delay ) {
		var details = button.closest( "details" );
		if ( !details ) {
			return;
		}
		setTimeout( function () {
			details.open = false;
		}, delay );
	}

	function copyText( button, text ) {
		navigator.clipboard.writeText( text ).then(
			function () {
				flashLabel( button, "Copied!", 1200 );
				closeMenu( button, 700 );
			},
			function () {
				flashLabel( button, "Failed", 1200 );
			}
		);
	}

	function init() {
		document.querySelectorAll( '[data-bxsites-action="copy-markdown"]' ).forEach( function ( button ) {
			if ( button.dataset.bxsitesInit ) {
				return;
			}
			button.dataset.bxsitesInit = "true";

			button.addEventListener( "click", function () {
				var url = button.dataset.bxsitesMarkdownUrl || "";
				if ( !url ) {
					return;
				}
				fetch( url )
					.then( function ( response ) {
						return response.text();
					} )
					.then( function ( text ) {
						copyText( button, text );
					} )
					.catch( function () {
						flashLabel( button, "Failed", 1200 );
					} );
			} );
		} );

		document.querySelectorAll( '[data-bxsites-action="copy-link"]' ).forEach( function ( button ) {
			if ( button.dataset.bxsitesInit ) {
				return;
			}
			button.dataset.bxsitesInit = "true";

			button.addEventListener( "click", function () {
				var url = button.dataset.bxsitesPageUrl || "";
				if ( !url ) {
					return;
				}
				copyText( button, url );
			} );
		} );

		document.querySelectorAll( '[data-bxsites-action="print"]' ).forEach( function ( button ) {
			if ( button.dataset.bxsitesInit ) {
				return;
			}
			button.dataset.bxsitesInit = "true";

			button.addEventListener( "click", function () {
				closeMenu( button, 0 );
				window.print();
			} );
		} );

		document.querySelectorAll( ".bxsites-page-actions__item[href]" ).forEach( function ( link ) {
			if ( link.dataset.bxsitesInit ) {
				return;
			}
			link.dataset.bxsitesInit = "true";

			link.addEventListener( "click", function () {
				closeMenu( link, 0 );
			} );
		} );

		// Close any open page-actions panel when clicking elsewhere on the page.
		document.addEventListener( "click", function ( event ) {
			document.querySelectorAll( ".bxsites-page-actions__disclosure[open]" ).forEach( function ( details ) {
				if ( !details.contains( event.target ) ) {
					details.open = false;
				}
			} );
		} );

		// Bare "c" toggles the page-actions menu from anywhere on the page -
		// same "not already typing somewhere else" guard search.js's own "/"
		// shortcut uses, since this one (unlike search's Cmd/Ctrl+K) has no
		// modifier of its own to disambiguate it from a reader's real typing.
		document.addEventListener( "keydown", function ( event ) {
			if ( event.key.toLowerCase() !== "c" || event.ctrlKey || event.metaKey || event.altKey ) {
				return;
			}
			var tag = ( event.target.tagName || "" ).toLowerCase();
			if ( tag === "input" || tag === "textarea" || event.target.isContentEditable ) {
				return;
			}
			var details = document.querySelector( ".bxsites-page-actions__disclosure" );
			if ( !details ) {
				return;
			}
			event.preventDefault();
			details.open = !details.open;
			if ( details.open ) {
				var firstItem = details.querySelector( ".bxsites-page-actions__item" );
				if ( firstItem ) {
					firstItem.focus();
				}
			}
		} );
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
