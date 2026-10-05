/**
 * Shared client-side search widget for bx-sites' built-in themes - fully
 * static, no server dependency, the same "index once at build time, search
 * in the browser" approach mkdocs uses by default, per module spec section 7.
 * Every theme's own search.bxm partial just renders the markup (an
 * #bxsites-search-input + #bxsites-search-results pair); this one script
 * wires all of them the same way against the shared search-index.json format
 * built by SearchIndexer.bx, using MiniSearch (vendored alongside this file)
 * to actually index/query it - prefix matching and typo-tolerant fuzzy
 * matching are both built into MiniSearch's own `search()` call, so unlike
 * the lunr.js widget this replaced, there's no separate wildcard-query retry
 * needed to match a partial word while typing.
 *
 * `window.__BXSITES_BASE_PATH__` (set inline by layout.bxm from
 * BaseUrlResolver's `basePath`) prefixes both the index fetch and every
 * result link, so search still works when a site is hosted from a sub-path.
 * `window.__BXSITES_SEARCH_NO_RESULTS__` (set inline by layout.bxm from
 * StringsResolver's own resolved `searchNoResults`) is this locale's own
 * "no results" text, same reasoning - a static asset shared by every theme
 * can't itself resolve per-locale strings, so the page that includes it hands
 * the already-resolved value over.
 *
 * Both the sidebar dropdown and the Cmd/Ctrl+K command palette render the
 * same enriched result row (title with matched-term highlighting, a
 * section/breadcrumb line, and a body snippet - all already present in
 * search-index.json's own `section`/`breadcrumb`/`body` fields, SearchIndexer.bx),
 * grouped by each result's top-level nav `section`, and share one keyboard-nav
 * helper (`createResultNav`) for Up/Down/Enter across the result list. Every
 * new class this introduces (`.bxsites-search-result*`, `.bxsites-search-group-label`)
 * is styled per theme in that theme's own style.css, deriving its accent
 * colors (the active row, the matched-term `<mark>`) from that theme's own
 * `--bxsites-accent` custom property rather than a fixed color, so the
 * highlight always matches the site's configured accent.
 *
 * `/` focuses the sidebar search box from anywhere on the page (mkdocs-material's
 * own convention); Cmd/Ctrl+K instead opens a separate command-palette-style
 * overlay (buildPalette()) - a centered modal over a backdrop, with arrow-key
 * result navigation and Enter-to-go, matching the "Quick Find"/⌘K convention
 * every other doc-search widget (Algolia DocSearch, Pagefind, VitePress,
 * Docusaurus, GitBook) uses. Its own markup is built entirely in JS and
 * appended to `document.body` - no theme template changes needed - and it
 * reuses the exact same already-built `idx` the sidebar widget itself
 * builds below, rather than fetching search-index.json twice. A
 * theme's `.bxsites-search-kbd` badge (if it renders one) gets its text
 * swapped to the platform-correct hint.
 */
