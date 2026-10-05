/**
 * Wires up `::: contact-form` blocks (DirectiveBlockProcessor.bx's own
 * `renderContactForm()`) - shared across all built-in themes, loaded
 * unconditionally alongside conditional-content-init.js/prompt-init.js
 * since the `::: contact-form` syntax needs no `bxsites.yaml` opt-in.
 *
 * This module has no backend of its own: submitting a `[data-bx-form]`
 * always POSTs JSON to its own `action` (bxSites Cloud's
 * `/api/forms/submit`, a separate service this build never talks to at
 * build time) and renders whatever that response implies. In particular,
 * whether this project's own plan is even entitled to a *working* form
 * is decided there, not here - a 403 renders the same "Upgrade to
 * enable this form" fallback regardless of *why* the account isn't
 * entitled, so a free-plan project's form still looks completely real
 * right up until a reader actually submits it.
 *
 * Response contract this handler understands:
 * - 2xx            - success; the form's own fields are swapped for an
 *                    inline "Thanks" message.
 * - 403            - not entitled on this plan; an inline upgrade
 *                    prompt replaces the generic error, fields stay put.
 * - 422            - validation failure. A JSON body shaped
 *                    `{ "errors": { "<field name>": "message" } }`
 *                    renders each message inline under its own field;
 *                    anything else (no body, no `errors`, a field name
 *                    with no matching input) falls back to one generic
 *                    message instead of silently dropping the detail.
 * - 429            - rate-limited; a "try again shortly" message.
 * - anything else, or the request never completing at all (offline, DNS,
 *   a plain network error) - one generic failure message. The reader's
 *   own input is never touched on any failure path - only a genuine 2xx
 *   ever clears the form.
 */
( function () {
	function statusEl( form ) {
		return form.querySelector( "[data-bx-form-status]" );
	}

	function setStatus( form, message, kind ) {
		var el = statusEl( form );
		if ( !el ) {
			return;
		}
		el.textContent = message;
		el.className = "bxsites-contact-form__status" + ( kind ? " bxsites-contact-form__status--" + kind : "" );
		el.hidden = !message;
	}

	function clearFieldErrors( form ) {
		form.querySelectorAll( ".bxsites-contact-form__field-error" ).forEach( function ( el ) {
			el.remove();
		} );
	}

	// @return true when at least one error in `errors` matched a real
	// field on this form and got its own inline message - the caller
	// falls back to one generic status message when this is false, so a
	// server response naming an unknown field (or carrying no usable
	// errors at all) is never silently swallowed.
	function showFieldErrors( form, errors ) {
		var shown = false;
		Object.keys( errors || {} ).forEach( function ( name ) {
			var field = form.querySelector( '[name="' + name.replace( /"/g, "" ) + '"]' );
			if ( !field ) {
				return;
			}
			var wrapper = field.closest( ".bxsites-contact-form__field" ) || field.parentNode;
			var message = document.createElement( "div" );
			message.className = "bxsites-contact-form__field-error";
			message.textContent = String( errors[ name ] );
			wrapper.appendChild( message );
			shown = true;
		} );
		return shown;
	}

	function setSubmitting( form, submitting ) {
		var button = form.querySelector( 'button[type="submit"]' );
		if ( !button ) {
			return;
		}
		button.disabled = submitting;
		if ( submitting ) {
			button.dataset.bxsitesLabel = button.textContent;
			var label = button.querySelector( ".bxsites-button__label" );
			if ( label ) {
				label.textContent = "Sending…";
			}
		} else if ( button.dataset.bxsitesLabel ) {
			var restoreLabel = button.querySelector( ".bxsites-button__label" );
			if ( restoreLabel ) {
				restoreLabel.textContent = button.dataset.bxsitesLabel;
			}
		}
	}

	function showSuccess( form ) {
		form.querySelectorAll( ".bxsites-contact-form__field, .bxsites-contact-form__honeypot, button[type=\"submit\"]" ).forEach( function ( el ) {
			el.hidden = true;
		} );
		setStatus( form, "Thanks — we'll be in touch.", "success" );
	}

	function handleResponse( form, response ) {
		if ( response.ok ) {
			showSuccess( form );
			return;
		}

		if ( response.status === 403 ) {
			setStatus( form, "This form isn't enabled on the current plan yet - upgrade to start accepting submissions.", "upgrade" );
			return;
		}

		if ( response.status === 429 ) {
			setStatus( form, "Too many submissions - please try again shortly.", "error" );
			return;
		}

		if ( response.status === 422 ) {
			response.json().then(
				function ( body ) {
					var shown = body && body.errors ? showFieldErrors( form, body.errors ) : false;
					if ( !shown ) {
						setStatus( form, "Please check the highlighted fields and try again.", "error" );
					} else {
						setStatus( form, "", "" );
					}
				},
				function () {
					setStatus( form, "Please check the highlighted fields and try again.", "error" );
				}
			);
			return;
		}

		setStatus( form, "Something went wrong sending this form. Please try again.", "error" );
	}

	function submitForm( form ) {
		var formId = form.getAttribute( "data-form-id" ) || "";
		var action = form.getAttribute( "action" ) || "/api/forms/submit";
		var method = form.getAttribute( "method" ) || "POST";
		var fields = Object.fromEntries( new FormData( form ).entries() );

		clearFieldErrors( form );
		setStatus( form, "", "" );
		setSubmitting( form, true );

		fetch( action, {
			method  : method,
			headers : { "Content-Type" : "application/json" },
			body    : JSON.stringify( { formId : formId, fields : fields } )
		} ).then(
			function ( response ) {
				setSubmitting( form, false );
				handleResponse( form, response );
			},
			function () {
				// Network/DNS/offline failure - the request never got a
				// response at all, not even an error status.
				setSubmitting( form, false );
				setStatus( form, "Something went wrong sending this form. Please check your connection and try again.", "error" );
			}
		);
	}

	function init() {
		document.querySelectorAll( "[data-bx-form]" ).forEach( function ( form ) {
			if ( form.dataset.bxsitesInit ) {
				return;
			}
			form.dataset.bxsitesInit = "true";

			form.addEventListener( "submit", function ( event ) {
				event.preventDefault();
				submitForm( form );
			} );
		} );
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", init );
	} else {
		init();
	}
} )();
