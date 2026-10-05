---
title: Rule Visualizer
order: 9
icon: phosphor-duotone:chart-line
summary: An admin UI to browse rulebooks, dry-run them against facts, and watch rules execute live.
tags: [guides, visualizer, admin]
---

# Rule Visualizer

The Rule Visualizer is an admin UI for RuleBox: a dashboard of your declared
rulebooks, a chain visualizer showing real execution order, a dry-run
playground, metrics/stats, and a live SSE tracker. It's modeled on
cbSecurity's own visualizer - off by default, and not secured by RuleBox
itself.

## Enabling it

```cfc
moduleSettings = {
	rulebox = {
		visualizer = {
			enabled = true
		}
	}
}
```

That's it - `enabled` is the only thing you strictly need. Once on, the UI
lives at `/rulebox-visualizer/visualizer/index` (and friends), via the
module's `this.entryPoint = "rulebox-visualizer"`.

While `enabled` is `false` (the default), every visualizer route 404s, and -
just as importantly - RuleBox does no extra work at all: no metrics are
persisted, and nothing is broadcast. Flipping it on is the only thing that
turns on the (small) per-rule-evaluation bookkeeping cost.

**RuleBox does not secure these routes for you.** Once you enable the
visualizer, wrap `/rulebox-visualizer` with a cbSecurity rule (or your own
auth interceptor) the same way you would any other admin UI.

## Opening the UI

With `enabled = true`, browse to your app's `/rulebox-visualizer` entry point:

| Screen | URL |
|--------|-----|
| Dashboard | `/rulebox-visualizer/visualizer/index` |
| Rule Visualizer (chain) | `/rulebox-visualizer/visualizer/chain?name={rulebook}` |
| Dry Run | `/rulebox-visualizer/visualizer/dryrun` |
| Metrics | `/rulebox-visualizer/visualizer/metrics` |
| Live Tracker | `/rulebox-visualizer/visualizer/live` |

The left sidebar links between the screens. The footer shows the metrics
store in use and confirms the visualizer is enabled.

The UI itself is Bootstrap 5, Alpine.js, and Phosphor Icons, loaded from a
CDN - there's nothing to build or bundle. The screenshots below use the
rulebooks in this module's own `test-harness/config/rulebox` folder.

Every CDN asset is pinned to an exact version (Bootstrap 5.3.3, Alpine.js
3.14.3, Phosphor Icons 2.1.1) and loaded with a Subresource Integrity
(`integrity="sha384-..."`) hash, so the browser refuses a file that has been
altered. SRI covers the stylesheet and script files themselves, not the icon
font files that Phosphor's CSS fetches by relative URL. The admin pages also
need to reach the CDNs, and Alpine.js evaluates expressions with
`new Function`, so a strict Content-Security-Policy (no `unsafe-eval`) will
block the UI.

## Screens

A one-minute tour of every screen:

<figure class="rb-video">
<video controls preload="metadata" playsinline poster="../../assets/video/rulebox-visualizer-intro-poster.png" aria-label="A one-minute tour of the RuleBox Visualizer">
<source src="../../assets/video/rulebox-visualizer-intro.mp4" type="video/mp4">
</video>
</figure>

Click any screenshot to enlarge it:

::: image-gallery columns="3"
::: image src="../assets/visualizer/dashboard.png" alt="The Dashboard: totals, a table of every rulebook with its outcomes, and a recent activity feed" caption="Dashboard"
:::
::: image src="../assets/visualizer/chain-loanapproval.png" alt="The chain view for the loanapproval rulebook, showing priority badges, a stops-chain marker, and per-rule outcome counts" caption="Rule Visualizer (chain view)"
:::
::: image src="../assets/visualizer/chain-seasonalpromo.png" alt="The chain view for seasonalpromo, showing active windows on two rules" caption="Chain view with active windows"
:::
::: image src="../assets/visualizer/dryrun.png" alt="The Dry Run playground: a rulebook picker and JSON facts on the left, which rules would execute on the right" caption="Dry Run"
:::
::: image src="../assets/visualizer/metrics.png" alt="The Metrics screen for loanapproval: evaluation count, average and total duration, and outcomes by state" caption="Metrics"
:::
::: image src="../assets/visualizer/live.png" alt="The Live Tracker: a Live badge and a table of rule evaluations streaming in, each with time, rulebook, rule, state and duration" caption="Live Tracker"
:::
:::

### Dashboard

Every declared rulebook (from `moduleSettings.rulebox.rulebooks` and/or your
convention folder - see the "Externalized Rule Definitions" guide), with its
rule count, evaluation counts by state, average duration, and a
recent-activity feed on the right. A rulebook that fails to load (a bad file
path, an unregistered action) is flagged with a red marker, like
`needsaction` above, instead of taking the whole page down.

### Rule Visualizer

A chosen rulebook's real execution chain, in the order the rules actually
run. Each row shows:

- the rule's **priority** (`P20`, `P10`, `P0`)
- a **stops chain** marker for rules that call `stop()`
- the rule's **evaluation count, average duration, and outcomes by state** (`EXECUTED`, `SKIPPED`, `STOPPED`)

Use the dropdown to switch rulebooks, or **Dry Run** to jump to the playground
with this rulebook preselected.

Rules with an active window (`activeFrom` / `activeUntil`) show it inline.

### Dry Run

Pick a rulebook, paste facts as JSON, and press **Run dry run**. The result
lists every rule in order and whether it **would execute** for those facts,
without running any action. It is backed by `RuleBook.dryRun()`, so nothing
is recorded in your metrics.

### Metrics

Aggregated stats for one rulebook: total evaluations, average and total
duration, and a count per outcome state. Pick a rulebook and press
**Refresh** to re-query.

