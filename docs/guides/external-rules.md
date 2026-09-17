---
title: Externalized Rule Definitions
order: 6
icon: phosphor-duotone:file-code
summary: Load rules from JSON, YAML, or a database instead of hand-writing DSL code.
tags: [guides, external-rules, json, yaml, database]
---

# Externalized Rule Definitions

Every rule you've seen so far is written in BoxLang, using the RuleBox
DSL. Sometimes that's the wrong place for a rule to live - business users
want to tweak a threshold without a deploy, or the rules genuinely belong
in a database table next to the data they govern. `RuleBook.loadRules()`
loads rule definitions from an external source - JSON, YAML, or a
database - and turns each one into a real `Rule`, wired into the same
priority chain, audit trail, and `dryRun()` support as any other rule.

## The rule-definition schema

A rule source is any object with a `load()` method that returns an array
of rule-definition structs. Each struct can contain:

| Key | Required | Meaning |
|---|---|---|
| `name` | No | The rule's name, used for [auditing](auditing.md). Defaults like any other rule if omitted |
| `priority` | No | See [Rule Priority](the-dsl.md). Defaults to `0` |
| `activeFrom` | No | See [active()](the-dsl.md#active). Left open-ended if omitted |
| `activeUntil` | No | See [active()](the-dsl.md#active). Left open-ended if omitted |
| `when` | No | A [condition node](#the-condition-tree-grammar) or a [predicate reference](#the-predicate-and-action-registries). Defaults to always-true |
| `except` | No | Same shape as `when`, negated |
| `then` | No | An array of [action references](#the-predicate-and-action-registries). Defaults to none |
| `using` | No | An array of fact names to restrict every `then` action to, applied the same way to each one - see [The DSL](the-dsl.md) |
| `stop` | No | `true` to stop the chain after this rule fires |

A JSON example, mirroring the "credit approval" walkthrough used
throughout these guides:

```json
[
	{
		"name": "highRisk",
		"priority": 10,
		"when": { "lt": [ "creditScore", 600 ] },
		"then": [ { "action": "flagHighRisk" } ],
		"stop": true
	},
	{
		"name": "approve",
		"when": { "gte": [ "creditScore", 600 ] },
		"then": [ { "action": "approveApplicant", "params": { "reason": "good credit" } } ]
	}
]
```

## The condition tree grammar

`when`/`except` accept a small, safe, declarative grammar instead of
arbitrary code - there's no `eval`, so a rule definition loaded from a
file or a database table can never execute code you didn't write
yourself. A condition node is a struct with exactly one operator key:

| Operator | Shape | Meaning |
|---|---|---|
| `eq` / `neq` | `[ "factPath", value ]` | Equals / not equals |
| `lt` / `lte` / `gt` / `gte` | `[ "factPath", value ]` | Numeric/date comparison |
| `in` | `[ "factPath", [ values ] ]` | Fact value is one of the given values |
| `and` / `or` | `[ node, node, ... ]` | All / any of the child nodes |
| `not` | `node` | Negates the child node |

`factPath` supports dot-notation into nested facts (`"applicant.address.state"`).
A missing path resolves to `null` rather than throwing. Nodes nest freely:

```json
{
	"and": [
		{ "eq": [ "state", "CA" ] },
		{ "or": [
			{ "lt": [ "creditScore", 600 ] },
			{ "not": { "eq": [ "flagged", true ] } }
		] }
	]
}
```

## The predicate and action registries

The condition grammar covers comparisons, but not arbitrary logic, and a
rule always needs to *do* something. For both cases, a rule definition
references code by name, and that name must be registered on the
`RuleBook` first via `registerPredicate()`/`registerAction()` - a rule
definition can never carry inline code, so untrusted rule sources stay
safe to load.

```js
ruleBook
	.registerPredicate( "isEligible", ( facts, params ) => facts.creditScore >= params.threshold )
	.registerAction( "approveApplicant", ( facts, result, params ) => result.setValue( params.reason ) )
```

Referenced from a rule definition as:

```json
{
	"when": { "predicate": "isEligible", "params": { "threshold": 600 } },
	"then": [ { "action": "approveApplicant", "params": { "reason": "good credit" } } ]
}
```

Both `registerAction()` and `registerPredicate()` accept three forms:

- **A closure/lambda** - `( facts, result, params ) => { ... }` for actions,
  `( facts, params ) => boolean` for predicates
- **An object instance** - duck-typed on an `execute( facts, result, params )`
  or `test( facts, params )` method. `RuleAction`/`RulePredicate` document
  the optional contract
- **A WireBox mapping ID string** - e.g. `"CreditService@myModule"`,
  resolved via `getInstance()` immediately when you call
  `registerAction()`/`registerPredicate()`, not deferred to rule execution

```js
ruleBook.registerAction( "approveApplicant", "ApprovalService@myModule" )
```

An action/predicate name referenced by a rule definition but never
registered throws `RuleBox.UnregisteredActionException` /
`RuleBox.UnregisteredPredicateException` from `loadRules()`, rather than
failing silently or at run time.

## JSONRuleSource

```js
ruleBook.loadRules( new rulebox.models.JSONRuleSource( "/path/to/rules.json" ) )
```

The file is a JSON array of rule-definition structs, as shown above.

## YAMLRuleSource

```js
ruleBook.loadRules( new rulebox.models.YAMLRuleSource( "/path/to/rules.yaml" ) )
```

Same schema, as YAML:

```yaml
- name: highRisk
  priority: 10
  when:
    lt: [ creditScore, 600 ]
  then:
    - action: flagHighRisk
  stop: true
```

YAML support depends on the official BoxLang YAML module, which RuleBox
does **not** install for you - install it yourself if you use
`YAMLRuleSource`:

```bash
box install boxlang-yaml
```

## DBRuleSource

Point it at a datasource and a SQL statement:

```js
ruleBook.loadRules( new rulebox.models.DBRuleSource(
	datasource = "myApp",
	sql        = "SELECT * FROM rules WHERE ruleset = 'credit'"
) )
```

...or hand it a query you already have, which is also the easiest way to
test code that uses `DBRuleSource`:

```js
ruleBook.loadRules( new rulebox.models.DBRuleSource( query = myQuery ) )
```

Expected columns: `name`, `priority`, `active_from` (optional),
`active_until` (optional), `when_json`, `except_json` (optional),
`then_json`, `stop`, `using_facts` (optional, a comma-delimited list of
fact names). `when_json`/`except_json`/`then_json` hold the same
condition-tree/action JSON used by `JSONRuleSource`, stored as text:

| Column | Maps to |
|---|---|
| `name` | `name` |
| `priority` | `priority` |
| `active_from` | `activeFrom` (optional) |
| `active_until` | `activeUntil` (optional) |
| `when_json` | `when` (deserialized) |
| `except_json` | `except` (deserialized, optional) |
| `then_json` | `then` (deserialized) |
| `stop` | `stop` |
| `using_facts` | `using` (comma-delimited list) |

## Writing your own source

Any object with a `load()` method returning an array of rule-definition
structs works with `loadRules()` - a REST call, a config service, a cache,
whatever fits. There's no interface to implement.

## Reloading rules manually

`loadRules()` is a one-shot call you make explicitly - RuleBox never
watches a file or table for changes on its own. To pick up edits, call
`reloadRules()` whenever you decide it's time (a scheduled task, an admin
action, whatever fits your app):

```js
ruleBook.reloadRules( new rulebox.models.JSONRuleSource( "/path/to/rules.json" ) )
```

`reloadRules()` is `clearRules()` (wipe the current rule chain and audit
trail) followed by `loadRules( source )`. Registries
(`registerAction()`/`registerPredicate()`) and [rule metrics](auditing.md#rule-metrics)
are untouched - `clearRules()` only touches rules.
