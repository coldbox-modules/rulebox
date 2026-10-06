---
title: Facts and Results
summary: Give rules their data, and read back what they decided.
icon: phosphor-duotone:number-circle-three
tags: [course]
---

# Facts and Results

Rules only know what you tell them. What you tell them is called **facts**.

## Three ways to give facts

All of these do the same job. Pick the one that reads best.

```js
// 1. Pass a struct to run()
getInstance( "LoanApproval" ).run( { creditScore: 640 } )

// 2. Add facts one at a time
getInstance( "LoanApproval" )
	.given( "creditScore", 640 )
	.given( "income", 80000 )
	.run()

// 3. Add many at once
getInstance( "LoanApproval" )
	.givenAll( { creditScore: 640, income: 80000 } )
	.run()
```

Inside a rule, facts are just a struct: `facts.creditScore`.

## Say which facts a rulebook takes

A rulebook can list the facts it expects: their names, types, whether they
are required, defaults and descriptions. Add a `defineFacts()` method next
to `defineRules()` in `LoanApproval.bx`:

```js
function defineFacts(){
	fact( "creditScore" )
		.type( "numeric" )
		.required()
		.description( "The applicant's credit score, 300 to 850" )
		.example( 680 )
	fact( "income" ).type( "numeric" ).defaultValue( 0 )
}
```

On its own this only describes the rulebook: anyone reading the class, and
the Visualizer (lesson 9), can see which facts it takes. A run with a
missing fact still runs.

To check the facts on every run, add `enforceFacts()`:

```js
function defineFacts(){
	enforceFacts()
	fact( "creditScore" ).type( "numeric" ).required()
	fact( "income" ).type( "numeric" ).defaultValue( 0 )
}
```

Now a missing `income` gets its default of `0`, and a run without a
`creditScore`, or with one that is not a number, throws
`RuleBox.InvalidFactsException` before any rule runs:

```js
getInstance( "LoanApproval" ).run( { creditScore: "abc" } )
// throws RuleBox.InvalidFactsException, whose message ends with:
// Fact [creditScore] must be a numeric value.
```

Use `strictFacts()` instead to also reject facts the rulebook did not
declare, such as a typo like `creditScroe`. The
[Declaring Facts guide](../guides/declaring-facts.md) has every option.

## Reading the Result

`getResult()` returns a **Result** object. These are the methods you will
use most:

| Method | What it does |
|---|---|
| `getValue()` | Returns the value, or `null` if no rule set one. |
| `isPresent()` | `true` if a rule set a value. |
| `orElse( other )` | Returns the value, or `other` if there is none. |
| `ifPresent( closure )` | Calls your closure with the value, only if there is one. |

Try them on the rulebook from lesson 2, using a score of `700` that no rule
reacts to:

```js
var result = getInstance( "LoanApproval" )
	.run( { creditScore: 700 } )
	.getResult()

result.isPresent()              // false
result.orElse( "NO DECISION" )  // "NO DECISION"
```

And with a score of `500`:

```js
getInstance( "LoanApproval" )
	.run( { creditScore: 500 } )
	.getResult()
	.ifPresent( ( value ) => println( "Decision: #value#" ) )  // Decision: DECLINED
```

## Give the Result a default

Most of the time you want an answer even when no rule matches. Set a
default result before you run:

```js
var decision = getInstance( "LoanApproval" )
	.withDefaultResult( "MANUAL_REVIEW" )
	.given( "creditScore", 640 )
	.run()
	.getResult()
	.getValue()

// "MANUAL_REVIEW"
```

No rule matched a score of `640`, so the default came through. A default
also gives every run a clean starting point.

## Try it

Change the default to `"NEEDS_MORE_INFO"` and run it again. Then try a
score of `500` and check that the rule still wins over the default.

Last, add `enforceFacts()` and run with no facts at all. Read the message:
it names the missing fact, so the caller knows exactly what to send.

**Next:** add more rules and control how they run.
