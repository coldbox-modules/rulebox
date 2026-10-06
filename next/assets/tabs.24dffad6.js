/**
 * Click-to-switch behavior for content tab groups (`=== "Title"` markdown
 * syntax, see TabsProcessor.bx), shared across all built-in themes. Each
 * group is fully self-contained - clicking a button only ever changes
 * state within its own `.bxsites-tabs` ancestor.
 */
( function () {
	function activate( group, index ) {
		group.querySelectorAll( ":scope > .bxsites-tabs__nav > .bxsites-tab-btn" ).forEach( function ( btn ) {
			btn.classList.toggle( "bxsites-tab-btn--active", btn.getAttribute( "data-bxsites-tab" ) === index );
		} );
		group.querySelectorAll( ":scope > .bxsites-tabs__panels > .bxsites-tab-panel" ).forEach( function ( panel ) {
			panel.classList.toggle( "bxsites-tab-panel--active", panel.getAttribute( "data-bxsites-tab" ) === index );
		} );
	}

	function init() {
		document.querySelectorAll( ".bxsites-tabs" ).forEach( function ( group ) {
			group.querySelectorAll( ".bxsites-tab-btn" ).forEach( function ( btn ) {
				btn.addEventListener( "click", function () {
					activate( group, btn.getAttribute( "data-bxsites-tab" ) );
				} );
			} );
		} );
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
