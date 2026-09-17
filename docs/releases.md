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

A BoxLang-only rewrite of the module, with a number of correctness fixes
and additions:

- **BoxLang only** - the module now targets BoxLang exclusively.
- **ColdBox 8+ integrations**.
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

See [Migrating from 1.0.0](../versions/1.0.0/index.md) if you're upgrading
from the CFML/RuleBook-era version of this module.

## 1.0.0

The first iteration of this module, released 2018-OCT-29. Its docs are
preserved under the [1.0.0 version](../versions/1.0.0/index.md) of this
site.
