/**
 * Wires up `::: prompt` blocks (DirectiveBlockProcessor.bx's own
 * `renderPrompt()`) - shared across all built-in themes, loaded
 * unconditionally alongside conditional-content-init.js since the
 * `::: prompt` syntax needs no `bxsites.yaml` opt-in. Two independent
 * behaviors, same shape as copy-code.js/admonition-collapse.js:
 *
 * - `.bxsites-prompt__copy` copies the block's own raw markdown source
 *   (`data-bxsites-prompt-text` on its `.bxsites-prompt` container, not
 *   its rendered HTML) to the clipboard - a reader always copies exactly
 *   the prompt text as authored, formatting markup included.
 * - `.bxsites-prompt__toggle` (only rendered for a "hidden"/"preview"
 *   block) flips `.is-expanded` on its own `.bxsites-prompt` container,
 *   swapping its own label between its `data-label-collapsed`/
 *   `data-label-expanded` text - the CSS keyed on `.is-expanded` does the
 *   actual showing/hiding.
 */
( function () {
	function init() {
		document.querySelectorAll( ".bxsites-prompt__copy" ).forEach( function ( button ) {
			if ( button.dataset.bxsitesInit ) {
				return;
			}
			button.dataset.bxsitesInit = "true";

			var container = button.closest( ".bxsites-prompt" );
			var label = button.querySelector( ".bxsites-prompt__copy-label" );
			if ( !container || !label ) {
				return;
			}

			button.addEventListener( "click", function () {
				var text = container.dataset.bxsitesPromptText || "";
				var original = label.textContent;

				navigator.clipboard.writeText( text ).then(
					function () {
						label.textContent = "Copied!";
						button.classList.add( "is-copied" );
						setTimeout( function () {
							label.textContent = original;
							button.classList.remove( "is-copied" );
						}, 1500 );
					},
					function () {
						label.textContent = "Failed";
						setTimeout( function () {
							label.textContent = original;
						}, 1500 );
					}
				);
			} );
		} );

		document.querySelectorAll( ".bxsites-prompt__toggle" ).forEach( function ( button ) {
			if ( button.dataset.bxsitesInit ) {
				return;
			}
			button.dataset.bxsitesInit = "true";

			var container = button.closest( ".bxsites-prompt" );
			if ( !container ) {
				return;
			}

			button.addEventListener( "click", function () {
				var expanded = container.classList.toggle( "is-expanded" );
				button.textContent = expanded ? button.dataset.labelExpanded : button.dataset.labelCollapsed;
				button.setAttribute( "aria-expanded", expanded ? "true" : "false" );
			} );
		} );
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
