---
title: Rules from JSON
summary: Keep your thresholds in a file the business can edit, without a code change.
icon: phosphor-duotone:number-circle-six
tags: [course]
---

# Rules from JSON

Credit-score cutoffs change. It is awkward to redeploy code every time.
RuleBox can load the same rules from a JSON file instead.

## Write the rules as data

Save this as `config/rules/loan.json`:

```json
[
	{
		"name": "declineLowScores",
		"description": "Declines a score under 580",
		"priority": 20,
		"when": { "lt": [ "creditScore", 580 ] },
		"then": [ { "action": "decide", "params": { "decision": "DECLINED" } } ],
		"stop": true
	},
	{
		"name": "autoApprove",
		"description": "Approves a good score, unless the amount is very large",
		"when": { "gte": [ "creditScore", 680 ] },
		"except": { "gt": [ "requestedAmount", 500000 ] },
		"then": [ { "action": "decide", "params": { "decision": "APPROVED" } } ]
	}
]
```

It is the same two rules, using the same ideas: a `name`, a `description`,
a `priority`, a `when`, an `except`, a `then`, and `stop`.

## Conditions without code

A condition in a JSON file is a small structure, not code. That is on
purpose: a file anyone can edit can never run code you did not write.

| Operator | Example | Meaning |
|---|---|---|
| `eq`, `neq` | `{ "eq": [ "state", "CA" ] }` | Equal, not equal |
| `lt`, `lte`, `gt`, `gte` | `{ "lt": [ "creditScore", 580 ] }` | Less or greater than |
| `in` | `{ "in": [ "region", [ "US", "CA" ] ] }` | One of a list |
| `and`, `or` | `{ "and": [ cond, cond ] }` | Combine conditions |
| `not` | `{ "not": cond }` | Flip a condition |

A condition compares a fact to a fixed value. That is why the `except` above
uses a fixed `500000` instead of "five times income" like lesson 4.

## Name your actions

A JSON file cannot hold code, so a `then` points at an action **by name**.
You register the code behind that name, once:

```js
var book = getInstance( "RuleBook@rulebox" )
	.registerAction( "decide", ( facts, result, params ) => {
		result.setValue( params.decision )
	} )
	.loadRules(
		new rulebox.models.JSONRuleSource( expandPath( "/config/rules/loan.json" ) )
	)
	.withDefaultResult( "MANUAL_REVIEW" )

var decision = book
	.run( { creditScore: 720, requestedAmount: 100000 } )
	.getResult()
	.getValue()

// "APPROVED"
```

`params` is whatever the JSON passed along, so one `decide` action serves
every rule. Run it with a score of `540` and you get `DECLINED`. With `640`
you get the default, `MANUAL_REVIEW`.

Everything from lesson 5 still works on a rulebook loaded from a file:
the audit trail, `dryRun()` and metrics.

## Describe the file and its facts

A rule file can also describe the rulebook and declare its facts, like
`defineFacts()` in lesson 3. Wrap the rules in an object:

```json
{
	"description": "Decides a loan application from the credit score",
	"facts": {
		"creditScore": { "type": "numeric", "required": true, "description": "300 to 850" },
		"requestedAmount": { "type": "numeric", "default": 0 }
	},
	"enforceFacts": true,
	"rules": [
		{
			"name": "declineLowScores",
			"description": "Declines a score under 580",
			"priority": 20,
			"when": { "lt": [ "creditScore", 580 ] },
			"then": [ { "action": "decide", "params": { "decision": "DECLINED" } } ],
			"stop": true
		},
		{
			"name": "autoApprove",
			"description": "Approves a good score, unless the amount is very large",
			"when": { "gte": [ "creditScore", 680 ] },
			"except": { "gt": [ "requestedAmount", 500000 ] },
			"then": [ { "action": "decide", "params": { "decision": "APPROVED" } } ]
		}
	]
}
```

`rules` holds the same array as before. `enforceFacts` checks the facts on
every run, and `strictFacts` would also reject undeclared ones. A bare
array still works, so add this only when you want it.

## Other sources

`JSONRuleSource` is one of three. `YAMLRuleSource` reads a YAML file and
`DBRuleSource` reads a database table. The
[Externalized Rule Definitions](../guides/external-rules.md) guide covers
them.

## Try it

Open `loan.json` and change `580` to `600`. Run a score of `590`. It was
`MANUAL_REVIEW` before, and it is `DECLINED` now. You changed behavior
without touching any BoxLang.

**Next:** use these rulebooks properly inside ColdBox.
