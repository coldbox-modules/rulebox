---
title: More Rules
summary: Add an approval rule, and control order and exceptions with priority, stop and except.
icon: phosphor-duotone:number-circle-four
tags: [course]
---

# More Rules

One rule is not much of a decision. Let's finish the loan rulebook. Replace
`models/LoanApproval.bx` with this:

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule( "declineLowScores" )
				.withPriority( 20 )
				.when( ( facts ) => facts.creditScore < 580 )
				.then( ( facts, result ) => result.setValue( "DECLINED" ) )
				.stop()
		)

		addRule(
			newRule( "autoApprove" )
				.when( ( facts ) => facts.creditScore >= 680 )
				.except( ( facts ) => facts.requestedAmount > facts.income * 5 )
				.then( ( facts, result ) => result.setValue( "APPROVED" ) )
		)
	}

}
```

There are three new ideas in there.

## `withPriority()`

Rules run from the **highest priority to the lowest**. The default is `0`.
Here `declineLowScores` has priority `20`, so it always goes first. Rules
with the same priority run in the order you added them.

Set the priority before you call `addRule()`.

## `stop()`

`stop()` ends the whole chain once that rule has fired. Once someone is
declined, there is no point checking whether to approve them.

## `except()`

`except()` is the opposite of `when()`: **skip the rule if this is true**.
Here a good score is approved, except when the amount asked for is more
than five times their income.

## Run it

Use the default from lesson 3 so there is always an answer:

```js
var decision = getInstance( "LoanApproval" )
	.withDefaultResult( "MANUAL_REVIEW" )
	.run( { creditScore: 720, income: 80000, requestedAmount: 100000 } )
	.getResult()
	.getValue()
```

Here is what you get for the four applicants from lesson 1. Every income
is `80000`.

| Credit score | Amount requested | Decision | Why |
|---|---|---|---|
| 540 | 100,000 | `DECLINED` | `declineLowScores` fired and stopped the chain. |
| 720 | 100,000 | `APPROVED` | Good score, amount is within 5x income. |
| 720 | 900,000 | `MANUAL_REVIEW` | Good score, but `except()` skipped the approval. The default stayed. |
| 640 | 100,000 | `MANUAL_REVIEW` | No rule matched, so the default stayed. |

> **Tip:** if a rule has more than one `then()`, write each action with a
> `{ ... }` body instead of the short `=>` form. The short form returns its
> value, and a `then()` that returns `true` stops the later ones in that
> rule.

## Try it

Change the approval threshold from `680` to `700` and run the `720` and
`690` applicants. The `690` applicant moves from `APPROVED` to
`MANUAL_REVIEW`. In the next lesson you will see exactly why.

**Next:** find out which rules ran.
