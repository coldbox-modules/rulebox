---
title: The RuleBook DSL
order: 2
icon: phosphor-duotone:magic-wand
summary: given / when / except / then / using / stop, explained.
tags: [guides, dsl]
---

# The RuleBook Domain Specific Language

The RuleBox DSL uses the `Given-When-Then` format, popularized by
Behavior Driven Development (BDD) and testing frameworks (TestBox,
Cucumber, Spock), and heavily inspired by RuleBox's Java counterpart,
[RuleBook](https://github.com/rulebook-rules/rulebook). Sentences should
describe rules, and rules should be defined using a ubiquitous language
that translates directly into the codebase.

## Given-When-Then

- **Given** - some Fact(s)
- **When** - a condition evaluates to `true`
- **Except** - a condition that evaluates to `false`
- **Then** - an action is triggered

`when()` conditions can grow unwieldy, so RuleBox adds `except()` to the
language: `when().except().then()`. Even when the `when()` condition
evaluates to `true`, chaining an `except()` onto it that evaluates to
`true` cancels the rule for that run.

## given() / givenAll()

`given()`/`givenAll()` accept one or more facts, in various forms, as a
collection of information provided to a single `Rule`. When grouping
`Rule`s into a `RuleBook`, facts are supplied when the `RuleBook` is run,
so the "Given" step is inferred:

```js
var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
	.withDefaultResult( 4.5 )
	.given( "creditScore", 650 )
	.given( "cashOnHand", 20000 )
	.given( "firstTimeHomeBuyer", false )
	.run()

var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
	.withDefaultResult( 4.5 )
	.givenAll( {
		creditScore: 650,
		cashOnHand: 20000,
		firstTimeHomeBuyer: false
	} )
	.run()
```

`givenAll()` accepts a second `overwrite` argument (default `true`) that
controls whether facts already present are replaced.

## when()

`when()` accepts a Predicate closure/lambda that evaluates a condition
based on the facts provided. Only **one** `when()` can be specified per
rule, and it must return `boolean`:

```js
.when( ( facts ) => {
	// determine if we continue or not
	return boolean
} )
```

## except()

`except()` negates the `when()` operation if it also passes. In other
words: when the balance is greater than 100, *except* when the account is
disabled, then dispense some money:

```js
except( ( facts ) => facts.accountDisabled )
```

## then()

`then()` accepts a Consumer closure/lambda describing the action to run
if `when()` evaluates to `true`. A `Rule` can specify **multiple**
`then()` calls, invoked in the order they're declared. If a `then()`
returns `true`, no further consumers in that rule execute - the chain
breaks. Returning `void` or `false` continues the chain:

```js
.then( ( facts, result ) => {
	// do stuff

	// break the next then()
	return true
} )
.then( ( facts, result ) => {
	// This never fires
} )
```

## using()

`using()` reduces the set of facts available to the *next* `then()`
call. Multiple `using()` calls can be chained together - the aggregate of
every fact name across them is what's made available to the immediately
following `then()`:

```js
addRule(
	newRule()
		.when( ( facts ) => facts.keyExists( "hello" ) && facts.keyExists( "world" ) )
		using( "hello" ).then( ( facts ) => println( facts.hello ) )
		using( "world" ).then( ( facts ) => println( facts.world ) )
)
```

## withPriority()

By default, rules execute strictly in the order they're added via
`addRule()`. `withPriority()` lets a rule jump the queue - a **higher**
priority runs **earlier**. Rules that share the same priority (the
default is `0`) keep insertion order relative to each other:

```js
addRule(
	newRule( "checkBlocklist" )
		.withPriority( 10 )
		.when( ( facts ) => facts.applicant.isBlocklisted() )
		.then( ( facts, result ) => result.setValue( 0 ) )
		.stop()
)

addRule(
	newRule( "creditScoreAdjustment" )
		// no withPriority() - defaults to 0, runs after the rule above
		.when( ( facts ) => facts.applicant.getCreditScore() < 600 )
		.then( ( facts, result ) => result.setValue( result.getValue() * 4 ) )
)
```

`withPriority()` can be called before or after a rule is added to a
`RuleBook` - the `RuleBook` re-derives its entire execution chain, sorted
by priority (ties broken by insertion order), every time `addRule()` is
called, so a later, higher-priority rule correctly slots ahead of rules
already registered.

## stop()

`stop()` breaks the rule chain. If specified on a rule whose `when()`
evaluates to `true`, then once that rule's `then()` action(s) complete,
no further rules in the chain are evaluated.

```js
addRule(
	newRule()
		.when( ( facts ) => facts.applicant.getCreditScore() < 600 )
		.then( ( facts, result ) => result.setValue( result.getValue() * 4 ) )
		.stop()
)
```

## active()

`active()` restricts a rule to a time window. Outside of it, the rule is
skipped exactly like a failed `when()` - no `then()` consumers run, and it
shows as `SKIPPED` in the [audit trail](auditing.md). Either bound can be
omitted to leave that side open-ended:

```js
addRule(
	newRule( "blackFridayPromo" )
		.active( from: "2025-11-28", until: "2025-12-01" )
		.then( ( facts, result ) => result.setValue( result.getValue() * 0.8 ) )
)

addRule(
	newRule( "legacyDiscount" )
		// no "from" - already active; expires at the given date
		.active( until: "2025-01-01" )
		.then( ( facts, result ) => result.setValue( result.getValue() * 0.9 ) )
)
```

`active()` can be called any time before `run()`/`dryRun()`; it's checked
fresh on every evaluation, not just once.
