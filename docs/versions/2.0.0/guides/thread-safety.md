---
title: Thread Safety
order: 11
icon: phosphor-duotone:shield-check
summary: Why RuleBook and Rule are transient, and how to get a fresh one every time.
tags: [guides, thread-safety]
---

# Thread Safety

**Call `getInstance()` for each use.** `RuleBook` and `Rule` are
**transient** (non-singleton) objects, so every `getInstance()` call
gives you a new one that nobody else is touching.

```js
var greeting = getInstance( "HelloWorld" )
	.run( { name : "World" } )
	.getResult()
	.getValue()
```

## Why

`given()` and `run( facts )` write facts onto the instance itself, and
the result and the rule status audit trail live there too. One
`RuleBook` instance is **not** safe to `run()` from several threads at
once, or with different facts in separate calls. A RuleBook instance is
only safe to `run()` again if it is given the exact same facts it
already holds.

Do not keep a RuleBook in a singleton property or a shared scope, and do
not inject one with a plain `inject="HelloWorld"` into a
singleton. That gives the singleton one instance for its whole life.

## Safe ways to get a RuleBook

- **`getInstance( "MyRuleBook" )`** in the place you use it, for a
  RuleBook class.
- **`ruleBook( "name" )`** in handlers, views and layouts, for a rulebook
  [declared in config](external-rules.md#declaring-rulebooks-in-config).
  It returns a fresh RuleBook every call.
- **`inject="rulebook:name"`** for the same declared rulebooks, in any
  class. It injects a small provider, not a RuleBook. Call `.get()` where
  you use it to get a fresh RuleBook, so it is safe even in a singleton:

```js title="LoanService.bx"
class singleton{

	property name="creditRules" inject="rulebook:credit";

	function decide( score ){
		return creditRules.get().run( { creditScore : score } ).getResult().getValue()
	}

}
```

## The Builder

`Builder@rulebox` itself is a `@singleton` `@threadsafe` class. It is
safe to share one instance of the builder across threads, since it only
hands back fresh `RuleBook` and `Rule` transients and holds no
request-specific state itself.
