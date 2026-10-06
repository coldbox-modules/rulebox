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

A one-minute tour of every screen, including rule health, errors and stack traces:

<figure class="rb-video">
<video controls preload="metadata" playsinline poster="../../assets/video/2.0.0/rulebox-visualizer-intro-poster.png" aria-label="A one-minute tour of the RuleBox Visualizer">
<source src="../../assets/video/2.0.0/rulebox-visualizer-intro.mp4" type="video/mp4">
</video>
</figure>

Click any screenshot to enlarge it:

::: image-gallery columns="3"
::: image src="../assets/visualizer/2.0.0/dashboard.png" alt="The Dashboard: totals, Problem rules and Slowest rules panels, a table of every rulebook with its outcomes and error rate, and a recent activity feed" caption="Dashboard"
:::
::: image src="../assets/visualizer/2.0.0/chain-loanapproval.png" alt="The chain view for the loanapproval rulebook, showing priority badges, a stops-chain marker, and per-rule outcome counts" caption="Rule Visualizer (chain view)"
:::
::: image src="../assets/visualizer/2.0.0/chain-fraudcheck.png" alt="The chain view for fraudcheck: each rule's evaluations, average and maximum duration and error rate, with callFraudService failing 34% of the time and showing its last error" caption="Chain view with a failing rule"
:::
::: image src="../assets/visualizer/2.0.0/chain-seasonalpromo.png" alt="The chain view for seasonalpromo, showing active windows on two rules" caption="Chain view with active windows"
:::
::: image src="../assets/visualizer/2.0.0/dryrun.png" alt="The Dry Run playground: a rulebook picker and JSON facts on the left, which rules would execute on the right" caption="Dry Run"
:::
::: image src="../assets/visualizer/2.0.0/metrics.png" alt="The Metrics screen for fraudcheck: evaluations, average duration, completion and error rates, a rule health table with a failing rule and its last error, and outcomes by state" caption="Metrics"
:::
::: image src="../assets/visualizer/2.0.0/metrics-errors.png" alt="A failing rule's errors on the Metrics screen: two distinct errors, each with how many times it happened, first and last seen, a Caused by line and its BoxLang stack frames" caption="A rule's errors and stack traces"
:::
::: image src="../assets/visualizer/2.0.0/live.png" alt="The Live Tracker: rule evaluations streaming in, with a FAILED row expanded to show its message, its cause and BoxLang stack frames" caption="Live Tracker"
:::
:::

### Dashboard

Every declared rulebook (from `moduleSettings.rulebox.rulebooks` and/or your
convention folder - see the "Externalized Rule Definitions" guide), with its
rule count, evaluation counts by state, error rate, average duration, and a
recent-activity feed on the right. A rulebook that fails to load (a bad file
path, an unregistered action) is flagged with a red marker, like
`needsaction` above, instead of taking the whole page down.

Two panels above the table answer "which rules need attention?" across every
declared rulebook:

- **Problem rules:** the five rules with the highest error rate (ties go to
  the most failures, then the most recent one), each with its last error.
  Rules that never failed are left out, so an empty panel means nothing has
  failed.
- **Slowest rules:** the five rules with the highest average duration, with
  their maximum.

Click a rule to open its rulebook's chain. See [Rule health](#rule-health) for
how the numbers are counted.

### Rule Visualizer

A chosen rulebook's real execution chain, in the order the rules actually
run. Each row shows:

- the rule's **priority** (`P20`, `P10`, `P0`)
- a **stops chain** marker for rules that call `stop()`
- the rule's **evaluation count, average and maximum duration, error rate, and outcomes by state** (`EXECUTED`, `SKIPPED`, `STOPPED`, `FAILED`)
- the rule's **last error** (type, message and time), when it has failed

Use the dropdown to switch rulebooks, or **Dry Run** to jump to the playground
with this rulebook preselected.

Rules with an active window (`activeFrom` / `activeUntil`) show it inline.

### Dry Run

Pick a rulebook, paste facts as JSON, and press **Run dry run**. The result
lists every rule in order and whether it **would execute** for those facts,
without running any action. It is backed by `RuleBook.dryRun()`, so nothing
is recorded in your metrics.

### Metrics

Aggregated stats for one rulebook: total evaluations, average duration,
completion and error rates, and a count per outcome state. Pick a rulebook and
press **Refresh** to re-query.

The **Rule health** table lists every rule of the rulebook that has run, with
its evaluations, completion rate, error rate, average and maximum duration,
and last error. It starts with the highest error rate on top; click any column
heading to sort by it (click again to flip the order), for example **Avg** to
find the slow ones.

