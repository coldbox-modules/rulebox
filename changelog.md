# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

----

## [Unreleased]

### Added

- GitHub actions upgrades
- AI integrations and instructions
- TestBox UI integration
- ColdBox 8+ Integrations
- `RULE_STATES.FAILED` status: a `then()` consumer that throws now records the rule as `FAILED` in the audit trail before the exception is re-thrown to the caller
- `Rule.run()` now throws a `RuleBox.RuleNotAttachedException` if called on a `Rule` that was never attached to a `RuleBook` via `addRule()`, instead of a cryptic null-reference error
- `Rule.withPriority( priority )`: rules now execute in priority order (highest first) instead of strictly insertion order. Rules sharing the same priority (default `0`) execute in the order they were added
- `dryRun()` on both `Rule` and `RuleBook`: preview which rules would fire for a given set of facts without invoking any `then()` consumers or mutating any state (facts, result, or the real audit trail). Unlike `run()`, `Rule.dryRun()` does not require the rule to be attached to a `RuleBook`
- Test coverage for: re-running a `RuleBook`/`Rule` with the same facts, the `overwrite=false` behavior of `givenAll()`, a `then()` consumer throwing mid-chain, running a detached `Rule`, rule priority ordering, and dry-run/explain mode
- Externalized Rule Definitions: `RuleBook.loadRules( source )` loads rule definitions from `JSONRuleSource`, `YAMLRuleSource`, `DBRuleSource`, or any object exposing `load()`, and turns each one into a real `Rule` - priority, `dryRun()`, and the audit trail all keep working unmodified. See the "Externalized Rule Definitions" guide
- `RuleBook.registerAction()`/`registerPredicate()`: register named actions/predicates a loaded rule definition can reference by name, accepting a closure/lambda, an object instance (duck-typed `execute()`/`test()`), or a WireBox mapping ID string resolved eagerly at registration
- A safe, declarative condition-tree grammar (`eq`/`neq`/`lt`/`lte`/`gt`/`gte`/`in`/`and`/`or`/`not` over dot-path facts) for a rule definition's `when`/`except`, with no `eval` - untrusted rule sources can't execute arbitrary code
- `RuleAction`/`RulePredicate`: optional documented interfaces for a class-based action/predicate registered via `registerAction()`/`registerPredicate()`
- `RuleBook.clearRules()`/`reloadRules( source )`: manually re-read an external rule source (a JSON/YAML file, a DB table) without restarting. RuleBox never watches a source for changes on its own - you decide when to reload. Registries and rule metrics are untouched
- `Rule.active( from, until )`: restrict a rule to a time window; outside of it the rule is skipped exactly like a failed `when()`. Either bound is optional. Externalized rule definitions can set this via `activeFrom`/`activeUntil` (or `active_from`/`active_until` columns for `DBRuleSource`)
- `RuleBook.getRuleMetrics( name )`/`getRuleMetricsMap()`: dashboard-ready, JSON-serializable per-rule execution metrics (evaluation counts by state, min/max/total/last duration, first/last run timestamps), accumulated across every `run()` call on the instance rather than resetting each run. `resetMetrics()` clears them
- `RuleBookRegistry@rulebox`: build named rulebooks from `moduleSettings.rulebox.rulebooks` config (a file path, inline rule definitions, or a full descriptor with actions/predicates/a DB source) and/or auto-discovered `*.json`/`*.yaml` files in a convention folder, instead of hand-wiring `registerAction()`/`loadRules()` per rulebook. `getRuleBook( name )` always returns a fresh instance - never a shared/cached one - so it's safe to use from a singleton or across concurrent requests. `reload()` re-scans config/the convention folder
- `InlineRuleSource`: a `RuleSource` backed by a literal array of rule-definition structs, no file or database
- A `ruleBook( name )` application helper mixin, available in handlers/views/layouts
- A `rulebook`/`rulebook:{name}` WireBox injection DSL: `rulebook` injects the `RuleBookRegistry` singleton, `rulebook:{name}` injects a provider (`.get()`) for that declared rulebook so it stays safe to inject even into a singleton
- The Rule Visualizer: an admin UI (dashboard, per-rulebook chain visualization, a dry-run playground, metrics/stats, and a live SSE tracker), off by default. Enable it with `moduleSettings.rulebox.visualizer.enabled = true` - RuleBox doesn't secure it on its own, so wrap it with cbSecurity (or your own auth) once enabled. Built on Bootstrap 5, Alpine.js, and Phosphor Icons via CDN. See the "Rule Visualizer" guide
- `IMetricsStore@rulebox`: the visualizer's metrics persistence contract, with `InMemoryMetricsStore` (fallback, no I/O) and `SQLiteMetricsStore` (default, via the `bx-sqlite` module) implementations. Swap in your own via `moduleSettings.rulebox.visualizer.metricsStore`
- `RuleEventBus@rulebox`: fans out one event per rule evaluation to the configured metrics store and any live subscribers (the visualizer's SSE stream). A complete no-op while the visualizer is disabled

### Fixed

- `RuleBook.run()` now resets the rule status audit trail (`getRuleStatusMap()`/`getRuleStatus()`) at the start of every run, so a rule that isn't reached in the current run (e.g. a chain that stops earlier than before) no longer reports a stale status from a previous run
- `given()`/`givenAll()`'s `overwrite` argument was previously ignored (facts were always force-overwritten); it is now honored on both `Rule` and `RuleBook`
- Fixed the RuleBox `RULE_STATES` broken instance access under BoxLang (see #6, #7)

### Updates

- Threadsafety for singleton objects
- `RULE_STATES.REGISTERED` now has the value `REGISTERED` instead of the confusing legacy value `NONE`
- Safe-navigation operator (`?.`) used for `Rule` chain traversal instead of manual `isNull()` guards

### Changed

- BoxLang only version of the module

## [1.0.0] => 2018-OCT-29

- First iteration of this module
