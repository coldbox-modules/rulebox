/**
 * Drives course progress tracking - the checkmarks/progress bar/"resume"
 * CTA on a `::: course id="..." :::` numbered index (CourseBuilder.bx),
 * and the "Mark complete" toggle on a lesson page's own chrome (currently
 * bootstrap only - see docs/guides/courses.md's theme-support note).
 * Shared across all built-in themes, always copied (no `bxsites.json`
 * opt-in flag - inert with zero cost on a page/project with no course
 * markup at all).
 *
 * A reader's progress is stored in `localStorage` under
 * `bxsites-course-progress-<courseId>`, one JSON blob per course per
 * browser: `{ firstStarted, lastVisited: {url, at}, completed: {url: at} }`.
 * `firstStarted` is set once, on the very first lesson visit, and never
 * overwritten again; `lastVisited` is overwritten on every lesson visit
 * and drives "Continue where you left off"; `completed` maps a lesson's
 * URL to when it was marked done and drives both the per-lesson
 * checkmarks and the index's own completion percentage (the total lesson
 * count is always counted live from the elements actually present on
 * that index page, never duplicated from the manifest into this file).
 *
 * A lesson is auto-marked complete the moment its page is visited -
 * `recordVisit()`, called on load whenever a lesson's own hidden
 * `[data-bxsites-course-lesson]` marker (`page.bxm`'s own lesson chrome)
 * is present. The "Mark complete"/"Mark incomplete" button lets a reader
 * undo an accidental auto-mark, or re-mark a lesson later.
 *
 * Every element this script touches is `hidden`/inert in the plain
 * server-rendered HTML - the numbered list and (on a lesson page) the
 * scoped prev/next pager are both fully server-rendered by
 * `CourseBuilder.bx`/`page.bxm` and never depend on this file; a
 * JS-disabled browser or a search crawler still sees the complete,
 * working base feature.
 */
( function () {
	function storageKey( courseId ) {
		return "bxsites-course-progress-" + courseId;
	}

	function emptyProgress() {
		return { firstStarted : null, lastVisited : null, completed : {} };
	}

	function loadProgress( courseId ) {
		try {
			var raw = localStorage.getItem( storageKey( courseId ) );
			return raw ? JSON.parse( raw ) : emptyProgress();
		} catch ( e ) {
			return emptyProgress();
		}
	}

	function saveProgress( courseId, data ) {
		try {
			localStorage.setItem( storageKey( courseId ), JSON.stringify( data ) );
		} catch ( e ) {
			// Storage unavailable (private browsing, blocked site data) -
			// this page load still reflects the change in the DOM, it just
			// won't be remembered on the next one.
		}
	}

	function recordVisit( courseId, lessonUrl ) {
		var data = loadProgress( courseId );
		var now = new Date().toISOString();
		if ( !data.firstStarted ) {
			data.firstStarted = now;
		}
		data.lastVisited = { url : lessonUrl, at : now };
		if ( !data.completed[ lessonUrl ] ) {
			data.completed[ lessonUrl ] = now;
		}
		saveProgress( courseId, data );
	}

	function toggleComplete( courseId, lessonUrl ) {
		var data = loadProgress( courseId );
		if ( data.completed[ lessonUrl ] ) {
			delete data.completed[ lessonUrl ];
		} else {
			data.completed[ lessonUrl ] = new Date().toISOString();
		}
		saveProgress( courseId, data );
	}

	function applyLessonState( courseId, lessonUrl ) {
		var data = loadProgress( courseId );
		var isComplete = !!data.completed[ lessonUrl ];
		document.querySelectorAll(
			'[data-bxsites-course-mark-complete][data-bxsites-course-id="' + courseId + '"][data-bxsites-lesson-url="' + lessonUrl + '"]'
		).forEach( function ( btn ) {
			btn.classList.toggle( "bxsites-course-mark-complete--done", isComplete );
			btn.textContent = isComplete ? "Mark incomplete" : "Mark complete";
		} );
	}

	function applyIndexState( courseId ) {
		var data = loadProgress( courseId );
		var scope = '.bxsites-course-index[data-bxsites-course-id="' + courseId + '"] ';

		document.querySelectorAll( scope + "[data-bxsites-lesson-url]" ).forEach( function ( item ) {
			var url = item.getAttribute( "data-bxsites-lesson-url" );
			var check = item.querySelector( "[data-bxsites-course-check]" );
			if ( check ) {
				check.classList.toggle( "bxsites-course-index__check--done", !!data.completed[ url ] );
			}
		} );

		var total = document.querySelectorAll( scope + ".bxsites-course-index__item" ).length;
		var completedCount = Object.keys( data.completed ).length;

		if ( total ) {
			var percent = Math.round( ( completedCount / total ) * 100 );
			document.querySelectorAll( '[data-bxsites-course-progress][data-bxsites-course-id="' + courseId + '"]' ).forEach( function ( bar ) {
				bar.hidden = false;
				var fill = bar.querySelector( "[data-bxsites-course-progress-fill]" );
				var label = bar.querySelector( "[data-bxsites-course-progress-label]" );
				if ( fill ) {
					fill.style.width = percent + "%";
				}
				if ( label ) {
					label.textContent = completedCount + " of " + total + " complete (" + percent + "%)";
				}
			} );
		}

		if ( data.lastVisited ) {
			document.querySelectorAll( '[data-bxsites-course-resume][data-bxsites-course-id="' + courseId + '"]' ).forEach( function ( resume ) {
				var link = resume.querySelector( "[data-bxsites-course-resume-link]" );
				if ( !link ) {
					return;
				}
				link.setAttribute( "href", data.lastVisited.url );
				link.textContent = data.lastVisited.url;
				resume.hidden = false;
			} );
		}
	}

	function init() {
		document.querySelectorAll( "[data-bxsites-course-lesson]" ).forEach( function ( meta ) {
			var courseId = meta.getAttribute( "data-bxsites-course-id" );
			var lessonUrl = meta.getAttribute( "data-bxsites-lesson-url" );
			recordVisit( courseId, lessonUrl );
			applyLessonState( courseId, lessonUrl );
		} );

		document.querySelectorAll( "[data-bxsites-course-mark-complete]" ).forEach( function ( btn ) {
			var courseId = btn.getAttribute( "data-bxsites-course-id" );
			var lessonUrl = btn.getAttribute( "data-bxsites-lesson-url" );
			applyLessonState( courseId, lessonUrl );
			btn.addEventListener( "click", function () {
				toggleComplete( courseId, lessonUrl );
				applyLessonState( courseId, lessonUrl );
			} );
		} );

		document.querySelectorAll( ".bxsites-course-index[data-bxsites-course-id]" ).forEach( function ( index ) {
			applyIndexState( index.getAttribute( "data-bxsites-course-id" ) );
		} );
	}

	window.bxSitesCourseProgress = { loadProgress : loadProgress, toggleComplete : toggleComplete };

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
