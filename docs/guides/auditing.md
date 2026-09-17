---
title: Auditing Rules
order: 5
icon: phosphor-duotone:list-magnifying-glass
summary: Track which rules fired, skipped, stopped, or failed - or preview it with dryRun().
tags: [guides, auditing, dry-run, metrics]
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

## Dry-run / explain mode

Sometimes you want to know which rules a given set of facts *would*
trigger, without actually triggering them - no `then()` consumers run, no
facts are merged into the sticky fact store, no `Result` is touched, and
the real audit trail (`getRuleStatusMap()`) is left exactly as it was.
`dryRun()` gives you that preview, on both `RuleBook` and `Rule`:

```js
report = ruleBook.dryRun( { "creditScore" : 550 } )
writeDump( report )
```

`RuleBook.dryRun()` returns an array of structs, one per rule reached, in
execution order:

```js
[
	{ "name" : "checkBlocklist",         "wouldExecute" : false, "wouldStop" : false },
	{ "name" : "creditScoreAdjustment",  "wouldExecute" : true,  "wouldStop" : false }
]
```

The walk stops exactly where a real `run()` would stop - the first rule
whose condition passes and has `stop()` set. Rules after that point are
never reached, so (just like a real run) they simply don't appear in the
report.

A single `Rule` can also be dry-run on its own - and unlike `run()`, it
doesn't require being attached to a `RuleBook` first:

```js
report = newRule()
	.when( ( facts ) => facts.creditScore < 600 )
	.stop()
	.dryRun( { "creditScore" : 550 } )

// { "name" : "...", "wouldExecute" : true, "wouldStop" : true }
```

## Rule metrics

While the audit trail tells you what happened on the *last* `run()`,
`RuleBook` also keeps running execution metrics per rule, accumulated
across every `run()` call on the instance - meant to be fed straight into
a dashboard:

```js
metrics = ruleBook.getRuleMetrics( "creditScoreAdjustment" )
writeDump( metrics )
```

```js
{
	"name"             : "creditScoreAdjustment",
	"totalEvaluations" : 42,
	"countsByState"    : { "EXECUTED" : 30, "SKIPPED" : 10, "STOPPED" : 1, "FAILED" : 1 },
	"totalDurationMs"  : 1234,
	"minDurationMs"    : 2,
	"maxDurationMs"    : 55,
	"lastDurationMs"   : 8,
	"firstRunAt"       : {ts '...'},
	"lastRunAt"        : {ts '...'}
}
```

- `countsByState` uses the same `RULE_STATES` values as the audit trail
- Duration covers the whole evaluation - `when()`/`except()` plus any
  `then()` consumers that ran - so a rule that's slow to *check* shows up
  even when it never fires
- A rule that's never been evaluated (or doesn't exist) returns the same
  shape with `totalEvaluations: 0` and no `firstRunAt`/`lastRunAt`, rather
  than throwing
- `dryRun()` never records metrics, same as it never touches the audit trail

Get every rule's metrics in one call with `ruleBook.getRuleMetricsMap()` -
a struct of `name → metrics`, plain enough to serialize straight to JSON
for a dashboard endpoint.

Unlike the status map, metrics are **not** reset by `run()` - they're a
running history for the instance's lifetime. Clear them explicitly with:

```js
ruleBook.resetMetrics()
```
