---
title: Thread Safety
order: 6
icon: phosphor-duotone:shield-check
summary: Why RuleBook and Rule are transient, and what that means for concurrent runs.
tags: [guides, thread-safety]
---

# Thread Safety

`RuleBook` and `Rule` are **transient** (non-singleton) objects, and
`given()`/`givenAll()` write facts directly onto the instance's own
state. That means a single `RuleBook` instance is **not** safe to `run()`
concurrently from multiple threads, or with different facts across
separate calls - the facts and the rule status audit trail accumulate on
that instance across every `run()` call.

Always request a fresh transient instance (e.g. `getInstance( "MyRuleBook" )`)
per invocation, whether that invocation happens on a separate thread or
simply at a separate point in time with different facts. A `RuleBook`
instance is only safe to `run()` again if it's given the exact same facts
it already holds.

`Builder@rulebox` itself is a `@singleton` `@threadsafe` class - it's
safe to share a single instance of the builder across threads, since it
only ever hands back fresh `RuleBook`/`Rule` transients rather than
holding request-specific state itself.
