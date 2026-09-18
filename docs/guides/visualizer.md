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

## Screens

- **Dashboard** - every declared rulebook (from `moduleSettings.rulebox.rulebooks` and/or your convention folder - see the "Externalized Rule Definitions" guide), its rule count, evaluation counts by state, and a recent-activity feed
- **Rule Visualizer** - a chosen rulebook's real execution chain (priority order, `stop()` points, active windows), with per-rule metrics
- **Dry Run** - pick a rulebook, paste facts as JSON, and see which rules would fire without executing anything - backed by `RuleBook.dryRun()`
- **Metrics** - aggregated stats per rulebook: evaluation counts by state, average/total duration
- **Live Tracker** - every rule evaluation, across every rulebook, streamed to the browser in real time via [BoxLang's `SSE()`](https://boxlang.ortusbooks.com/boxlang-framework/server-sent-events)

The UI itself is Bootstrap 5, Alpine.js, and Phosphor Icons, loaded from a
CDN - there's nothing to build or bundle.

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
			metricsStore   = "SQLiteMetricsStore@rulebox",
			// Only read by SQLiteMetricsStore
			datasourceName = "rulebox_visualizer"
		}
	}
}
```

### The default: SQLite

`SQLiteMetricsStore@rulebox` is the default - it persists events to a
`rulebox_events` table (auto-created on first use) via the
[`bx-sqlite`](https://forgebox.io/view/bx-sqlite) BoxLang module, so metrics
survive a restart. It requires:

1. `bx-sqlite` installed (`box install bx-sqlite`)
2. A datasource registered under the name in `datasourceName` (default `rulebox_visualizer`), e.g. in `Application.bx`:

```cfc
this.datasources = {
	rulebox_visualizer: {
		driver: "sqlite",
		protocol: "directory",
		database: "./.database/rulebox_visualizer"
	}
}
```

Neither the module nor the datasource is installed/registered for you - if
you enable the visualizer and keep the default store, you set these up
yourself. If `bx-sqlite` or the datasource isn't available, RuleBox logs it
and keeps going: live broadcast still works, nothing gets persisted.

### Swapping it out

Implement `IMetricsStore@rulebox` (`recordEvent`, `queryEvents`,
`queryRuleBookSummary`, `queryRuleMetrics`, `queryRuleBookNames`, `reset`)
and point `metricsStore` at your WireBox mapping - a Redis-backed store, a
real RDBMS table via `qb`, whatever fits your app.
`InMemoryMetricsStore@rulebox` ships as a fallback-of-last-resort: no I/O,
nothing survives a restart, useful for tests or a purely live-tracker setup.

## What it doesn't do

The condition tree behind a `when()`/`except()` closure isn't introspectable
once compiled, so the chain visualizer shows what's inspectable on a live
`Rule` - name, priority, `stop()`, active window, metrics - not a decompiled
condition. Access control is also entirely on you; see above.