( function () {
	var RESULT_LIMIT = 10;
	var SNIPPET_LENGTH = 160;

	function basePath() {
		return window.__BXSITES_BASE_PATH__ || "/";
	}

	function noResultsText() {
		return window.__BXSITES_SEARCH_NO_RESULTS__ || "No results found.";
	}

	function escapeRegExp( text ) {
		return text.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" );
	}

	/**
	 * Appends `text` to `el` as one or more text/`<mark>` nodes, wrapping
	 * every case-insensitive occurrence of any of `terms` (MiniSearch's own
	 * matched query terms for that hit) in a `<mark class="bxsites-search-result__mark">`.
	 * Built as DOM nodes rather than an innerHTML string so nothing in a
	 * page title/query can be interpreted as markup.
	 *
	 * @el Element to append nodes to
	 * @text Plain text to render
	 * @terms Matched terms to highlight within `text` (MiniSearch hit.terms)
	 */
	function appendHighlighted( el, text, terms ) {
		var pattern = ( terms || [] )
			.filter( function ( term ) { return term; } )
			.map( escapeRegExp )
			.join( "|" );

		if ( !pattern ) {
			el.appendChild( document.createTextNode( text ) );
			return;
		}

		var re = new RegExp( "(" + pattern + ")", "i" );
		text.split( re ).forEach( function ( part, i ) {
			if ( !part ) {
				return;
			}
			if ( i % 2 === 1 ) {
				var mark = document.createElement( "mark" );
				mark.className = "bxsites-search-result__mark";
				mark.textContent = part;
				el.appendChild( mark );
			} else {
				el.appendChild( document.createTextNode( part ) );
			}
		} );
	}

	/**
	 * Trims an already-truncated (SearchIndexer.bx caps it at 400 chars)
	 * body string down to a short preview, breaking on a word boundary
	 * rather than mid-word.
	 */
	function buildSnippet( body ) {
		if ( !body || body.length <= SNIPPET_LENGTH ) {
			return body || "";
		}
		return body.slice( 0, SNIPPET_LENGTH ).replace( /\s+\S*$/, "" ) + "…";
	}

	/**
	 * Buckets `hits` by their own `section` field, preserving each
	 * section's first-seen position and every hit's original relevance
	 * order within its bucket - so results stay grouped under one header
	 * per section even when MiniSearch's own ranking interleaves sections.
	 *
	 * @return Array of { section, hits } in first-seen order
	 */
	function groupBySection( hits ) {
		var order = [];
		var buckets = {};
		hits.forEach( function ( hit ) {
			var key = hit.section || "";
			if ( !buckets[ key ] ) {
				buckets[ key ] = [];
				order.push( key );
			}
			buckets[ key ].push( hit );
		} );
		return order.map( function ( key ) {
			return { section : key, hits : buckets[ key ] };
		} );
	}

	/**
	 * Builds one result row shared by both the sidebar dropdown and the
	 * command palette - a title (with matched-term highlighting), an
	 * optional breadcrumb line, and an optional snippet line.
	 *
	 * @doc One enriched hit from search() - { title, url, section, breadcrumb, snippet, terms }
	 * @resultClass Outer `<li>` class - lets each widget keep its own existing row styling
	 */
	function buildResultRow( doc, resultClass ) {
		var li = document.createElement( "li" );
		li.className = resultClass;

		var a = document.createElement( "a" );
		a.className = "bxsites-search-result__link";
		a.href = basePath() + doc.url;

		var title = document.createElement( "div" );
		title.className = "bxsites-search-result__title";
		appendHighlighted( title, doc.title, doc.terms );
		a.appendChild( title );

		if ( doc.breadcrumb && doc.breadcrumb.length ) {
			var meta = document.createElement( "div" );
			meta.className = "bxsites-search-result__meta";
			meta.textContent = doc.breadcrumb.join( " › " );
			a.appendChild( meta );
		}

		if ( doc.snippet ) {
			var snippet = document.createElement( "div" );
			snippet.className = "bxsites-search-result__snippet";
			snippet.textContent = doc.snippet;
			a.appendChild( snippet );
		}

		li.appendChild( a );
		return li;
	}

	/**
	 * Clears `list` and renders `hits` into it as one `<li class="bxsites-search-group-label">`
	 * per section (groupBySection()) followed by that section's own result
	 * rows (buildResultRow()). When `nav` is given, wires each row's
	 * mouseenter to move the keyboard-nav highlight onto it, matching the
	 * old hover behavior.
	 *
	 * @list The `<ul>` to render into
	 * @hits Enriched hits from search()
	 * @resultClass Outer `<li>` class for each result row
	 * @nav Optional createResultNav() instance to wire hover highlighting to
	 */
	function renderGroupedResults( list, hits, resultClass, nav ) {
		list.innerHTML = "";
		groupBySection( hits ).forEach( function ( group ) {
			if ( group.section ) {
				var label = document.createElement( "li" );
				label.className = "bxsites-search-group-label";
				label.textContent = group.section;
				label.setAttribute( "aria-hidden", "true" );
				list.appendChild( label );
			}
			group.hits.forEach( function ( hit ) {
				var li = buildResultRow( hit, resultClass );
				if ( nav ) {
					li.addEventListener( "mouseenter", function () {
						nav.setActive( nav.indexOf( li ) );
					} );
				}
				list.appendChild( li );
			} );
		} );
	}

	/**
	 * Keyboard/hover navigation shared by the sidebar dropdown and the
	 * command palette - tracks one active index into `list`'s own
	 * `resultSelector` matches (which excludes group-label rows) and
	 * toggles `activeClass` accordingly.
	 */
	function createResultNav( list, resultSelector, activeClass ) {
		var activeIndex = -1;

		function items() {
			return list.querySelectorAll( resultSelector );
		}

		function setActive( index ) {
			var els = items();
			els.forEach( function ( li, i ) {
				li.classList.toggle( activeClass, i === index );
			} );
			if ( els[ index ] ) {
				els[ index ].scrollIntoView( { block : "nearest" } );
			}
			activeIndex = index;
		}

		function move( delta ) {
			var els = items();
			if ( !els.length ) {
				return;
			}
			setActive( ( activeIndex + delta + els.length ) % els.length );
		}

		function current() {
			var els = items();
			return els[ activeIndex ] || els[ 0 ] || null;
		}

		function reset() {
			activeIndex = -1;
		}

		function indexOf( el ) {
			return Array.prototype.indexOf.call( items(), el );
		}

		return { setActive : setActive, move : move, current : current, reset : reset, indexOf : indexOf };
	}

	/**
	 * Builds the Cmd/Ctrl+K command-palette overlay - a backdrop + centered
	 * panel with its own input, live result count, grouped result list and
	 * a keyboard-hint bar - entirely DOM-generated (no theme template
	 * changes needed) and appended to `document.body` once. Arrow Up/Down
	 * move a `--active` highlight across results, Enter navigates to the
	 * highlighted (or first) one, Escape or a backdrop click closes it.
	 *
	 * @searchFn `query => Array<{ title, url, section, breadcrumb, snippet, terms }>` - the sidebar widget's own `search()`, shared rather than re-fetching/re-indexing search-index.json a second time
	 *
	 * @return { open: () => void, close: () => void }
	 */
	function buildPalette( searchFn ) {
		var backdrop = document.createElement( "div" );
		backdrop.className = "bxsites-command-palette";
		backdrop.hidden = true;

		var panel = document.createElement( "div" );
		panel.className = "bxsites-command-palette__panel";
		backdrop.appendChild( panel );

		var inputRow = document.createElement( "div" );
		inputRow.className = "bxsites-command-palette__input-row";
		panel.appendChild( inputRow );

		var input = document.createElement( "input" );
		input.type = "text";
		input.className = "bxsites-command-palette__input";
		input.setAttribute( "aria-label", "Search" );
		inputRow.appendChild( input );

		var count = document.createElement( "span" );
		count.className = "bxsites-command-palette__count";
		inputRow.appendChild( count );

		var list = document.createElement( "ul" );
		list.className = "bxsites-command-palette__results";
		panel.appendChild( list );

		var hints = document.createElement( "div" );
		hints.className = "bxsites-command-palette__hints";
		[
			{ keys : [ "↑", "↓" ], label : "Navigate" },
			{ keys : [ "↵" ], label : "Open" },
			{ keys : [ "Esc" ], label : "Close" }
		].forEach( function ( hint ) {
			var span = document.createElement( "span" );
			hint.keys.forEach( function ( key ) {
				var kbd = document.createElement( "kbd" );
				kbd.textContent = key;
				span.appendChild( kbd );
			} );
			span.appendChild( document.createTextNode( " " + hint.label ) );
			hints.appendChild( span );
		} );
		panel.appendChild( hints );

		document.body.appendChild( backdrop );

		var nav = createResultNav( list, "li.bxsites-command-palette__result", "bxsites-command-palette__result--active" );

		function render( query ) {
			nav.reset();
			count.textContent = "";

			if ( !query ) {
				list.innerHTML = "";
				return;
			}

			var hits = searchFn( query );

			if ( !hits.length ) {
				list.innerHTML = "";
				var empty = document.createElement( "li" );
				empty.className = "bxsites-command-palette__empty";
				empty.textContent = noResultsText();
				list.appendChild( empty );
				return;
			}

			count.textContent = hits.length + ( hits.length === 1 ? " result" : " results" );
			renderGroupedResults( list, hits, "bxsites-command-palette__result", nav );
			nav.setActive( 0 );
		}

		function open() {
			backdrop.hidden = false;
			input.value = "";
			list.innerHTML = "";
			count.textContent = "";
			input.focus();
		}

		function close() {
			backdrop.hidden = true;
		}

		input.addEventListener( "input", function () {
			render( input.value.trim() );
		} );

		input.addEventListener( "keydown", function ( evt ) {
			if ( evt.key === "ArrowDown" ) {
				evt.preventDefault();
				nav.move( 1 );
			} else if ( evt.key === "ArrowUp" ) {
				evt.preventDefault();
				nav.move( -1 );
			} else if ( evt.key === "Enter" ) {
				var target = nav.current();
				var link = target ? target.querySelector( "a" ) : null;
				if ( link ) {
					evt.preventDefault();
					window.location.href = link.href;
				}
			} else if ( evt.key === "Escape" ) {
				close();
			}
		} );

		backdrop.addEventListener( "click", function ( evt ) {
			if ( evt.target === backdrop ) {
				close();
			}
		} );

		return { open : open, close : close };
	}

	function init() {
		var input = document.getElementById( "bxsites-search-input" );
		var results = document.getElementById( "bxsites-search-results" );
		if ( !input || !results ) {
			return;
		}

		var idx = null;

		fetch( basePath() + "search-index.json" )
			.then( function ( res ) {
				return res.json();
			} )
			.then( function ( docs ) {
				idx = new MiniSearch( {
					fields      : [ "title", "tags", "headings", "body" ],
					storeFields : [ "title", "url", "section", "breadcrumb", "body" ],
					searchOptions : {
						boost  : { title : 10, tags : 8, headings : 5 },
						prefix : true,
						fuzzy  : 0.2
					}
				} );

				idx.addAll( docs.map( function ( doc, i ) {
					return {
						id         : i,
						title      : doc.title,
						url        : doc.url,
						section    : doc.section || "",
						breadcrumb : doc.breadcrumb || [],
						tags       : ( doc.tags || [] ).join( " " ),
						headings   : ( doc.headings || [] ).join( " " ),
						body       : doc.body
					};
				} ) );
			} )
			.catch( function () {
				// The index may legitimately be missing (search disabled for
				// this build) - fail quietly rather than breaking the page.
			} );

		// Shared by the sidebar widget below and buildPalette()'s own query
		// handler - looks up against whatever `idx` the fetch above finished
		// building (stays null, so this just returns no hits, until it does),
		// and enriches each raw MiniSearch hit with the extra stored fields
		// (section/breadcrumb/snippet/matched terms) both widgets render.
		// MiniSearch's own `prefix`/`fuzzy` search options (set above) already
		// cover partial words while typing and simple typos in one call - no
		// separate wildcard-query retry needed, unlike the lunr.js widget
		// this replaced.
		function search( query ) {
			if ( !query || !idx ) {
				return [];
			}
			var hits = [];
			try {
				hits = idx.search( query );
			} catch ( e ) {
				hits = [];
			}
			return hits.slice( 0, RESULT_LIMIT ).map( function ( hit ) {
				return {
					title      : hit.title,
					url        : hit.url,
					section    : hit.section || "",
					breadcrumb : hit.breadcrumb || [],
					snippet    : buildSnippet( hit.body ),
					terms      : hit.terms || []
				};
			} );
		}

		var sidebarNav = createResultNav( results, "li.bxsites-search-result", "bxsites-search-result--active" );

		function closeResults() {
			results.innerHTML = "";
			results.classList.remove( "bxsites-search-open" );
			sidebarNav.reset();
		}

		input.addEventListener( "input", function () {
			var query = input.value.trim();

			if ( !query || !idx ) {
				closeResults();
				return;
			}

			var hits = search( query );
			sidebarNav.reset();

			if ( !hits.length ) {
				results.innerHTML = "";
				var empty = document.createElement( "li" );
				empty.className = "bxsites-search-empty";
				empty.textContent = noResultsText();
				results.appendChild( empty );
				results.classList.add( "bxsites-search-open" );
				return;
			}

			renderGroupedResults( results, hits, "bxsites-search-result", sidebarNav );
			sidebarNav.setActive( 0 );
			results.classList.add( "bxsites-search-open" );
		} );

		input.addEventListener( "keydown", function ( evt ) {
			if ( evt.key === "ArrowDown" ) {
				evt.preventDefault();
				sidebarNav.move( 1 );
			} else if ( evt.key === "ArrowUp" ) {
				evt.preventDefault();
				sidebarNav.move( -1 );
			} else if ( evt.key === "Enter" ) {
				var target = sidebarNav.current();
				var link = target ? target.querySelector( "a" ) : null;
				if ( link ) {
					evt.preventDefault();
					window.location.href = link.href;
				}
			} else if ( evt.key === "Escape" ) {
				closeResults();
				input.blur();
			}
		} );

		document.addEventListener( "click", function ( evt ) {
			if ( evt.target !== input && !results.contains( evt.target ) ) {
				closeResults();
			}
		} );

		// mkdocs-material's own convention: "/" focuses search from anywhere
		// on the page, unless the visitor is already typing somewhere else.
		document.addEventListener( "keydown", function ( evt ) {
			if ( evt.key !== "/" || evt.target === input ) {
				return;
			}
			var tag = ( evt.target.tagName || "" ).toLowerCase();
			if ( tag === "input" || tag === "textarea" || evt.target.isContentEditable ) {
				return;
			}
			evt.preventDefault();
			input.focus();
		} );

		var palette = buildPalette( function ( query ) {
			return search( query );
		} );

		// Cmd/Ctrl+K - the convention every other doc-search widget (Algolia
		// DocSearch, Pagefind, VitePress, Docusaurus, ...) uses; unlike "/"
		// above it's meant to work everywhere, including while typing in
		// another field, so there's no "already typing" guard here.
		document.addEventListener( "keydown", function ( evt ) {
			if ( !( evt.ctrlKey || evt.metaKey ) || evt.key.toLowerCase() !== "k" ) {
				return;
			}
			evt.preventDefault();
			palette.open();
		} );

		// Shows the platform-correct hint (⌘K on Mac, Ctrl K elsewhere) in the
		// kbd badge search.bxm renders next to the input, if the theme has one.
		var kbd = document.querySelector( ".bxsites-search-kbd" );
		if ( kbd && /Mac|iPod|iPhone|iPad/.test( window.navigator.platform || "" ) ) {
			kbd.textContent = "⌘K";
		}
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
