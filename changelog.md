# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

* * *

## [Unreleased]

## [2.0.0] - 2026-10-07

### Added

- `RULE_STATES.FAILED` status: a `then()` consumer that throws now records the rule as `FAILED` in the audit trail before the exception is re-thrown to the caller
- `Rule.run()` now throws a `RuleBox.RuleNotAttachedException` if called on a `Rule` that was never attached to a `RuleBook` via `addRule()`, instead of a cryptic null-reference error
- `Rule.withPriority( priority )`: rules now execute in priority order (highest first) instead of strictly insertion order. Rules sharing the same priority (default `0`) execute in the order they were added
- `dryRun()` on both `Rule` and `RuleBook`: preview which rules would fire for a given set of facts without invoking any `then()` consumers or mutating any state (facts, result, or the real audit trail). Unlike `run()`, `Rule.dryRun()` does not require the rule to be attached to a `RuleBook`
- `Rule.active( from, until )`: restrict a rule to a time window; outside of it the rule is skipped exactly like a failed `when()`. Either bound is optional. Externalized rule definitions can set this via `activeFrom`/`activeUntil` (or `active_from`/`active_until` columns for `DBRuleSource`)
- Externalized Rule Definitions: `RuleBook.loadRules( source )` loads rule definitions from `JSONRuleSource`, `YAMLRuleSource`, `DBRuleSource`, or any object exposing `load()`, and turns each one into a real `Rule` - priority, `dryRun()`, and the audit trail all keep working unmodified. See the "Externalized Rule Definitions" guide
- `RuleBook.registerAction()`/`registerPredicate()`: register named actions/predicates a loaded rule definition can reference by name, accepting a closure/lambda, an object instance (duck-typed `execute()`/`test()`), or a WireBox mapping ID string resolved eagerly at registration
- A safe, declarative condition-tree grammar (`eq`/`neq`/`lt`/`lte`/`gt`/`gte`/`in`/`and`/`or`/`not` over dot-path facts) for a rule definition's `when`/`except`, with no `eval` - untrusted rule sources can't execute arbitrary code
- `RuleAction`/`RulePredicate`: optional documented interfaces for a class-based action/predicate registered via `registerAction()`/`registerPredicate()`
- `RuleBook.clearRules()`/`reloadRules( source )`: manually re-read an external rule source (a JSON/YAML file, a DB table) without restarting. RuleBox never watches a source for changes on its own - you decide when to reload. Registries and rule metrics are untouched
- `InlineRuleSource`: a `RuleSource` backed by a literal array of rule-definition structs, no file or database
- `RuleBookRegistry@rulebox`: build named rulebooks from `moduleSettings.rulebox.rulebooks` config (a file path, inline rule definitions, or a full descriptor with actions/predicates/a DB source) and/or auto-discovered `*.json`/`*.yaml` files in a convention folder, instead of hand-wiring `registerAction()`/`loadRules()` per rulebook. `getRuleBook( name )` always returns a fresh instance - never a shared/cached one - so it's safe to use from a singleton or across concurrent requests. `reload()` re-scans config/the convention folder
- A `ruleBook( name )` application helper mixin, available in handlers/views/layouts
- A `rulebook`/`rulebook:{name}` WireBox injection DSL: `rulebook` injects the `RuleBookRegistry` singleton, `rulebook:{name}` injects a provider (`.get()`) for that declared rulebook so it stays safe to inject even into a singleton
- Declared facts: a `RuleBook` can declare the facts it takes with `fact( name )` in a new `defineFacts()` method (`type()`, `required()`, `defaultValue()`, `description()`, `example()`, `values()`), or from data with `withFacts( struct )`. `getFactDefinitions()` returns them for documentation or a UI. The declarations only describe the rulebook unless it calls `enforceFacts()`: then `run()` and `dryRun()` apply defaults and throw `RuleBox.InvalidFactsException`, listing every missing, mistyped or disallowed fact, before any rule runs. `strictFacts()` (or `enforceFacts( strict = true )`) also rejects undeclared facts. `validateFacts( facts )` returns the same problems without running or throwing. Messages never include fact values. See the "Declaring Facts" guide
- Descriptions for rulebooks and rules: `withDescription()` and `getDescription()` on `RuleBook` and `Rule`. A `RuleBook` subclass without one falls back to its `@description` or `@hint` annotation, else its docblock. Rule definitions, rule-file envelopes and config declarations take a `description` key, `dryRun()` reports each rule's description, and the Rule Visualizer shows them on the dashboard, the chain view and the Dry Run screen
- Rule files and rule sources can return an envelope, `{ description, facts, enforceFacts, strictFacts, rules }`, instead of a bare array of rules, and declared rulebooks take `description`, `facts`, `enforceFacts` and `strictFacts` keys in config
- `RuleBook.getRuleMetrics( name )`/`getRuleMetricsMap()`: dashboard-ready, JSON-serializable per-rule execution metrics (evaluation counts by state, min/max/total/last duration, first/last run timestamps), accumulated across every `run()` call on the instance rather than resetting each run. `resetMetrics()` clears them
- `RuleBook.getRuleMetrics()` adds `completed`, `failed`, `completionRate`, `errorRate`, `avgDurationMs` and, once a rule fails, `lastError` (`{ type, message, at, fingerprint }`) and `errors`: the rule's distinct errors, each stored once with a `count` (the same error is never added twice), with its cause chain (up to 5), up to 10 BoxLang frames and the raw Java trace (cut to 4000 characters). `RuleHealth::errorOf()` and `foldError()` do the trimming and dedup
- The Rule Visualizer: an admin UI (dashboard, per-rulebook chain visualization, a dry-run playground, metrics/stats, and a live SSE tracker), off by default. Enable it with `moduleSettings.rulebox.visualizer.enabled = true` - RuleBox doesn't secure it on its own, so wrap it with cbSecurity (or your own auth) once enabled. Built on Bootstrap 5, Alpine.js, and Phosphor Icons via CDN. See the "Rule Visualizer" guide
- The Rule Visualizer shows a rulebook's declared facts on its chain view, and the Dry Run screen builds a form from them (type-aware fields, required markers, defaults or examples prefilled, a Form/JSON toggle). When a rulebook enforces its facts, a rejected dry run shows each problem next to its field. A new `apiFacts` JSON endpoint returns a rulebook's facts, and `runDryRun` answers 400 with the problems
- Rule health in the Rule Visualizer: see which rules fail, how often, and which are slow. The dashboard gains "Problem rules" (by error rate, with the last error) and "Slowest rules" (by average duration) panels; the Metrics screen gains completion and error rates and a sortable per-rule health table; the chain view shows each rule's error rate and last error; the Live Tracker highlights `FAILED` rows with their error. Each failing rule's distinct errors open with their count, first and last seen, "Caused by" chain, BoxLang stack frames and raw Java stack trace
- `IMetricsStore@rulebox`: the visualizer's metrics persistence contract, with `InMemoryMetricsStore` (default, no I/O, nothing survives a restart) and `SQLiteMetricsStore` (opt-in, persists across restarts via the `bx-sqlite` module) implementations. Swap in your own via `moduleSettings.rulebox.visualizer.metricsStore`
- `IMetricsStore.queryAllRuleMetrics( rulebookName )` and `queryRuleErrors( rulebookName, ruleName, limit )`, and the same health fields on every store summary. A `FAILED` event carries `errorType`, `errorMessage`, `errorFingerprint`, `errorCausedBy`, `errorStackTrace` and `errorRawStackTrace`. `SQLiteMetricsStore` keeps each distinct error once in a new `rulebox_errors` table (an upsert counts repeats) and adds `errorType`/`errorMessage`/`errorFingerprint` columns to an existing `rulebox_events` table on startup. A custom store must implement the new methods
- `RuleEventBus@rulebox`: fans out one event per rule evaluation to the configured metrics store and any live subscribers (the visualizer's SSE stream). A complete no-op while the visualizer is disabled
- ColdBox 8+ support
- `AGENTS.md` instructions for AI coding agents

### Changed

- **Breaking:** RuleBox now runs on BoxLang 1.18+ only
- **Breaking:** `RULE_STATES.REGISTERED` now has the value `REGISTERED` instead of the legacy value `NONE`
- Thread safety for singleton objects
- Safe-navigation operator (`?.`) used for `Rule` chain traversal instead of manual `isNull()` guards
- The new RuleBox logo in the Rule Visualizer: the sidebar brand and the browser tab icon
- CI runs the tests on BoxLang 1 and BoxLang bleeding edge, and retries CommandBox setup and the ForgeBox publish

### Fixed

- `RuleBook.run()` now resets the rule status audit trail (`getRuleStatusMap()`/`getRuleStatus()`) at the start of every run, so a rule that isn't reached in the current run (e.g. a chain that stops earlier than before) no longer reports a stale status from a previous run
- `given()`/`givenAll()`'s `overwrite` argument was previously ignored (facts were always force-overwritten); it is now honored on both `Rule` and `RuleBook`
- Fixed the RuleBox `RULE_STATES` broken instance access under BoxLang (see #6, #7)

## [1.0.0] => 2018-OCT-29

- First iteration of this module

[unreleased]: https://github.com/coldbox-modules/rulebox/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/coldbox-modules/rulebox/compare/a48e7f619b1c4dff62d0d7a86419eba0bbfc0b0c...v2.0.0
