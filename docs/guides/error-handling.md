---
title: Error Handling
order: 7
icon: phosphor-duotone:warning-circle
summary: What happens when a then() throws, and what happens when a Rule is run detached.
tags: [guides, errors]
---

# Error Handling

## A `then()` consumer that throws

If a `then()` consumer throws, RuleBox records the rule as `FAILED` in
the audit trail (see [Auditing Rules](auditing.md)) **before** the
exception is re-thrown to the caller. That means `ruleBook.getRuleStatus()`
reliably reflects a mid-chain failure - you don't have to catch the
exception yourself just to find out which rule blew up:

```js
try {
	myRuleBook.run()
} catch( any e ) {
	writeDump( myRuleBook.getRuleStatus( "myFailingRule" ) ) // "FAILED"
	rethrow;
}
```

## Running a detached `Rule`

Calling `run()` directly on a `Rule` that was never added to a
`RuleBook` via `addRule()` throws a named exception,
`RuleBox.RuleNotAttachedException`, rather than a cryptic
null-reference error:

```js
var orphan = getInstance( "Rule@rulebox" )
orphan.run() // throws RuleBox.RuleNotAttachedException
```

Always build rules through a `RuleBook` (either a subclass's
`defineRules()`, or [the Builder](the-builder.md)) so every `Rule` is
attached before it's run.
