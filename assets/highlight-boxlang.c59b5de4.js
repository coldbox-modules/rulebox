/**
 * Registers a lightweight BoxLang syntax-highlighting grammar with
 * highlight.js - the CDN "common languages" bundle this theme loads ships
 * no BoxLang/CFML grammar of its own. Deliberately not a full grammar
 * (no tag-mode `<bx:set>` syntax, no every-built-in-function keyword list)
 * - just enough to correctly color comments, strings (with BoxLang's own
 * `#expression#` string interpolation), numbers and the common script-mode
 * keywords, which covers the vast majority of real BoxLang snippets in
 * documentation. Aliased as "bx", "bxs", "bxm" and "cfscript" so any of
 * those fenced-code-block language identifiers light up the same way.
 * Loaded before `hljs.highlightAll()` runs - see layout.bxm.
 */
( function () {
	if ( typeof hljs === "undefined" ) {
		return;
	}

	hljs.registerLanguage( "boxlang", function ( hl ) {
		var INTERPOLATION = {
			className: "subst",
			begin: "#",
			end: "#",
			contains: [ hl.C_NUMBER_MODE ]
		};

		var STRING = {
			className: "string",
			variants: [
				{ begin: '"', end: '"', contains: [ INTERPOLATION, { begin: '""' } ] },
				{ begin: "'", end: "'", contains: [ INTERPOLATION, { begin: "''" } ] }
			]
		};

		var KEYWORDS = {
			keyword:
				"function class interface extends implements var final static public private " +
				"package remote required return if else for while do switch case default break " +
				"continue try catch finally throw new import include in instanceof typeof abstract",
			literal: "true false null this super",
			built_in: "string numeric boolean array struct query any void date binary component"
		};

		return {
			name: "BoxLang",
			case_insensitive: true,
			keywords: KEYWORDS,
			contains: [
				hl.C_LINE_COMMENT_MODE,
				hl.C_BLOCK_COMMENT_MODE,
				STRING,
				hl.C_NUMBER_MODE,
				{
					className: "title.function",
					begin: /\bfunction\s+/,
					end: /\(/,
					excludeBegin: true,
					excludeEnd: true
				},
				{
					className: "title.class",
					begin: /\b(?:class|interface)\s+/,
					end: /[\s{]/,
					excludeBegin: true,
					excludeEnd: true
				}
			]
		};
	} );

	hljs.registerAliases( [ "bx", "bxs", "bxm", "cfscript" ], { languageName: "boxlang" } );
} )();
