---
title: Auditing Rules
order: 5
icon: phosphor-duotone:list-magnifying-glass
summary: Preview what would fire with dryRun(), then track which rules fired, skipped, stopped, or failed.
tags: [guides, auditing, dry-run, metrics]
---

# Auditing Rules

Auditing answers two questions: which rules *would* fire for some facts,
and which rules *did* fire on the last run.

## Dry-run / explain mode

Sometimes you want to know which rules a given set of facts *would*
trigger, without actually triggering them. `dryRun()` gives you that
preview, on both `RuleBook` and `Rule`. It does not:

- run any `then()` consumers
- merge facts into the sticky fact store
- touch the `Result`
- change the status map or the rule metrics

```js
report = ruleBook.dryRun( { "creditScore" : 550 } )
writeDump( report )
```

`RuleBook.dryRun()` returns an array of structs, one per rule reached, in
execution order. `description` is the rule's
[description](the-dsl.md#withdescription), or `""`:

```js
[
	{ "name" : "checkBlocklist",         "description" : "Declines blocklisted applicants", "wouldExecute" : false, "wouldStop" : false },
	{ "name" : "creditScoreAdjustment",  "description" : "",                                "wouldExecute" : true,  "wouldStop" : false }
]
```

The walk stops where a real `run()` would stop: at the first rule whose
condition passes and has `stop()` set. Rules after that point don't appear
in the report.

A single `Rule` can also be dry-run on its own. Unlike `run()`, it doesn't
need to be attached to a `RuleBook`. Create it with
[the Builder](the-builder.md):

```js
builder = getInstance( "Builder@rulebox" )

report = builder.rule( "lowScore" )
	.when( ( facts ) => facts.creditScore < 600 )
	.stop()
	.dryRun( { "creditScore" : 550 } )

// { "name" : "lowScore", "wouldExecute" : true, "wouldStop" : true }
```

## Name your rules

A `RuleBook` records each rule's state in a status map, keyed by rule
name. Give your rules a `name` so the audit trail is meaningful. Without
one you'll see the rule's internal UUID. You can name a rule in any of
these ways:

```js
// Using the Builder
builder.rule( "ruleName" )

// Using newRule(), inside a RuleBook
addRule( newRule( "ruleName" ) )

// Or its setter
addRule( newRule().setName( "ruleName" ) )
```

## Rule states

Each rule added to a `RuleBook` has a state, from the `RULE_STATES`
struct exposed on every `RuleBook` instance:

| State | Meaning |
|---|---|
| `REGISTERED` | Added, not yet evaluated this run |
| `EXECUTED` | `when()` passed (and `except()` did not) and the `then()` actions completed |
| `SKIPPED` | `when()`/`except()` did not pass, or the rule is outside its `active()` window |
| `STOPPED` | Executed, then `stop()` halted the chain |
| `FAILED` | Evaluating the rule threw. This can come from `when()`, `except()`, a `then()` consumer, or a bad `active()` date. See [Error Handling](error-handling.md) |

`run()` resets every rule back to `REGISTERED` at the start of each run, so
a rule that a shorter chain doesn't reach never shows a stale state from a
previous run.

## Reading the audit trail

```js
status = ruleBook.getRuleStatus( "rule1" )
```

A name that isn't in the status map returns `NOT_AVAILABLE`.

To get the whole status map, a plain struct of rule name to state:

```js
writeDump( ruleBook.getRuleStatusMap() )
```

## Rule metrics

The audit trail tells you what happened on the *last* `run()`. A
`RuleBook` also keeps running metrics per rule, added up across every
`run()` call on that instance:

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
	"avgDurationMs"    : 29.38,
	"completed"        : 41,
	"failed"           : 1,
	"completionRate"   : 0.976,
	"errorRate"        : 0.024,
	"lastError"        : {
		"type"        : "CreditService.TimeoutException",
		"message"     : "Credit service did not answer in time",
		"at"          : "2026-10-05T16:54:53",
		"fingerprint" : "9F2C..."
	},
	"errors"           : [
		{
			"fingerprint"   : "9F2C...",
			"type"          : "CreditService.TimeoutException",
			"message"       : "Credit service did not answer in time",
			"causedBy"      : [ { "type" : "java.net.SocketTimeoutException", "message" : "Read timed out" } ],
			"stackTrace"    : [ "scoreApplicant() /app/models/CreditService.bx:42", "..." ],
			"rawStackTrace" : "ortus.boxlang.runtime.types.exceptions.CustomException: ...",
			"count"         : 1,
			"firstAt"       : "2026-10-05T16:54:53",
			"lastAt"        : "2026-10-05T16:54:53"
		}
	]
	// ...plus minDurationMs, maxDurationMs, lastDurationMs, firstRunAt, lastRunAt
}
```

- `countsByState` uses the same `RULE_STATES` values as the audit trail
- `completed` counts evaluations that finished without throwing (`EXECUTED`,
  `SKIPPED`, `STOPPED`); `failed` counts the ones that threw (`FAILED`). The
  rates divide them by `totalEvaluations` and are `0` before the first run
- `lastError` appears once the rule has failed: the exception's type and
  message (cut to 500 characters), when it happened, and its fingerprint. The
  exception is still re-thrown to your code
- `errors` lists the rule's distinct errors, most recently seen first. The same
  error (same type, message, cause chain and frames in the rule's own code) is
  one entry whose `count` goes up; it is never added twice. Each keeps the
  cause chain (up to 5 deep), up to 10 BoxLang stack frames and the raw Java
  trace cut to 4000 characters, never the exception's `detail`. A rule keeps its
  10 most recently seen errors
- Duration covers the whole evaluation, so a rule that is slow to *check*
  shows up even when it never fires
- A rule that was never evaluated (or doesn't exist) returns the same
  shape with `totalEvaluations: 0` and no `firstRunAt`/`lastRunAt`

`ruleBook.getRuleMetricsMap()` returns every rule's metrics as a struct of
name to metrics, ready to serialize to JSON for a dashboard.

Unlike the status map, `run()` does not reset metrics. Clear them yourself
with `ruleBook.resetMetrics()`.

Metrics live on the `RuleBook` instance, so a new `RuleBook` starts from
zero. For metrics across runs and instances, use the
[Rule Visualizer](visualizer.md#metrics-persistence).
