---
title: When Things Go Wrong
summary: What RuleBox does when a rule throws, and the mistakes it catches early.
icon: phosphor-duotone:number-circle-eight
tags: [course]
---

# When Things Go Wrong

Rules call real code, and real code fails. Here is what you can expect.

## A rule that throws

Say a rule calls a credit bureau, and the bureau is down:

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule( "lookupBureau" )
				.then( ( facts, result ) => {
					throw( type="App.BureauDown", message="Credit bureau is down" )
				} )
		)
	}

}
```

When you run it, two things happen:

1. The rule is marked `FAILED` in the audit trail.
2. The error is thrown again to you, unchanged.

```js
var book = getInstance( "BureauRules" )

try {
	book.run()
} catch( any e ) {
	e.type                              // "App.BureauDown"
	book.getRuleStatus( "lookupBureau" )  // "FAILED"
}
```

RuleBox never hides an error. You choose what to do with it. Because the
`FAILED` mark is written first, you can always see which rule broke.

## A name that was never registered

Lesson 6 had a `then` that points at the action `decide`. If you load the
file and forget to register it:

```js
getInstance( "RuleBook@rulebox" )
	.loadRules( new rulebox.models.JSONRuleSource( expandPath( "/config/rules/loan.json" ) ) )
```

you get an error straight away, when the rules load:

```
RuleBox.UnregisteredActionException: No action registered under the name 'decide'.
```

You find out on startup, not the first time a customer hits that rule. A
predicate that is missing gives `RuleBox.UnregisteredPredicateException`.

## A rule that was never added to a book

A `Rule` only works inside a RuleBook. Running one that is on its own gives
a clear error instead of a confusing one:

```js
getInstance( "Rule@rulebox" ).run()
// RuleBox.RuleNotAttachedException
```

Always create rules with `newRule()` inside `defineRules()`, or with the
Builder.

## Try it

Make `lookupBureau` throw, run the book inside a `try`, and print
`getRuleStatusMap()` in the `catch`. Notice that rules after the failing one
are still `REGISTERED`: the chain stopped where the error happened.

**Next:** see all of this in a browser.
