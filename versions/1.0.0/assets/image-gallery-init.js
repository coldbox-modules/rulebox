/**
 * Drives `::: image-gallery`'s click-to-enlarge lightbox (DirectiveBlockProcessor.bx).
 * Only copied into a build when at least one page actually uses the
 * directive (BuildPipeline.bx's own `imageGalleryUsed` flag) - inert with
 * zero cost otherwise, the same opt-in posture as openapi-init.js.
 *
 * One shared overlay is built lazily on the first click and reused for
 * every gallery on the page. Prev/next only cycles within the SAME
 * gallery the opened image belongs to - a page with more than one
 * `::: image-gallery` never mixes them together in one lightbox session.
 */
( function () {
	var overlay = null;
	var images = [];
	var index = 0;

	function buildOverlay() {
		var el = document.createElement( "div" );
		el.className = "bxsites-lightbox";
		el.hidden = true;
		el.innerHTML =
			'<button type="button" class="bxsites-lightbox__close" aria-label="Close">&times;</button>' +
			'<button type="button" class="bxsites-lightbox__prev" aria-label="Previous image">&#8249;</button>' +
			'<img class="bxsites-lightbox__image" alt="">' +
			'<button type="button" class="bxsites-lightbox__next" aria-label="Next image">&#8250;</button>';

		el.querySelector( ".bxsites-lightbox__close" ).addEventListener( "click", close );
		el.querySelector( ".bxsites-lightbox__prev" ).addEventListener( "click", function () {
			show( index - 1 );
		} );
		el.querySelector( ".bxsites-lightbox__next" ).addEventListener( "click", function () {
			show( index + 1 );
		} );
		// A click anywhere on the dark scrim (not the image or the nav
		// buttons themselves, which stop propagation isn't needed for
		// since they're not descendants of the image) closes it.
		el.addEventListener( "click", function ( event ) {
			if ( event.target === el ) {
				close();
			}
		} );

		document.body.appendChild( el );
		return el;
	}

	function show( newIndex ) {
		index = ( newIndex + images.length ) % images.length;
		var img = images[ index ];
		var lightboxImage = overlay.querySelector( ".bxsites-lightbox__image" );
		lightboxImage.src = img.currentSrc || img.src;
		lightboxImage.alt = img.alt;

		var multiple = images.length > 1;
		overlay.querySelector( ".bxsites-lightbox__prev" ).hidden = !multiple;
		overlay.querySelector( ".bxsites-lightbox__next" ).hidden = !multiple;
	}

	function open( gallery, clickedImage ) {
		if ( !overlay ) {
			overlay = buildOverlay();
		}
		images = Array.prototype.slice.call( gallery.querySelectorAll( ".bxsites-image-gallery__image" ) );
		show( images.indexOf( clickedImage ) );
		overlay.hidden = false;
		document.addEventListener( "keydown", onKeydown );
	}

	function close() {
		if ( overlay ) {
			overlay.hidden = true;
		}
		document.removeEventListener( "keydown", onKeydown );
	}

	function onKeydown( event ) {
		if ( event.key === "Escape" ) {
			close();
		} else if ( event.key === "ArrowLeft" ) {
			show( index - 1 );
		} else if ( event.key === "ArrowRight" ) {
			show( index + 1 );
		}
	}

	function init() {
		document.querySelectorAll( ".bxsites-image-gallery" ).forEach( function ( gallery ) {
			gallery.querySelectorAll( ".bxsites-image-gallery__image[data-bxsites-lightbox]" ).forEach( function ( img ) {
				img.addEventListener( "click", function () {
					open( gallery, img );
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
