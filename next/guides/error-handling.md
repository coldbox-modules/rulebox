---
title: Error Handling
order: 7
icon: phosphor-duotone:warning-circle
summary: What happens when a rule throws, and what happens when a Rule is run detached.
tags: [guides, errors]
---

# Error Handling

## A rule that throws

If a rule throws while it is being evaluated, RuleBox records the rule as
`FAILED` in the audit trail (see [Auditing Rules](auditing.md)) **before**
the exception is re-thrown to the caller. This covers a throw from:

- a `then()` consumer
- `when()`
- `except()`
- a bad `active()` date (one that can't be read as a date)

The rules after the failed one are never reached, so they stay
`REGISTERED`. That means `ruleBook.getRuleStatus()` reliably reflects a
mid-chain failure. You don't have to catch the exception yourself just to
find out which rule blew up:

```js
try {
	myRuleBook.run()
} catch( any e ) {
	writeDump( myRuleBook.getRuleStatus( "myFailingRule" ) ) // "FAILED"
	rethrow;
}
```

## Invalid facts

A rulebook that [enforces its facts](declaring-facts.md#enforcing-facts)
checks them before any rule runs. A missing required fact, a value of the
wrong type, a value outside a fact's `values`, or (in strict mode) an
undeclared fact throws `RuleBox.InvalidFactsException`. Its `message`
lists every problem, and its `extendedInfo` holds them as a JSON array of
`{ fact, problem, message }`. Messages never include fact values.

An invalid fact declaration, such as an unknown type or an unknown key
passed to `withFacts()`, throws `RuleBox.InvalidFactDefinitionException`.

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
