---
title: Your First Rule
summary: Write a RuleBook with one rule, run it, and read the answer.
icon: phosphor-duotone:number-circle-two
tags: [course]
---

# Your First Rule

We start with the smallest useful rule: decline anyone with a low credit
score.

## Create a RuleBook

A RuleBook is a class that extends `rulebox.models.RuleBook` and adds its
rules in a `defineRules()` method. Save this as `models/LoanApproval.bx`:

```js
/**
 * Decides a loan application from the applicant's credit score.
 */
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule( "declineLowScores" )
				.withDescription( "Declines a score under 580" )
				.when( ( facts ) => facts.creditScore < 580 )
				.then( ( facts, result ) => result.setValue( "DECLINED" ) )
		)
	}

}
```

Read it out loud, it says what it does:

- The comment above the class describes the whole rulebook.
- `newRule( "declineLowScores" )` makes a rule and names it. Always name
  your rules. The name shows up when you look at what ran.
- `withDescription(...)` says in plain words what the rule does.
  Descriptions do not change how anything runs; they show up in the
  Visualizer (lesson 9) and in `getDescription()`.
- `when(...)` is the condition. It receives the `facts` and returns `true`
  or `false`.
- `then(...)` is the action. It runs only when the condition is `true`.
  It receives the `facts` and the `result` to fill in.
- `addRule(...)` puts the rule in the book.

## Run it

Create a handler that runs the rulebook with some facts. Save this as
`handlers/Loans.bx`:

```js
class {

	function decide( event, rc, prc ){
		var decision = getInstance( "LoanApproval" )
			.run( { creditScore: 540 } )
			.getResult()
			.getValue()

		event.renderData( type="text", data=decision )
	}

}
```

Three calls do the work:

1. `run( facts )` hands the facts to the rules and runs them. It returns
   the RuleBook itself.
2. `getResult()` gets the **Result** object.
3. `getValue()` reads what the rules put in it.

With a score of `540`, the answer is `DECLINED`.

> Use `getInstance()` every time you need a RuleBook. A RuleBook remembers
> its facts and result, so you want a fresh one for each decision.

## Try it

Change `540` to `700` and run it again. The condition is now `false`, so
the `then` never runs and no value is set. That is not an error, it just
means no rule had an opinion. The next lesson shows how to handle that.

**Next:** facts and results in detail.
