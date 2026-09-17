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