### Live Tracker

Every rule evaluation, across every rulebook, streamed to the browser as it
happens via [BoxLang's `SSE()`](https://boxlang.ortusbooks.com/boxlang-framework/server-sent-events).
Each row shows the time, rulebook, rule, outcome state, and duration. Use
**Pause** to freeze the table while you read it; the table keeps the latest
200 rows.

> **Needs BoxLang 1.18.0 or later.** Earlier web runtimes apply whitespace
> compression to `text/event-stream` responses, which strips the blank line
> that ends each event, so the browser connects (the badge says **Live**) but
> never receives a row. 1.18.0 never compresses SSE. On an older runtime, set
> `whitespaceCompressionEnabled` to `false` in `boxlang.json`, keeping in mind
> that it applies to all of your app's output.

#### Limiting live connections

Each open Live Tracker tab holds a stream open, and that pins two server
threads for as long as it stays connected. RuleBox therefore caps how many
streams can be open at once with `visualizer.maxStreams` (default `25`):

```cfc
moduleSettings = {
	rulebox = {
		visualizer = {
			enabled    = true,
			maxStreams = 10
		}
	}
}
```

Once the cap is reached, further requests to `stream` get an HTTP `503` with
`{ "error": "Too many live tracker connections" }` instead of a new stream, and
a slot frees up as soon as a tab closes or its connection drops. Keep the cap
comfortably below your servlet container's worker thread count so the tracker
can never starve the rest of your application. Each stream also buffers at
most 1000 events; if a browser stalls and falls behind, its oldest unsent
events are dropped rather than letting memory grow.

## Metrics persistence

Every rule evaluation is recorded through `RuleEventBus@rulebox`, which fans
it out to two places: the configured metrics store (for the dashboard/metrics
screens) and any live subscribers (the SSE tracker). The store is
swappable:

```cfc
moduleSettings = {
	rulebox = {
		visualizer = {
			enabled        = true,
			// A WireBox mapping ID - swap in your own implementation of IMetricsStore@rulebox
			metricsStore   = "InMemoryMetricsStore@rulebox",
			// Only read by SQLiteMetricsStore, if you opt into it below
			datasourceName = "rulebox_visualizer"
		}
	}
}
```

### The default: in-memory

`InMemoryMetricsStore@rulebox` is the default - zero setup, live broadcast
and the dashboard/metrics screens work immediately after enabling the
visualizer. The tradeoff: nothing survives a restart. Totals and per-rule
metrics are exact running aggregates, while the recent-activity feed keeps
only the last 1000 events per rulebook (`maxEventsPerRulebook`).

### Persisting across restarts: SQLite

For metrics that survive a restart, point `metricsStore` at
`SQLiteMetricsStore@rulebox` instead. It persists events to a
`rulebox_events` table (auto-created on first use) via the
[`bx-sqlite`](https://forgebox.io/view/bx-sqlite) BoxLang module. It requires:

1. `bx-sqlite` installed (`box install bx-sqlite`) and registered with your
   engine so its JDBC driver is available - how you do this depends on your
   engine/environment, so verify it independently of RuleBox
2. A datasource registered under the name in `datasourceName` (default `rulebox_visualizer`), e.g. in `Application.bx`:

```cfc
this.datasources = {
	rulebox_visualizer: {
		driver: "sqlite",
		database: "./.database/rulebox_visualizer.db"
	}
}
```

Neither the module nor the datasource is installed/registered for you - if
you opt into this store, you set these up yourself. If `bx-sqlite` or the
datasource isn't available, RuleBox logs it and keeps going: live broadcast
still works, nothing gets persisted.

#### Retention, indexing and the circuit breaker

The SQLite store is hardened for long-running apps. All of these settings live
under `visualizer` and are optional:

| Setting | Default | Meaning |
| --- | --- | --- |
| `retentionDays` | `30` | Delete events older than this many days. `0` disables. |
| `maxStoredEvents` | `100000` | Keep at most this many rows (the newest). `0` disables. |
| `circuitBreakerThreshold` | `5` | Consecutive failed writes before the store stops trying. |
| `circuitBreakerCooldownSeconds` | `60` | How long it stays idle before a single trial write. |

- Retention is enforced by a cheap `DELETE` once every 500 inserts, never on
  every insert, so the table can briefly exceed the limits between prunes.
- The `rulebox_events` table has an index on `(rulebookName, ruleName, id)` for
  the per-rule metrics queries (created automatically; existing tables get it
  on the next startup).
- If writes keep failing (a missing datasource, a locked or full database), the
  store logs **one** error when the breaker opens, skips persistence for the
  cool-down (live broadcast keeps working), then retries once and logs **one**
  info line when it recovers. A failed schema create is retried on the next
  event rather than being swallowed for good.
- Each recorded event is still a synchronous `INSERT` on the thread that
  evaluated the rule. That is a deliberate trade-off for simplicity; if it is
  too slow for your traffic, use the in-memory store or implement
  `IMetricsStore@rulebox` with a queue.

### Swapping it out

Implement `IMetricsStore@rulebox` (`recordEvent`, `queryEvents`,
`queryRuleBookSummary`, `queryRuleMetrics`, `queryRuleBookNames`, `reset`)
and point `metricsStore` at your WireBox mapping - a Redis-backed store, a
real RDBMS table via `qb`, whatever fits your app.

## What it doesn't do

The condition tree behind a `when()`/`except()` closure isn't introspectable
once compiled, so the chain visualizer shows what's inspectable on a live
`Rule` - name, priority, `stop()`, active window, metrics - not a decompiled
condition. Access control is also entirely on you; see above.
