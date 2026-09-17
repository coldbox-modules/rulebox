---
title: The Builder
order: 4
icon: phosphor-duotone:hammer
summary: Build à la carte rules and rule books without a dedicated class.
tags: [guides, builder]
---

# The Builder

`Builder@rulebox` is a singleton that lets you create rules and rule
books on the fly, without writing a dedicated class that extends
`RuleBook`. It's handy for dynamic or à la carte rules assembled at
runtime.

```js
builder = getInstance( "Builder@rulebox" )

myRuleBook = builder.rulebook( "My RuleBook" )
	.addRule(
		builder.rule()
			.then( ( facts ) => println( "Hello " ) )
	)
	.addRule(
		builder.rule()
			.then( ( facts ) => println( "World " ) )
	)

myRuleBook.run()
```

| Method | Returns | Description |
|---|---|---|
| `rulebook( name="" )` | `RuleBook` | Creates a new `RuleBook`, optionally named |
| `rule( name )` | `Rule` | Creates a new standalone `Rule`, optionally named |

Since `builder.rulebook()` returns a normal `RuleBook` instance, every
method described in [The RuleBook DSL](the-dsl.md) and
[Facts & Results](facts-and-results.md) - `given()`, `withDefaultResult()`,
`addRule()`, `run()` - is available on it, exactly as it would be on a
hand-written `RuleBook` subclass.
