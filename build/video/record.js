// Records a walkthrough of the RuleBox Visualizer running in the test harness.
// See build/video/README.md for the full steps.
const { chromium } = require( "playwright" );
const path = require( "path" );

const BASE = process.env.BASE_URL || "http://localhost:8190";
const VIZ = BASE + "/rulebox-visualizer/visualizer";
const OUT = path.join( __dirname, process.env.OUTDIR || "out" );
const W = 1280, H = 800;
const sleep = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );

const MARK = `<svg width="72" height="72" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00BFF3"/><stop offset="1" stop-color="#00E08A"/></linearGradient></defs><rect x="3" y="3" width="34" height="34" rx="9" fill="none" stroke="url(#g)" stroke-width="3"/><path d="M11 14h14M11 20h9M11 26.5l3.2 3.2 6.6-6.6" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
	// Warm the context's HTTP cache (CDN CSS/JS) in a throwaway tab so the recorded page loads fast
	const warm = await context.newPage();
	for( const a of [ "index", "chain?name=loanapproval", "dryrun", "metrics" ] ){
		await warm.goto( VIZ + "/" + a, { waitUntil: "networkidle", timeout: 90000 } ).catch( () => {} );
	}
	await warm.setContent( card( "warm", "warm" ), { waitUntil: "networkidle", timeout: 90000 } ).catch( () => {} );
	await warm.close();
	const page = await context.newPage();

	// 1. Title
	await page.setContent( card( 'RuleBox <span class="grad">Visualizer</span>', "See your rules. Watch them fire." ), { waitUntil: "load", timeout: 20000 } );
	await page.screenshot( { path: path.join( OUT, "poster.png" ) } );
	await sleep( 3500 );

	// 2. Dashboard
	await page.goto( VIZ + "/index", { waitUntil: "load", timeout: 20000 } );
	await page.mouse.move( 640, 400 );
	await caption( page, "Dashboard", "Every declared rulebook, its outcomes and recent activity" );
	await sleep( 1200 );
	const rows = page.locator( "table tbody tr" );
	const rowCount = Math.min( await rows.count(), 4 );
	for( let i = 0; i < rowCount; i++ ){
		await glide( page, rows.nth( i ) );
		await sleep( 500 );
	}
	await sleep( 1200 );

	// 3. Chain view
	const chainLink = page.locator( 'a[href*="chain?name=loanapproval"]' ).first();
	await glide( page, chainLink );
	await chainLink.click();
	await page.waitForLoadState( "load" );
	await caption( page, "Chain view", "Rules in the order they really run, with priorities and stops" );
	await sleep( 1500 );
	await page.mouse.wheel( 0, 260 );
	await sleep( 2500 );

	// 4. Dry run
	const dryLink = page.getByRole( "link", { name: /dry run/i } ).first();
	await glide( page, dryLink );
	await dryLink.click();
	await page.waitForLoadState( "load" );
	await caption( page, "Dry Run", "Try any facts. Nothing executes, nothing is recorded." );
	const select = page.locator( 'select[x-model="rulebookName"]' ).first();
	await glide( page, select );
	await select.selectOption( "loanapproval" );
	await sleep( 600 );
	const facts = page.locator( 'textarea[x-model="factsText"]' ).first();
	await glide( page, facts );
	await facts.click();
	await facts.fill( "" );
	await facts.pressSequentially( '{ "creditScore": 640 }', { delay: 70 } );
	await sleep( 500 );
	const runBtn = page.locator( "button", { hasText: /run/i } ).first();
	await glide( page, runBtn );
	await runBtn.click();
	await sleep( 3200 );
	await caption( page, "Dry Run", "A low score stops the chain at the first rule" );
	await glide( page, facts );
	await facts.click();
	await facts.fill( "" );
	await facts.pressSequentially( '{ "creditScore": 540 }', { delay: 70 } );
	await glide( page, runBtn );
	await runBtn.click();
	await sleep( 3200 );

	// 5. Metrics
	const metricsLink = page.getByRole( "link", { name: /metrics/i } ).first();
	await glide( page, metricsLink );
	await metricsLink.click();
	await page.waitForLoadState( "load" );
	await caption( page, "Metrics", "Evaluations, average duration and outcomes, across every run" );
	await sleep( 1000 );
	const mSelect = page.locator( 'select[x-model="rulebookName"]' ).first();
	if( await mSelect.count() ){
		await glide( page, mSelect );
		await mSelect.selectOption( "loanapproval" ).catch( () => {} );
	}
	await sleep( 3500 );

	// 6. Live tracker, with traffic flowing
	const liveLink = page.getByRole( "link", { name: /live/i } ).first();
	await glide( page, liveLink );
	await liveLink.click();
	await page.waitForLoadState( "domcontentloaded" );
	await caption( page, "Live Tracker", "Every rule evaluation, streamed as it happens" );
	await sleep( 1200 );
	const stopAt = Date.now() + 8000;
	while( Date.now() < stopAt ){
		await traffic( 1 );
		await sleep( 350 );
	}
	await sleep( 1200 );

	// 7. Outro
	await page.setContent( card( 'Turn it on in <span class="grad">one setting</span>', "visualizer = { enabled = true }", '<div class="chip"><span style="color:#2bf59a">$</span> box install rulebox</div>' ), { waitUntil: "load", timeout: 20000 } );
	await sleep( 3500 );

	// 8. End screen
	await page.setContent( endScreen(), { waitUntil: "load", timeout: 20000 } );
	await sleep( 6000 );

	await context.close();
	await browser.close();
	console.log( "video:", await page.video().path() );
} )().catch( ( e ) => { console.error( e ); process.exit( 1 ); } );
