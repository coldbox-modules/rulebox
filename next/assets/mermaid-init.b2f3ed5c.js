/**
 * Converts bx-markdown's fenced ```mermaid code blocks (rendered as plain
 * <pre><code class="language-mermaid">) into mermaid.js's own expected
 * <div class="mermaid"> container, then renders them - shared across all
 * built-in themes, only loaded when bxsites.json's `mermaid` is true.
 */
( function () {
	function init() {
		document.querySelectorAll( "code.language-mermaid" ).forEach( function ( code ) {
			var container = document.createElement( "div" );
			container.className = "mermaid";
			container.textContent = code.textContent;
			var pre = code.closest( "pre" );
			( pre || code ).replaceWith( container );
		} );

		if ( window.mermaid ) {
			mermaid.initialize( {
				startOnLoad: true,
				theme: document.documentElement.getAttribute( "data-theme" ) === "dark" ? "dark" : "default"
			} );
		}
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
