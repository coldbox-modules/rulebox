---
title: Releases
order: 3
icon: phosphor-duotone:git-branch
summary: What's new in 2.0.0, and where to find the full changelog.
tags: [releases]
---

# Releases

RuleBox follows [Semantic Versioning](https://semver.org/). The full,
line-by-line history lives in
[`changelog.md`](https://github.com/coldbox-modules/rulebox/blob/development/changelog.md)
at the root of the repository. Highlights below.

## 2.0.0

A BoxLang-only rewrite of the module. The main additions:

- **External rule sources** - load rules from JSON, YAML or a database
  with `loadRules()`. See
  [Externalized Rule Definitions](guides/external-rules.md).
- **Declared rulebooks** - name your rulebooks in config or a folder of
  files, then get them from `RuleBookRegistry` or the `ruleBook()` helper.
  See [Externalized Rule Definitions](guides/external-rules.md).
- **`dryRun()`** - preview which rules would fire, without running any
  `then()` consumers. See [Auditing Rules](guides/auditing.md).
- **Rule metrics** - per-rule counts and timings across runs. See
  [Auditing Rules](guides/auditing.md).
- **`active()` time windows** - limit a rule to a date range. See
  [The RuleBook DSL](guides/the-dsl.md).
- **Rule Visualizer** - an admin UI, off by default. See
  [Rule Visualizer](guides/visualizer.md).
- **Breaking:** `RULE_STATES.REGISTERED` replaces `NONE`. See
  [Migrating from 1.0.0](#migrating-from-100).

Also in 2.0.0, with fixes and smaller changes:

- **BoxLang only** - the module now targets BoxLang exclusively.
- **ColdBox 8+ integrations**.
- **Rule priority** - `Rule.withPriority()` lets a rule run earlier than
  others in the same chain, regardless of `addRule()` order. See
  [The RuleBook DSL](guides/the-dsl.md#withpriority).
- **`RULE_STATES.FAILED`** - a `then()` consumer that throws is now
  recorded as `FAILED` in the audit trail *before* the exception is
  re-thrown to the caller, instead of leaving a stale status behind. See
  [Error Handling](guides/error-handling.md).
- **`RuleBox.RuleNotAttachedException`** - calling `run()` on a `Rule`
  that was never added to a `RuleBook` via `addRule()` now throws this
  named exception instead of a cryptic null-reference error.
- **Audit trail reset on every `run()`** - `RuleBook.run()` resets
  `getRuleStatusMap()`/`getRuleStatus()` at the start of every run, so a
  rule that a chain didn't reach this time around no longer reports a
  stale status left over from a previous run.
- **`overwrite` is honored** - the `overwrite` argument on `given()`/
  `givenAll()` was previously ignored (facts were always force-overwritten);
  it's now respected on both `Rule` and `RuleBook`.
- **Thread-safety** for singleton objects (like `Builder@rulebox`).
- Safe-navigation (`?.`) used for `Rule` chain traversal instead of manual
  `isNull()` guards.

## Migrating from 1.0.0

What to change when you upgrade from 1.0.0:

- **Run on BoxLang.** 2.0.0 no longer supports other engines.
- **Replace `NONE` with `REGISTERED`.** The state of a rule that was added
  but not reached is now `REGISTERED`. Update any code that compares a rule
  status to `"NONE"`. See [Auditing Rules](guides/auditing.md).
- **Do not rely on stale statuses.** `getRuleStatusMap()` is now reset at
  the start of every `run()`.
- **Check `overwrite` on `given()`/`givenAll()`.** It used to be ignored.
  Now `overwrite = false` keeps existing facts.
- **Attach rules before calling `run()`.** Running a `Rule` that was never
  added to a `RuleBook` now throws `RuleBox.RuleNotAttachedException`.

The old docs are kept in the [1.0.0 archive](/versions/1.0.0/).

## 1.0.0

The first iteration of this module, released 2018-OCT-29. Its docs are
preserved under the [1.0.0 version](/versions/1.0.0/) of this
site.
