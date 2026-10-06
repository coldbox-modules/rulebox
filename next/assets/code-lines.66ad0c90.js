/**
 * Adds line numbers, highlighted/inserted/deleted lines, and an optional
 * title bar (plain or terminal-style) to fenced code blocks carrying
 * `hl_lines`/`linenums`/`title`/`frame`/`insert`/`delete` (see
 * CodeAnnotationProcessor.bx, which stamps them onto the `<pre>` as
 * `data-bxsites-*` attributes). Runs after highlight.js so a code block's
 * syntax-highlighting spans already exist in the DOM - splitting them
 * into one wrapper per source line has to walk that existing element
 * tree (a naive split of the text on "\n" would cut a span that spans
 * multiple lines, e.g. a multi-line comment or string token, in half).
 *
 * Only touches `<pre>` elements that actually carry one of these
 * annotations - the vast majority of code blocks have none and are left
 * exactly as highlight.js rendered them.
 */
( function () {
	/**
	 * Recursively walks `node`'s children, appending a clone of every
	 * leaf (text node) - wrapped in shallow clones of every element
	 * ancestor it sits under, so its own highlight.js class survives -
	 * onto the current (last) entry of `lines`. A literal newline inside
	 * a text node closes the current line and starts a new one.
	 */
	function walk( node, ancestors, lines ) {
		node.childNodes.forEach( function ( child ) {
			if ( child.nodeType === Node.TEXT_NODE ) {
				var parts = child.nodeValue.split( "\n" );
				parts.forEach( function ( part, i ) {
					if ( part.length ) {
						appendWrapped( document.createTextNode( part ), ancestors, lines );
					}
					if ( i < parts.length - 1 ) {
						lines.push( [] );
					}
				} );
			} else if ( child.nodeType === Node.ELEMENT_NODE ) {
				walk( child, ancestors.concat( [ child ] ), lines );
			}
		} );
	}

	function appendWrapped( leaf, ancestors, lines ) {
		var wrapped = leaf;
		for ( var i = ancestors.length - 1; i >= 0; i-- ) {
			var clone = ancestors[ i ].cloneNode( false );
			clone.appendChild( wrapped );
			wrapped = clone;
		}
		lines[ lines.length - 1 ].push( wrapped );
	}

	/**
	 * @return Array of lines, each an array of DOM nodes to place inside that line's wrapper
	 */
	function splitIntoLines( codeEl ) {
		var lines = [ [] ];
		walk( codeEl, [], lines );
		var last = lines[ lines.length - 1 ];
		if ( lines.length > 1 && last.length === 0 ) {
			lines.pop();
		}
		return lines;
	}

	/**
	 * Parses one of `data-bxsites-hl-lines`/`-insert-lines`/`-delete-lines`
	 * into a set of line numbers - all three share the same comma-separated
	 * format CodeAnnotationProcessor.bx writes them in.
	 *
	 * @spec Comma-separated line numbers, e.g. "2,4,5,6"
	 */
	function parseLineSet( spec ) {
		var set = {};
		( spec || "" ).split( "," ).forEach( function ( token ) {
			var n = parseInt( token, 10 );
			if ( !isNaN( n ) ) {
				set[ n ] = true;
			}
		} );
		return set;
	}

	function annotate( pre ) {
		var code = pre.querySelector( "code" );
		if ( !code ) {
			return;
		}

		// highlight.js's own `hljs.highlightAll()` (in layout.bxm) only ever
		// *schedules* highlighting when the page is still parsing - it defers
		// itself to a `window`-level "DOMContentLoaded" listener, which fires
		// *after* this script's own `document`-level listener (DOM event
		// propagation runs document-target listeners before window-bubble
		// ones). So on first load this element may still be raw/un-highlighted
		// here. Force it now - `highlightElement` stamps `dataset.highlighted`
		// and is a no-op if that's already set, so this is safe whether
		// highlight.js already ran (nothing to do) or hasn't yet (highlights
		// it immediately) - and either way, once stamped, highlight.js's own
		// later sweep will skip this element instead of re-highlighting over
		// (and silently discarding) the line-split structure built below.
		if ( window.hljs && !code.dataset.highlighted ) {
			window.hljs.highlightElement( code );
		}

		var hlLines = parseLineSet( pre.getAttribute( "data-bxsites-hl-lines" ) );
		var insertLines = parseLineSet( pre.getAttribute( "data-bxsites-insert-lines" ) );
		var deleteLines = parseLineSet( pre.getAttribute( "data-bxsites-delete-lines" ) );
		var startLineAttr = pre.getAttribute( "data-bxsites-start-line" );
		var showNumbers = startLineAttr !== null;
		var startLine = showNumbers ? ( parseInt( startLineAttr, 10 ) || 1 ) : 1;

		var lines = splitIntoLines( code );
		code.textContent = "";
		code.classList.add( "bxsites-code" );
		if ( showNumbers ) {
			code.classList.add( "bxsites-code--numbered" );
		}

		lines.forEach( function ( nodes, index ) {
			var lineNumber = startLine + index;
			var lineEl = document.createElement( "span" );
			lineEl.className = "bxsites-code-line";
			if ( showNumbers ) {
				lineEl.setAttribute( "data-line", lineNumber );
			}
			if ( hlLines[ index + 1 ] ) {
				lineEl.classList.add( "bxsites-hl-line" );
			}
			if ( insertLines[ index + 1 ] ) {
				lineEl.classList.add( "bxsites-insert-line" );
			}
			if ( deleteLines[ index + 1 ] ) {
				lineEl.classList.add( "bxsites-delete-line" );
			}
			nodes.forEach( function ( node ) {
				lineEl.appendChild( node );
			} );
			code.appendChild( lineEl );
		} );

		var title = pre.getAttribute( "data-bxsites-title" );
		var isTerminal = pre.getAttribute( "data-bxsites-frame" ) === "terminal";
		var prevEl = pre.previousElementSibling;
		var alreadyTitled = prevEl && prevEl.classList.contains( "bxsites-code-title" );
		if ( ( title || isTerminal ) && pre.parentNode && !alreadyTitled ) {
			var titleEl = document.createElement( "div" );
			titleEl.className = "bxsites-code-title";
			if ( isTerminal ) {
				// Three-dot window chrome + centered title, same macOS-terminal
				// convention Expressive Code/VitePress use - built as real
				// elements rather than textContent so the dots have somewhere
				// to sit; title text is still `textContent`-assigned onto its
				// own span, never string-concatenated into innerHTML.
				titleEl.classList.add( "bxsites-frame-terminal" );
				var dots = document.createElement( "span" );
				dots.className = "bxsites-frame-dots";
				for ( var i = 0; i < 3; i++ ) {
					dots.appendChild( document.createElement( "span" ) );
				}
				titleEl.appendChild( dots );
				var textEl = document.createElement( "span" );
				textEl.className = "bxsites-code-title__text";
				textEl.textContent = title;
				titleEl.appendChild( textEl );
			} else {
				titleEl.textContent = title;
			}
			pre.parentNode.insertBefore( titleEl, pre );
		}
	}

	function init() {
		document.querySelectorAll(
			"pre[data-bxsites-hl-lines], pre[data-bxsites-start-line], pre[data-bxsites-title], " +
			"pre[data-bxsites-frame], pre[data-bxsites-insert-lines], pre[data-bxsites-delete-lines]"
		).forEach( annotate );
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
