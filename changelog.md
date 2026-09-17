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
- Test coverage for: re-running a `RuleBook`/`Rule` with the same facts, the `overwrite=false` behavior of `givenAll()`, a `then()` consumer throwing mid-chain, running a detached `Rule`, and rule priority ordering

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
