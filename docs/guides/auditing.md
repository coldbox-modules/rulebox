---
title: Auditing Rules
order: 5
icon: phosphor-duotone:list-magnifying-glass
summary: Track which rules fired, skipped, stopped, or failed.
tags: [guides, auditing]
---

# Auditing Rules

Rule auditing tells you which rules fired and which didn't. A `RuleBook`
tracks this in a `RuleStatusMap`. Give your rules a `name` so the audit
trail is meaningful - otherwise you'll see the rule's internal UUID
instead. You can name a rule in any of these ways:

```js
// Using the Builder
builder.rule( "ruleName" )

// Using newRule()
addRule( newRule( "ruleName" ) )

// Or its setter
addRule( newRule().setName( "ruleName" ) )
```

## Rule states

Each rule added to a `RuleBook` has its state tracked via
`RULE_STATES`, exposed on every `RuleBook` instance:

| State | Meaning |
|---|---|
| `REGISTERED` | The rule has been added to the `RuleBook`, not yet evaluated this run |
| `EXECUTED` | The rule's `when()` (and `except()`) passed and its `then()` action(s) completed successfully |
| `SKIPPED` | The rule's `when()`/`except()` condition did not pass |
| `STOPPED` | The rule executed and then called `stop()`, halting the chain |
| `FAILED` | A `then()` consumer threw - see [Error Handling](error-handling.md) |
| `NOT_AVAILABLE` | Returned by `getRuleStatus()` for a name that isn't in the map |

`RuleBook.run()` resets every registered rule's status back to
`REGISTERED` at the start of each run, so a rule that a shorter chain
doesn't reach this time around never reports a stale status left over
from a previous run.

## Reading the audit trail

```js
status = ruleBook.getRuleStatus( "rule1" )
status = ruleBook.getRuleStatus( "rule2" )
```

Or retrieve the entire map:

```js
writeDump( ruleBook.getRuleStatusMap() )
```
