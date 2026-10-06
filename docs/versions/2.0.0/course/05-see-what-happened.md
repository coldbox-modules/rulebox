---
title: See What Happened
summary: Read the audit trail, preview a run with dryRun(), and check metrics.
icon: phosphor-duotone:number-circle-five
tags: [course]
---

# See What Happened

"Why was this person declined?" is the question rules engines get asked
most. RuleBox can answer it three ways.

## 1. The audit trail

After a run, ask each rule how it went:

```js
var book = getInstance( "LoanApproval" )
	.withDefaultResult( "MANUAL_REVIEW" )
	.run( { creditScore: 720, income: 80000, requestedAmount: 100000 } )

book.getRuleStatus( "autoApprove" )   // "EXECUTED"
book.getRuleStatusMap()
// { declineLowScores: "SKIPPED", autoApprove: "EXECUTED" }
```

Every rule ends a run in one of these states:

| State | Meaning |
|---|---|
| `EXECUTED` | The condition passed and the `then()` ran. |
| `SKIPPED` | The condition did not pass. |
| `STOPPED` | It ran, and then `stop()` ended the chain. |
| `FAILED` | Something in the rule threw an error. See lesson 8. |
| `REGISTERED` | The rule was never reached. |

Run the same rulebook for a score of `540`:

```js
// { declineLowScores: "STOPPED", autoApprove: "REGISTERED" }
```

`declineLowScores` stopped the chain, so `autoApprove` was never looked at.
This is why naming your rules matters.

## 2. Preview with `dryRun()`

`dryRun()` asks "what **would** happen?" without doing it. No actions run,
and nothing is changed or recorded.

```js
getInstance( "LoanApproval" )
	.dryRun( { creditScore: 720, income: 80000, requestedAmount: 100000 } )
```

You get one entry for each rule it reaches, in order:

```js
[
	{ name: "declineLowScores", wouldExecute: false, wouldStop: false },
	{ name: "autoApprove",      wouldExecute: true,  wouldStop: false }
]
```

For a score of `540` the list has only one entry, because
`declineLowScores` would stop the chain:

```js
[
	{ name: "declineLowScores", wouldExecute: true, wouldStop: true }
]
```

Use `dryRun()` whenever someone asks "what happens if...?". It is safe to
call on live rules.

## 3. Metrics

A RuleBook also keeps running totals for each rule:

```js
book.getRuleMetrics( "autoApprove" )
// {
//   name: "autoApprove",
//   totalEvaluations: 1,
//   countsByState: { EXECUTED: 1 },
//   ... plus min, max and total duration, and first and last run times
// }
```

Metrics live on that one RuleBook instance. Because you ask for a fresh one
each time, they are most useful for a long-lived instance. In lesson 9 the
Visualizer collects them for you across every run.

## Try it

Call `dryRun()` with a score of `600`. Both rules report
`wouldExecute: false`. That is the "manual review" case: nobody matched, so
the default decides.

**Next:** move the rules out of code and into a file.
