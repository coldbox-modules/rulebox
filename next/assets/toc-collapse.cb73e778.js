/**
 * Collapses the mobile "On this page" <details> (theme.options.tocPosition:
 * "sticky"'s own below-xl fallback - see each theme's own page.bxm
 * renderToc()) after a click on one of its own links. A native <details>
 * stays open through an anchor-jump click by default, which would
 * otherwise cover the very heading the reader just navigated to - closing
 * it doesn't interfere with the jump itself, since it's just a class/state
 * change alongside the browser's own default navigation.
 */
( function () {
	document.querySelectorAll( ".bxsites-toc-mobile a" ).forEach( function ( link ) {
		link.addEventListener( "click", function () {
			var details = link.closest( "details" )
			if ( details ) {
				details.open = false
			}
		} )
	} )
} )()
