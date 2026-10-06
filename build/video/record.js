// Records a walkthrough of the RuleBox Visualizer running in the test harness.
// See build/video/README.md for the full steps.
const { chromium } = require( "playwright" );
const path = require( "path" );
const { execSync } = require( "child_process" );

const BASE = process.env.BASE_URL || "http://localhost:8190";
const VIZ = BASE + "/rulebox-visualizer";
const OUT = path.join( __dirname, process.env.OUTDIR || "out" );
const W = 1280, H = 800;
const sleep = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );


function card( title, sub, extra = "" ){
	return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;800&family=Manrope:wght@500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
html,body{margin:0;height:100%;background:#060a12;color:#eef3fa;font-family:Manrope,system-ui,sans-serif;overflow:hidden}
.glow1,.glow2{position:absolute;border-radius:50%;filter:blur(10px)}
.glow1{width:900px;height:900px;left:-300px;top:-380px;background:radial-gradient(circle,rgba(0,191,243,.28),transparent 65%)}
.glow2{width:900px;height:900px;right:-320px;bottom:-420px;background:radial-gradient(circle,rgba(0,255,120,.20),transparent 65%)}
.c{position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center}
h1{margin:0;font-family:Sora,sans-serif;font-size:64px;font-weight:800;letter-spacing:-.03em}
.grad{background:linear-gradient(90deg,#33cfff,#2bf59a);-webkit-background-clip:text;color:transparent}
p{margin:0;font-size:24px;color:#9fb0cc}
.chip{font-family:"JetBrains Mono",monospace;font-size:22px;padding:14px 22px;border-radius:14px;background:#0b1220;border:1px solid #1c2840}
.c > *{opacity:0;transform:translateY(14px);animation:in .7s ease forwards}
.c > *:nth-child(2){animation-delay:.15s}.c > *:nth-child(3){animation-delay:.3s}.c > *:nth-child(4){animation-delay:.45s}.c > *:nth-child(5){animation-delay:.65s}
@keyframes in{to{opacity:1;transform:none}}
</style></head><body><div class="glow1"></div><div class="glow2"></div>
<div class="c">${MARK}<h1>${title}</h1><p>${sub}</p>${extra}</div></body></html>`;
}


const fs = require( "fs" );
const svgData = ( f ) => "data:image/svg+xml;base64," + fs.readFileSync( path.join( __dirname, f ) ).toString( "base64" );

// The RuleBox icon from the docs brand assets, on the title, outro and end cards
const MARK = `<img src="${ svgData( "../../docs/assets/brand/rulebox-icon-full.svg" ) }" height="120" style="margin:-16px 0" alt="">`;

function endScreen(){
	const cb = svgData( "coldbox-icon-full.svg" ), bl = svgData( "boxlang-icon-full.svg" );
	return card(
		'<span class="grad">rulebox.coldbox.org</span>',
		"Docs, the Tutorial Course and every guide",
		`<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">
			<div class="chip"><span style="color:#2bf59a">$</span> box install rulebox</div>
			<div class="chip" style="color:#9fb0cc">github.com/coldbox-modules/rulebox</div>
		</div>
		<div style="display:flex;align-items:center;gap:14px;margin-top:18px;font-size:18px;color:#9fb0cc">
			<img src="${ cb }" width="34" height="34" alt=""> <img src="${ bl }" width="34" height="34" alt="">
			<span>Built on ColdBox and BoxLang by <b style="color:#eef3fa">Ortus Solutions</b></span>
		</div>`
	);
}

// A visible cursor and a caption bar, injected into every Visualizer page.
const OVERLAY = () => {
	const add = () => {
		if( document.getElementById( "rbCursor" ) ) return;
		const cur = document.createElement( "div" );
		cur.id = "rbCursor";
		cur.style.cssText = "position:fixed;z-index:99999;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(51,207,255,.35);border:2px solid #33cfff;pointer-events:none;transition:transform .08s";
		document.body.appendChild( cur );
		document.addEventListener( "mousemove", ( e ) => { cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; } );
		document.addEventListener( "mousedown", () => { cur.style.transform = "scale(.7)"; } );
		document.addEventListener( "mouseup", () => { cur.style.transform = "scale(1)"; } );
		const cap = document.createElement( "div" );
		cap.id = "rbCaption";
		cap.style.cssText = "position:fixed;z-index:99998;left:50%;bottom:28px;transform:translateX(-50%);max-width:80%;padding:14px 22px;border-radius:14px;background:rgba(6,10,18,.92);border:1px solid #1c2840;box-shadow:0 20px 50px -20px rgba(0,0,0,.8);color:#eef3fa;font:600 20px Manrope,system-ui,sans-serif;text-align:center;opacity:0;transition:opacity .35s";
		document.body.appendChild( cap );
	};
	if( document.readyState === "loading" ) document.addEventListener( "DOMContentLoaded", add ); else add();
};

async function caption( page, title, sub ){
	await page.evaluate( ( [ t, s ] ) => {
		const c = document.getElementById( "rbCaption" );
		if( !c ) return;
		c.innerHTML = `<span style="background:linear-gradient(90deg,#33cfff,#2bf59a);-webkit-background-clip:text;color:transparent">${ t }</span>` + ( s ? `<div style="font-weight:500;font-size:16px;color:#9fb0cc;margin-top:4px">${ s }</div>` : "" );
		c.style.opacity = "1";
	}, [ title, sub || "" ] );
}

async function glide( page, locator ){
	const box = await locator.boundingBox();
	if( !box ) return;
	await page.mouse.move( box.x + box.width / 2, box.y + box.height / 2, { steps: 25 } );
	await sleep( 250 );
}

async function traffic( n ){
	for( let i = 0; i < n; i++ ){
		await fetch( BASE + "/demo/run" ).catch( () => {} );
	}
}

( async () => {
	// Warm up: some runs so the dashboard and metrics have data
	await traffic( 40 );

	process.env.PLAYWRIGHT_DISABLE_FORCED_CHROMIUM_PROXIED_LOOPBACK = "1";
	const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;
	const browser = await chromium.launch( { proxy } );
	const context = await browser.newContext( {
		viewport: { width: W, height: H },
		deviceScaleFactor: 1,
		ignoreHTTPSErrors: true,
		recordVideo: { dir: OUT, size: { width: W, height: H } }
	} );
	await context.addInitScript( OVERLAY );
	// Serve CDN and web-font files from memory: each is fetched once with curl, so no recorded page waits on
	// the network or shows up unstyled while its stylesheet is still loading
	const cdnCache = {};
	await context.route( /^https:\/\/(cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//, async ( route ) => {
		const url = route.request().url();
		try{
			cdnCache[ url ] = cdnCache[ url ] || execSync( `curl -sSfL "${ url }"`, { maxBuffer: 1 << 26 } );
		} catch( e ){
			return route.continue();
		}
		const type = /\.css(\?|$)|fonts\.googleapis/.test( url ) ? "text/css" : /\.js(\?|$)/.test( url ) ? "application/javascript" : /\.woff2/.test( url ) ? "font/woff2" : /\.woff/.test( url ) ? "font/woff" : /\.ttf/.test( url ) ? "font/ttf" : "application/octet-stream";
		await route.fulfill( { status: 200, body: cdnCache[ url ], contentType: type, headers: { "access-control-allow-origin": "*" } } );
	} );
	// Load every screen once in a throwaway tab, so the cache above is full before recording starts
	const warm = await context.newPage();
	for( const a of [ "index", "chain?name=fraudcheck", "chain?name=loanapproval", "dryrun?name=loanapproval", "metrics", "live" ] ){
		await warm.goto( a === "index" ? VIZ : VIZ + "/" + a, { waitUntil: "networkidle", timeout: 90000 } ).catch( () => {} );
	}
	await warm.setContent( card( "warm", "warm" ), { waitUntil: "networkidle", timeout: 90000 } ).catch( () => {} );
	await warm.close();
	const page = await context.newPage();
	// Scene start times (seconds into the raw recording), saved to out/marks.json for edit.sh
	const t0 = Date.now();
	const marks = {};
	const mark = ( name ) => { marks[ name ] = +( ( Date.now() - t0 ) / 1000 ).toFixed( 2 ); };

	// 1. Title
	await page.setContent( card( 'RuleBox <span class="grad">Visualizer</span>', "See your rules. Watch them fire. Find the ones that fail." ), { waitUntil: "load", timeout: 20000 } );
	await page.screenshot( { path: path.join( OUT, "poster.png" ) } );
	mark( "title" );
	await sleep( 3500 );
	mark( "titleEnd" );

	// 2. Dashboard: totals, problem rules, slowest rules, every rulebook
	await page.goto( VIZ, { waitUntil: "load", timeout: 20000 } );
	await page.mouse.move( 640, 400 );
	mark( "tour" );
	await caption( page, "Dashboard", "Every rulebook, plus the rules that fail most and the slowest ones" );
	await sleep( 1200 );
	await glide( page, page.locator( "#rb-problem-rules tbody tr" ).first() );
	await sleep( 1600 );
	const slow = page.locator( "#rb-slowest-rules tbody tr" );
	for( let i = 0; i < Math.min( await slow.count(), 3 ); i++ ){
		await glide( page, slow.nth( i ) );
		await sleep( 400 );
	}
	await sleep( 800 );

	// 3. Chain view of the failing rulebook
	const chainLink = page.locator( '#rb-problem-rules a[href*="chain?name=fraudcheck"]' ).first();
	await glide( page, chainLink );
	await chainLink.click();
	await page.waitForLoadState( "load" );
	await caption( page, "Chain view", "Rules in run order, with durations, error rates and the last error" );
	await sleep( 1200 );
	await glide( page, page.locator( ".card", { hasText: "callFraudService" } ).first() );
	await sleep( 2600 );

	// 4. A rulebook that describes itself and declares the facts it takes
	const bookSelect = page.locator( 'select[name="name"]' ).first();
	await glide( page, bookSelect );
	await Promise.all( [ page.waitForNavigation( { waitUntil: "load" } ), bookSelect.selectOption( "loanapproval" ) ] );
	await caption( page, "Facts and descriptions", "A rulebook can describe itself and declare the facts it takes" );
	await sleep( 1400 );
	await glide( page, page.locator( ".rb-facts-table tbody tr" ).first() );
	await sleep( 1200 );
	await glide( page, page.locator( ".rb-facts-table tbody tr" ).nth( 2 ) );
	await sleep( 1600 );

	// 5. Dry run, with a form built from those facts
	const dryLink = page.locator( "a.btn", { hasText: /dry run/i } ).first();
	await glide( page, dryLink );
	await dryLink.click();
	await page.waitForLoadState( "load" );
	await page.locator( "#fact-creditScore" ).waitFor( { timeout: 15000 } );
	await caption( page, "Dry Run", "A form built from the declared facts. Nothing executes, nothing is recorded." );
	const score = page.locator( "#fact-creditScore" );
	await glide( page, score );
	await score.click();
	await score.fill( "" );
	await score.pressSequentially( "640", { delay: 110 } );
	await sleep( 400 );
	const runBtn = page.locator( "button", { hasText: /run dry run/i } ).first();
	await glide( page, runBtn );
	await runBtn.click();
	await sleep( 2600 );
	// The rulebook enforces its facts: leave out the required one and the run is rejected
	await glide( page, score );
	await score.click();
	await score.fill( "" );
	await sleep( 300 );
	await glide( page, runBtn );
	await runBtn.click();
	await caption( page, "Enforced facts", "A missing or invalid fact is rejected before any rule runs" );
	await sleep( 2800 );

	// 6. Metrics: rule health, sorting, then one rule's errors and stack traces
	const metricsLink = page.getByRole( "link", { name: /metrics/i } ).first();
	await glide( page, metricsLink );
	await metricsLink.click();
	await page.waitForLoadState( "load" );
	const mSelect = page.locator( 'select[x-model="rulebookName"]' ).first();
	await glide( page, mSelect );
	await mSelect.selectOption( "fraudcheck" ).catch( () => {} );
	await caption( page, "Metrics", "Completion and error rates, durations, and every rule's health" );
	await sleep( 2200 );
	const avgHeader = page.locator( "#rb-rule-health th", { hasText: "Avg" } ).first();
	await glide( page, avgHeader );
	await avgHeader.click();
	await caption( page, "Rule health", "Sort by any column: here, the slowest rules first" );
	await sleep( 1800 );
	const errHeader = page.locator( "#rb-rule-health th", { hasText: "Error rate" } ).first();
	await glide( page, errHeader );
	await errHeader.click();
	await sleep( 900 );
	const toggle = page.locator( ".rb-errors-toggle" ).first();
	await glide( page, toggle );
	await toggle.click();
	await sleep( 700 );
	await caption( page, "Errors and stack traces", "Each distinct error once, with a count, its cause and where it was thrown" );
	await page.mouse.wheel( 0, 330 );
	await sleep( 3200 );
	const raw = page.locator( ".rb-error-card summary" ).first();
	await glide( page, raw );
	await raw.click();
	await sleep( 2200 );

	// 7. Live tracker, with traffic flowing; open a failed evaluation
	const liveLink = page.getByRole( "link", { name: /live/i } ).first();
	await glide( page, liveLink );
	await liveLink.click();
	await page.waitForLoadState( "domcontentloaded" );
	await caption( page, "Live Tracker", "Every rule evaluation, streamed as it happens" );
	await sleep( 1000 );
	const stopAt = Date.now() + 6000;
	while( Date.now() < stopAt ){
		await traffic( 1 );
		await sleep( 300 );
	}
	// Keep the traffic going until a failure is near the top, then open it
	for( let i = 0; i < 30; i++ ){
		const failedRow = page.locator( "tbody > tr.rb-row-failed" ).first();
		if( await failedRow.count() && ( await failedRow.boundingBox() )?.y < 420 ) break;
		await traffic( 1 );
		await sleep( 300 );
	}
	const failed = page.locator( "tbody > tr.rb-row-failed" ).first();
	await glide( page, failed );
	await failed.click();
	await caption( page, "Live Tracker", "Click a failed evaluation to see why it failed" );
	await sleep( 3200 );
	mark( "tourEnd" );

	// 8. Outro (marks go after setContent: a card is only on screen once it has loaded)
	await page.setContent( card( 'Turn it on in <span class="grad">one setting</span>', "visualizer = { enabled = true }", '<div class="chip"><span style="color:#2bf59a">$</span> box install rulebox</div>' ), { waitUntil: "load", timeout: 20000 } );
	mark( "outro" );
	await sleep( 3500 );

	// 9. End screen
	await page.setContent( endScreen(), { waitUntil: "load", timeout: 20000 } );
	mark( "end" );
	await sleep( 6000 );
	mark( "endEnd" );
	fs.writeFileSync( path.join( OUT, "marks.json" ), JSON.stringify( marks, null, 2 ) );

	await context.close();
	await browser.close();
	console.log( "video:", await page.video().path() );
} )().catch( ( e ) => { console.error( e ); process.exit( 1 ); } );