Under a failing rule's last error, **Show errors** opens the rule's distinct
errors. Each shows its type and message, how many times it
happened, when it was first and last seen, the **Caused by** chain, the BoxLang
stack frames, and a **Raw Java stack trace** you can expand. The
**Errors and stack traces** link on the dashboard and **Show errors and stack
traces** in the chain view open the same panel.

#### Rule health

Every evaluation of a rule ends in one of the `RULE_STATES`. For health:

- **Completed** counts evaluations that finished without throwing:
  `EXECUTED`, `SKIPPED` and `STOPPED`. A skipped rule did its job (its
  condition was false), so it counts as completed.
- **Failed** counts evaluations that threw (`FAILED`), from a condition, a
  predicate or an action.
- **Completion rate** and **error rate** are completed or failed divided by
  all evaluations. Both are `0` before the first evaluation.
- **Last error** is the most recent failure's exception **type** and
  **message**, and when it happened. The exception is still re-thrown to your
  code.

#### Errors and stack traces

For every failure RuleBox keeps, trimmed:

| Field | What is kept |
| --- | --- |
| `type`, `message` | The exception type (the Java class name for a Java exception) and message, cut to 500 characters |
| `causedBy` | The "caused by" chain, up to 5 deep, each as `{ type, message }` |
| `stackTrace` | Up to 10 BoxLang frames (your code), as `function() /path/File.bx:line` |
| `rawStackTrace` | The Java stack trace, cut to 4000 characters |

The exception's `detail` is never kept.

**The same error is stored once.** Each error gets a fingerprint from its type,
message, cause chain and the rule's own frames (the code that ran inside the
rule, not RuleBook or whatever called it). A repeat of the same error only adds
1 to its `count` and moves its `lastAt`, however many times it happens or from
which handler. A rule keeps its 10 most recently seen distinct errors.

> Stack traces show file paths and function names. That is one more reason to
> secure `/rulebox-visualizer` before you enable it outside development.

RuleBox has no per-rule timeouts, so a slow rule shows up through its average
and maximum duration rather than as a failure.

### Live Tracker

Every rule evaluation, across every rulebook, streamed to the browser as it
happens via [BoxLang's `SSE()`](https://boxlang.ortusbooks.com/boxlang-framework/server-sent-events).
Each row shows the time, rulebook, rule, outcome state, and duration. A
`FAILED` row is highlighted in red with the error type and message under the
rule name; click it to expand the cause chain and stack traces. Use
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
- A `FAILED` event row stores only its error type, message and fingerprint
  (`errorType`, `errorMessage`, `errorFingerprint`). The error itself, with its
  causes and traces, is one row per rule and fingerprint in `rulebox_errors`;
  a repeat is an upsert that adds 1 to its count. A table created by an older
  RuleBox gets the new columns and table on the next startup; its existing rows
  have no error details.
- Retention also applies to errors: `retentionDays` deletes errors not seen
  since the cutoff, and each rule keeps its 10 most recently seen errors. Once
  a rule's last failed event is pruned, it no longer has a last error.
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
`queryRuleBookSummary`, `queryRuleMetrics`, `queryAllRuleMetrics`,
`queryRuleErrors`, `queryRuleBookNames`, `reset`) and point `metricsStore` at your WireBox
mapping - a Redis-backed store, a real RDBMS table via `qb`, whatever fits
your app.

The interface's docblocks describe each shape. In short:

- A `FAILED` event passed to `recordEvent()` carries `errorType`,
  `errorMessage`, `errorFingerprint`, `errorCausedBy`, `errorStackTrace` and
  `errorRawStackTrace`. Store each distinct `errorFingerprint` once per rule and
  count repeats; `RuleHealth::foldError( errors, error, at )` does that for an
  array. `queryEvents()` returns `errorType`, `errorMessage` and
  `errorFingerprint` on `FAILED` events only.
- Summaries add `completed`, `failed`, `completionRate`, `errorRate` and
  `avgDurationMs`. `rulebox.models.metrics.RuleHealth::of( countsByState,
  totalEvaluations, totalDurationMs )` computes them, so your store reports
  them the same way.
- Rule metrics also add `minDurationMs`, `maxDurationMs`, `lastRunAt`, and
  `lastError` (`{ type, message, at, fingerprint }`) once the rule has failed.
- `queryAllRuleMetrics( rulebookName )` returns the rule metrics of every rule
  that has run, for the dashboard panels and the Rule health table.
- `queryRuleErrors( rulebookName, ruleName, limit )` returns the rule's distinct
  errors, most recently seen first, each with its `count`, `firstAt` and
  `lastAt`.

## What it doesn't do

The condition tree behind a `when()`/`except()` closure isn't introspectable
once compiled, so the chain visualizer shows what's inspectable on a live
`Rule` - name, priority, `stop()`, active window, metrics - not a decompiled
condition. Access control is also entirely on you; see above.
